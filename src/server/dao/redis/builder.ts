import * as redis from "redis"
import {IDaoBuilder} from "../ibuilder"
import {RedisFeatureDao} from "./feature"
import {RedisStoryDao} from "./story"

export class RedisDaoBuilder implements IDaoBuilder {
    private readonly client: redis.RedisClient

    constructor(client: redis.RedisClient) {
        this.client = client
    }

    stop() {
        this.client.quit()
    }

    buildFeatureDao(): RedisFeatureDao {
        return new RedisFeatureDao(this.client)
    }

    buildStoryDao(): RedisStoryDao {
        return new RedisStoryDao(this.client)
    }
}
