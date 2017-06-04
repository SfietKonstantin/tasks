import * as redis from "redis"
import * as redisasync from "./async"
import * as bluebird from "bluebird"
import {IStoryDao} from "../istory"
import {RedisFeatureDao} from "./feature"
import {Feature} from "../../../common/feature"
import {Story, StoryContent} from "../../../common/story"
import {CorruptedError} from "../error/corrupted"
import {NotFoundError} from "../../../common/errors/notfound"
import {wrapUnknownErrors} from "./utils/error"
import {StoryStateBuilder} from "./utils/storystate"
import {KeyFactory} from "./utils/keyfactory"
import {BooleanBuilder} from "./utils/boolean"
bluebird.promisifyAll(redis)

class RedisStory {
    readonly name: string
    readonly description: string
    readonly duration: number
    readonly feature: string
    readonly state: string
    readonly assignee?: string
    readonly sprint?: string
    readonly visible: boolean

    constructor(story: StoryContent) {
        this.name = story.name
        this.description = story.description
        this.duration = story.duration
        this.feature = story.feature.identifier
        this.state = StoryStateBuilder.toString(story.state)
        if (story.assignee) {
            this.assignee = story.assignee.identifier
        }
        if (story.sprint) {
            this.sprint = story.sprint.identifier
        }
        this.visible = story.visible
    }

    static add(storyContent: StoryContent, client: redisasync.RedisAsyncClient): Promise<Story> {
        return RedisStory.createIdentifier(client).then((storyIdentifier: string): Promise<Story> => {
            const story: Story = {
                identifier: storyIdentifier,
                name: storyContent.name,
                description: storyContent.description,
                duration: storyContent.duration,
                feature: storyContent.feature,
                state: storyContent.state,
                assignee: storyContent.assignee,
                sprint: storyContent.sprint,
                visible: storyContent.visible
            }
            return RedisStory.save(story, client).then(() => {
                return story
            })
        })
    }

    static save(story: Story, client: redisasync.RedisAsyncClient): Promise<void> {
        const storyIdentifier = story.identifier
        const redisStory = new RedisStory(story)
        const storyKey = KeyFactory.createStoryKey(storyIdentifier)
        return client.hmsetAsync(storyKey, redisStory).then(() => {
            const featureIdentifier = story.feature.identifier
            const featureStoriesKey = KeyFactory.createFeatureKey(featureIdentifier, "stories")
            return client.saddAsync(featureStoriesKey, storyIdentifier)
        }).then(() => {
            const storyIdsKey = KeyFactory.createGlobalStoryKey("ids")
            return client.saddAsync(storyIdsKey, storyIdentifier)
        })
    }

    static load(storyIdentifier: string, client: redisasync.RedisAsyncClient): Promise<Story> {
        const storyKey = KeyFactory.createStoryKey(storyIdentifier)
        return client.hgetallAsync(storyKey).then((result: any) => {
            if (!result.hasOwnProperty("name")) {
                throw new CorruptedError(`Story ${storyIdentifier} do not have property "name"`)
            }
            if (!result.hasOwnProperty("description")) {
                throw new CorruptedError(`Story ${storyIdentifier} do not have property "description"`)
            }
            if (!result.hasOwnProperty("duration")) {
                throw new CorruptedError(`Story ${storyIdentifier} do not have property "duration"`)
            }
            if (!result.hasOwnProperty("feature")) {
                throw new CorruptedError(`Story ${storyIdentifier} do not have property "feature"`)
            }
            if (!result.hasOwnProperty("state")) {
                throw new CorruptedError(`Story ${storyIdentifier} do not have property "state"`)
            }
            const state = StoryStateBuilder.fromString(result["state"])
            if (state == null) {
                throw new CorruptedError(`Story ${storyIdentifier} has an invalid "state"`)
            }
            if (!result.hasOwnProperty("visible")) {
                throw new CorruptedError(`Story ${storyIdentifier} do not have property "visible"`)
            }
            const visible = BooleanBuilder.fromString(result["visible"])
            if (visible == null) {
                throw new CorruptedError(`Story ${storyIdentifier} has an invalid "visible"`)
            }

            const featureIdentifier = result["feature"] as string
            return RedisStory.getFeature(storyIdentifier, featureIdentifier, client).then((feature: Feature): Story => {
                return {
                    identifier: storyIdentifier,
                    name: result["name"] as string,
                    description: result["description"] as string,
                    duration: +(result["duration"] as string),
                    feature,
                    assignee: null,
                    sprint: null,
                    state: state,
                    visible: visible
                }
            })
        })
    }

    private static getFeature(storyIdentifier: string, featureIdentifier: string,
                              client: redisasync.RedisAsyncClient): Promise<Feature> {
        return new RedisFeatureDao(client).getFeature(featureIdentifier).catch(() => {
            throw new CorruptedError(`Story ${storyIdentifier} has an invalid "feature"`)
        })
    }

    private static createIdentifier(client: redisasync.RedisAsyncClient): Promise<string> {
        const storyCurrentIdKey = KeyFactory.createGlobalStoryKey("currentId")
        return client.incrAsync(storyCurrentIdKey).then((id: number) => {
            return `${id}`
        }).catch((error) => {
            wrapUnknownErrors(error)
        })
    }
}

export class RedisStoryDao implements IStoryDao {
    private readonly client: redisasync.RedisAsyncClient

    constructor(client: redis.RedisClient) {
        this.client = client as redisasync.RedisAsyncClient
    }

    getAllStories(): Promise<Array<Story>> {
        const storyIdsKey = KeyFactory.createGlobalStoryKey("ids")
        return this.client.smembersAsync(storyIdsKey).then((identifiers: Array<String>) => {
            const sortedIdentifiers = identifiers.sort()
            return Promise.all(sortedIdentifiers.map((identifier: string) => {
                return this.getStory(identifier).catch(() => {
                    return null
                })
            }))
        }).then((stories: Array<Story | null>) => {
            return stories.filter((story: Story | null) => {
                return story && story.visible
            })
        }).catch(() => {
            return []
        })
    }

    getFeatureStories(featureIdentifier: string): Promise<Array<Story>> {
        return this.hasFeature(featureIdentifier).then((): Promise<Array<string>> => {
            const featureStoriesKey = KeyFactory.createFeatureKey(featureIdentifier, "stories")
            return this.client.smembersAsync(featureStoriesKey)
        }).then((storyIdentifiers: Array<string>) => {
            const sortedIdentifiers = storyIdentifiers.sort()
            return Promise.all(sortedIdentifiers.map((storyIdentifier: string) => {
                return this.getStory(storyIdentifier).catch(() => {
                    return null
                })
            }))
        }).then((stories: Array<Story | null>) => {
            return stories.filter((story: Story | null) => {
                return story && story.visible
            })
        }).catch((error) => {
            wrapUnknownErrors(error)
        })
    }

    addStory(story: StoryContent): Promise<Story> {
        return this.hasFeature(story.feature.identifier).then(() => {
            return RedisStory.add(story, this.client)
        }).catch((error) => {
            wrapUnknownErrors(error)
        })
    }

    removeStory(storyIdentifier: string): Promise<void> {
        return this.getStory(storyIdentifier).then((story: Story) => {
            story.visible = false
            return RedisStory.save(story, this.client)
        }).catch((error) => {
            wrapUnknownErrors(error)
        })
    }

    getStory(storyIdentifier: string): Promise<Story> {
        return this.hasStory(storyIdentifier).then(() => {
            return RedisStory.load(storyIdentifier, this.client)
        }).catch((error) => {
            wrapUnknownErrors(error)
        })
    }

    hasStory(storyIdentifier: string): Promise<void> {
        const storyKey = KeyFactory.createStoryKey(storyIdentifier)
        return this.client.existsAsync(storyKey).then((result: number) => {
            if (result !== 1) {
                throw new NotFoundError(`Story ${storyIdentifier} not found`)
            }
        })
    }

    private hasFeature(featureIdentifier: string) {
        return new RedisFeatureDao(this.client).hasFeature(featureIdentifier)
    }
}
