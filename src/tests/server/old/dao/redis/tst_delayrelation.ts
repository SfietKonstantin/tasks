import * as chai from "chai"
import * as redis from "redis"
import {DelayRelation} from "../../../../../common/old/delayrelation"
import {RedisDelayRelationDao} from "../../../../../server/old/dao/redis/delayrelation"
import {RedisDaoBuilder} from "../../../../../server/old/dao/redis/builder"
import {RedisTestDataProvider} from "./testdataprovider"
import {
    project1, invalidProject,
    delayRelation1, delayRelation2, delayd1, invalidDelay, delayRelation3, delayd2,
    invalidDelayRelation1, invalidDelayRelation2
} from "../../../../common/old/testdata"
import {KeyFactory} from "../../../../../server/old/dao/redis/utils/keyfactory"
import {NotFoundError} from "../../../../../common/errors/notfound"
import {CorruptedError} from "../../../../../server/dao/error/corrupted"
import {InternalError} from "../../../../../server/dao/error/internal"
import {ExistsError} from "../../../../../server/error/exists"

describe("Redis DAO DelayRelation", () => {
    let client: redis.RedisClient
    let dao: RedisDelayRelationDao
    beforeEach(() => {
        return RedisTestDataProvider.dump().then((testClient: redis.RedisClient) => {
            client = testClient
            const builder = new RedisDaoBuilder(client)
            dao = builder.buildDelayRelationDao()
        })
    })
    afterEach(() => {
        client.quit()
    })
    describe("getDelayRelations", () => {
        xit("Should get a list of task relations that belongs to a delay from the DB", () => {
            return dao.getDelayRelations(project1.identifier, delayd1.identifier)
                .then((delayRelations: Array<DelayRelation>) => {
                    const expected: Array<DelayRelation> = [delayRelation1, delayRelation2]
                    chai.expect(delayRelations).to.deep.equal(expected)
            })
        })
        xit("Should get an exception for an invalid project identifier", () => {
            return dao.getDelayRelations(invalidProject.identifier, delayd1.identifier).then(() => {
                throw new Error("getDelayRelations should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should get an exception for an invalid delay identifier", () => {
            return dao.getDelayRelations(project1.identifier, invalidDelay.identifier).then(() => {
                throw new Error("getDelayRelations should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should get an exception for a task relation with corrupted lag", () => {
            const delayRelationKey = KeyFactory.createDelayRelationKey(project1.identifier, delayRelation1.delay,
                delayRelation1.task)
            return RedisTestDataProvider.setMember(client, delayRelationKey, "test", "test").then(() => {
                return RedisTestDataProvider.deleteMember(client, delayRelationKey, "lag")
            }).then(() => {
                return dao.getDelayRelations(project1.identifier, delayd1.identifier)
            }).then(() => {
                throw new Error("getDelayRelations should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        xit("Should get an exception when a delay relation is missing in the DB", () => {
            const taskRelationKey = KeyFactory.createDelayRelationKey(project1.identifier, delayRelation1.delay,
                delayRelation1.task)
            return RedisTestDataProvider.deleteValue(client, taskRelationKey).then(() => {
                return dao.getDelayRelations(project1.identifier, delayd1.identifier)
            }).then(() => {
                throw new Error("getDelayRelations should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        xit("Should get an exception for a delay with corrupted relations", () => {
            const relationsKey = KeyFactory.createDelayKey(project1.identifier, delayd1.identifier, "relations")
            return RedisTestDataProvider.setValue(client, relationsKey, "test").then(() => {
                return dao.getDelayRelations(project1.identifier, delayd1.identifier)
            }).then(() => {
                throw new Error("getDelayRelations should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
    describe("addDelayRelation", () => {
        xit("Should add a delay relation in the DB", () => {
            return dao.addDelayRelation(project1.identifier, delayRelation3).then(() => {
                return dao.getDelayRelations(project1.identifier, delayd2.identifier)
            }).then((taskRelations: Array<DelayRelation>) => {
                chai.expect(taskRelations).to.deep.equal([delayRelation3])
            })
        })
        xit("Should get an exception for an invalid project identifier", () => {
            return dao.addDelayRelation(invalidProject.identifier, delayRelation3).then(() => {
                throw new Error("addDelayRelation should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should get an exception for an invalid delay", () => {
            return dao.addDelayRelation(project1.identifier, invalidDelayRelation1).then(() => {
                throw new Error("addDelayRelation should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should get an exception for an invalid task", () => {
            return dao.addDelayRelation(project1.identifier, invalidDelayRelation2).then(() => {
                throw new Error("addDelayRelation should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should get an exception when adding an existing delay relation in the DB", () => {
            return dao.addDelayRelation(project1.identifier, delayRelation1).then(() => {
                throw new Error("addDelayRelation should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(ExistsError)
            })
        })
        xit("Should get an exception when adding a delay relation to a delay with corrupted relations", () => {
            const relationsKey = KeyFactory.createDelayKey(project1.identifier, delayd2.identifier, "relations")
            RedisTestDataProvider.setValue(client, relationsKey, "test").then(() => {
                return dao.addDelayRelation(project1.identifier, delayRelation3)
            }).then(() => {
                throw new Error("addDelayRelation should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
})
