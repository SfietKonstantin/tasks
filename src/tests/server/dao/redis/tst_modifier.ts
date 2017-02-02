import * as chai from "chai"
import * as redis from "redis"
import {Modifier} from "../../../../common/modifier"
import {RedisModifierDao} from "../../../../server/dao/redis/modifier"
import {RedisDaoBuilder} from "../../../../server/dao/redis/builder"
import {RedisTestDataProvider} from "./testdataprovider"
import {
project1, invalidProject, modifier1, modifier2, taskd1, invalidTaskd, modifier4,
modifier3, taskd2
} from "../../testdata"
import {KeyFactory} from "../../../../server/dao/redis/utils/keyfactory"
import {NotFoundError} from "../../../../common/errors/notfound"
import {CorruptedError} from "../../../../server/dao/error/corrupted"
import {InternalError} from "../../../../server/dao/error/internal"
import {TaskLocation} from "../../../../common/tasklocation"
import {InputError} from "../../../../common/errors/input"

describe("Redis DAO Modifier", () => {
    let client: redis.RedisClient
    let dao: RedisModifierDao
    beforeEach((done) => {
        RedisTestDataProvider.dump().then((testClient: redis.RedisClient) => {
            client = testClient
            const builder = new RedisDaoBuilder(client)
            dao = builder.buildModifierDao()
            done()
        })
    })
    afterEach(() => {
        client.quit()
    })
    describe("getModifier", () => {
        it("Should get a task from the DB (End)", (done) => {
            dao.getModifier(project1.identifier, 1).then((modifier: Modifier) => {
                chai.expect(modifier).to.deep.equal(modifier1)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get a task from the DB (Beginning)", (done) => {
            dao.getModifier(project1.identifier, 2).then((modifier: Modifier) => {
                chai.expect(modifier).to.deep.equal(modifier2)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid project identifier", (done) => {
            dao.getModifier(invalidProject.identifier, 1).then(() => {
                done(new Error("getModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid modifier id", (done) => {
            dao.getModifier(project1.identifier, 4).then(() => {
                done(new Error("getModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a modifier with corrupted name", (done) => {
            const modifierKey = KeyFactory.createModifierKey(project1.identifier, 1)
            RedisTestDataProvider.deleteMember(client, modifierKey, "name").then(() => {
                return dao.getModifier(project1.identifier, 1)
            }).then(() => {
                done(new Error("getModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a modifier with corrupted description", (done) => {
            const modifierKey = KeyFactory.createModifierKey(project1.identifier, 1)
            RedisTestDataProvider.deleteMember(client, modifierKey, "description").then(() => {
                return dao.getModifier(project1.identifier, 1)
            }).then(() => {
                done(new Error("getModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a modifier with corrupted location", (done) => {
            const modifierKey = KeyFactory.createModifierKey(project1.identifier, 1)
            RedisTestDataProvider.deleteMember(client, modifierKey, "location").then(() => {
                return dao.getModifier(project1.identifier, 1)
            }).then(() => {
                done(new Error("getModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a modifier with an invalid location", (done) => {
            const modifierKey = KeyFactory.createModifierKey(project1.identifier, 1)
            RedisTestDataProvider.setMember(client, modifierKey, "location", "test").then(() => {
                return dao.getModifier(project1.identifier, 1)
            }).then(() => {
                done(new Error("getModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a modifier with corrupted duration", (done) => {
            const modifierKey = KeyFactory.createModifierKey(project1.identifier, 1, "duration")
            RedisTestDataProvider.deleteValue(client, modifierKey).then(() => {
                return dao.getModifier(project1.identifier, 1)
            }).then(() => {
                done(new Error("getModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a corrupted modifier", (done) => {
            const modifierKey = KeyFactory.createModifierKey(project1.identifier, 1)
            RedisTestDataProvider.setValue(client, modifierKey, "test").then(() => {
                return dao.getModifier(project1.identifier, 1)
            }).then(() => {
                done(new Error("getModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
    describe("getTaskModifiers", () => {
        it("Should get a list of tasks that belongs to a task from the DB", (done) => {
            dao.getTaskModifiers(project1.identifier, taskd1.identifier).then((modifiers: Array<Modifier>) => {
                const expected = [modifier1, modifier2, modifier3]
                chai.expect(modifiers).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid project identifier", (done) => {
            dao.getTaskModifiers(invalidProject.identifier, taskd1.identifier).then(() => {
                done(new Error("getTaskModifiers should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid taskidentifier", (done) => {
            dao.getTaskModifiers(project1.identifier, invalidTaskd.identifier).then(() => {
                done(new Error("getTaskModifiers should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get only modifiers without corrupted body from the DB", (done) => {
            const modifierKey = KeyFactory.createModifierKey(project1.identifier, 1)
            RedisTestDataProvider.setValue(client, modifierKey, "test").then(() => {
                return dao.getTaskModifiers(project1.identifier, taskd1.identifier)
            }).then((modifiers: Array<Modifier>) => {
                const expected = [modifier2, modifier3]
                chai.expect(modifiers).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
    describe("addModifier", () => {
        it("Should add a modifier in the DB", (done) => {
            dao.addModifier(project1.identifier, modifier4).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding a modifier in the DB with an invalid location type", (done) => {
            const modifier: Modifier = {
                name: "Modifier",
                description: "Description",
                duration: 10,
                location: (10 as TaskLocation)
            }

            dao.addModifier(project1.identifier, modifier).then(() => {
                done(new Error("addModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InputError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding a modifier in the DB for an invalid project", (done) => {
            dao.addModifier(invalidProject.identifier, modifier4).then(() => {
                done(new Error("addModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding a modifier in a project with corrupted latest modifier id", (done) => {
            RedisTestDataProvider.setValue(client, "modifier:project1:lastId", "test").then(() => {
                return dao.addModifier(project1.identifier, modifier4)
            }).then(() => {
                done(new Error("addModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding a modifier in a project with corrupted modifier ids", (done) => {
            RedisTestDataProvider.setValue(client, "modifier:project1:ids", "test").then(() => {
                return dao.addModifier(project1.identifier, modifier4)
            }).then(() => {
                done(new Error("addModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
    describe("addModifierForTask", () => {
        it("Should add a modifier to a task", (done) => {
            dao.addModifierForTask(project1.identifier, 3, taskd2.identifier).then(() => {
                return dao.getTaskModifiers(project1.identifier, taskd2.identifier)
            }).then((modifiers: Array<Modifier>) => {
                chai.expect(modifiers).to.deep.equal([modifier3])
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid project identifier", (done) => {
            dao.addModifierForTask(invalidProject.identifier, 3, taskd2.identifier).then(() => {
                done(new Error("addModifierForTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid modifier id", (done) => {
            dao.addModifierForTask(project1.identifier, 4, taskd2.identifier).then(() => {
                done(new Error("addModifierForTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid task identifier", (done) => {
            dao.addModifierForTask(project1.identifier, 3, invalidTaskd.identifier).then(() => {
                done(new Error("addModifierForTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding a modifier with corrupted task identifiers to a task", (done) => {
            const tasksKey = KeyFactory.createModifierKey(project1.identifier, 3, "tasks")
            RedisTestDataProvider.setValue(client, tasksKey, "test").then(() => {
                return dao.addModifierForTask(project1.identifier, 3, taskd2.identifier)
            }).then(() => {
                done(new Error("addModifierForTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding a modifier to a task with corrupted modifier ids", (done) => {
            const modifiersKey = KeyFactory.createTaskKey(project1.identifier, taskd2.identifier, "modifiers")
            RedisTestDataProvider.setValue(client, modifiersKey, "test").then(() => {
                return dao.addModifierForTask(project1.identifier, 3, taskd2.identifier)
            }).then(() => {
                done(new Error("addModifierForTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
