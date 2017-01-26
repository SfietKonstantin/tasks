import * as redis from "redis"
import * as bluebird from "bluebird"
import {project1, project2} from "../testdata"
import {Project} from "../../../common/project"
bluebird.promisifyAll(redis)

export interface RedisAsyncClient extends redis.RedisClient {
    setAsync(...args: any[]): Promise<any>
    delAsync(...args: any[]): Promise<any>
    hmsetAsync(...args: any[]): Promise<any>
    hsetAsync(...args: any[]): Promise<any>
    hdelAsync(...args: any[]): Promise<any>
    saddAsync(...args: any[]): Promise<any>
}

export class RedisTestDataProvider {
    static dump(): Promise<redis.RedisClient> {
        let client = RedisTestDataProvider.getClient()
        RedisTestDataProvider.flush(client)

        return Promise.resolve().then(() => {
            // Add some projects
            return Promise.all([project1, project2].map((project: Project) => {
                return client.saddAsync("project:ids", project.identifier).then(() => {
                    const redisProject = {
                        name: project.name,
                        description: project.description
                    }
                    return client.hmsetAsync(`project:${project.identifier}`, redisProject)
                })
            }))
        }).then(() => {
            // TODO add some tasks etc

        }).then(() => {
            return client
        })
    }

    static delete(client: redis.RedisClient, key: string): Promise<void> {
        return (client as RedisAsyncClient).delAsync(key)
    }

    static deleteMember(client: redis.RedisClient, key: string, member: string): Promise<void> {
        return (client as RedisAsyncClient).hdelAsync(key, member)
    }

    static set(client: redis.RedisClient, key: string, value: string) {
        return (client as RedisAsyncClient).setAsync(key, value)
    }

    static flush(client: redis.RedisClient) {
        client.flushdb()
    }

    private static getClient(): RedisAsyncClient {
        let client = redis.createClient() as RedisAsyncClient
        client.select(3)
        return client
    }
}
