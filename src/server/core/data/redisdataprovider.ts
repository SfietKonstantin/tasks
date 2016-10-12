import {
    CorruptedError, NullIdentifierError, ExistsError,
    ProjectNotFoundError, TaskNotFoundError, ModifierNotFoundError,
    DelayNotFoundError, TransactionError
} from "./idataprovider"
import { IRedisDataProvider } from "./iredisdataprovider"
import { Identifiable, Project, Task, TaskResults, Modifier, Delay } from "../../../common/types"
import * as redis from "redis"
import * as bluebird from "bluebird"

const redisAsync: any = bluebird.promisifyAll(redis)

declare module "redis" {
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

    static save(project: Project, client: redis.RedisClient): Promise<void> {
        const redisProject = new RedisProject(project)
        const identifier = project.identifier
        return client.multi().hmset("project:" + identifier, redisProject)
                             .sadd("project:ids", identifier)
                             .execAsync().then((result: any) => {})
    }

    static load(identifier: string, client: redis.RedisClient): Promise<Project> {

        return client.hgetallAsync("project:" + identifier).then((result: any) => {
            if (!result.hasOwnProperty("name")) {
                throw new CorruptedError("Project " + identifier + " do not have property name")
            }
            if (!result.hasOwnProperty("description")) {
                throw new CorruptedError("Project " + identifier + " do not have property description")
            }
            const project: Project = {
                identifier,
                name: result["name"] as string,
                description: result["description"] as string
            }
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
    static save(task: Task, client: redis.RedisClient): Promise<void> {
        const redisTask = new RedisTask(task)
        const identifier = task.identifier
        return client.multi().hmset("task:" + identifier, redisTask)
                             .mset("task:" + identifier + ":estimatedStartDate", task.estimatedStartDate.getTime(),
                                   "task:" + identifier + ":estimatedDuration", task.estimatedDuration)
                             .sadd("project:" + task.projectIdentifier + ":tasks", identifier)
                             .execAsync().then((result: any) => {})
    }
    static load(identifier: string, client: redis.RedisClient): Promise<Task> {
        return client.hgetallAsync("task:" + identifier).then((result: any) => {
            if (!result.hasOwnProperty("name")) {
                throw new CorruptedError("Task " + identifier + " do not have property projectIdentifier")
            }
            if (!result.hasOwnProperty("name")) {
                throw new CorruptedError("Task " + identifier + " do not have property name")
            }
            if (!result.hasOwnProperty("description")) {
                throw new CorruptedError("Task " + identifier + " do not have property description")
            }
            const projectIdentifier: string = result["projectIdentifier"]
            const name: string = result["name"]
            const description: string = result["description"]
            return client.mgetAsync("task:" + identifier + ":estimatedStartDate",
                                    "task:" + identifier + ":estimatedDuration")
                         .then((result: Array<string>) => {
                if (!result[0]) {
                    throw new CorruptedError("Task " + identifier + " do not have property estimatedStartDate")
                }
                if (!result[1]) {
                    throw new CorruptedError("Task " + identifier + " do not have property estimatedDuration")
                }

                const task: Task = {
                    identifier,
                    projectIdentifier,
                    name,
                    description,
                    estimatedStartDate: new Date(+result[0]),
                    estimatedDuration: +result[1]
                }
                return task
            })
        })
    }
}

class RedisModifier {
    name: string
    description: string

    constructor(modifier: Modifier) {
        this.name = modifier.name
        this.description = modifier.description
    }
    static save(id: number, modifier: Modifier, client: redis.RedisClient): Promise<number> {
        const redisModifier = new RedisModifier(modifier)
        return client.multi().hmset("modifier:" + id, redisModifier)
                             .set("modifier:" + id + ":duration", modifier.duration)
                             .execAsync().then((result: any) => { return id })
    }
    static load(id: number, client: redis.RedisClient): Promise<Modifier> {
        return client.hgetallAsync("modifier:" + id).then((result: any) => {
            if (!result.hasOwnProperty("name")) {
                throw new CorruptedError("Modifier " + id + " do not have property name")
            }
            if (!result.hasOwnProperty("description")) {
                throw new CorruptedError("Modifier " + id + " do not have property description")
            }
            const name: string = result["name"]
            const description: string = result["description"]
            return client.getAsync("modifier:" + id + ":duration").then((result: string) => {
                if (!result) {
                    throw new CorruptedError("Modifier " + id + " do not have property duration")
                }
                const modifier: Modifier = {
                    name,
                    description,
                    duration: +result
                }
                return modifier
            })
        })
    }
}

class RedisDelay {
    identifier: string
    projectIdentifier: string
    name: string
    description: string
    date: number

    constructor(delay: Delay) {
        this.identifier = delay.identifier
        this.projectIdentifier = delay.projectIdentifier
        this.name = delay.name
        this.description = delay.description
        this.date = delay.date.getTime()
    }
    static save(delay: Delay, client: redis.RedisClient): Promise<void> {
        const redisDelay = new RedisDelay(delay)
        const identifier = delay.identifier
        return client.multi().hmset("delay:" + identifier, redisDelay)
                             .sadd("project:" + delay.projectIdentifier + ":delays", identifier)
                             .execAsync().then((result: any) => {})
    }
    static load(identifier: string, client: redis.RedisClient): Promise<Delay> {
        return client.hgetallAsync("delay:" + identifier).then((result: any) => {
            if (!result.hasOwnProperty("projectIdentifier")) {
                throw new CorruptedError("Delay " + identifier + " do not have property projectIdentifier")
            }
            if (!result.hasOwnProperty("name")) {
                throw new CorruptedError("Delay " + identifier + " do not have property name")
            }
            if (!result.hasOwnProperty("description")) {
                throw new CorruptedError("Delay " + identifier + " do not have property description")
            }
            if (!result.hasOwnProperty("date")) {
                throw new CorruptedError("Delay " + identifier + " do not have property date")
            }
            const projectIdentifier: string = result["projectIdentifier"]
            const name: string = result["name"]
            const description: string = result["description"]

            const delay: Delay = {
                identifier: identifier,
                projectIdentifier,
                name,
                description,
                date: new Date(+result["date"]),
            }
            return delay
        })
    }
}

export class RedisDataProvider implements IRedisDataProvider {
    client: redis.RedisClient
    static getDefaultClient(): redis.RedisClient {
        return redis.createClient()
    }
    constructor(client: redis.RedisClient) {
        this.client = client
    }
    getAllProjects(): Promise<Array<Project>> {
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
    getProject(identifier: string): Promise<Project> {
        return this.hasProject(identifier).then(() => {
            return RedisProject.load(identifier, this.client)
        })
    }
    addProject(project: Project): Promise<void> {
        return RedisDataProvider.checkIdentifier(project).then(() => {
            return this.notHasProject(project.identifier)
        }).then(() => {
            return RedisProject.save(project, this.client)
        })
    }
    hasTask(identifier: string): Promise<void> {
        return this.client.existsAsync("task:" + identifier).then((result: number) => {
            if (result !== 1) {
                throw new TaskNotFoundError("Task " + identifier + " not found")
            }
        })
    }
    getTasks(identifiers: Array<string>): Promise<Array<Task>> {
        return Promise.all(identifiers.map(this.getMappedTask.bind(this)))
    }
    getTask(identifier: string): Promise<Task> {
        return this.hasTask(identifier).then(() => {
            return RedisTask.load(identifier, this.client)
        })
    }
    getProjectTasks(identifier: string): Promise<Array<Task>> {
        return this.hasProject(identifier).then(() => {
            return this.client.smembersAsync("project:" + identifier + ":tasks")
        }).then((identifiers: Array<string>) => {
            return this.getTasks(identifiers.sort())
        })
    }
    addTask(task: Task): Promise<void> {
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
    setTaskRelation(parentTaskIdentifier: string, childTaskIdentifier: string): Promise<void> {
        return this.hasTask(parentTaskIdentifier).then(() => {
            return this.hasTask(childTaskIdentifier)
        }).then(() => {
            return this.client.multi().sadd("task:" + parentTaskIdentifier + ":children", childTaskIdentifier)
                                      .sadd("task:" + childTaskIdentifier + ":parents", parentTaskIdentifier)
                                      .execAsync()
        })
    }
    getParentTaskIdentifiers(identifier: string): Promise<Array<string>> {
        return this.hasTask(identifier).then(() => {
            return this.client.smembersAsync("task:" + identifier + ":parents")
        }).then((identifiers: Array<string>) => {
            return identifiers.sort()
        })
    }
    getChildrenTaskIdentifiers(identifier: string): Promise<Array<string>> {
        return this.hasTask(identifier).then(() => {
            return this.client.smembersAsync("task:" + identifier + ":children")
        }).then((ids: Array<string>) => {
            return ids.sort()
        })
    }
    isTaskImportant(identifier: string): Promise<boolean> {
        return this.hasTask(identifier).then(() => {
            return this.client.sismemberAsync("task:important", identifier)
        }).then((result: number) => {
            return (result !== 0)
        })
    }
    setTaskImportant(identifier: string, important: boolean): Promise<void> {
        return this.hasTask(identifier).then(() => {
            if (important) {
                return this.client.saddAsync("task:important", identifier)
            } else {
                return this.client.sremAsync("task:important", identifier)
            }
        })
    }
    getTasksResults(identifiers: Array<string>): Promise<Array<TaskResults>> {
        return Promise.all(identifiers.map(this.getMappedTaskResults.bind(this)))
    }
    getTaskResults(identifier: string): Promise<TaskResults> {
        return this.hasTask(identifier).then(() => {
            return this.client.mgetAsync("task:" + identifier + ":startDate", "task:" + identifier + ":duration")
        }).then((results: Array<string>) => {
            if (!results[0]) {
                throw new CorruptedError("Task " + identifier + " do not have property startDate")
            }
            if (!results[1]) {
                throw new CorruptedError("Task " + identifier + " do not have property duration")
            }
            const taskResults: TaskResults = {
                taskIdentifier: identifier,
                startDate: new Date(+results[0]),
                duration: +results[1]
            }
            return taskResults
        })
    }
    setTasksResults(results: Array<TaskResults>): Promise<void> {
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
    getModifiers(ids: Array<number>): Promise<Array<Modifier>> {
        return Promise.all(ids.map(this.getMappedModifier.bind(this)))
    }
    getModifier(id: number): Promise<Modifier> {
        return this.hasModifier(id).then(() => {
            return RedisModifier.load(id, this.client)
        })
    }
    getTaskModifierIds(identifier: string): Promise<Array<number>> {
        return this.hasTask(identifier).then(() => {
            return this.client.smembersAsync("task:" + identifier + ":modifiers")
        }).then((ids: Array<string>) => {
            return ids.map(RedisDataProvider.indexFromString).sort(RedisDataProvider.compareNumbers)
        })
    }
    getModifieredTaskIds(id: number): Promise<Array<string>> {
        return this.hasModifier(id).then(() => {
            return this.client.smembersAsync("modifier:" + id + ":tasks")
        }).then((ids: Array<string>) => {
            return ids.sort()
        })
    }
    addModifier(modifier: Modifier): Promise<number> {
        return this.getNextId("modifier").then((id: number) => {
            return RedisModifier.save(id, modifier, this.client)
        })
    }
    setModifierForTask(id: number, taskIdentifier: string): Promise<void> {
        return this.hasModifier(id).then(() => {
            return this.hasTask(taskIdentifier)
        }).then(() => {
            return this.client.multi().sadd("modifier:" + id + ":tasks", taskIdentifier)
                                      .sadd("task:" + taskIdentifier + ":modifiers", id)
                                      .execAsync()
        })
    }
    getModifiersValues(ids: Array<number>): Promise<Array<number>> {
        if (ids.length === 0) {
            return new Promise<Array<number>>((resolve, reject) => {
                resolve([])
            })
        } else {
            return this.client.mgetAsync(ids.map((id: number) => {
                return "modifier:" + id + ":duration"
            })).then((results: Array<any>) => {
                return results.map((result) => { return result ? +result : null })
            })
        }
    }
    getDelays(identifiers: Array<string>): Promise<Array<Delay>> {
        return Promise.all(identifiers.map(this.getMappedDelays.bind(this)))
    }
    getDelay(identifier: string): Promise<Delay> {
        return this.hasDelay(identifier).then(() => {
            return RedisDelay.load(identifier, this.client)
        })
    }
    addDelay(delay: Delay): Promise<void> {
        return RedisDataProvider.checkIdentifier(delay).then(() => {
            return RedisDataProvider.checkNullIdentifier(delay.projectIdentifier)
        }).then(() => {
            return this.hasProject(delay.projectIdentifier)
        }).then(() => {
            return this.notHasDelay(delay.identifier)
        }).then(() => {
            return RedisDelay.save(delay, this.client)
        })
    }
    getProjectDelays(identifier: string): Promise<Array<Delay>> {
        return this.hasProject(identifier).then(() => {
            return this.client.smembersAsync("project:" + identifier + ":delays")
        }).then((identifiers: Array<string>) => {
            return this.getDelays(identifiers.sort())
        })
    }
    setDelayTaskRelation(delayIdentifier: string, taskIdentifier: string): Promise<void> {
        return this.hasDelay(delayIdentifier).then(() => {
            return this.hasTask(taskIdentifier)
        }).then(() => {
            return this.client.multi().sadd("delay:" + delayIdentifier + ":tasks", taskIdentifier)
                                      .sadd("task:" + taskIdentifier + ":delays", delayIdentifier)
                                      .execAsync()
        })
    }
    getTaskDelayIds(identifier: string): Promise<Array<string>> {
        return this.hasTask(identifier).then(() => {
            return this.client.smembersAsync("task:" + identifier + ":delays")
        }).then((identifiers: Array<string>) => {
            return identifiers.sort()
        })
    }
    getDelayTaskIds(identifier: string): Promise<Array<string>> {
        return this.hasDelay(identifier).then(() => {
            return this.client.smembersAsync("delay:" + identifier + ":tasks")
        }).then((identifiers: Array<string>) => {
            return identifiers.sort()
        })
    }
    watchTasksModifiers(identifiers: Array<string>): Promise<void> {
        return this.client.watchAsync(identifiers.map((identifier: string) => {
            return "task:" + identifier + ":modifiers"
        })).then((result) => {})
    }
    watchModifiersDurations(identifiers: Array<string>): Promise<void> {
        return this.client.watchAsync(identifiers.map((identifier: string) => {
            return "modifier:" + identifier + ":duration"
        })).then((result) => {})
    }
    private static indexFromString(id: string): number {
        return +id
    }
    private static compareNumbers(first: number, second: number): number {
        return first - second
    }
    private getMappedProject(identifier: string): Promise<Project> {
        return this.getProject(identifier).then((project: Project) => {
            return project
        }).catch((error: Error) => {
            return null
        })
    }
    private static checkIdentifier<T extends Identifiable>(type: T): Promise<void> {
        return RedisDataProvider.checkNullIdentifier(type.identifier)
    }
    private static checkNullIdentifier(identifier: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (identifier == null) {
                reject(new NullIdentifierError("Null identifier"))
            } else {
                resolve()
            }
        })
    }
    private getNextId(type: string): Promise<number> {
        return this.client.incrAsync(type + ":lastId").then((id: string) => {
            return this.client.saddAsync(type + ":ids", id).then((result: number) => {
                return +id
            })
        })
    }
    private notHasProject(identifier: string): Promise<void> {
        return this.client.existsAsync("project:" + identifier).then((result: number) => {
            if (result === 1) {
                throw new ExistsError("Project " + identifier + " already exists")
            }
        })
    }
    private hasProject(identifier: string): Promise<void> {
        return this.client.existsAsync("project:" + identifier).then((result: number) => {
            if (result !== 1) {
                throw new ProjectNotFoundError("Project " + identifier + " not found")
            }
        })
    }
    private notHasTask(identifier: string): Promise<void> {
        return this.client.existsAsync("task:" + identifier).then((result: number) => {
            if (result === 1) {
                throw new ExistsError("Task " + identifier + " already exists")
            }
        })
    }
    private notHasDelay(identifier: string): Promise<void> {
        return this.client.existsAsync("delay:" + identifier).then((result: number) => {
            if (result === 1) {
                throw new ExistsError("Delay " + identifier + " already exists")
            }
        })
    }
    private hasModifier(id: number): Promise<void> {
        return this.client.existsAsync("modifier:" + id).then((result: number) => {
            if (result !== 1) {
                throw new ModifierNotFoundError("Modifier " + id + " not found")
            }
        })
    }
    private hasDelay(identifier: string): Promise<void> {
        return this.client.existsAsync("delay:" + identifier).then((result: number) => {
            if (result !== 1) {
                throw new DelayNotFoundError("Delay " + identifier + " not found")
            }
        })
    }
    private getMappedTask(identifier: string): Promise<Task> {
        return this.getTask(identifier).then((task: Task) => {
            return task
        }).catch((error: Error) => {
            return null
        })
    }
    private getMappedTaskResults(identifier: string): Promise<TaskResults> {
        return this.getTaskResults(identifier).then((taskResults: TaskResults) => {
            return taskResults
        }).catch((error: Error) => {
            return null
        })
    }
    private getMappedModifier(id: number): Promise<Modifier> {
        return this.getModifier(id).then((modifier: Modifier) => {
            return modifier
        }).catch((error: Error) => {
            return null
        })
    }
    private getMappedDelays(identifier: string): Promise<Delay> {
        return this.getDelay(identifier).then((delay: Delay) => {
            return delay
        }).catch((error: Error) => {
            return null
        })
    }
}
