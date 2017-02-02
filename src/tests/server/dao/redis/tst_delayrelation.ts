import * as chai from "chai"
import * as redis from "redis"
import {DelayRelation} from "../../../../common/delayrelation"
import {RedisDelayRelationDao} from "../../../../server/dao/redis/delayrelation"
import {RedisDaoBuilder} from "../../../../server/dao/redis/builder"
import {RedisTestDataProvider} from "./testdataprovider"
import {
project1, invalidProject,
taskd1, invalidTaskd, delayRelation1, delayRelation2, delayd1, invalidDelay, delayRelation3, delayd2,
invalidDelayRelation1, invalidDelayRelation2
} from "../../testdata"
import {KeyFactory} from "../../../../server/dao/redis/utils/keyfactory"
import {NotFoundError} from "../../../../common/errors/notfound"
import {CorruptedError} from "../../../../server/dao/error/corrupted"
import {InternalError} from "../../../../server/dao/error/internal"
import {ExistsError} from "../../../../server/error/exists"

describe("Redis DAO DelayRelation", () => {
    let client: redis.RedisClient
    let dao: RedisDelayRelationDao
    beforeEach((done) => {
        RedisTestDataProvider.dump().then((testClient: redis.RedisClient) => {
            client = testClient
            const builder = new RedisDaoBuilder(client)
            dao = builder.buildDelayRelationDao()
            done()
        })
    })
    afterEach(() => {
        client.quit()
    })
    describe("getDelayRelations", () => {
        it("Should get a list of task relations that belongs to a delay from the DB", (done) => {
            dao.getDelayRelations(project1.identifier, delayd1.identifier)
                .then((delayRelations: Array<DelayRelation>) => {
                    const expected: Array<DelayRelation> = [delayRelation1, delayRelation2]
                    chai.expect(delayRelations).to.deep.equal(expected)
                    done()
                }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid project identifier", (done) => {
            dao.getDelayRelations(invalidProject.identifier, delayd1.identifier).then(() => {
                done(new Error("getDelayRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid delay identifier", (done) => {
            dao.getDelayRelations(project1.identifier, invalidDelay.identifier).then(() => {
                done(new Error("getDelayRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a task relation with corrupted lag", (done) => {
            const delayRelationKey = KeyFactory.createDelayRelationKey(project1.identifier, delayRelation1.delay,
                delayRelation1.task)
            RedisTestDataProvider.setMember(client, delayRelationKey, "test", "test").then(() => {
                return RedisTestDataProvider.deleteMember(client, delayRelationKey, "lag")
            }).then(() => {
                return dao.getDelayRelations(project1.identifier, delayd1.identifier)
            }).then(() => {
                done(new Error("getDelayRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when a delay relation is missing in the DB", (done) => {
            const taskRelationKey = KeyFactory.createDelayRelationKey(project1.identifier, delayRelation1.delay,
                delayRelation1.task)
            RedisTestDataProvider.deleteValue(client, taskRelationKey).then(() => {
                return dao.getDelayRelations(project1.identifier, delayd1.identifier)
            }).then(() => {
                done(new Error("getDelayRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a delay with corrupted relations", (done) => {
            const relationsKey = KeyFactory.createDelayKey(project1.identifier, delayd1.identifier, "relations")
            RedisTestDataProvider.setValue(client, relationsKey, "test").then(() => {
                return dao.getDelayRelations(project1.identifier, delayd1.identifier)
            }).then(() => {
                done(new Error("getDelayRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
    describe("addDelayRelation", () => {
        it("Should add a delay relation in the DB", (done) => {
            dao.addDelayRelation(project1.identifier, delayRelation3).then(() => {
                return dao.getDelayRelations(project1.identifier, delayd2.identifier)
            }).then((taskRelations: Array<DelayRelation>) => {
                chai.expect(taskRelations).to.deep.equal([delayRelation3])
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid project identifier", (done) => {
            dao.addDelayRelation(invalidProject.identifier, delayRelation3).then(() => {
                done(new Error("addDelayRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid delay", (done) => {
            dao.addDelayRelation(project1.identifier, invalidDelayRelation1).then(() => {
                done(new Error("addDelayRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid task", (done) => {
            dao.addDelayRelation(project1.identifier, invalidDelayRelation2).then(() => {
                done(new Error("addDelayRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding an existing delay relation in the DB", (done) => {
            dao.addDelayRelation(project1.identifier, delayRelation1).then(() => {
                done(new Error("addDelayRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(ExistsError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding a delay relation to a delay with corrupted relations", (done) => {
            const relationsKey = KeyFactory.createDelayKey(project1.identifier, delayd2.identifier, "relations")
            RedisTestDataProvider.setValue(client, relationsKey, "test").then(() => {
                return dao.addDelayRelation(project1.identifier, delayRelation3)
            }).then(() => {
                done(new Error("addDelayRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
