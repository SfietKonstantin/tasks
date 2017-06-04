import * as chai from "chai"
import * as redis from "redis"
import {TaskRelation} from "../../../../../common/old/taskrelation"
import {RedisTaskRelationDao} from "../../../../../server/old/dao/redis/taskrelation"
import {RedisTestDataProvider} from "./testdataprovider"
import {RedisDaoBuilder} from "../../../../../server/old/dao/redis/builder"
import {
    project1, invalidProject, taskd1, taskd2, invalidTaskd,
    taskRelation1, taskRelation2, taskRelation3, invalidTaskRelation1, invalidTaskRelation2
} from "../../../../common/old/testdata"
import {KeyFactory} from "../../../../../server/old/dao/redis/utils/keyfactory"
import {NotFoundError} from "../../../../../common/errors/notfound"
import {CorruptedError} from "../../../../../server/dao/error/corrupted"
import {InternalError} from "../../../../../server/dao/error/internal"
import {ExistsError} from "../../../../../server/error/exists"

describe("Redis DAO TaskRelation", () => {
    let client: redis.RedisClient
    let dao: RedisTaskRelationDao
    beforeEach(() => {
        return RedisTestDataProvider.dump().then((testClient: redis.RedisClient) => {
            client = testClient
            const builder = new RedisDaoBuilder(client)
            dao = builder.buildTaskRelationDao()
        })
    })
    afterEach(() => {
        client.quit()
    })
    describe("getTaskRelations", () => {
        xit("Should get a list of task relations that belongs to a task from the DB", () => {
            return dao.getTaskRelations(project1.identifier, taskd1.identifier)
                .then((taskRelations: Array<TaskRelation>) => {
                    const expected = [taskRelation1, taskRelation2]
                    chai.expect(taskRelations).to.deep.equal(expected)
                })
        })
        xit("Should get an exception for an invalid project identifier", () => {
            return dao.getTaskRelations(invalidProject.identifier, taskd1.identifier).then(() => {
                throw new Error("getTaskRelations should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should get an exception for an invalid task identifier", () => {
            return dao.getTaskRelations(project1.identifier, invalidTaskd.identifier).then(() => {
                throw new Error("getTaskRelations should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should get an exception for a task relation with corrupted previousLocation", () => {
            const taskRelationKey = KeyFactory.createTaskRelationKey(project1.identifier, taskRelation1.previous,
                taskRelation1.next)
            return RedisTestDataProvider.deleteMember(client, taskRelationKey, "previousLocation").then(() => {
                return dao.getTaskRelations(project1.identifier, taskd1.identifier)
            }).then(() => {
                throw new Error("getTaskRelations should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        xit("Should get an exception for a task relation with corrupted lag", () => {
            const taskRelationKey = KeyFactory.createTaskRelationKey(project1.identifier, taskRelation1.previous,
                taskRelation1.next)
            return RedisTestDataProvider.deleteMember(client, taskRelationKey, "lag").then(() => {
                return dao.getTaskRelations(project1.identifier, taskd1.identifier)
            }).then(() => {
                throw new Error("getTaskRelations should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        xit("Should get an exception for a task relation with an invalid previousLocation", () => {
            const taskRelationKey = KeyFactory.createTaskRelationKey(project1.identifier, taskRelation1.previous,
                taskRelation1.next)
            return RedisTestDataProvider.setMember(client, taskRelationKey, "previousLocation", "test").then(() => {
                return dao.getTaskRelations(project1.identifier, taskd1.identifier)
            }).then(() => {
                throw new Error("getTaskRelations should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        xit("Should get an exception when a task relation is missing in the DB", () => {
            const taskRelationKey = KeyFactory.createTaskRelationKey(project1.identifier, taskRelation1.previous,
                taskRelation1.next)
            return RedisTestDataProvider.deleteValue(client, taskRelationKey).then(() => {
                return dao.getTaskRelations(project1.identifier, taskd1.identifier)
            }).then(() => {
                throw new Error("getTaskRelations should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        xit("Should get an exception for a task with corrupted relations", () => {
            const relationsKey = KeyFactory.createTaskKey(project1.identifier, taskd1.identifier, "relations")
            return RedisTestDataProvider.setValue(client, relationsKey, "test").then(() => {
                return dao.getTaskRelations(project1.identifier, taskd1.identifier)
            }).then(() => {
                throw new Error("getTaskRelations should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
    describe("addTaskRelation", () => {
        xit("Should add a task relation in the DB", () => {
            return dao.addTaskRelation(project1.identifier, taskRelation3).then(() => {
                return dao.getTaskRelations(project1.identifier, taskd2.identifier)
            }).then((taskRelations: Array<TaskRelation>) => {
                chai.expect(taskRelations).to.deep.equal([taskRelation3])
            })
        })
        xit("Should get an exception for an invalid project identifier", () => {
            return dao.addTaskRelation(invalidProject.identifier, taskRelation3).then(() => {
                throw new Error("addTaskRelation should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should get an exception for an invalid parent task", () => {
            return dao.addTaskRelation(project1.identifier, invalidTaskRelation1).then(() => {
                throw new Error("addTaskRelation should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should get an exception for an invalid child task", () => {
            return dao.addTaskRelation(project1.identifier, invalidTaskRelation2).then(() => {
                throw new Error("addTaskRelation should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should get an exception when adding an existing task relation in the DB", () => {
            return dao.addTaskRelation(project1.identifier, taskRelation1).then(() => {
                throw new Error("addTaskRelation should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(ExistsError)
            })
        })
        xit("Should get an exception when adding a task relation to a task with corrupted relations", () => {
            const relationsKey = KeyFactory.createTaskKey(project1.identifier, taskd2.identifier, "relations")
            return RedisTestDataProvider.setValue(client, relationsKey, "test").then(() => {
                return dao.addTaskRelation(project1.identifier, taskRelation3)
            }).then(() => {
                throw new Error("addTaskRelation should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
})
