import * as chai from "chai"
import * as redis from "redis"
import {Feature} from "../../../../common/feature"
import {Story} from "../../../../common/story"
import {
    feature1, feature2, feature3, invalidFeature, invalidStory, story1, story2,
    story3
} from "../../../common/testdata"
import {RedisFeatureDao} from "../../../../server/dao/redis/feature"
import {RedisStoryDao} from "../../../../server/dao/redis/story"
import {RedisDaoBuilder} from "../../../../server/dao/redis/builder"
import {KeyFactory} from "../../../../server/dao/redis/utils/keyfactory"
import {RedisTestDataProvider} from "./testdataprovider"
import {NotFoundError} from "../../../../common/errors/notfound"
import {CorruptedError} from "../../../../server/dao/error/corrupted"
import {InternalError} from "../../../../server/dao/error/internal"
import {ExistsError} from "../../../../server/error/exists"

describe("Redis DAO Story", () => {
    let client: redis.RedisClient
    let dao: RedisStoryDao
    beforeEach(() => {
        return RedisTestDataProvider.dump().then((testClient: redis.RedisClient) => {
            client = testClient
            const builder = new RedisDaoBuilder(client)
            dao = builder.buildStoryDao()
        })
    })
    afterEach(() => {
        client.quit()
    })
    describe("getAllStories", () => {
        it("Should get an empty list of stories in an empty DB", () => {
            RedisTestDataProvider.flush(client)
            return dao.getAllStories().then((stories: Array<Story>) => {
                chai.expect(stories).to.empty
            })
        })
        it("Should get a list of stories from the DB", () => {
            return dao.getAllStories().then((story: Array<Story>) => {
                chai.expect(story).to.deep.equal([story1, story2])
            })
        })
        it("Should only get stories with body from the DB", () => {
            const storyKey = KeyFactory.createStoryKey(story1.identifier)
            return RedisTestDataProvider.deleteValue(client, storyKey).then(() => {
                return dao.getAllStories()
            }).then((stories: Array<Story>) => {
                chai.expect(stories).to.deep.equal([story2])
            })
        })
        it("Should get only stories without corrupted body from the DB", () => {
            const storyKey = KeyFactory.createStoryKey(story1.identifier)
            return RedisTestDataProvider.setValue(client, storyKey, "test").then(() => {
                return dao.getAllStories()
            }).then((stories: Array<Story>) => {
                chai.expect(stories).to.deep.equal([story2])
            })
        })
        it("Should get only visible stories from the DB", () => {
            return dao.removeStory(story1.identifier).then(() => {
                return dao.getAllStories()
            }).then((stories: Array<Story>) => {
                chai.expect(stories).to.deep.equal([story2])
            })
        })
        it("Should get an empty list of stories for a DB with corrupted keys", () => {
            const storyIdsKey = KeyFactory.createGlobalStoryKey("ids")
            return RedisTestDataProvider.deleteValue(client, storyIdsKey).then(() => {
                return RedisTestDataProvider.setValue(client, storyIdsKey, "test")
            }).then(() => {
                return dao.getAllStories()
            }).then((stories: Array<Story>) => {
                chai.expect(stories).to.empty
            })
        })
    })
    describe("getFeatureStories", () => {
        it("Should get an empty list of stories for a feature without stories", () => {
            return dao.getFeatureStories(feature2.identifier).then((stories: Array<Story>) => {
                chai.expect(stories).to.empty
            })
        })
        it("Should get a list of stories for a feature", () => {
            return dao.getFeatureStories(feature1.identifier).then((story: Array<Story>) => {
                chai.expect(story).to.deep.equal([story1, story2])
            })
        })
        it("Should only get stories with body for a feature", () => {
            const storyKey = KeyFactory.createStoryKey(story1.identifier)
            return RedisTestDataProvider.deleteValue(client, storyKey).then(() => {
                return dao.getFeatureStories(feature1.identifier)
            }).then((stories: Array<Story>) => {
                chai.expect(stories).to.deep.equal([story2])
            })
        })
        it("Should get only stories without corrupted body for a feature", () => {
            const storyKey = KeyFactory.createStoryKey(story1.identifier)
            return RedisTestDataProvider.setValue(client, storyKey, "test").then(() => {
                return dao.getFeatureStories(feature1.identifier)
            }).then((stories: Array<Story>) => {
                chai.expect(stories).to.deep.equal([story2])
            })
        })
        it("Should get only visible stories for a feature", () => {
            return dao.removeStory(story1.identifier).then(() => {
                return dao.getFeatureStories(feature1.identifier)
            }).then((stories: Array<Story>) => {
                chai.expect(stories).to.deep.equal([story2])
            })
        })
        it("Should get an exception for a feature with corrupted keys", () => {
            const featureStoriesKey = KeyFactory.createFeatureKey(feature1.identifier, "stories")
            return RedisTestDataProvider.deleteValue(client, featureStoriesKey).then(() => {
                return RedisTestDataProvider.setValue(client, featureStoriesKey, "test")
            }).then(() => {
                return dao.getFeatureStories(feature1.identifier)
            }).then(() => {
                throw new Error("getFeatureStories should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
    describe("getStory", () => {
        it("Should get a feature from the DB", () => {
            return dao.getStory(story1.identifier).then((story: Story) => {
                chai.expect(story).to.deep.equal(story1)
            })
        })
        it("Should get an exception for an invalid story identifier", () => {
            return dao.getStory(invalidStory.identifier).then(() => {
                throw new Error("getStory should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        it("Should get an exception for a story with corrupted name", () => {
            const storyKey = KeyFactory.createStoryKey(story1.identifier)
            return RedisTestDataProvider.deleteMember(client, storyKey, "name").then(() => {
                return dao.getStory(story1.identifier)
            }).then(() => {
                throw new Error("getStory should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a story with corrupted description", () => {
            const storyKey = KeyFactory.createStoryKey(story1.identifier)
            return RedisTestDataProvider.deleteMember(client, storyKey, "description").then(() => {
                return dao.getStory(story1.identifier)
            }).then(() => {
                throw new Error("getStory should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a story with corrupted duration", () => {
            const storyKey = KeyFactory.createStoryKey(story1.identifier)
            return RedisTestDataProvider.deleteMember(client, storyKey, "duration").then(() => {
                return dao.getStory(story1.identifier)
            }).then(() => {
                throw new Error("getStory should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a story with corrupted feature", () => {
            const storyKey = KeyFactory.createStoryKey(story1.identifier)
            return RedisTestDataProvider.deleteMember(client, storyKey, "feature").then(() => {
                return dao.getStory(story1.identifier)
            }).then(() => {
                throw new Error("getStory should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a story with an invalid feature", () => {
            const storyKey = KeyFactory.createStoryKey(story1.identifier)
            return RedisTestDataProvider.setMember(client, storyKey, "feature", invalidFeature.identifier).then(() => {
                return dao.getStory(story1.identifier)
            }).then(() => {
                throw new Error("getStory should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a story with corrupted state", () => {
            const storyKey = KeyFactory.createStoryKey(story1.identifier)
            return RedisTestDataProvider.deleteMember(client, storyKey, "state").then(() => {
                return dao.getStory(story1.identifier)
            }).then(() => {
                throw new Error("getStory should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a story with an invalid state", () => {
            const storyKey = KeyFactory.createStoryKey(story1.identifier)
            return RedisTestDataProvider.setMember(client, storyKey, "state", "test").then(() => {
                return dao.getStory(story1.identifier)
            }).then(() => {
                throw new Error("getStory should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a story with corrupted visible", () => {
            const storyKey = KeyFactory.createStoryKey(story1.identifier)
            return RedisTestDataProvider.deleteMember(client, storyKey, "visible").then(() => {
                return dao.getStory(story1.identifier)
            }).then(() => {
                throw new Error("getStory should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a story with an invalid visible", () => {
            const storyKey = KeyFactory.createStoryKey(story1.identifier)
            return RedisTestDataProvider.setMember(client, storyKey, "visible", "test").then(() => {
                return dao.getStory(story1.identifier)
            }).then(() => {
                throw new Error("getStory should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a corrupted story", () => {
            const storyKey = KeyFactory.createStoryKey(story1.identifier)
            return RedisTestDataProvider.setValue(client, storyKey, "test").then(() => {
                return dao.getStory(story1.identifier)
            }).then(() => {
                throw new Error("getStory should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
    describe("addStory", () => {
        it("Should add a story in the DB", () => {
            return dao.addStory(story3).then(() => {
                return dao.getStory(story3.identifier)
            }).then((story: Story) => {
                chai.expect(story).to.deep.equal(story3)
            })
        })
        it("Should generate an id for the added story", () => {
            const storyCurrentIdKey = KeyFactory.createGlobalStoryKey("currentId")
            return RedisTestDataProvider.setValue(client, storyCurrentIdKey, "123").then(() => {
                return dao.addStory(story3)
            }).then((story: Story) => {
                chai.expect(story.identifier).to.equal("124")
            })
        })
        it("Should generate a default id", () => {
            const storyCurrentIdKey = KeyFactory.createGlobalStoryKey("currentId")
            return RedisTestDataProvider.deleteValue(client, storyCurrentIdKey).then(() => {
                return dao.addStory(story3)
            }).then((story: Story) => {
                chai.expect(story.identifier).to.equal("1")
            })
        })
        it("Should get an exception when adding a feature in a DB with corrupted ids", () => {
            const storyIdsKey = KeyFactory.createGlobalStoryKey("ids")
            return RedisTestDataProvider.setValue(client, storyIdsKey, "test").then(() => {
                return dao.addStory(story3)
            }).then(() => {
                throw new Error("addStory should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
        it("Should get an exception when adding a feature in a DB with corrupted current id", () => {
            const storyIdsKey = KeyFactory.createGlobalStoryKey("currentId")
            return RedisTestDataProvider.setValue(client, storyIdsKey, "test").then(() => {
                return dao.addStory(story3)
            }).then(() => {
                throw new Error("addStory should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
    describe("removeStory", () => {
        it("Should hide a story", () => {
            return dao.removeStory(story1.identifier).then(() => {
                return dao.getStory(story1.identifier)
            }).then((story: Story) => {
                chai.expect(story.visible).to.false
            })
        })
        it("Should get an exception for a non inexisting story", () => {
            return dao.removeStory(invalidFeature.identifier).then(() => {
                throw new Error("removeStory should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        it("Should get an exception for a corrupted feature", () => {
            const storyKey = KeyFactory.createStoryKey(story1.identifier)
            return RedisTestDataProvider.setValue(client, storyKey, "test").then(() => {
                return dao.removeStory(story1.identifier)
            }).then(() => {
                throw new Error("removeStory should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
})
