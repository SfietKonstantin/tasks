import { ProjectNotFoundError, TaskNotFoundError, ImpactNotFoundError, InvalidInputError, TransactionError } from "./idataprovider"
import { IRedisDataProvider } from "./iredisdataprovider"
import { Project, Task, TaskResults, Impact } from "../types"
import * as redis from "redis"
import * as bluebird from "bluebird"

const redisAsync: any = bluebird.promisifyAll(redis);

declare module 'redis' {
    export interface RedisClient extends NodeJS.EventEmitter {
        setAsync(...args: any[]): Promise<any>;
        getAsync(...args: any[]): Promise<any>;
        mgetAsync(...args: any[]): Promise<any>;
        msetAsync(...args: any[]): Promise<any>;
        incrAsync(...args: any[]): Promise<any>;
        sismemberAsync(...args: any[]): Promise<any>;
        saddAsync(...args: any[]): Promise<any>;
        sremAsync(...args: any[]): Promise<any>;
        smembersAsync(...args: any[]): Promise<any>;
        hmsetAsync(...args: any[]): Promise<any>;
        hgetallAsync(...args: any[]): Promise<any>;
        existsAsync(...args: any[]): Promise<number>;
        watchAsync(...args: any[]): Promise<any>;
    }
    export interface Multi {
        execAsync(): Promise<any>;
    }
}

class RedisTask {
    id: number
    projectId: number
    name: string
    description: string

    constructor(task: Task) {
        this.id = task.id
        this.projectId = task.projectId
        this.name = task.name
        this.description = task.description
    }
    static save(task: Task, client: redis.RedisClient) : Promise<number> {
        let redisTask = new RedisTask(task)
        const id = task.id
        return client.hmsetAsync("task:" + id, redisTask).then(() => {
            return client.multi().mset("task:" + id + ":estimatedStartDate", task.estimatedStartDate.getTime(),
                                       "task:" + id + ":estimatedDuration", task.estimatedDuration)
                                 .sadd("project:" + task.projectId + ":tasks", id)
                                 .execAsync()
        }).then((result: any) => { return id })
    }
    static load(id: number, client: redis.RedisClient) : Promise<Task> {
        let task = new Task(+id, null)
        return client.hgetallAsync("task:" + id).then((result: any) => {
            task.projectId = result.hasOwnProperty("projectId") ? +(result["projectId"]) : null
            task.name = result.hasOwnProperty("name") ? result["name"] : null
            task.description = result.hasOwnProperty("description") ? result["description"] : null
            return client.mgetAsync("task:" + id + ":estimatedStartDate", 
                                    "task:" + id + ":estimatedDuration")
        }).then((result: Array<string>) => { 
            task.estimatedStartDate = result[0] ? new Date(+result[0]) : null
            task.estimatedDuration = result[1] ? +(result[1]) : null
            return task
        })
    }
}

class RedisImpact {
    id: number
    taskId: number
    name: string
    description: string

    constructor(impact: Impact) {
        this.id = impact.id
        this.name = impact.name
        this.description = impact.description
    }
    static save(impact: Impact, client: redis.RedisClient) : Promise<number> {
        let redisImpact = new RedisImpact(impact)
        const id = impact.id
        return client.multi().hmset("impact:" + id, redisImpact)
                             .set("impact:" + id + ":duration", impact.duration)
                             .execAsync().then((result: any) => { return id })
    }
    static load(id: number, client: redis.RedisClient) : Promise<Impact> {
        let impact = new Impact(+id)
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
            const sortedIds = ids.map(RedisDataProvider.indexFromString).sort(RedisDataProvider.compareNumbers)
            const promises = sortedIds.map(this.getMappedProject.bind(this))
            return Promise.all(promises)
        }).then((projects: Array<Project>) => {
            return projects.filter((project: Project) => { return !!project })
        }).catch((error: Error) => {
            return []
        })
    }
    getProject(id: number) : Promise<Project> {
        return this.projectExists(id).then(() => {
            return this.client.hgetallAsync("project:" + id)
        }).then((result: any) => {
            let project = new Project(+id)
            project.name = result.hasOwnProperty("name") ? result["name"] : null
            project.description = result.hasOwnProperty("description") ? result["description"] : null 
            return project
        })
    }
    addProject(project: Project) : Promise<number> {
        return this.getNextId("project").then((id: number) => {
            project.id = id
            return this.client.hmsetAsync("project:" + id, project).then((result: any) => { return id })
        })
    }
    setProjectRootTask(projectId: number, taskId: number) : Promise<void> {
        return this.projectExists(projectId).then(() => {
            return this.taskExists(taskId)
        }).then(() => {
            return this.client.setAsync("project:" + projectId + ":root", taskId)
        })
    }
    getProjectRootTask(projectId: number) : Promise<number> {
        return this.projectExists(projectId).then(() => {
            return this.client.getAsync("project:" + projectId + ":root")
        }).then((id: string) => {
            return id ? +id : null
        })
    }
    getTasks(ids: Array<number>) : Promise<Array<Task>> {
        return Promise.all(ids.map(this.getMappedTask.bind(this)))
    }
    getTask(id: number) : Promise<Task> {
        return this.taskExists(id).then(() => {
            return RedisTask.load(id, this.client)
        })
    }
    getProjectTasks(id: number) : Promise<Array<Task>> {
        return this.projectExists(id).then(() => {
            return this.client.smembersAsync("project:" + id + ":tasks")
        }).then((ids: Array<String>) => {
            return this.getTasks(ids.map(RedisDataProvider.indexFromString)
                                    .sort(RedisDataProvider.compareNumbers))
        })
    }
    addTask(projectId: number, task: Task) : Promise<number> {
        return this.projectExists(projectId).then(() => {
            return this.getNextId("task")
        }).then((id: number) => {
            task.id = id
            task.projectId = projectId
            return RedisTask.save(task, this.client)
        })
    }
    setTaskRelation(parentTaskId: number, childTaskId: number) : Promise<void> {
        return this.taskExists(parentTaskId).then(() => {
            return this.taskExists(childTaskId)
        }).then(() => {
            return this.client.multi().sadd("task:" + parentTaskId + ":children", childTaskId)
                                      .sadd("task:" + childTaskId + ":parents", parentTaskId)
                                      .execAsync()
        })
    }
    getParentTaskIds(id: number) : Promise<Array<number>> {
        return this.taskExists(id).then(() => {
            return this.client.smembersAsync("task:" + id + ":parents")
        }).then((ids: Array<string>) => {
            return ids.map(RedisDataProvider.indexFromString).sort(RedisDataProvider.compareNumbers)
        })
    }
    getChildrenTaskIds(id: number) : Promise<Array<number>> {
        return this.taskExists(id).then(() => {
            return this.client.smembersAsync("task:" + id + ":children")
        }).then((ids: Array<string>) => {
            return ids.map(RedisDataProvider.indexFromString).sort(RedisDataProvider.compareNumbers)
        })
    }
    isTaskImportant(id: number) : Promise<boolean> {
        return this.taskExists(id).then(() => {
            return this.client.sismemberAsync("task:important", id)
        }).then((result: number) => {
            return (result != 0)
        })
    }
    setTaskImportant(id: number, important: boolean) : Promise<void> {
        return this.taskExists(id).then(() => {
            if (important) {
                return this.client.saddAsync("task:important", id)
            } else {
                return this.client.sremAsync("task:important", id)
            }
        })
    }
    getTaskResults(id: number) : Promise<TaskResults> {
        return this.taskExists(id).then(() => {
            return this.client.mgetAsync("task:" + id + ":startDate", "task:" + id + ":duration")
        }).then((results: Array<string>) => {
            const startDate = results[0] ? new Date(+results[0]) : null
            const duration = results[1] ? +results[1] : null
            return new TaskResults(id, startDate, duration)
        })
    }
    setTasksResults(results: Array<TaskResults>) : Promise<void> {
        return Promise.all(results.map((results: TaskResults) => {
            return this.taskExists(results.taskId)
        })).then(() => {
            let set = new Array<string>()
            for (let result of results) {
                set.push("task:" + result.taskId + ":duration")
                set.push("" + result.duration)
                set.push("task:" + result.taskId + ":startDate")
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
        return this.impactExists(id).then(() => {
            return RedisImpact.load(id, this.client)
        })
    }
    getTaskImpactIds(id: number) : Promise<Array<number>> {
        return this.taskExists(id).then(() => {
            return this.client.smembersAsync("task:" + id + ":impacts")
        }).then((ids: Array<string>) => {
            return ids.map(RedisDataProvider.indexFromString).sort(RedisDataProvider.compareNumbers)
        })
    }
    getImpactedTaskIds(id: number) : Promise<Array<number>> {
        return this.impactExists(id).then(() => {
            return this.client.smembersAsync("impact:" + id + ":tasks")
        }).then((ids: Array<string>) => {
            return ids.map(RedisDataProvider.indexFromString).sort(RedisDataProvider.compareNumbers)
        })
    }
    addImpact(impact: Impact) : Promise<number> {
        return this.getNextId("impact").then((id: number) => {
            impact.id = id
            return RedisImpact.save(impact, this.client)
        })
    }
    setImpactForTask(id: number, taskId: number) : Promise<void> {
        return this.impactExists(id).then(() => {
            return this.taskExists(taskId)
        }).then(() => {
            return this.client.multi().sadd("impact:" + id + ":tasks", taskId)
                                      .sadd("task:" + taskId + ":impacts", id)
                                      .execAsync()
        })
    }
    getImpactsValues(ids: Array<number>) : Promise<Array<number>> {
        return this.client.mgetAsync(ids.map((id: number) => { 
            return "impact:" + id + ":duration"
        })).then((results: Array<any>) => {
            return results.map((result) => { return result ? +result : null })
        })
    }
    watchTasksImpacts(ids: Array<number>) : Promise<void> {
        return this.client.watchAsync(ids.map((id: number) => {
            return "task:" + id + ":impacts" 
        })).then((result) => {})
    }
    watchImpactsDurations(ids: Array<number>) : Promise<void> {
        return this.client.watchAsync(ids.map((id: number) => {
            return "impact:" + id + ":duration" 
        })).then((result) => {})
    }
    private static indexFromString(id: string) : number {
        return +id
    }
    private static compareNumbers(first: number, second: number) : number {
        return first - second
    }
    private getMappedProject(id: number) : Promise<Project> {
        return this.getProject(id).then((project: Project) => {
            return project
        }).catch((error: Error) => {
            return null
        })
    }
    private getNextId(type: string) : Promise<number> {
        return this.client.incrAsync(type + ":lastId").then((id: string) => {
            return this.client.saddAsync(type + ":ids", id).then((result: number) => {
                return +id
            })
        })
    }
    private projectExists(id: number) : Promise<void> {
        return this.client.existsAsync("project:" + id).then((result: number) => {
            if (result != 1) {
                throw new ProjectNotFoundError("Project " + id + " not found")
            }
        })
    }
    private taskExists(id: number) : Promise<void> {
        return this.client.existsAsync("task:" + id).then((result: number) => {
            if (result != 1) {
                throw new TaskNotFoundError("Task " + id + " not found")
            }
        })
    }
    private impactExists(id: number) : Promise<void> {
        return this.client.existsAsync("impact:" + id).then((result: number) => {
            if (result != 1) {
                throw new ImpactNotFoundError("Impact " + id + " not found")
            }
        })
    }
    private getMappedTask(id: number) : Promise<Task> {
        return this.getTask(id).then((task: Task) => {
            return task
        }).catch((rror: Error) => {
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