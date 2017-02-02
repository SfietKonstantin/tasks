import * as chai from "chai"
import * as redis from "redis"
import {DelayDefinition} from "../../../../common/delay"
import {RedisDelayDao} from "../../../../server/dao/redis/delay"
import {RedisDaoBuilder} from "../../../../server/dao/redis/builder";
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
    beforeEach((done) => {
        RedisTestDataProvider.dump().then((testClient: redis.RedisClient) => {
            client = testClient
            const builder = new RedisDaoBuilder(client)
            dao = builder.buildDelayDao()
            done()
        })
    })
    afterEach(() => {
        client.quit()
    })
    describe("getDelay", () => {
        it("Should get a delay from the DB", (done) => {
            dao.getDelay(project1.identifier, delayd1.identifier).then((delay: DelayDefinition) => {
                chai.expect(delay).to.deep.equal(delayd1)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid project identifier", (done) => {
            dao.getDelay(invalidProject.identifier, delayd1.identifier).then(() => {
                done(new Error("getDelay should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid delay identifier", (done) => {
            dao.getDelay(project1.identifier, invalidDelay.identifier).then(() => {
                done(new Error("getDelay should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a delay with corrupted name", (done) => {
            const delayKey = KeyFactory.createDelayKey(project1.identifier, delayd1.identifier)
            RedisTestDataProvider.deleteMember(client, delayKey, "name").then(() => {
                return dao.getDelay(project1.identifier, delayd1.identifier)
            }).then(() => {
                done(new Error("getDelay should not be a success"))
                done()
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a delay with corrupted description", (done) => {
            const delayKey = KeyFactory.createDelayKey(project1.identifier, delayd1.identifier)
            RedisTestDataProvider.deleteMember(client, delayKey, "description").then(() => {
                return dao.getDelay(project1.identifier, delayd1.identifier)
            }).then(() => {
                done(new Error("getDelay should not be a success"))
                done()
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a delay with corrupted date", (done) => {
            const delayKey = KeyFactory.createDelayKey(project1.identifier, delayd1.identifier)
            RedisTestDataProvider.deleteMember(client, delayKey, "date").then(() => {
                return dao.getDelay(project1.identifier, delayd1.identifier)
            }).then(() => {
                done(new Error("getDelay should not be a success"))
                done()
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a corrupted delay", (done) => {
            const delayKey = KeyFactory.createDelayKey(project1.identifier, delayd1.identifier)
            RedisTestDataProvider.setValue(client, delayKey, "test").then(() => {
                return dao.getDelay(project1.identifier, delayd1.identifier)
            }).then(() => {
                done(new Error("getDelay should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
    describe("getProjectDelays", () => {
        it("Should get a list of delays that belongs to a project from the DB", (done) => {
            dao.getProjectDelays(project1.identifier).then((delays: Array<DelayDefinition>) => {
                const expected = [delayd1, delayd2]
                chai.expect(delays).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid project identifier", (done) => {
            dao.getProjectDelays(invalidProject.identifier).then(() => {
                done(new Error("getProjectDelays should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should only get delays with body from the DB", (done) => {
            const delayKey = KeyFactory.createDelayKey(project1.identifier, delayd1.identifier)
            RedisTestDataProvider.deleteValue(client, delayKey).then(() => {
                return dao.getProjectDelays(project1.identifier)
            }).then((delays: Array<DelayDefinition>) => {
                const expected = [delayd2]
                chai.expect(delays).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should only get delays without corrupted body from the DB", (done) => {
            const delayKey = KeyFactory.createDelayKey(project1.identifier, delayd1.identifier)
            RedisTestDataProvider.setValue(client, delayKey, "test").then(() => {
                return dao.getProjectDelays(project1.identifier)
            }).then((delays: Array<DelayDefinition>) => {
                const expected = [delayd2]
                chai.expect(delays).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
    describe("addDelay", () => {
        it("Should add a delay in the DB", (done) => {
            dao.addDelay(project1.identifier, delayd3).then(() => {
                return dao.getDelay(project1.identifier, delayd3.identifier)
            }).then((task: DelayDefinition) => {
                chai.expect(task).to.deep.equal(delayd3)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding a delay in the DB for an invalid project", (done) => {
            dao.addDelay(invalidProject.identifier, delayd3).then(() => {
                done(new Error("addDelay should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding an existing delay in the DB", (done) => {
            dao.addDelay(project1.identifier, delayd1).then(() => {
                done(new Error("addDelay should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(ExistsError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding delay", (done) => {
            const delayIdsKey = KeyFactory.createProjectKey(project1.identifier, "delays")
            RedisTestDataProvider.setValue(client, delayIdsKey, "test").then(() => {
                return dao.addDelay(project1.identifier, delayd3)
            }).then(() => {
                done(new Error("addDelay should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
