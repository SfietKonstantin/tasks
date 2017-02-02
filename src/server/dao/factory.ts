import * as redis from "redis"
import {RedisDaoBuilder} from "./redis/builder"

export class DaoBuilderFactory {
    static create(dbIndex: number = 0) {
        const client = redis.createClient()
        client.select(dbIndex)
        return new RedisDaoBuilder(client)
    }
}
