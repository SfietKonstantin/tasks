import { IDataProvider, ProjectNotFoundError, TaskNotFoundError, ImpactNotFoundError } from "./idataprovider"
import { Project, Task, Impact } from "../types"
import * as redis from "redis"
import * as async from "async"
import * as bluebird from "bluebird"

const redisAsync: any = bluebird.promisifyAll(redis);

declare module 'redis' {
    export interface RedisClient extends NodeJS.EventEmitter {
        setAsync(...args: any[]): Promise<any>;
        getAsync(...args: any[]): Promise<any>;
        mgetAsync(...args: any[]): Promise<any>;
        incrAsync(...args: any[]): Promise<any>;
        saddAsync(...args: any[]): Promise<any>;
        smembersAsync(...args: any[]): Promise<any>;
        hmsetAsync(...args: any[]): Promise<any>;
        hgetallAsync(...args: any[]): Promise<any>;
        existsAsync(...args: any[]): Promise<number>;
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
    static save(task: Task, client: redis.RedisClient) : Promise<void> {
        let redisTask = new RedisTask(task)
        let id = task.id
        return client.multi().hmset("task:" + id, redisTask)
                             .mset("task:" + id + ":estimatedStartDate", task.estimatedStartDate.getTime(),
                                   "task:" + id + ":estimatedDuration", task.estimatedDuration)
                             .sadd("project:" + task.projectId + ":tasks", id)
                             .execAsync().then((result: any) => {})
        
    }
    static load(id: number, client: redis.RedisClient) : Promise<Task> {
        return client.hgetallAsync("task:" + id).then((result: any) => {
            return client.mgetAsync("task:" + id + ":estimatedStartDate", 
                                    "task:" + id + ":estimatedDuration").then((result2: Array<string>) => {
                let task = new Task(+id, null)
                task.projectId = result.hasOwnProperty("projectId") ? +(result["projectId"]) : null
                task.name = result.hasOwnProperty("name") ? result["name"] : null
                task.description = result.hasOwnProperty("description") ? result["description"] : null 
                task.estimatedStartDate = result2[0] ? new Date(+result2[0]) : null
                task.estimatedDuration = result2[1] ? +(result2[1]) : null
                return task
            })
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
    static save(impact: Impact, client: redis.RedisClient) : Promise<void> {
        let redisImpact = new RedisImpact(impact)
        let id = impact.id
        return client.multi().hmset("impact:" + id, redisImpact)
                             .set("impact:" + id + ":duration", impact.duration)
                             .execAsync().then((result: any) => {})
    }
    static load(id: number, client: redis.RedisClient) : Promise<Impact> {
        return client.hgetallAsync("impact:" + id).then((result: any) => {
            return client.getAsync("impact:" + id + ":duration").then((result2: string) => {
                let impact = new Impact(+id)
                impact.name = result.hasOwnProperty("name") ? result["name"] : null
                impact.description = result.hasOwnProperty("description") ? result["description"] : null 
                impact.duration = result2 ? +result2 : null
                return impact
            })
        })
    }
}

export class RedisDataProvider implements IDataProvider {
    client: redis.RedisClient
    static getDefaultClient() : redis.RedisClient {
        return redis.createClient()
    }
    constructor(client: redis.RedisClient) {
        this.client = client
    }
    getAllProjects() : Promise<Array<Project>> {
        return this.client.smembersAsync("project:ids").then((ids: Array<String>) => {
            let sortedIds = ids.map(RedisDataProvider.indexFromString).sort(RedisDataProvider.compareNumbers)
            return new Promise<Array<Project>>((resolve, reject) => {
                async.map(ids, this.getMappedProject.bind(this), (error: Error, result: Array<Project>) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(result)
                    }
                })
            }).then((projects: Array<Project>) => {
                return projects.filter((project: Project) => { return !!project })
            })
        }).catch((error: Error) => {
            return []
        })
    }
    getProject(id: number) : Promise<Project> {
        return this.projectExists(id).then(() => {
            return this.client.hgetallAsync("project:" + id).then((result: any) => {
                let project = new Project(+id)
                project.name = result.hasOwnProperty("name") ? result["name"] : null
                project.description = result.hasOwnProperty("description") ? result["description"] : null 
                return project
            })
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
            return this.taskExists(taskId).then(() => {
                return this.client.setAsync("project:" + projectId + ":root", taskId)
            })
        })
    }
    getProjectRootTask(projectId: number) : Promise<number> {
        return this.projectExists(projectId).then(() => {
            return this.client.getAsync("project:" + projectId + ":root").then((id: string) => {
                return id ? +id : null
            })
        })
    }
    getTasks(ids: Array<number>) : Promise<Array<Task>> {
        return new Promise<Array<Task>>((resolve, reject) => {
            async.map(ids, this.getMappedTask.bind(this), (error: Error, result: Array<Task>) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(result)
                }
            })
        })
    }
    getTask(id: number) : Promise<Task> {
        return this.taskExists(id).then(() => {
            return RedisTask.load(id, this.client)
        })
    }
    getProjectTasks(id: number) : Promise<Array<Task>> {
        return this.projectExists(id).then(() => {
            return this.client.smembersAsync("project:" + id + ":tasks").then((ids: Array<String>) => {
                return this.getTasks(ids.map(RedisDataProvider.indexFromString)
                                        .sort(RedisDataProvider.compareNumbers))
            })
        })
    }
    addTask(projectId: number, task: Task) : Promise<number> {
        return this.projectExists(projectId).then(() => {
            return this.getNextId("task").then((id: number) => {
                task.id = id
                task.projectId = projectId
                return RedisTask.save(task, this.client).then(() => { return id })
            })
        })
    }
    setTaskRelation(parentTaskId: number, childTaskId: number) : Promise<void> {
        return this.taskExists(parentTaskId).then(() => {
            return this.taskExists(childTaskId).then(() => {
                return this.client.multi().sadd("task:" + parentTaskId + ":children", childTaskId)
                                          .sadd("task:" + childTaskId + ":parents", parentTaskId)
                                          .execAsync()
            })
        })
    }
    getParentTaskIds(id: number) : Promise<Array<number>> {
        return this.taskExists(id).then(() => {
            return this.client.smembersAsync("task:" + id + ":parents").then((ids: Array<string>) => {
                return ids.map(RedisDataProvider.indexFromString).sort(RedisDataProvider.compareNumbers)
            })
        })
    }
    getChildrenTaskIds(id: number) : Promise<Array<number>> {
        return this.taskExists(id).then(() => {
            return this.client.smembersAsync("task:" + id + ":children").then((ids: Array<string>) => {
                return ids.map(RedisDataProvider.indexFromString).sort(RedisDataProvider.compareNumbers)
            })
        })
    }
    getImpacts(ids: Array<number>) : Promise<Array<Impact>> {
        return new Promise<Array<Project>>((resolve, reject) => {
            async.map(ids, this.getMappedImpact.bind(this), (error: Error, result: Array<Impact>) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(result)
                }
            })
        })
    }
    getImpact(id: number): Promise<Impact> {
        return this.impactExists(id).then(() => {
            return RedisImpact.load(id, this.client)
        })
    }
    getTaskImpactIds(id: number) : Promise<Array<number>> {
        return this.taskExists(id).then(() => {
            return this.client.smembersAsync("task:" + id + ":impacts").then((ids: Array<string>) => {
                return ids.map(RedisDataProvider.indexFromString).sort(RedisDataProvider.compareNumbers)
            })
        })
    }
    getImpactedTaskIds(id: number) : Promise<Array<number>> {
        return this.impactExists(id).then(() => {
            return this.client.smembersAsync("impact:" + id + ":tasks").then((ids: Array<string>) => {
                return ids.map(RedisDataProvider.indexFromString).sort(RedisDataProvider.compareNumbers)
            })
        })
    }
    addImpact(impact: Impact) : Promise<number> {
        return this.getNextId("impact").then((id: number) => {
            impact.id = id
            return RedisImpact.save(impact, this.client).then(() => { return id })
        })
    }
    setImpactForTask(id: number, taskId: number) {
        return this.impactExists(id).then(() => {
            return this.taskExists(taskId).then(() => {
                return this.client.multi().sadd("impact:" + id + ":tasks", taskId)
                                          .sadd("task:" + taskId + ":impacts", id)
                                          .execAsync()

            })
        })
    }
    private static indexFromString(id: string) : number {
        return +id
    }
    private static compareNumbers(first: number, second: number) : number {
        return first - second
    }
    private getMappedProject(id: number, callback: (error: Error, project: Project) => void) {
        this.getProject(id).then((project: Project) => {
            callback(null, project)
        }).catch((error: Error) => {
            callback(null, null)
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
    private getMappedTask(id: number, callback: (error: Error, task: Task) => void) {
        this.getTask(id).then((task: Task) => {
            callback(null, task)
        }).catch((error: Error) => {
            callback(error, null)
        })
    }
    private getMappedImpact(id: number, callback: (error: Error, impact: Impact) => void) {
        this.getImpact(id).then((impact: Impact) => {
            callback(null, impact)
        }).catch((error: Error) => {
            callback(error, null)
        })
    }
}