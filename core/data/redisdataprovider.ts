import { NullIdentifierError, ExistsError, ProjectNotFoundError, TaskNotFoundError, ImpactNotFoundError, InvalidInputError, TransactionError } from "./idataprovider"
import { IRedisDataProvider } from "./iredisdataprovider"
import { Identifiable, Project, Task, TaskResults, Impact } from "../types"
import * as redis from "redis"
import * as bluebird from "bluebird"

const redisAsync: any = bluebird.promisifyAll(redis)

declare module 'redis' {
    export interface RedisClient extends NodeJS.EventEmitter {
        setAsync(...args: any[]): Promise<any>
        getAsync(...args: any[]): Promise<any>
        mgetAsync(...args: any[]): Promise<any>
        msetAsync(...args: any[]): Promise<any>
        incrAsync(...args: any[]): Promise<any>
        sismemberAsync(...args: any[]): Promise<any>
        saddAsync(...args: any[]): Promise<any>
        sremAsync(...args: any[]): Promise<any>
        smembersAsync(...args: any[]): Promise<any>
        hmsetAsync(...args: any[]): Promise<any>
        hgetallAsync(...args: any[]): Promise<any>
        existsAsync(...args: any[]): Promise<number>
        watchAsync(...args: any[]): Promise<any>
    }
    export interface Multi {
        execAsync(): Promise<any>
    }
}

class RedisProject {
    identifier: string
    name: string
    description: string

    constructor(project: Project) {
        this.identifier = project.identifier
        this.name = project.name
        this.description = project.description
    }

    static save(project: Project, client: redis.RedisClient) : Promise<void> {
        const redisProject = new RedisProject(project)
        const identifier = project.identifier
        return client.multi().hmset("project:" + identifier, redisProject).sadd("project:ids", identifier)
                             .execAsync().then((result: any) => {})
    }

    static load(identifier: string, client: redis.RedisClient) : Promise<Project> {
        const project: Project = {
            identifier: identifier, 
            name: null, 
            description: null, 
        }
        return client.hgetallAsync("project:" + identifier).then((result: any) => {
            project.name = result.hasOwnProperty("name") ? result["name"] : null
            project.description = result.hasOwnProperty("description") ? result["description"] : null
            return project
        })
    }
}

class RedisTask {
    identifier: string
    projectIdentifier: string
    name: string
    description: string

    constructor(task: Task) {
        this.identifier = task.identifier
        this.projectIdentifier = task.projectIdentifier
        this.name = task.name
        this.description = task.description
    }
    static save(task: Task, client: redis.RedisClient) : Promise<void> {
        const redisTask = new RedisTask(task)
        const identifier = task.identifier
        return client.hmsetAsync("task:" + identifier, redisTask).then(() => {
            return client.multi().mset("task:" + identifier + ":estimatedStartDate", task.estimatedStartDate.getTime(),
                                       "task:" + identifier + ":estimatedDuration", task.estimatedDuration)
                                 .sadd("project:" + task.projectIdentifier + ":tasks", identifier)
                                 .execAsync()
        }).then((result: any) => {})
    }
    static load(identifier: string, client: redis.RedisClient) : Promise<Task> {
        const task: Task = {
            identifier: identifier, 
            projectIdentifier: null,
            name: null, 
            description: null, 
            estimatedStartDate: null, 
            estimatedDuration: null
        }
        return client.hgetallAsync("task:" + identifier).then((result: any) => {
            task.projectIdentifier = result.hasOwnProperty("projectIdentifier") ? result["projectIdentifier"] : null
            task.name = result.hasOwnProperty("name") ? result["name"] : null
            task.description = result.hasOwnProperty("description") ? result["description"] : null
            return client.mgetAsync("task:" + identifier + ":estimatedStartDate", 
                                    "task:" + identifier + ":estimatedDuration")
        }).then((result: Array<string>) => { 
            task.estimatedStartDate = result[0] ? new Date(+result[0]) : null
            task.estimatedDuration = result[1] ? +(result[1]) : null
            return task
        })
    }
}

class RedisImpact {
    id: number
    taskIdentifier: string
    name: string
    description: string

    constructor(impact: Impact) {
        this.id = impact.id
        this.name = impact.name
        this.description = impact.description
    }
    static save(impact: Impact, client: redis.RedisClient) : Promise<number> {
        const redisImpact = new RedisImpact(impact)
        const id = impact.id
        return client.multi().hmset("impact:" + id, redisImpact)
                             .set("impact:" + id + ":duration", impact.duration)
                             .execAsync().then((result: any) => { return id })
    }
    static load(id: number, client: redis.RedisClient) : Promise<Impact> {
        const impact: Impact = {
            id: id,
            name: null,
            description: null,
            duration: null
        }
        return client.hgetallAsync("impact:" + id).then((result: any) => {
            impact.name = result.hasOwnProperty("name") ? result["name"] : null
            impact.description = result.hasOwnProperty("description") ? result["description"] : null
            return client.getAsync("impact:" + id + ":duration")
        }).then((result: string) => { 
            impact.duration = result ? +result : null
            return impact
        })
    }
}

export class RedisDataProvider implements IRedisDataProvider {
    client: redis.RedisClient
    static getDefaultClient() : redis.RedisClient {
        return redis.createClient()
    }
    constructor(client: redis.RedisClient) {
        this.client = client
    }
    getAllProjects() : Promise<Array<Project>> {
        return this.client.smembersAsync("project:ids").then((ids: Array<String>) => {
            const sortedIds = ids.sort()
            const promises = sortedIds.map(this.getMappedProject.bind(this))
            return Promise.all(promises)
        }).then((projects: Array<Project>) => {
            return projects.filter((project: Project) => { return !!project })
        }).catch((error: Error) => {
            return []
        })
    }
    getProject(identifier: string) : Promise<Project> {
        return this.hasProject(identifier).then(() => {
            return RedisProject.load(identifier, this.client)
        })
    }
    addProject(project: Project) : Promise<void> {
        return RedisDataProvider.checkIdentifier(project).then(() => {
            return this.notHasProject(project.identifier)
        }).then(() => {
            return RedisProject.save(project, this.client)
        })
    }
    hasTask(identifier: string) : Promise<void> {
        return this.client.existsAsync("task:" + identifier).then((result: number) => {
            if (result != 1) {
                throw new TaskNotFoundError("Task " + identifier + " not found")
            }
        })
    }
    getTasks(identifiers: Array<string>) : Promise<Array<Task>> {
        return Promise.all(identifiers.map(this.getMappedTask.bind(this)))
    }
    getTask(identifier: string) : Promise<Task> {
        return this.hasTask(identifier).then(() => {
            return RedisTask.load(identifier, this.client)
        })
    }
    getProjectTasks(identifier: string) : Promise<Array<Task>> {
        return this.hasProject(identifier).then(() => {
            return this.client.smembersAsync("project:" + identifier + ":tasks")
        }).then((identifiers: Array<string>) => {
            return this.getTasks(identifiers.sort())
        })
    }
    addTask(task: Task) : Promise<void> {
        return RedisDataProvider.checkIdentifier(task).then(() => {
            return RedisDataProvider.checkNullIdentifier(task.projectIdentifier)
        }).then(() => {
            return this.hasProject(task.projectIdentifier)
        }).then(() => {
            return this.notHasTask(task.identifier)
        }).then(() => {
            return RedisTask.save(task, this.client)
        })
    }
    setTaskRelation(parentTaskIdentifier: string, childTaskIdentifier: string) : Promise<void> {
        return this.hasTask(parentTaskIdentifier).then(() => {
            return this.hasTask(childTaskIdentifier)
        }).then(() => {
            return this.client.multi().sadd("task:" + parentTaskIdentifier + ":children", childTaskIdentifier)
                                      .sadd("task:" + childTaskIdentifier + ":parents", parentTaskIdentifier)
                                      .execAsync()
        })
    }
    getParentTaskIdentifiers(identifier: string) : Promise<Array<string>> {
        return this.hasTask(identifier).then(() => {
            return this.client.smembersAsync("task:" + identifier + ":parents")
        }).then((identifiers: Array<string>) => {
            return identifiers.sort()
        })
    }
    getChildrenTaskIdentifiers(identifier: string) : Promise<Array<string>> {
        return this.hasTask(identifier).then(() => {
            return this.client.smembersAsync("task:" + identifier + ":children")
        }).then((ids: Array<string>) => {
            return ids.sort()
        })
    }
    isTaskImportant(identifier: string) : Promise<boolean> {
        return this.hasTask(identifier).then(() => {
            return this.client.sismemberAsync("task:important", identifier)
        }).then((result: number) => {
            return (result != 0)
        })
    }
    setTaskImportant(identifier: string, important: boolean) : Promise<void> {
        return this.hasTask(identifier).then(() => {
            if (important) {
                return this.client.saddAsync("task:important", identifier)
            } else {
                return this.client.sremAsync("task:important", identifier)
            }
        })
    }
    getTasksResults(identifiers: Array<string>) : Promise<Array<TaskResults>> {
        return Promise.all(identifiers.map(this.getMappedTaskResults.bind(this)))
    }
    getTaskResults(identifier: string) : Promise<TaskResults> {
        return this.hasTask(identifier).then(() => {
            return this.client.mgetAsync("task:" + identifier + ":startDate", "task:" + identifier + ":duration")
        }).then((results: Array<string>) => {
            const taskResults: TaskResults = {
                taskIdentifier: identifier,
                startDate: results[0] ? new Date(+results[0]) : null,
                duration: results[1] ? +results[1] : null
            }
            return taskResults
        })
    }
    setTasksResults(results: Array<TaskResults>) : Promise<void> {
        return Promise.all(results.map((results: TaskResults) => {
            return this.hasTask(results.taskIdentifier)
        })).then(() => {
            let set = new Array<string>()
            for (let result of results) {
                set.push("task:" + result.taskIdentifier + ":duration")
                set.push("" + result.duration)
                set.push("task:" + result.taskIdentifier + ":startDate")
                set.push("" + result.startDate.getTime())
            }

            return this.client.multi().mset(set).execAsync()
        }).then((result: Array<string>) => {
            if (!result) {
                throw new TransactionError("Task results have been set during the process")
            }
        })
    }
    getImpacts(ids: Array<number>) : Promise<Array<Impact>> {
        return Promise.all(ids.map(this.getMappedImpact.bind(this)))
    }
    getImpact(id: number): Promise<Impact> {
        return this.hasImpact(id).then(() => {
            return RedisImpact.load(id, this.client)
        })
    }
    getTaskImpactIds(identifier: string) : Promise<Array<number>> {
        return this.hasTask(identifier).then(() => {
            return this.client.smembersAsync("task:" + identifier + ":impacts")
        }).then((ids: Array<string>) => {
            return ids.map(RedisDataProvider.indexFromString).sort(RedisDataProvider.compareNumbers)
        })
    }
    getImpactedTaskIds(id: number) : Promise<Array<string>> {
        return this.hasImpact(id).then(() => {
            return this.client.smembersAsync("impact:" + id + ":tasks")
        }).then((ids: Array<string>) => {
            return ids.sort()
        })
    }
    addImpact(impact: Impact) : Promise<number> {
        return this.getNextId("impact").then((id: number) => {
            impact.id = id
            return RedisImpact.save(impact, this.client)
        })
    }
    setImpactForTask(id: number, taskIdentifier: string) : Promise<void> {
        return this.hasImpact(id).then(() => {
            return this.hasTask(taskIdentifier)
        }).then(() => {
            return this.client.multi().sadd("impact:" + id + ":tasks", taskIdentifier)
                                      .sadd("task:" + taskIdentifier + ":impacts", id)
                                      .execAsync()
        })
    }
    getImpactsValues(ids: Array<number>) : Promise<Array<number>> {
        if (ids.length == 0) {
            return new Promise<Array<number>>((resolve, reject) => {
                resolve([])
            })
        } else {
            return this.client.mgetAsync(ids.map((id: number) => { 
                return "impact:" + id + ":duration"
            })).then((results: Array<any>) => {
                return results.map((result) => { return result ? +result : null })
            })
        }
    }
    watchTasksImpacts(identifiers: Array<string>) : Promise<void> {
        return this.client.watchAsync(identifiers.map((identifier: string) => {
            return "task:" + identifier + ":impacts" 
        })).then((result) => {})
    }
    watchImpactsDurations(identifiers: Array<string>) : Promise<void> {
        return this.client.watchAsync(identifiers.map((identifier: string) => {
            return "impact:" + identifier + ":duration" 
        })).then((result) => {})
    }
    private static indexFromString(id: string) : number {
        return +id
    }
    private static compareNumbers(first: number, second: number) : number {
        return first - second
    }
    private getMappedProject(identifier: string) : Promise<Project> {
        return this.getProject(identifier).then((project: Project) => {
            return project
        }).catch((error: Error) => {
            return null
        })
    }
    private static checkIdentifier<T extends Identifiable>(type: T) : Promise<void> {
        return RedisDataProvider.checkNullIdentifier(type.identifier)
    }
    private static checkNullIdentifier(identifier: string) : Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (identifier == null) {
                reject(new NullIdentifierError("Null identifier"))
            } else {
                resolve()
            }
        })
    }
    private getNextId(type: string) : Promise<number> {
        return this.client.incrAsync(type + ":lastId").then((id: string) => {
            return this.client.saddAsync(type + ":ids", id).then((result: number) => {
                return +id
            })
        })
    }
    private notHasProject(identifier: string) : Promise<void> {
        return this.client.existsAsync("project:" + identifier).then((result: number) => {
            if (result == 1) {
                throw new ExistsError("Project " + identifier + " already exists")
            }
        })
    }
    private hasProject(identifier: string) : Promise<void> {
        return this.client.existsAsync("project:" + identifier).then((result: number) => {
            if (result != 1) {
                throw new ProjectNotFoundError("Project " + identifier + " not found")
            }
        })
    }
    private notHasTask(identifier: string) : Promise<void> {
        return this.client.existsAsync("task:" + identifier).then((result: number) => {
            if (result == 1) {
                throw new ExistsError("Task " + identifier + " already exists")
            }
        })
    }
    private hasImpact(id: number) : Promise<void> {
        return this.client.existsAsync("impact:" + id).then((result: number) => {
            if (result != 1) {
                throw new ImpactNotFoundError("Impact " + id + " not found")
            }
        })
    }
    private getMappedTask(identifier: string) : Promise<Task> {
        return this.getTask(identifier).then((task: Task) => {
            return task
        }).catch((error: Error) => {
            return null
        })
    }
    private getMappedTaskResults(identifier: string) : Promise<TaskResults> {
        return this.getTaskResults(identifier).then((taskResults: TaskResults) => {
            return taskResults
        }).catch((error: Error) => {
            return null
        })
    }
    private getMappedImpact(id: number) : Promise<Impact> {
        return this.getImpact(id).then((impact: Impact) => {
            return impact
        }).catch((error: Error) => {
            return null
        })
    }
}