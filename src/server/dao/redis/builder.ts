import * as redis from "redis"
import {RedisProjectDao} from "./old/project"
import {IDaoBuilder} from "../ibuilder"
import {RedisTaskDao} from "./old/task"
import {RedisDelayDao} from "./old/delay"
import {RedisTaskRelationDao} from "./old/taskrelation"
import {RedisDelayRelationDao} from "./old/delayrelation"
import {RedisModifierDao} from "./old/modifier"

export class RedisDaoBuilder implements IDaoBuilder {
    private readonly client: redis.RedisClient

    constructor(client: redis.RedisClient) {
        this.client = client
    }

    stop() {
        this.client.quit()
    }

    buildProjectDao() {
        return new RedisProjectDao(this.client)
    }

    buildTaskDao() {
        return new RedisTaskDao(this.client)
    }

    buildDelayDao() {
        return new RedisDelayDao(this.client)
    }

    buildTaskRelationDao() {
        return new RedisTaskRelationDao(this.client)
    }

    buildDelayRelationDao() {
        return new RedisDelayRelationDao(this.client)
    }

    buildModifierDao() {
        return new RedisModifierDao(this.client)
    }
}
