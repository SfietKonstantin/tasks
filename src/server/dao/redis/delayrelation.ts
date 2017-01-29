import * as redis from "redis"
import * as redisasync from "./async"
import * as bluebird from "bluebird"
import {IDelayRelationDao} from "../idelayrelation"
import {DelayRelation} from "../../../common/delayrelation"
import {KeyFactory} from "./utils/keyfactory"
import {CorruptedError} from "../error/corrupted"
import {wrapUnknownErrors} from "./utils/error"
import {ExistsError} from "../error/exists"
import {RedisTaskDao} from "./task"
import {RedisDelayDao} from "./delay"
bluebird.promisifyAll(redis)

class RedisDelayRelation {
    lag: number

    constructor(delayRelation: DelayRelation) {
        this.lag = delayRelation.lag
    }

    static save(projectIdentifier: string, relation: DelayRelation,
                client: redisasync.RedisAsyncClient): Promise<void> {
        const redisDelayRelation = new RedisDelayRelation(relation)
        const delayRelationKey = KeyFactory.createDelayRelationKey(projectIdentifier, relation.delay, relation.task)
        return client.hmsetAsync(delayRelationKey, redisDelayRelation).then(() => {
            const relationsKey = KeyFactory.createDelayKey(projectIdentifier, relation.delay, "relations")
            return client.saddAsync(relationsKey, relation.task)
        })
    }

    static load(projectIdentifier: string, delay: string, task: string,
                client: redisasync.RedisAsyncClient): Promise<DelayRelation> {
        const delayRelationKey = KeyFactory.createDelayRelationKey(projectIdentifier, delay, task)
        return client.hgetallAsync(delayRelationKey).then((result: any) => {
            if (result == null) {
                throw new CorruptedError(`DelayRelation ${delay}-${task} is null`)
            }
            if (!result.hasOwnProperty("lag")) {
                throw new CorruptedError(`DelayRelation ${delay}-${task} do not have property "lag"`)
            }
            return {
                delay,
                task,
                lag: +(result["lag"] as string)
            }
        })
    }
}

export class RedisDelayRelationDao implements IDelayRelationDao {
    private client: redisasync.RedisAsyncClient

    constructor(client: redis.RedisClient) {
        this.client = client as redisasync.RedisAsyncClient
    }

    addDelayRelation(projectIdentifier: string, relation: DelayRelation): Promise<void> {
        return this.hasDelay(projectIdentifier, relation.delay).then(() => {
            return this.hasTask(projectIdentifier, relation.task)
        }).then(() => {
            return this.notHasRelation(projectIdentifier, relation)
        }).then(() => {
            return RedisDelayRelation.save(projectIdentifier, relation, this.client)
        }).catch((error: Error) => {
            wrapUnknownErrors(error)
        })
    }

    getDelayRelations(projectIdentifier: string, delayIdentifier: string): Promise<Array<DelayRelation>> {
        return this.hasDelay(projectIdentifier, delayIdentifier).then((): Promise<Array<string>> => {
            const relationsKey = KeyFactory.createDelayKey(projectIdentifier, delayIdentifier, "relations")
            return this.client.smembersAsync(relationsKey)
        }).then((identifiers: Array<string>) => {
            return Promise.all(identifiers.sort().map((taskIndentifier: string): Promise<DelayRelation> => {
                return RedisDelayRelation.load(projectIdentifier, delayIdentifier, taskIndentifier, this.client)
            }))
        }).catch((error: Error) => {
            wrapUnknownErrors(error)
        })
    }

    private hasTask(projectIdentifier: string, taskIdentifier: string) {
        return new RedisTaskDao(this.client).hasTask(projectIdentifier, taskIdentifier)
    }

    private hasDelay(projectIdentifier: string, delayIdentifier: string) {
        return new RedisDelayDao(this.client).hasDelay(projectIdentifier, delayIdentifier)
    }

    private notHasRelation(projectIdentifier: string, relation: DelayRelation) {
        const relationsKey = KeyFactory.createDelayKey(projectIdentifier, relation.delay, "relations")
        return this.client.sismemberAsync(relationsKey, relation.task).then((result: number) => {
            if (result === 1) {
                throw new ExistsError(`Relation between ${relation.delay} and ${relation.task} already exists`)
            }
        })
    }
}
