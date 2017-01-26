import * as redis from "redis"
import {RedisProjectDao} from "./redisprojectdao";

export class RedisDaoFactory {
    static createProjectDao(client: redis.RedisClient) {
        return new RedisProjectDao(client)
    }
}
