import * as redis from "redis"
import * as bluebird from "bluebird"
import {
    project1, project2, taskd1, taskd2, taskd3, taskRelation1, taskRelation2, delayd1, delayd2,
    delayRelation1, delayRelation2
} from "../../testdata"
import {Project} from "../../../../common/project"
import {TaskDefinition} from "../../../../common/task"
import {KeyFactory} from "../../../../server/dao/redis/utils/keyfactory"
import {TaskRelation} from "../../../../common/taskrelation"
import {TaskLocationBuilder} from "../../../../server/dao/redis/utils/tasklocation"
import {DelayDefinition} from "../../../../common/delay"
import {DelayRelation} from "../../../../common/delayrelation"
bluebird.promisifyAll(redis)

export interface RedisAsyncClient extends redis.RedisClient {
    setAsync(...args: any[]): Promise<any>
    delAsync(...args: any[]): Promise<any>
    msetAsync(...args: any[]): Promise<any>
    hsetAsync(...args: any[]): Promise<any>
    hmsetAsync(...args: any[]): Promise<any>
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
                const projectIdsKey = KeyFactory.createGlobalProjectKey("ids")
                return client.saddAsync(projectIdsKey, project.identifier).then(() => {
                    const redisProject = {
                        name: project.name,
                        description: project.description
                    }
                    const projectKey = KeyFactory.createProjectKey(project.identifier)
                    return client.hmsetAsync(projectKey, redisProject)
                })
            }))
        }).then(() => {
            return Promise.all([taskd1, taskd2, taskd3].map((task: TaskDefinition) => {
                const projectTasksKey = KeyFactory.createProjectKey(project1.identifier, "tasks")
                return client.saddAsync(projectTasksKey, task.identifier).then(() => {
                    const redisTask = {
                        name: task.name,
                        description: task.description
                    }
                    const taskKey = KeyFactory.createTaskKey(project1.identifier, task.identifier)
                    return client.hmsetAsync(taskKey, redisTask)
                }).then(() => {
                    const startDateKey = KeyFactory.createTaskKey(project1.identifier, task.identifier,
                        "estimatedStartDate")
                    const durationKey = KeyFactory.createTaskKey(project1.identifier, task.identifier,
                        "estimatedDuration")
                    return client.msetAsync(startDateKey, task.estimatedStartDate.getTime(),
                        durationKey, task.estimatedDuration)
                })
            }))
        }).then(() => {
            return Promise.all([taskRelation1, taskRelation2].map((taskRelation: TaskRelation) => {
                const relationsKey = KeyFactory.createTaskKey(project1.identifier, taskd1.identifier, "relations")
                return client.saddAsync(relationsKey, taskRelation.next).then(() => {
                    const redisRelation = {
                        previousLocation: TaskLocationBuilder.toString(taskRelation.previousLocation),
                        lag: taskRelation.lag
                    }
                    const taskRelationKey = KeyFactory.createTaskRelationKey(project1.identifier, taskRelation.previous,
                        taskRelation.next)
                    return client.hmsetAsync(taskRelationKey, redisRelation)
                })
            }))
        }).then(() => {
            return Promise.all([delayd1, delayd2].map((delay: DelayDefinition) => {
                const projectDelaysKey = KeyFactory.createProjectKey(project1.identifier, "delays")
                return client.saddAsync(projectDelaysKey, delay.identifier).then(() => {
                    const redisDelay = {
                        name: delay.name,
                        description: delay.description,
                        date: delay.date.getTime()
                    }
                    const delayKey = KeyFactory.createDelayKey(project1.identifier, delay.identifier)
                    return client.hmsetAsync(delayKey, redisDelay)
                })
            }))
        }).then(() => {
            return Promise.all([delayRelation1, delayRelation2].map((delayRelation: DelayRelation) => {
                const relationsKey = KeyFactory.createDelayKey(project1.identifier, delayd1.identifier, "relations")
                return client.saddAsync(relationsKey, delayRelation.task).then(() => {
                    const redisRelation = {
                        lag: delayRelation.lag
                    }
                    const taskRelationKey = KeyFactory.createDelayRelationKey(project1.identifier, delayRelation.delay,
                        delayRelation.task)
                    return client.hmsetAsync(taskRelationKey, redisRelation)
                })
            }))
        }).then(() => {
            return client
        })
    }

    static setValue(client: redis.RedisClient, key: string, value: string) {
        return (client as RedisAsyncClient).setAsync(key, value)
    }

    static deleteValue(client: redis.RedisClient, key: string): Promise<void> {
        return (client as RedisAsyncClient).delAsync(key)
    }

    static setMember(client: redis.RedisClient, key: string, member: string, value: string): Promise<void> {
        return (client as RedisAsyncClient).hsetAsync(key, member, value)
    }

    static deleteMember(client: redis.RedisClient, key: string, member: string): Promise<void> {
        return (client as RedisAsyncClient).hdelAsync(key, member)
    }

    static addValue(client: redis.RedisClient, key: string, value: string) {
        return (client as RedisAsyncClient).saddAsync(key, value)
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
