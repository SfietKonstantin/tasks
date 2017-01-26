import * as redis from "redis"
import {RedisProjectDao} from "./project"
import {IDaoBuilder} from "../ibuilder"
import {RedisTaskDao} from "./task"

export class RedisDaoBuilder implements IDaoBuilder {
    private client: redis.RedisClient
    constructor(client: redis.RedisClient) {
        this.client = client
    }
    buildProjectDao() {
        return new RedisProjectDao(this.client)
    }
    buildTaskDao() {
        return new RedisTaskDao(this.client);
    }
}
