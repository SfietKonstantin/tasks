import * as redis from "redis"
import * as redisasync from "./async"
import * as bluebird from "bluebird"
import {IDelayDao} from "../idelay"
import {DelayDefinition} from "../../../common/delay"
import {KeyFactory} from "./utils/keyfactory"
import {CorruptedError} from "../error/corrupted"
import {NotFoundError} from "../../../common/errors/notfound"
import {wrapUnknownErrors} from "./utils/error"
import {ExistsError} from "../../error/exists"
import {RedisProjectDao} from "./project"
bluebird.promisifyAll(redis)

class RedisDelay {
    name: string
    description: string
    date: number

    constructor(delay: DelayDefinition) {
        this.name = delay.name
        this.description = delay.description
        this.date = delay.date.getTime()
    }
    static save(projectIdentifier: string, delay: DelayDefinition, client: redisasync.RedisAsyncClient): Promise<void> {
        const redisDelay = new RedisDelay(delay)
        const delayIdentifier = delay.identifier
        const delayKey = KeyFactory.createDelayKey(projectIdentifier, delayIdentifier)
        return client.hmsetAsync(delayKey, redisDelay).then(() => {
            const projectDelaysKey = KeyFactory.createProjectKey(projectIdentifier, "delays")
            return client.saddAsync(projectDelaysKey, delayIdentifier)
        })
    }
    static load(projectIdentifier: string, delayIdentifier: string,
                client: redisasync.RedisAsyncClient): Promise<DelayDefinition> {
        const delayKey = KeyFactory.createDelayKey(projectIdentifier, delayIdentifier)
        return client.hgetallAsync(delayKey).then((result: any) => {
            if (!result.hasOwnProperty("name")) {
                throw new CorruptedError(`DelayDefinition ${delayIdentifier} do not have property "name"`)
            }
            if (!result.hasOwnProperty("description")) {
                throw new CorruptedError(`DelayDefinition ${delayIdentifier} do not have property "description"`)
            }
            if (!result.hasOwnProperty("date")) {
                throw new CorruptedError(`DelayDefinition ${delayIdentifier} do not have property "date"`)
            }
            const name: string = result["name"]
            const description: string = result["description"]

            return {
                identifier: delayIdentifier,
                name,
                description,
                date: new Date(+result["date"]),
            }
        })
    }
}

export class RedisDelayDao implements IDelayDao {
    private client: redisasync.RedisAsyncClient

    constructor(client: redis.RedisClient) {
        this.client = client as redisasync.RedisAsyncClient
    }

    hasDelay(projectIdentifier: string, delayIdentifier: string): Promise<void> {
        return this.hasProject(projectIdentifier).then(() => {
            const delayKey = KeyFactory.createDelayKey(projectIdentifier, delayIdentifier)
            return this.client.existsAsync(delayKey).then((result: number) => {
                if (result !== 1) {
                    throw new NotFoundError(`Delay ${delayIdentifier} not found`)
                }
            })
        })
    }

    getDelay(projectIdentifier: string, delayIdentifier: string): Promise<DelayDefinition> {
        return this.hasDelay(projectIdentifier, delayIdentifier).then(() => {
            return RedisDelay.load(projectIdentifier, delayIdentifier, this.client)
        }).catch((error: Error) => {
            wrapUnknownErrors(error)
        })
    }
    getProjectDelays(projectIdentifier: string): Promise<Array<DelayDefinition>> {
        return this.hasProject(projectIdentifier).then((): Promise<Array<string>> => {
            const projectDelaysKey = KeyFactory.createProjectKey(projectIdentifier, "delays")
            return this.client.smembersAsync(projectDelaysKey)
        }).then((delayIdentifiers: Array<string>) => {
            return Promise.all(delayIdentifiers.map((delayIdentifier) => {
                return this.getDelay(projectIdentifier, delayIdentifier).catch(() => {
                    return null
                })
            }))
        }).then((delays: Array<DelayDefinition | null>) => {
            return delays.filter((value: DelayDefinition | null) => {
                return value != null
            })
        }).catch((error: Error) => {
            wrapUnknownErrors(error)
        })
    }
    addDelay(projectIdentifier: string, delay: DelayDefinition): Promise<void> {
        return this.hasProject(projectIdentifier).then(() => {
            return this.notHasDelay(projectIdentifier, delay.identifier)
        }).then(() => {
            return RedisDelay.save(projectIdentifier, delay, this.client)
        }).catch((error: Error) => {
            wrapUnknownErrors(error)
        })
    }
    private hasProject(projectIdentifier: string) {
        return new RedisProjectDao(this.client).hasProject(projectIdentifier)
    }
    private notHasDelay(projectIdentifier: string, delayIdentifier: string): Promise<void> {
        const delayKey = KeyFactory.createDelayKey(projectIdentifier, delayIdentifier)
        return this.client.existsAsync(delayKey).then((result: number) => {
            if (result === 1) {
                throw new ExistsError(`Delay ${delayIdentifier} already exists`)
            }
        })
    }
}
