import * as redis from "redis"
import * as redisasync from "./async"
import * as bluebird from "bluebird"
import {IModifierDao} from "../imodifier"
import {Modifier} from "../../../common/modifier"
import {KeyFactory} from "./utils/keyfactory"
import {CorruptedError} from "../error/corrupted"
import {NotFoundError} from "../../../common/errors/notfound"
import {wrapUnknownErrors} from "./utils/error"
import {TaskLocationBuilder} from "./utils/tasklocation"
import {RedisProjectDao} from "./project"
import {RedisTaskDao} from "./task"
import {InputError} from "../../../common/errors/input"
bluebird.promisifyAll(redis)

class RedisModifier {
    name: string
    description: string
    location: string

    constructor(modifier: Modifier) {
        this.name = modifier.name
        this.description = modifier.description
        this.location = TaskLocationBuilder.toString(modifier.location)

        if (this.location === "") {
            throw new InputError(`Invalid location for Modifier`)
        }
    }

    static save(projectIdentifier: string, modifierId: number, modifier: Modifier,
                client: redisasync.RedisAsyncClient): Promise<number> {
        const redisModifier = new RedisModifier(modifier)
        const modifierKey = KeyFactory.createModifierKey(projectIdentifier, modifierId)
        return client.hmsetAsync(modifierKey, redisModifier).then(() => {
            const durationKey = KeyFactory.createModifierKey(projectIdentifier, modifierId, "duration")
            return client.setAsync(durationKey, modifier.duration)
        })
    }

    static load(projectIdentifier: string, modifierId: number, client: redisasync.RedisAsyncClient): Promise<Modifier> {
        const modifierKey = KeyFactory.createModifierKey(projectIdentifier, modifierId)
        return client.hgetallAsync(modifierKey).then((result: any) => {
            if (!result.hasOwnProperty("name")) {
                throw new CorruptedError(`Modifier ${modifierId} do not have property "name"`)
            }
            if (!result.hasOwnProperty("description")) {
                throw new CorruptedError(`Modifier ${modifierId} do not have property "description"`)
            }
            if (!result.hasOwnProperty("location")) {
                throw new CorruptedError(`Modifier ${modifierId} do not have property "location"`)
            }
            const name: string = result["name"]
            const description: string = result["description"]
            const location = TaskLocationBuilder.fromString(result["location"])
            if (location == null) {
                throw new CorruptedError(`Modifier ${modifierId} have an invalid type`)
            }
            const durationKey = KeyFactory.createModifierKey(projectIdentifier, modifierId, "duration")
            return client.getAsync(durationKey).then((result: string): Modifier => {
                if (!result) {
                    throw new CorruptedError(`Modifier ${modifierId} do not have property "duration"`)
                }
                return {
                    name,
                    description,
                    duration: +result,
                    location
                }
            })
        })
    }
}

export class RedisModifierDao implements IModifierDao {
    private client: redisasync.RedisAsyncClient

    constructor(client: redis.RedisClient) {
        this.client = client as redisasync.RedisAsyncClient
    }

    hasModifier(projectIdentifier: string, modifierId: number): Promise<void> {
        return this.hasProject(projectIdentifier).then(() => {
            const modifierKey = KeyFactory.createModifierKey(projectIdentifier, modifierId)
            return this.client.existsAsync(modifierKey).then((result: number) => {
                if (result !== 1) {
                    throw new NotFoundError(`Modifier ${modifierId} not found`)
                }
            })
        })
    }

    getModifier(projectIdentifier: string, modifierId: number): Promise<Modifier> {
        return this.hasModifier(projectIdentifier, modifierId).then(() => {
            return RedisModifier.load(projectIdentifier, modifierId, this.client)
        }).catch((error: Error) => {
            wrapUnknownErrors(error)
        })
    }

    getTaskModifiers(projectIdentifier: string, taskIdentifier: string): Promise<Array<Modifier>> {
        return this.hasTask(projectIdentifier, taskIdentifier).then((): Promise<Array<string>> => {
            const modifiersKey = KeyFactory.createTaskKey(projectIdentifier, taskIdentifier, "modifiers")
            return this.client.smembersAsync(modifiersKey)
        }).then((ids: Array<string>) => {
            const sortedIds = ids.map(RedisModifierDao.indexFromString).sort(RedisModifierDao.compareNumbers)
            return Promise.all(sortedIds.map((modifierId: number) => {
                return this.getModifier(projectIdentifier, modifierId).catch(() => {
                    return null
                })
            }))
        }).then((tasks: Array<Modifier | null>) => {
            return tasks.filter((value: Modifier | null) => {
                return value != null
            })
        }).catch((error: Error) => {
            wrapUnknownErrors(error)
        })
    }

    addModifier(projectIdentifier: string, modifier: Modifier): Promise<number> {
        return this.hasProject(projectIdentifier).then(() => {
            return this.getNextId(projectIdentifier)
        }).then((modifierId: number) => {
            return RedisModifier.save(projectIdentifier, modifierId, modifier, this.client).then(() => {
                return modifierId
            })
        }).catch((error: Error) => {
            wrapUnknownErrors(error)
        })
    }

    addModifierForTask(projectIdentifier: string, modifierId: number, taskIdentifier: string): Promise<void> {
        return this.hasModifier(projectIdentifier, modifierId).then(() => {
            return this.hasTask(projectIdentifier, taskIdentifier)
        }).then(() => {
            const tasksKey = KeyFactory.createModifierKey(projectIdentifier, modifierId, "tasks")
            return this.client.saddAsync(tasksKey, taskIdentifier)
        }).then(() => {
            const modifiersKey = KeyFactory.createTaskKey(projectIdentifier, taskIdentifier, "modifiers")
            return this.client.saddAsync(modifiersKey, modifierId)
        }).catch((error: Error) => {
            wrapUnknownErrors(error)
        })
    }

    private static indexFromString(id: string): number {
        return +id
    }

    private static compareNumbers(first: number, second: number): number {
        return first - second
    }

    private getNextId(projectIdentifier: string): Promise<number> {
        return this.client.incrAsync(`modifier:${projectIdentifier}:lastId`).then((id: string) => {
            return this.client.saddAsync(`modifier:${projectIdentifier}:ids`, id).then(() => {
                return +id
            })
        })
    }

    private hasProject(projectIdentifier: string) {
        return new RedisProjectDao(this.client).hasProject(projectIdentifier)
    }

    private hasTask(projectIdentifier: string, taskIdentifier: string) {
        return new RedisTaskDao(this.client).hasTask(projectIdentifier, taskIdentifier)
    }
}
