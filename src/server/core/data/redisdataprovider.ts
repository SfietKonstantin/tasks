import { CorruptedError, IDataProvider } from "./idataprovider"
import {
    Identifiable, Project, Task, TaskRelation, TaskResults,
    Modifier, TaskLocation, Delay
} from "../../../common/types"
import { ExistsError, NotFoundError } from "../../../common/errors"
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

const projectRootKey = (projectIdentifier: string) => {
    return "project:" + projectIdentifier
}

const projectKey = (projectIdentifier: string, property: string) => {
    return "project:" + projectIdentifier + ":" + property
}

const taskRootKey = (projectIdentifier: string, taskIdentifier: string) => {
    return "task:" + projectIdentifier + ":" + taskIdentifier
}

const taskKey = (projectIdentifier: string, taskIdentifier: string, property: string) => {
    return "task:" + projectIdentifier + ":" + taskIdentifier + ":" + property
}

const taskRelationKey = (projectIdentifier: string, previousIdentifier: string, nextIdentifier: string) => {
    return "task:" + projectIdentifier + ":" + previousIdentifier + ":relation:" + nextIdentifier
}

const modifierRootKey = (projectIdentifier: string, modifierId: number) => {
    return "modifier:" + projectIdentifier + ":" + modifierId
}

const modifierKey = (projectIdentifier: string, modifierId: number, property: string) => {
    return "modifier:" + projectIdentifier + ":" + modifierId + ":" + property
}

const delayRootKey = (projectIdentifier: string, taskIdentifier: string) => {
    return "delay:" + projectIdentifier + ":" + taskIdentifier
}

const delayKey = (projectIdentifier: string, taskIdentifier: string, property: string) => {
    return "delay:" + projectIdentifier + ":" + taskIdentifier + ":" + property
}

const fromTaskLocation = (location: TaskLocation): string => {
    switch (location) {
        case TaskLocation.Beginning:
            return "Beginning"
        case TaskLocation.End:
            return "End"
        default:
            return ""
    }
}

const toTaskLocation = (location: string): TaskLocation | null => {
    if (location === "Beginning") {
        return TaskLocation.Beginning
    } else if (location === "End") {
        return TaskLocation.End
    } else {
        return null
    }
}

class RedisProject {
    name: string
    description: string

    constructor(project: Project) {
        this.name = project.name
        this.description = project.description
    }

    static save(project: Project, client: redis.RedisClient): Promise<void> {
        const redisProject = new RedisProject(project)
        const projectIdentifier = project.identifier
        return client.multi().hmset(projectRootKey(projectIdentifier), redisProject)
                             .sadd("project:ids", projectIdentifier)
                             .execAsync().then((result: any) => {})
    }

    static load(projectIdentifier: string, client: redis.RedisClient): Promise<Project> {

        return client.hgetallAsync(projectRootKey(projectIdentifier)).then((result: any) => {
            if (!result.hasOwnProperty("name")) {
                throw new CorruptedError("Project " + projectIdentifier + " do not have property name")
            }
            if (!result.hasOwnProperty("description")) {
                throw new CorruptedError("Project " + projectIdentifier + " do not have property description")
            }
            const project: Project = {
                identifier: projectIdentifier,
                name: result["name"] as string,
                description: result["description"] as string
            }
            return project
        })
    }
}

class RedisTask {
    name: string
    description: string

    constructor(task: Task) {
        this.name = task.name
        this.description = task.description
    }
    static save(projectIdentifier: string, task: Task, client: redis.RedisClient): Promise<void> {
        const redisTask = new RedisTask(task)
        const taskIdentifier = task.identifier
        return client.multi().hmset(taskRootKey(projectIdentifier, taskIdentifier), redisTask)
                             .mset(taskKey(projectIdentifier, taskIdentifier, "estimatedStartDate"),
                                   task.estimatedStartDate.getTime(),
                                   taskKey(projectIdentifier, taskIdentifier, "estimatedDuration"),
                                   task.estimatedDuration)
                             .sadd(projectKey(projectIdentifier, "tasks"),
                                   taskIdentifier)
                             .execAsync().then((result: any) => {})
    }
    static load(projectIdentifier: string, taskIdentifier: string, client: redis.RedisClient): Promise<Task> {
        return client.hgetallAsync(taskRootKey(projectIdentifier, taskIdentifier)).then((result: any) => {
            if (!result.hasOwnProperty("name")) {
                throw new CorruptedError("Task " + taskIdentifier + " do not have property name")
            }
            if (!result.hasOwnProperty("description")) {
                throw new CorruptedError("Task " + taskIdentifier + " do not have property description")
            }
            const name: string = result["name"]
            const description: string = result["description"]
            return client.mgetAsync(taskKey(projectIdentifier, taskIdentifier, "estimatedStartDate"),
                                    taskKey(projectIdentifier, taskIdentifier, "estimatedDuration"))
                         .then((result: Array<string>) => {
                if (!result[0]) {
                    throw new CorruptedError("Task " + taskIdentifier + " do not have property estimatedStartDate")
                }
                if (!result[1]) {
                    throw new CorruptedError("Task " + taskIdentifier + " do not have property estimatedDuration")
                }

                const task: Task = {
                    identifier: taskIdentifier,
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

class RedisTaskRelation {
    previousLocation: string
    nextLocation: string
    lag: number

    constructor(taskRelation: TaskRelation) {
        this.previousLocation = fromTaskLocation(taskRelation.previousLocation)
        this.nextLocation = fromTaskLocation(taskRelation.nextLocation)
        this.lag = taskRelation.lag
    }

    static save(projectIdentifier: string, relation: TaskRelation, client: redis.RedisClient): Promise<void> {
        const redisTaskRelation = new RedisTaskRelation(relation)
        return client.hmsetAsync(taskRelationKey(projectIdentifier, relation.previous, relation.next),
                                 redisTaskRelation).then(() => {
            return client.saddAsync(taskKey(projectIdentifier, relation.previous, "relations"), relation.next)
        })
    }

    static load(projectIdentifier: string, previous: string, next: string,
                client: redis.RedisClient): Promise<TaskRelation> {
        return client.hgetallAsync(taskRelationKey(projectIdentifier, previous, next))
                     .then((result: any) => {
            if (!result.hasOwnProperty("previousLocation")) {
                throw new CorruptedError("TaskRelation " + previous + "-" + next
                                                         + " do not have property previousLocation")
            }
            if (!result.hasOwnProperty("nextLocation")) {
                throw new CorruptedError("TaskRelation " + previous + "-" + next + " do not have property nextLocation")
            }
            if (!result.hasOwnProperty("lag")) {
                throw new CorruptedError("TaskRelation " + previous + "-" + next + " do not have property lag")
            }
            const previousLocation = toTaskLocation(result["previousLocation"])
            if (previousLocation == null) {
                throw new CorruptedError("TaskRelation " + previous + "-" + next + " has an invalid previousLocation")
            }
            const nextLocation = toTaskLocation(result["nextLocation"])
            if (nextLocation == null) {
                throw new CorruptedError("TaskRelation " + previous + "-" + next + " has an invalid nextLocation")
            }
            const relation: TaskRelation = {
                previous,
                previousLocation,
                next,
                nextLocation,
                lag: +(result["lag"] as string)
            }
            return relation
        })
    }
}

class RedisModifier {
    name: string
    description: string
    location: string

    constructor(modifier: Modifier) {
        this.name = modifier.name
        this.description = modifier.description
        this.location = fromTaskLocation(modifier.location)
    }
    static save(projectIdentifier: string, modifierId: number, modifier: Modifier,
                client: redis.RedisClient): Promise<number> {
        const redisModifier = new RedisModifier(modifier)
        return client.multi().hmset(modifierRootKey(projectIdentifier, modifierId), redisModifier)
                             .set(modifierKey(projectIdentifier, modifierId, "duration"), modifier.duration)
                             .execAsync().then((result: any) => { return modifierId })
    }
    static load(projectIdentifier: string, modifierId: number, client: redis.RedisClient): Promise<Modifier> {
        return client.hgetallAsync(modifierRootKey(projectIdentifier, modifierId)).then((result: any) => {
            if (!result.hasOwnProperty("name")) {
                throw new CorruptedError("Modifier " + modifierId + " do not have property name")
            }
            if (!result.hasOwnProperty("description")) {
                throw new CorruptedError("Modifier " + modifierId + " do not have property description")
            }
            if (!result.hasOwnProperty("location")) {
                throw new CorruptedError("Modifier " + modifierId + " do not have property location")
            }
            const name: string = result["name"]
            const description: string = result["description"]
            const location = toTaskLocation(result["location"])
            if (location == null) {
                throw new CorruptedError("Modifier " + modifierId + " have an invalid type")
            }
            const modifierDuration = modifierKey(projectIdentifier, modifierId, "duration")
            return client.getAsync(modifierDuration).then((result: string) => {
                if (!result) {
                    throw new CorruptedError("Modifier " + modifierId + " do not have property duration")
                }
                const modifier: Modifier = {
                    name,
                    description,
                    duration: +result,
                    location
                }
                return modifier
            })
        })
    }
}

class RedisDelay {
    name: string
    description: string
    date: number

    constructor(delay: Delay) {
        this.name = delay.name
        this.description = delay.description
        this.date = delay.date.getTime()
    }
    static save(projectIdentifier: string, delay: Delay, client: redis.RedisClient): Promise<void> {
        const redisDelay = new RedisDelay(delay)
        const delayIdentifier = delay.identifier
        return client.multi().hmset(delayRootKey(projectIdentifier, delayIdentifier), redisDelay)
                             .sadd(projectKey(projectIdentifier, "delays"), delayIdentifier)
                             .execAsync().then((result: any) => {})
    }
    static load(projectIdentifier: string, delayIdentifier: string, client: redis.RedisClient): Promise<Delay> {
        return client.hgetallAsync(delayRootKey(projectIdentifier, delayIdentifier)).then((result: any) => {
            if (!result.hasOwnProperty("name")) {
                throw new CorruptedError("Delay " + delayIdentifier + " do not have property name")
            }
            if (!result.hasOwnProperty("description")) {
                throw new CorruptedError("Delay " + delayIdentifier + " do not have property description")
            }
            if (!result.hasOwnProperty("date")) {
                throw new CorruptedError("Delay " + delayIdentifier + " do not have property date")
            }
            const name: string = result["name"]
            const description: string = result["description"]

            const delay: Delay = {
                identifier: delayIdentifier,
                name,
                description,
                date: new Date(+result["date"]),
            }
            return delay
        })
    }
}

export class RedisDataProvider implements IDataProvider {
    client: redis.RedisClient
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
        }).catch((error) => {
            return []
        })
    }
    getProject(projectIdentifier: string): Promise<Project> {
        return this.hasProject(projectIdentifier).then(() => {
            return RedisProject.load(projectIdentifier, this.client)
        })
    }
    addProject(project: Project): Promise<void> {
        return this.notHasProject(project.identifier).then(() => {
            return RedisProject.save(project, this.client)
        })
    }
    getTask(projectIdentifier: string, taskIdentifier: string): Promise<Task> {
        return this.hasTask(projectIdentifier, taskIdentifier).then(() => {
            return RedisTask.load(projectIdentifier, taskIdentifier, this.client)
        })
    }
    getProjectTasks(projectIdentifier: string): Promise<Array<Task>> {
        return this.hasProject(projectIdentifier).then(() => {
            return this.client.smembersAsync(projectKey(projectIdentifier, "tasks"))
        }).then((taskIdentifiers: Array<string>) => {
            return this.getTasks(projectIdentifier, taskIdentifiers.sort())
        }).then((tasks: Array<Task | null>) => {
            return tasks.filter((value: Task | null) => {
                return value != null
            })
        })
    }
    addTask(projectIdentifier: string, task: Task): Promise<void> {
        return this.hasProject(projectIdentifier).then(() => {
            return this.notHasTask(projectIdentifier, task.identifier)
        }).then(() => {
            return RedisTask.save(projectIdentifier, task, this.client)
        })
    }
    isTaskImportant(projectIdentifier: string, taskIdentifier: string): Promise<boolean> {
        return this.hasTask(projectIdentifier, taskIdentifier).then(() => {
            return this.client.sismemberAsync(projectKey(projectIdentifier, "task:important"), taskIdentifier)
        }).then((result: number) => {
            return (result !== 0)
        })
    }
    setTaskImportant(projectIdentifier: string, taskIdentifier: string, important: boolean): Promise<void> {
        return this.hasTask(projectIdentifier, taskIdentifier).then(() => {
            if (important) {
                return this.client.saddAsync(projectKey(projectIdentifier, "task:important"), taskIdentifier)
            } else {
                return this.client.sremAsync(projectKey(projectIdentifier, "task:important"), taskIdentifier)
            }
        })
    }
    addTaskRelation(projectIdentifier: string, relation: TaskRelation): Promise<void> {
        return this.hasTask(projectIdentifier, relation.previous).then(() => {
            return this.hasTask(projectIdentifier, relation.next)
        }).then(() => {
            return RedisTaskRelation.save(projectIdentifier, relation, this.client)
        })
    }
    getTaskRelations(projectIdentifier: string, taskIdentifier: string): Promise<Array<TaskRelation>> {
        return this.hasTask(projectIdentifier, taskIdentifier).then(() => {
            return this.client.smembersAsync(taskKey(projectIdentifier, taskIdentifier, "relations"))
        }).then((identifiers: Array<string>) => {
            return Promise.all(identifiers.sort().map((childIndentifier: string): Promise<TaskRelation> => {
                return RedisTaskRelation.load(projectIdentifier, taskIdentifier, childIndentifier, this.client)
            }))
        })
    }
    getTaskResults(projectIdentifier: string, taskIdentifier: string): Promise<TaskResults> {
        return this.hasTask(projectIdentifier, taskIdentifier).then(() => {
            return this.client.mgetAsync(taskKey(projectIdentifier, taskIdentifier, "startDate"),
                                         taskKey(projectIdentifier, taskIdentifier, "duration"))
        }).then((results: Array<string>) => {
            if (!results[0]) {
                throw new CorruptedError("Task " + taskIdentifier + " do not have property startDate")
            }
            if (!results[1]) {
                throw new CorruptedError("Task " + taskIdentifier + " do not have property duration")
            }
            const taskResults: TaskResults = {
                startDate: new Date(+results[0]),
                duration: +results[1]
            }
            return taskResults
        })
    }
    setTaskResults(projectIdentifier: string, taskIdentifier: string, taskResults: TaskResults): Promise<void> {
        return this.hasTask(projectIdentifier, taskIdentifier).then(() => {
            const set = [
                taskKey(projectIdentifier, taskIdentifier, "duration"),
                +taskResults.duration,
                taskKey(projectIdentifier, taskIdentifier, "startDate"),
                +taskResults.startDate.getTime()
            ]
            return this.client.msetAsync(set)
        })
    }
    getModifier(projectIdentifier: string, modifierId: number): Promise<Modifier> {
        return this.hasModifier(projectIdentifier, modifierId).then(() => {
            return RedisModifier.load(projectIdentifier, modifierId, this.client)
        })
    }
    getTaskModifiers(projectIdentifier: string, taskIdentifier: string): Promise<Array<Modifier>> {
        return this.hasTask(projectIdentifier, taskIdentifier).then(() => {
            return this.client.smembersAsync(taskKey(projectIdentifier, taskIdentifier, "modifiers"))
        }).then((ids: Array<string>) => {
            const sorted = ids.map(RedisDataProvider.indexFromString).sort(RedisDataProvider.compareNumbers)
            return this.getModifiers(projectIdentifier, sorted)
        })
    }
    addModifier(projectIdentifier: string, modifier: Modifier): Promise<number> {
        return this.getNextId("modifier").then((modifierId: number) => {
            return RedisModifier.save(projectIdentifier, modifierId, modifier, this.client)
        })
    }
    setModifierForTask(projectIdentifier: string, modifierId: number, taskIdentifier: string): Promise<void> {
        return this.hasModifier(projectIdentifier, modifierId).then(() => {
            return this.hasTask(projectIdentifier, taskIdentifier)
        }).then(() => {
            return this.client.multi().sadd(modifierKey(projectIdentifier, modifierId, "tasks"), taskIdentifier)
                                      .sadd(taskKey(projectIdentifier, taskIdentifier, "modifiers"), modifierId)
                                      .execAsync()
        })
    }
    getDelay(projectIdentifier: string, delayIdentifier: string): Promise<Delay> {
        return this.hasDelay(projectIdentifier, delayIdentifier).then(() => {
            return RedisDelay.load(projectIdentifier, delayIdentifier, this.client)
        })
    }
    getProjectDelays(projectIdentifier: string): Promise<Array<Delay>> {
        return this.hasProject(projectIdentifier).then(() => {
            return this.client.smembersAsync(projectKey(projectIdentifier, "delays"))
        }).then((delayIdentifiers: Array<string>) => {
            return this.getDelays(projectIdentifier, delayIdentifiers.sort())
        }).then((delays: Array<Delay | null>) => {
            return delays.filter((value: Delay | null) => {
                return value != null
            })
        })
    }
    addDelay(projectIdentifier: string, delay: Delay): Promise<void> {
        return this.hasProject(projectIdentifier).then(() => {
            return this.notHasDelay(projectIdentifier, delay.identifier)
        }).then(() => {
            return RedisDelay.save(projectIdentifier, delay, this.client)
        })
    }
    addDelayTaskRelation(projectIdentifier: string, delayIdentifier: string, taskIdentifier: string): Promise<void> {
        return this.hasDelay(projectIdentifier, delayIdentifier).then(() => {
            return this.hasTask(projectIdentifier, taskIdentifier)
        }).then(() => {
            return this.client.multi().sadd(delayKey(projectIdentifier, delayIdentifier, "tasks"), taskIdentifier)
                                      .sadd(taskKey(projectIdentifier, taskIdentifier, "delays"), delayIdentifier)
                                      .execAsync()
        })
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
        }).catch((error) => {
            return null
        })
    }
    private getNextId(type: string): Promise<number> {
        return this.client.incrAsync(type + ":lastId").then((id: string) => {
            return this.client.saddAsync(type + ":ids", id).then((result: number) => {
                return +id
            })
        })
    }
    private notHasProject(projectIdentifier: string): Promise<void> {
        return this.client.existsAsync(projectRootKey(projectIdentifier)).then((result: number) => {
            if (result === 1) {
                throw new ExistsError("Project " + projectIdentifier + " already exists")
            }
        })
    }
    private hasProject(projectIdentifier: string): Promise<void> {
        return this.client.existsAsync(projectRootKey(projectIdentifier)).then((result: number) => {
            if (result !== 1) {
                throw new NotFoundError("Project " + projectIdentifier + " not found")
            }
        })
    }
    private notHasTask(projectIdentifier: string, taskIdentifier: string): Promise<void> {
        return this.client.existsAsync(taskRootKey(projectIdentifier, taskIdentifier)).then((result: number) => {
            if (result === 1) {
                throw new ExistsError("Task " + taskIdentifier + " already exists")
            }
        })
    }
    private hasTask(projectIdentifier: string, taskIdentifier: string): Promise<void> {
        return this.hasProject(projectIdentifier).then(() => {
            return this.client.existsAsync(taskRootKey(projectIdentifier, taskIdentifier)).then((result: number) => {
                if (result !== 1) {
                    throw new NotFoundError("Task " + taskIdentifier + " not found")
                }
            })
        })
    }
    private notHasDelay(projectIdentifier: string, delayIdentifier: string): Promise<void> {
        return this.client.existsAsync(delayRootKey(projectIdentifier, delayIdentifier)).then((result: number) => {
            if (result === 1) {
                throw new ExistsError("Delay " + delayIdentifier + " already exists")
            }
        })
    }
    private hasModifier(projectIdentifier: string, modifierId: number): Promise<void> {
        return this.hasProject(projectIdentifier).then(() => {
            return this.client.existsAsync(modifierRootKey(projectIdentifier, modifierId)).then((result: number) => {
                if (result !== 1) {
                    throw new NotFoundError("Modifier " + modifierId + " not found")
                }
            })
        })
    }
    private hasDelay(projectIdentifier: string, delayIdentifier: string): Promise<void> {
        return this.hasProject(projectIdentifier).then(() => {
            return this.client.existsAsync(delayRootKey(projectIdentifier, delayIdentifier)).then((result: number) => {
                if (result !== 1) {
                    throw new NotFoundError("Delay " + delayIdentifier + " not found")
                }
            })
        })
    }
    private getTasks(projectIdentifier: string, taskIdentifiers: Array<string>): Promise<Array<Task | null>> {
        return Promise.all(taskIdentifiers.map((taskIdentifier: string): Promise<Task | null> => {
            return this.getTask(projectIdentifier, taskIdentifier).catch((error) => {
                return null
            })
        }))
    }
    private getModifiers(projectIdentifier: string, modifierIds: Array<number>): Promise<Array<Modifier | null>> {
        return Promise.all(modifierIds.map((modifierId: number): Promise<Modifier | null> => {
            return this.getModifier(projectIdentifier, modifierId).catch((error) => {
                return null
            })
        }))
    }
    private getDelays(projectIdentifier: string, delayIdentifiers: Array<string>): Promise<Array<Delay | null>> {
        return Promise.all(delayIdentifiers.map((delayIdentifier): Promise<Delay | null> => {
            return this.getDelay(projectIdentifier, delayIdentifier).catch((error) => {
                return null
            })
        }))
    }
}
