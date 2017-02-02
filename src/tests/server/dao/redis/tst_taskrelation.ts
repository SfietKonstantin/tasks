import * as chai from "chai"
import * as redis from "redis"
import {TaskRelation} from "../../../../common/taskrelation"
import {RedisTaskRelationDao} from "../../../../server/dao/redis/taskrelation"
import {RedisTestDataProvider} from "./testdataprovider"
import {RedisDaoBuilder} from "../../../../server/dao/redis/builder"
import {
project1, invalidProject, taskd1, taskd2, invalidTaskd,
taskRelation1, taskRelation2, taskRelation3, invalidTaskRelation1, invalidTaskRelation2
} from "../../testdata"
import {KeyFactory} from "../../../../server/dao/redis/utils/keyfactory"
import {NotFoundError} from "../../../../common/errors/notfound"
import {CorruptedError} from "../../../../server/dao/error/corrupted"
import {InternalError} from "../../../../server/dao/error/internal"
import {ExistsError} from "../../../../server/error/exists"

describe("Redis DAO TaskRelation", () => {
    let client: redis.RedisClient
    let dao: RedisTaskRelationDao
    beforeEach((done) => {
        RedisTestDataProvider.dump().then((testClient: redis.RedisClient) => {
            client = testClient
            const builder = new RedisDaoBuilder(client)
            dao = builder.buildTaskRelationDao()
            done()
        })
    })
    afterEach(() => {
        client.quit()
    })
    describe("getTaskRelations", () => {
        it("Should get a list of task relations that belongs to a task from the DB", (done) => {
            dao.getTaskRelations(project1.identifier, taskd1.identifier).then((taskRelations: Array<TaskRelation>) => {
                const expected = [taskRelation1, taskRelation2]
                chai.expect(taskRelations).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid project identifier", (done) => {
            dao.getTaskRelations(invalidProject.identifier, taskd1.identifier).then(() => {
                done(new Error("getTaskRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid task identifier", (done) => {
            dao.getTaskRelations(project1.identifier, invalidTaskd.identifier).then(() => {
                done(new Error("getTaskRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a task relation with corrupted previousLocation", (done) => {
            const taskRelationKey = KeyFactory.createTaskRelationKey(project1.identifier, taskRelation1.previous,
                taskRelation1.next)
            RedisTestDataProvider.deleteMember(client, taskRelationKey, "previousLocation").then(() => {
                return dao.getTaskRelations(project1.identifier, taskd1.identifier)
            }).then(() => {
                done(new Error("getTaskRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a task relation with corrupted lag", (done) => {
            const taskRelationKey = KeyFactory.createTaskRelationKey(project1.identifier, taskRelation1.previous,
                taskRelation1.next)
            RedisTestDataProvider.deleteMember(client, taskRelationKey, "lag").then(() => {
                return dao.getTaskRelations(project1.identifier, taskd1.identifier)
            }).then(() => {
                done(new Error("getTaskRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a task relation with an invalid previousLocation", (done) => {
            const taskRelationKey = KeyFactory.createTaskRelationKey(project1.identifier, taskRelation1.previous,
                taskRelation1.next)
            RedisTestDataProvider.setMember(client, taskRelationKey, "previousLocation", "test").then(() => {
                return dao.getTaskRelations(project1.identifier, taskd1.identifier)
            }).then(() => {
                done(new Error("getTaskRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when a task relation is missing in the DB", (done) => {
            const taskRelationKey = KeyFactory.createTaskRelationKey(project1.identifier, taskRelation1.previous,
                taskRelation1.next)
            RedisTestDataProvider.deleteValue(client, taskRelationKey).then(() => {
                return dao.getTaskRelations(project1.identifier, taskd1.identifier)
            }).then(() => {
                done(new Error("getTaskRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a task with corrupted relations", (done) => {
            const relationsKey = KeyFactory.createTaskKey(project1.identifier, taskd1.identifier, "relations")
            RedisTestDataProvider.setValue(client, relationsKey, "test").then(() => {
                return dao.getTaskRelations(project1.identifier, taskd1.identifier)
            }).then(() => {
                done(new Error("getTaskRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
    describe("addTaskRelation", () => {
        it("Should add a task relation in the DB", (done) => {
            dao.addTaskRelation(project1.identifier, taskRelation3).then(() => {
                return dao.getTaskRelations(project1.identifier, taskd2.identifier)
            }).then((taskRelations: Array<TaskRelation>) => {
                chai.expect(taskRelations).to.deep.equal([taskRelation3])
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid project identifier", (done) => {
            dao.addTaskRelation(invalidProject.identifier, taskRelation3).then(() => {
                done(new Error("addTaskRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid parent task", (done) => {
            dao.addTaskRelation(project1.identifier, invalidTaskRelation1).then(() => {
                done(new Error("addTaskRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid child task", (done) => {
            dao.addTaskRelation(project1.identifier, invalidTaskRelation2).then(() => {
                done(new Error("addTaskRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding an existing task relation in the DB", (done) => {
            dao.addTaskRelation(project1.identifier, taskRelation1).then(() => {
                done(new Error("addTaskRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(ExistsError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding a task relation to a task with corrupted relations", (done) => {
            const relationsKey = KeyFactory.createTaskKey(project1.identifier, taskd2.identifier, "relations")
            RedisTestDataProvider.setValue(client, relationsKey, "test").then(() => {
                return dao.addTaskRelation(project1.identifier, taskRelation3)
            }).then(() => {
                done(new Error("addTaskRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
