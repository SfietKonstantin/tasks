import * as redis from "redis"
import {RedisProjectDao} from "./project"
import {IDaoBuilder} from "../ibuilder"
import {RedisTaskDao} from "./task"
import {RedisDelayDao} from "./delay"
import {RedisTaskRelationDao} from "./taskrelation"
import {RedisDelayRelationDao} from "./delayrelation"
import {RedisModifierDao} from "./modifier"

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
