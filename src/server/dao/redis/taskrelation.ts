import * as redis from "redis"
import * as redisasync from "./async"
import * as bluebird from "bluebird"
import {ITaskRelationDao} from "../itaskrelation"
import {TaskRelation} from "../../../common/taskrelation"
import {wrapUnknownErrors} from "./utils/error"
import {KeyFactory} from "./utils/keyfactory"
import {CorruptedError} from "../error/corrupted"
import {RedisTaskDao} from "./task"
import {TaskLocationBuilder} from "./utils/tasklocation"
import {ExistsError} from "../../error/exists"
bluebird.promisifyAll(redis)

class RedisTaskRelation {
    previousLocation: string
    lag: number

    constructor(taskRelation: TaskRelation) {
        this.previousLocation = TaskLocationBuilder.toString(taskRelation.previousLocation)
        this.lag = taskRelation.lag
    }

    static save(projectIdentifier: string, relation: TaskRelation, client: redisasync.RedisAsyncClient): Promise<void> {
        const redisTaskRelation = new RedisTaskRelation(relation)
        const taskRelationKey = KeyFactory.createTaskRelationKey(projectIdentifier, relation.previous, relation.next)
        return client.hmsetAsync(taskRelationKey, redisTaskRelation).then(() => {
            const relationsKey = KeyFactory.createTaskKey(projectIdentifier, relation.previous, "relations")
            return client.saddAsync(relationsKey, relation.next)
        })
    }

    static load(projectIdentifier: string, previous: string, next: string,
                client: redisasync.RedisAsyncClient): Promise<TaskRelation> {
        const taskRelationKey = KeyFactory.createTaskRelationKey(projectIdentifier, previous, next)
        return client.hgetallAsync(taskRelationKey).then((result: any): TaskRelation => {
            if (result == null) {
                throw new CorruptedError(`TaskRelation ${previous}-${next} is null`)
            }
            if (!result.hasOwnProperty("previousLocation")) {
                throw new CorruptedError(`TaskRelation ${previous}-${next} do not have property "previousLocation"`)
            }
            if (!result.hasOwnProperty("lag")) {
                throw new CorruptedError(`TaskRelation ${previous}-${next} do not have property "lag"`)
            }
            const previousLocation = TaskLocationBuilder.fromString(result["previousLocation"])
            if (previousLocation == null) {
                throw new CorruptedError(`TaskRelation ${previous}-${next} has an invalid "previousLocation"`)
            }
            return {
                previous,
                previousLocation,
                next,
                lag: +(result["lag"] as string)
            }
        })
    }
}

export class RedisTaskRelationDao implements ITaskRelationDao {
    private client: redisasync.RedisAsyncClient

    constructor(client: redis.RedisClient) {
        this.client = client as redisasync.RedisAsyncClient
    }

    addTaskRelation(projectIdentifier: string, relation: TaskRelation): Promise<void> {
        return this.hasTask(projectIdentifier, relation.previous).then(() => {
            return this.hasTask(projectIdentifier, relation.next)
        }).then(() => {
            return this.notHasRelation(projectIdentifier, relation)
        }).then(() => {
            return RedisTaskRelation.save(projectIdentifier, relation, this.client)
        }).catch((error: Error) => {
            wrapUnknownErrors(error)
        })
    }

    getTaskRelations(projectIdentifier: string, taskIdentifier: string): Promise<Array<TaskRelation>> {
        return this.hasTask(projectIdentifier, taskIdentifier).then((): Promise<Array<string>> => {
            const relationsKey = KeyFactory.createTaskKey(projectIdentifier, taskIdentifier, "relations")
            return this.client.smembersAsync(relationsKey)
        }).then((identifiers: Array<string>) => {
            return Promise.all(identifiers.sort().map((childIndentifier: string): Promise<TaskRelation> => {
                return RedisTaskRelation.load(projectIdentifier, taskIdentifier, childIndentifier, this.client)
            }))
        }).catch((error: Error) => {
            wrapUnknownErrors(error)
        })
    }

    private hasTask(projectIdentifier: string, taskIdentifier: string) {
        return new RedisTaskDao(this.client).hasTask(projectIdentifier, taskIdentifier)
    }

    private notHasRelation(projectIdentifier: string, relation: TaskRelation) {
        const relationsKey = KeyFactory.createTaskKey(projectIdentifier, relation.previous, "relations")
        return this.client.sismemberAsync(relationsKey, relation.next).then((result: number) => {
            if (result === 1) {
                throw new ExistsError(`Relation between ${relation.previous} and ${relation.next} already exists`)
            }
        })
    }
}
