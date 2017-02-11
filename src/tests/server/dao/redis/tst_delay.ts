import * as chai from "chai"
import * as redis from "redis"
import {DelayDefinition} from "../../../../common/delay"
import {RedisDelayDao} from "../../../../server/dao/redis/delay"
import {RedisDaoBuilder} from "../../../../server/dao/redis/builder"
import {RedisTestDataProvider} from "./testdataprovider"
import {project1, invalidProject, delayd1, delayd2, delayd3, invalidDelay} from "../../testdata"
import {KeyFactory} from "../../../../server/dao/redis/utils/keyfactory"
import {NotFoundError} from "../../../../common/errors/notfound"
import {CorruptedError} from "../../../../server/dao/error/corrupted"
import {InternalError} from "../../../../server/dao/error/internal"
import {ExistsError} from "../../../../server/error/exists"

describe("Redis DAO Delay", () => {
    let client: redis.RedisClient
    let dao: RedisDelayDao
    beforeEach(() => {
        return RedisTestDataProvider.dump().then((testClient: redis.RedisClient) => {
            client = testClient
            const builder = new RedisDaoBuilder(client)
            dao = builder.buildDelayDao()
        })
    })
    afterEach(() => {
        client.quit()
    })
    describe("getDelay", () => {
        it("Should get a delay from the DB", () => {
            return dao.getDelay(project1.identifier, delayd1.identifier).then((delay: DelayDefinition) => {
                chai.expect(delay).to.deep.equal(delayd1)
            })
        })
        it("Should get an exception for an invalid project identifier", () => {
            return dao.getDelay(invalidProject.identifier, delayd1.identifier).then(() => {
                throw new Error("getDelay should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        it("Should get an exception for an invalid delay identifier", () => {
            return dao.getDelay(project1.identifier, invalidDelay.identifier).then(() => {
                throw new Error("getDelay should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        it("Should get an exception for a delay with corrupted name", () => {
            const delayKey = KeyFactory.createDelayKey(project1.identifier, delayd1.identifier)
            return RedisTestDataProvider.deleteMember(client, delayKey, "name").then(() => {
                return dao.getDelay(project1.identifier, delayd1.identifier)
            }).then(() => {
                throw new Error("getDelay should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a delay with corrupted description", () => {
            const delayKey = KeyFactory.createDelayKey(project1.identifier, delayd1.identifier)
            return RedisTestDataProvider.deleteMember(client, delayKey, "description").then(() => {
                return dao.getDelay(project1.identifier, delayd1.identifier)
            }).then(() => {
                throw new Error("getDelay should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a delay with corrupted date", () => {
            const delayKey = KeyFactory.createDelayKey(project1.identifier, delayd1.identifier)
            return RedisTestDataProvider.deleteMember(client, delayKey, "date").then(() => {
                return dao.getDelay(project1.identifier, delayd1.identifier)
            }).then(() => {
                throw new Error("getDelay should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a corrupted delay", () => {
            const delayKey = KeyFactory.createDelayKey(project1.identifier, delayd1.identifier)
            return RedisTestDataProvider.setValue(client, delayKey, "test").then(() => {
                return dao.getDelay(project1.identifier, delayd1.identifier)
            }).then(() => {
                throw new Error("getDelay should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
    describe("getProjectDelays", () => {
        it("Should get a list of delays that belongs to a project from the DB", () => {
            return dao.getProjectDelays(project1.identifier).then((delays: Array<DelayDefinition>) => {
                const expected = [delayd1, delayd2]
                chai.expect(delays).to.deep.equal(expected)
            })
        })
        it("Should get an exception for an invalid project identifier", () => {
            return dao.getProjectDelays(invalidProject.identifier).then(() => {
                throw new Error("getProjectDelays should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        it("Should only get delays with body from the DB", () => {
            const delayKey = KeyFactory.createDelayKey(project1.identifier, delayd1.identifier)
            return RedisTestDataProvider.deleteValue(client, delayKey).then(() => {
                return dao.getProjectDelays(project1.identifier)
            }).then((delays: Array<DelayDefinition>) => {
                const expected = [delayd2]
                chai.expect(delays).to.deep.equal(expected)
            })
        })
        it("Should only get delays without corrupted body from the DB", () => {
            const delayKey = KeyFactory.createDelayKey(project1.identifier, delayd1.identifier)
            return RedisTestDataProvider.setValue(client, delayKey, "test").then(() => {
                return dao.getProjectDelays(project1.identifier)
            }).then((delays: Array<DelayDefinition>) => {
                const expected = [delayd2]
                chai.expect(delays).to.deep.equal(expected)
            })
        })
    })
    describe("addDelay", () => {
        it("Should add a delay in the DB", () => {
            return dao.addDelay(project1.identifier, delayd3).then(() => {
                return dao.getDelay(project1.identifier, delayd3.identifier)
            }).then((task: DelayDefinition) => {
                chai.expect(task).to.deep.equal(delayd3)
            })
        })
        it("Should get an exception when adding a delay in the DB for an invalid project", () => {
            return dao.addDelay(invalidProject.identifier, delayd3).then(() => {
                throw new Error("addDelay should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        it("Should get an exception when adding an existing delay in the DB", () => {
            return dao.addDelay(project1.identifier, delayd1).then(() => {
                throw new Error("addDelay should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(ExistsError)
            })
        })
        it("Should get an exception when adding delay", () => {
            const delayIdsKey = KeyFactory.createProjectKey(project1.identifier, "delays")
            return RedisTestDataProvider.setValue(client, delayIdsKey, "test").then(() => {
                return dao.addDelay(project1.identifier, delayd3)
            }).then(() => {
                throw new Error("addDelay should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
})
