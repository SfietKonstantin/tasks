import * as chai from "chai"
import * as redis from "redis"
import {Modifier} from "../../../../common/modifier"
import {RedisModifierDao} from "../../../../server/dao/redis/modifier"
import {RedisDaoBuilder} from "../../../../server/dao/redis/builder"
import {RedisTestDataProvider} from "./testdataprovider"
import {
project1, invalidProject, modifier1, modifier2, taskd1, invalidTaskd, modifier4,
modifier3, taskd2
} from "../../../common/testdata"
import {KeyFactory} from "../../../../server/dao/redis/utils/keyfactory"
import {NotFoundError} from "../../../../common/errors/notfound"
import {CorruptedError} from "../../../../server/dao/error/corrupted"
import {InternalError} from "../../../../server/dao/error/internal"
import {TaskLocation} from "../../../../common/tasklocation"
import {InputError} from "../../../../common/errors/input"

describe("Redis DAO Modifier", () => {
    let client: redis.RedisClient
    let dao: RedisModifierDao
    beforeEach(() => {
        return RedisTestDataProvider.dump().then((testClient: redis.RedisClient) => {
            client = testClient
            const builder = new RedisDaoBuilder(client)
            dao = builder.buildModifierDao()
        })
    })
    afterEach(() => {
        client.quit()
    })
    describe("getModifier", () => {
        it("Should get a task from the DB (End)", () => {
            return dao.getModifier(project1.identifier, 1).then((modifier: Modifier) => {
                chai.expect(modifier).to.deep.equal(modifier1)
            })
        })
        it("Should get a task from the DB (Beginning)", () => {
            return dao.getModifier(project1.identifier, 2).then((modifier: Modifier) => {
                chai.expect(modifier).to.deep.equal(modifier2)
            })
        })
        it("Should get an exception for an invalid project identifier", () => {
            return dao.getModifier(invalidProject.identifier, 1).then(() => {
                throw new Error("getModifier should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        it("Should get an exception for an invalid modifier id", () => {
            return dao.getModifier(project1.identifier, 4).then(() => {
                throw new Error("getModifier should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        it("Should get an exception for a modifier with corrupted name", () => {
            const modifierKey = KeyFactory.createModifierKey(project1.identifier, 1)
            return RedisTestDataProvider.deleteMember(client, modifierKey, "name").then(() => {
                return dao.getModifier(project1.identifier, 1)
            }).then(() => {
                throw new Error("getModifier should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a modifier with corrupted description", () => {
            const modifierKey = KeyFactory.createModifierKey(project1.identifier, 1)
            return RedisTestDataProvider.deleteMember(client, modifierKey, "description").then(() => {
                return dao.getModifier(project1.identifier, 1)
            }).then(() => {
                throw new Error("getModifier should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a modifier with corrupted location", () => {
            const modifierKey = KeyFactory.createModifierKey(project1.identifier, 1)
            return RedisTestDataProvider.deleteMember(client, modifierKey, "location").then(() => {
                return dao.getModifier(project1.identifier, 1)
            }).then(() => {
                throw new Error("getModifier should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a modifier with an invalid location", () => {
            const modifierKey = KeyFactory.createModifierKey(project1.identifier, 1)
            return RedisTestDataProvider.setMember(client, modifierKey, "location", "test").then(() => {
                return dao.getModifier(project1.identifier, 1)
            }).then(() => {
                throw new Error("getModifier should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a modifier with corrupted duration", () => {
            const modifierKey = KeyFactory.createModifierKey(project1.identifier, 1, "duration")
            return RedisTestDataProvider.deleteValue(client, modifierKey).then(() => {
                return dao.getModifier(project1.identifier, 1)
            }).then(() => {
                throw new Error("getModifier should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a corrupted modifier", () => {
            const modifierKey = KeyFactory.createModifierKey(project1.identifier, 1)
            return RedisTestDataProvider.setValue(client, modifierKey, "test").then(() => {
                return dao.getModifier(project1.identifier, 1)
            }).then(() => {
                throw new Error("getModifier should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
    describe("getTaskModifiers", () => {
        it("Should get a list of tasks that belongs to a task from the DB", () => {
            return dao.getTaskModifiers(project1.identifier, taskd1.identifier).then((modifiers: Array<Modifier>) => {
                const expected = [modifier1, modifier2, modifier3]
                chai.expect(modifiers).to.deep.equal(expected)
            })
        })
        it("Should get an exception for an invalid project identifier", () => {
            return dao.getTaskModifiers(invalidProject.identifier, taskd1.identifier).then(() => {
                throw new Error("getTaskModifiers should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        it("Should get an exception for an invalid taskidentifier", () => {
            return dao.getTaskModifiers(project1.identifier, invalidTaskd.identifier).then(() => {
                throw new Error("getTaskModifiers should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        it("Should get only modifiers without corrupted body from the DB", () => {
            const modifierKey = KeyFactory.createModifierKey(project1.identifier, 1)
            return RedisTestDataProvider.setValue(client, modifierKey, "test").then(() => {
                return dao.getTaskModifiers(project1.identifier, taskd1.identifier)
            }).then((modifiers: Array<Modifier>) => {
                const expected = [modifier2, modifier3]
                chai.expect(modifiers).to.deep.equal(expected)
            })
        })
    })
    describe("addModifier", () => {
        it("Should add a modifier in the DB", () => {
            return dao.addModifier(project1.identifier, modifier4)
        })
        it("Should get an exception when adding a modifier in the DB with an invalid location type", () => {
            const modifier: Modifier = {
                name: "Modifier",
                description: "Description",
                duration: 10,
                location: (10 as TaskLocation)
            }

            return dao.addModifier(project1.identifier, modifier).then(() => {
                throw new Error("addModifier should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InputError)
            })
        })
        it("Should get an exception when adding a modifier in the DB for an invalid project", () => {
            return dao.addModifier(invalidProject.identifier, modifier4).then(() => {
                throw new Error("addModifier should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        it("Should get an exception when adding a modifier in a project with corrupted latest modifier id", () => {
            return RedisTestDataProvider.setValue(client, "modifier:project1:lastId", "test").then(() => {
                return dao.addModifier(project1.identifier, modifier4)
            }).then(() => {
                throw new Error("addModifier should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
        it("Should get an exception when adding a modifier in a project with corrupted modifier ids", () => {
            return RedisTestDataProvider.setValue(client, "modifier:project1:ids", "test").then(() => {
                return dao.addModifier(project1.identifier, modifier4)
            }).then(() => {
                throw new Error("addModifier should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
    describe("addModifierForTask", () => {
        it("Should add a modifier to a task", () => {
            return dao.addModifierForTask(project1.identifier, 3, taskd2.identifier).then(() => {
                return dao.getTaskModifiers(project1.identifier, taskd2.identifier)
            }).then((modifiers: Array<Modifier>) => {
                chai.expect(modifiers).to.deep.equal([modifier3])
            })
        })
        it("Should get an exception for an invalid project identifier", () => {
            return dao.addModifierForTask(invalidProject.identifier, 3, taskd2.identifier).then(() => {
                throw new Error("addModifierForTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        it("Should get an exception for an invalid modifier id", () => {
            return dao.addModifierForTask(project1.identifier, 4, taskd2.identifier).then(() => {
                throw new Error("addModifierForTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        it("Should get an exception for an invalid task identifier", () => {
            return dao.addModifierForTask(project1.identifier, 3, invalidTaskd.identifier).then(() => {
                throw new Error("addModifierForTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        it("Should get an exception when adding a modifier with corrupted task identifiers to a task", () => {
            const tasksKey = KeyFactory.createModifierKey(project1.identifier, 3, "tasks")
            return RedisTestDataProvider.setValue(client, tasksKey, "test").then(() => {
                return dao.addModifierForTask(project1.identifier, 3, taskd2.identifier)
            }).then(() => {
                throw new Error("addModifierForTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
        it("Should get an exception when adding a modifier to a task with corrupted modifier ids", () => {
            const modifiersKey = KeyFactory.createTaskKey(project1.identifier, taskd2.identifier, "modifiers")
            return RedisTestDataProvider.setValue(client, modifiersKey, "test").then(() => {
                return dao.addModifierForTask(project1.identifier, 3, taskd2.identifier)
            }).then(() => {
                throw new Error("addModifierForTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
})
