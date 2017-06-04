import * as chai from "chai"
import * as redis from "redis"
import {Feature} from "../../../../common/feature"
import {feature1, feature2, feature3, invalidFeature} from "../../../common/testdata"
import {RedisFeatureDao} from "../../../../server/dao/redis/feature"
import {RedisDaoBuilder} from "../../../../server/dao/redis/builder"
import {KeyFactory} from "../../../../server/dao/redis/utils/keyfactory"
import {RedisTestDataProvider} from "./testdataprovider"
import {NotFoundError} from "../../../../common/errors/notfound"
import {CorruptedError} from "../../../../server/dao/error/corrupted"
import {InternalError} from "../../../../server/dao/error/internal"
import {ExistsError} from "../../../../server/error/exists"

describe("Redis DAO Feature", () => {
    let client: redis.RedisClient
    let dao: RedisFeatureDao
    beforeEach(() => {
        return RedisTestDataProvider.dump().then((testClient: redis.RedisClient) => {
            client = testClient
            const builder = new RedisDaoBuilder(client)
            dao = builder.buildFeatureDao()
        })
    })
    afterEach(() => {
        client.quit()
    })
    describe("getAllFeatures", () => {
        it("Should get an empty list of features in an empty DB", () => {
            RedisTestDataProvider.flush(client)
            return dao.getAllFeatures().then((features: Array<Feature>) => {
                chai.expect(features).to.empty
            })
        })
        it("Should get a list of features from the DB", () => {
            return dao.getAllFeatures().then((features: Array<Feature>) => {
                chai.expect(features).to.deep.equal([feature1, feature2])
            })
        })
        it("Should only get features with body from the DB", () => {
            const featureKey = KeyFactory.createFeatureKey(feature1.identifier)
            return RedisTestDataProvider.deleteValue(client, featureKey).then(() => {
                return dao.getAllFeatures()
            }).then((features: Array<Feature>) => {
                chai.expect(features).to.deep.equal([feature2])
            })
        })
        it("Should get only features without corrupted body from the DB", () => {
            const featureKey = KeyFactory.createFeatureKey(feature1.identifier)
            return RedisTestDataProvider.setValue(client, featureKey, "test").then(() => {
                return dao.getAllFeatures()
            }).then((features: Array<Feature>) => {
                chai.expect(features).to.deep.equal([feature2])
            })
        })
        it("Should get only visible features from the DB", () => {
            return dao.removeFeature(feature1.identifier).then(() => {
                return dao.getAllFeatures()
            }).then((features: Array<Feature>) => {
                chai.expect(features).to.deep.equal([feature2])
            })
        })
        it("Should get an empty list of features for a DB with corrupted keys", () => {
            const featureIdsKey = KeyFactory.createGlobalFeatureKey("ids")
            return RedisTestDataProvider.deleteValue(client, featureIdsKey).then(() => {
                return RedisTestDataProvider.setValue(client, featureIdsKey, "test")
            }).then(() => {
                return dao.getAllFeatures()
            }).then((features: Array<Feature>) => {
                chai.expect(features).to.empty
            })
        })
    })
    describe("getFeature", () => {
        it("Should get a feature from the DB", () => {
            return dao.getFeature(feature1.identifier).then((feature: Feature) => {
                chai.expect(feature).to.deep.equal(feature1)
            })
        })
        it("Should get an exception for an invalid feature identifier", () => {
            return dao.getFeature(invalidFeature.identifier).then(() => {
                throw new Error("getFeature should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        it("Should get an exception for a feature with corrupted name", () => {
            const featureKey = KeyFactory.createFeatureKey(feature1.identifier)
            return RedisTestDataProvider.deleteMember(client, featureKey, "name").then(() => {
                return dao.getFeature(feature1.identifier)
            }).then(() => {
                throw new Error("getFeature should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a feature with corrupted description", () => {
            const featureKey = KeyFactory.createFeatureKey(feature1.identifier)
            return RedisTestDataProvider.deleteMember(client, featureKey, "description").then(() => {
                return dao.getFeature(feature1.identifier)
            }).then(() => {
                throw new Error("getFeature should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a feature with corrupted color", () => {
            const featureKey = KeyFactory.createFeatureKey(feature1.identifier)
            return RedisTestDataProvider.deleteMember(client, featureKey, "color").then(() => {
                return dao.getFeature(feature1.identifier)
            }).then(() => {
                throw new Error("getFeature should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a feature with corrupted visible", () => {
            const featureKey = KeyFactory.createFeatureKey(feature1.identifier)
            return RedisTestDataProvider.deleteMember(client, featureKey, "visible").then(() => {
                return dao.getFeature(feature1.identifier)
            }).then(() => {
                throw new Error("getFeature should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a feature with an invalid visible", () => {
            const featureKey = KeyFactory.createFeatureKey(feature1.identifier)
            return RedisTestDataProvider.setMember(client, featureKey, "visible", "test").then(() => {
                return dao.getFeature(feature1.identifier)
            }).then(() => {
                throw new Error("getFeature should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a corrupted feature", () => {
            const featureKey = KeyFactory.createFeatureKey(feature1.identifier)
            return RedisTestDataProvider.setValue(client, featureKey, "test").then(() => {
                return dao.getFeature(feature1.identifier)
            }).then(() => {
                throw new Error("getFeature should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
    describe("addFeature", () => {
        it("Should add a feature in the DB", () => {
            return dao.addFeature(feature3).then(() => {
                return dao.getFeature(feature3.identifier)
            }).then((feature: Feature) => {
                chai.expect(feature).to.deep.equal(feature3)
            })
        })
        it("Should get an exception when adding an existing feature in the DB", () => {
            return dao.addFeature(feature1).then(() => {
                throw new Error("addFeature should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(ExistsError)
            })
        })
        it("Should get an exception when adding a feature in a DB with corrupted ids", () => {
            const featureIdsKey = KeyFactory.createGlobalFeatureKey("ids")
            return RedisTestDataProvider.setValue(client, featureIdsKey, "test").then(() => {
                return dao.addFeature(feature3)
            }).then(() => {
                throw new Error("addFeature should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
    describe("removeFeature", () => {
        it("Should hide a feature", () => {
            return dao.removeFeature(feature1.identifier).then(() => {
                return dao.getFeature(feature1.identifier)
            }).then((feature: Feature) => {
                chai.expect(feature.visible).to.false
            })
        })
        it("Should get an exception for a non inexisting feature", () => {
            return dao.removeFeature(invalidFeature.identifier).then(() => {
                throw new Error("removeFeature should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        it("Should get an exception for a corrupted feature", () => {
            const featureKey = KeyFactory.createFeatureKey(feature1.identifier)
            return RedisTestDataProvider.setValue(client, featureKey, "test").then(() => {
                return dao.removeFeature(feature1.identifier)
            }).then(() => {
                throw new Error("getFeature should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
})
