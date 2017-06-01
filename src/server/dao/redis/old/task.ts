import * as redis from "redis"
import * as redisasync from "../async"
import * as bluebird from "bluebird"
import {ITaskDao} from "../../itask"
import {TaskDefinition} from "../../../../common/old/task"
import {wrapUnknownErrors} from "../utils/error"
import {KeyFactory} from "../utils/keyfactory"
import {CorruptedError} from "../../error/corrupted"
import {NotFoundError} from "../../../../common/errors/notfound"
import {RedisProjectDao} from "./project"
import {ExistsError} from "../../../error/exists"
bluebird.promisifyAll(redis)

class RedisTask {
    readonly name: string
    readonly description: string

    constructor(task: TaskDefinition) {
        this.name = task.name
        this.description = task.description
    }

    static save(projectIdentifier: string, task: TaskDefinition, client: redisasync.RedisAsyncClient): Promise<void> {
        const redisTask = new RedisTask(task)
        const taskIdentifier = task.identifier
        const taskKey = KeyFactory.createTaskKey(projectIdentifier, taskIdentifier)
        return client.hmsetAsync(taskKey, redisTask).then(() => {
            const startDateKey = KeyFactory.createTaskKey(projectIdentifier, taskIdentifier, "estimatedStartDate")
            const durationKey = KeyFactory.createTaskKey(projectIdentifier, taskIdentifier, "estimatedDuration")
            return client.msetAsync(startDateKey, task.estimatedStartDate.getTime(),
                durationKey, task.estimatedDuration)
        }).then(() => {
            const projectTasksKey = KeyFactory.createProjectKey(projectIdentifier, "tasks")
            return client.saddAsync(projectTasksKey, taskIdentifier)
        })
    }

    static load(projectIdentifier: string, taskIdentifier: string,
                client: redisasync.RedisAsyncClient): Promise<TaskDefinition> {
        const taskKey = KeyFactory.createTaskKey(projectIdentifier, taskIdentifier)
        return client.hgetallAsync(taskKey).then((result: any) => {
            if (!result.hasOwnProperty("name")) {
                throw new CorruptedError(`Task ${taskIdentifier} do not have property "name"`)
            }
            if (!result.hasOwnProperty("description")) {
                throw new CorruptedError(`Task ${taskIdentifier} do not have property "description"`)
            }
            const name: string = result["name"]
            const description: string = result["description"]
            const startDateKey = KeyFactory.createTaskKey(projectIdentifier, taskIdentifier, "estimatedStartDate")
            const durationKey = KeyFactory.createTaskKey(projectIdentifier, taskIdentifier, "estimatedDuration")
            return client.mgetAsync(startDateKey, durationKey).then((result: Array<string>): TaskDefinition => {
                if (!result[0]) {
                    throw new CorruptedError(`Task ${taskIdentifier} do not have property "estimatedDuration"`)
                }
                if (!result[1]) {
                    throw new CorruptedError(`Task ${taskIdentifier} do not have property "estimatedDuration"`)
                }

                return {
                    identifier: taskIdentifier,
                    name,
                    description,
                    estimatedStartDate: new Date(+result[0]),
                    estimatedDuration: +result[1]
                }
            })
        })
    }
}

export class RedisTaskDao implements ITaskDao {
    private readonly client: redisasync.RedisAsyncClient

    constructor(client: redis.RedisClient) {
        this.client = client as redisasync.RedisAsyncClient
    }

    hasTask(projectIdentifier: string, taskIdentifier: string): Promise<void> {
        return this.hasProject(projectIdentifier).then(() => {
            const taskKey = KeyFactory.createTaskKey(projectIdentifier, taskIdentifier)
            return this.client.existsAsync(taskKey).then((result: number) => {
                if (result !== 1) {
                    throw new NotFoundError(`Task ${taskIdentifier} not found`)
                }
            })
        })
    }

    getTask(projectIdentifier: string, taskIdentifier: string): Promise<TaskDefinition> {
        return this.hasTask(projectIdentifier, taskIdentifier).then(() => {
            return RedisTask.load(projectIdentifier, taskIdentifier, this.client)
        }).catch((error) => {
            wrapUnknownErrors(error)
        })
    }

    getProjectTasks(projectIdentifier: string): Promise<Array<TaskDefinition>> {
        return this.hasProject(projectIdentifier).then((): Promise<Array<string>> => {
            const projectTasksKey = KeyFactory.createProjectKey(projectIdentifier, "tasks")
            return this.client.smembersAsync(projectTasksKey)
        }).then((taskIdentifiers: Array<string>) => {
            const sortedIdentifiers = taskIdentifiers.sort()
            return Promise.all(sortedIdentifiers.map((taskIdentifier: string) => {
                return this.getTask(projectIdentifier, taskIdentifier).catch(() => {
                    return null
                })
            }))
        }).then((tasks: Array<TaskDefinition | null>) => {
            return tasks.filter((value: TaskDefinition | null) => {
                return value != null
            })
        }).catch((error) => {
            wrapUnknownErrors(error)
        })
    }

    addTask(projectIdentifier: string, task: TaskDefinition): Promise<void> {
        return this.hasProject(projectIdentifier).then(() => {
            return this.notHasTask(projectIdentifier, task.identifier)
        }).then(() => {
            return RedisTask.save(projectIdentifier, task, this.client)
        }).catch((error) => {
            wrapUnknownErrors(error)
        })
    }

    isTaskImportant(projectIdentifier: string, taskIdentifier: string): Promise<boolean> {
        return this.hasTask(projectIdentifier, taskIdentifier).then((): Promise<number> => {
            const projectImportantTasksKey = KeyFactory.createProjectKey(projectIdentifier, "task:important")
            return this.client.sismemberAsync(projectImportantTasksKey, taskIdentifier)
        }).then((result: number) => {
            return (result !== 0)
        }).catch((error) => {
            wrapUnknownErrors(error)
        })
    }

    setTaskImportant(projectIdentifier: string, taskIdentifier: string, important: boolean): Promise<void> {
        return this.hasTask(projectIdentifier, taskIdentifier).then(() => {
            const projectImportantTasksKey = KeyFactory.createProjectKey(projectIdentifier, "task:important")
            if (important) {
                return this.client.saddAsync(projectImportantTasksKey, taskIdentifier)
            } else {
                return this.client.sremAsync(projectImportantTasksKey, taskIdentifier)
            }
        }).catch((error) => {
            wrapUnknownErrors(error)
        })
    }

    private hasProject(projectIdentifier: string) {
        return new RedisProjectDao(this.client).hasProject(projectIdentifier)
    }

    private notHasTask(projectIdentifier: string, taskIdentifier: string): Promise<void> {
        const taskKey = KeyFactory.createTaskKey(projectIdentifier, taskIdentifier)
        return this.client.existsAsync(taskKey).then((result: number) => {
            if (result === 1) {
                throw new ExistsError(`Task ${taskIdentifier} already exists`)
            }
        })
    }
}
