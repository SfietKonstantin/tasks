import * as redis from "redis"
import * as bluebird from "bluebird"
import {feature1, feature2, story1, story2} from "../../../common/testdata"
import {KeyFactory} from "../../../../server/dao/redis/utils/keyfactory"
import {Feature} from "../../../../common/feature"
import {Story} from "../../../../common/story"
import {StoryStateBuilder} from "../../../../server/dao/redis/utils/storystate"
import {BooleanBuilder} from "../../../../server/dao/redis/utils/boolean"
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
            // Add some features
            return Promise.all([feature1, feature2].map((feature: Feature) => {
                const featureIdsKey = KeyFactory.createGlobalFeatureKey("ids")
                return client.saddAsync(featureIdsKey, feature.identifier).then(() => {
                    const redisFeature = {
                        name: feature.name,
                        description: feature.description,
                        color: feature.color,
                        visible: BooleanBuilder.toString(feature.visible)
                    }
                    const featureKey = KeyFactory.createFeatureKey(feature.identifier)
                    return client.hmsetAsync(featureKey, redisFeature)
                })
            }))
        }).then(() => {
            // Add some stories
            return Promise.all([story1, story2].map((story: Story) => {
                const storyIdsKey = KeyFactory.createGlobalStoryKey("ids")
                return client.saddAsync(storyIdsKey, story.identifier).then(() => {
                    const redisStory = {
                        name: story.name,
                        description: story.description,
                        duration: story.duration,
                        feature: story.feature.identifier,
                        state: StoryStateBuilder.toString(story.state),
                        visible: BooleanBuilder.toString(story.visible)
                    }
                    const featureKey = KeyFactory.createStoryKey(story.identifier)
                    return client.hmsetAsync(featureKey, redisStory)
                }).then(() => {
                    const featureStoriesKey = KeyFactory.createFeatureKey(story.feature.identifier, "stories")
                    return client.saddAsync(featureStoriesKey, story.identifier)
                })
            })).then(() => {
                const storyCurrentIdKey = KeyFactory.createGlobalStoryKey("currentId")
                return client.setAsync(storyCurrentIdKey, "2")
            })
        }).then(() => {
            return client
        })
    }

    static dumpOnly(): Promise<void> {
        return RedisTestDataProvider.dump().then((client: redis.RedisClient) => {
            client.quit()
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
