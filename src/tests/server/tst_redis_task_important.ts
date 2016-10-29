import * as chai from "chai"
import * as redis from "redis"
import * as bluebird from "bluebird"
import { Project, Task } from "../../common/types"
import { NotFoundError } from "../../common/errors"
import { InternalError } from "../../server/core/data/idataprovider"
import { RedisDataProvider } from "../../server/core/data/redisdataprovider"

const redisAsync: any = bluebird.promisifyAll(redis)

declare module "redis" {
    export interface RedisClient extends NodeJS.EventEmitter {
        setAsync(...args: any[]): Promise<any>
        delAsync(...args: any[]): Promise<any>
    }
}

describe("Redis", () => {
    let client: redis.RedisClient
    let db: RedisDataProvider
    before(() => {
        client = redis.createClient()
        client.select(3)

        db = new RedisDataProvider(client)
    })
    describe("isTaskImportant", () => {
        it("Should add some testing data", (done) => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then(() => {
                const task: Task = {
                    identifier: "task",
                    name: "Task",
                    description: "Description",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 30
                }
                return db.addTask("project", task).then(() => {
                    done()
                })
            }).catch((error) => {
                done(error)
            })
        })
        it("Should check that task is not important", (done) => {
            db.isTaskImportant("project", "task").then((important: boolean) => {
                chai.expect(important).to.false
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should set task as important", (done) => {
            db.setTaskImportant("project", "task", true).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should check that task is important", (done) => {
            db.isTaskImportant("project", "task").then((important: boolean) => {
                chai.expect(important).to.true
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should set task as not important", (done) => {
            db.setTaskImportant("project", "task", false).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should check that task is not important", (done) => {
            db.isTaskImportant("project", "task").then((important: boolean) => {
                chai.expect(important).to.false
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when checking task status on invalid project", (done) => {
            db.isTaskImportant("project2", "task").then((important: boolean) => {
                done(new Error("isTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when checking task status on invalid task", (done) => {
            db.isTaskImportant("project", "task2").then((important: boolean) => {
                done(new Error("isTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("project:project:task:important", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted project", (done) => {
            db.isTaskImportant("project", "task").then((important: boolean) => {
                done(new Error("isTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        after(() => {
            client.flushdb()
        })
    })
    describe("setTaskImportant", () => {
        it("Should add some testing data", (done) => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then(() => {
                const task: Task = {
                    identifier: "task",
                    name: "Task",
                    description: "Description",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 30
                }
                return db.addTask("project", task).then(() => {
                    done()
                })
            }).catch((error) => {
                done(error)
            })
        })
        it("Should set task as important", (done) => {
            db.setTaskImportant("project", "task", true).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should check that task is important", (done) => {
            db.isTaskImportant("project", "task").then((important: boolean) => {
                chai.expect(important).to.true
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should set task as not important", (done) => {
            db.setTaskImportant("project", "task", false).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should check that task is not important", (done) => {
            db.isTaskImportant("project", "task").then((important: boolean) => {
                chai.expect(important).to.false
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should set task as important", (done) => {
            db.setTaskImportant("project", "task", true).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should check that task is important", (done) => {
            db.isTaskImportant("project", "task").then((important: boolean) => {
                chai.expect(important).to.true
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should set task as important", (done) => {
            db.setTaskImportant("project", "task", true).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should check that task is still important", (done) => {
            db.isTaskImportant("project", "task").then((important: boolean) => {
                chai.expect(important).to.true
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when setting task status on invalid project", (done) => {
            db.setTaskImportant("project2", "task", true).then(() => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when setting task status on invalid task", (done) => {
            db.setTaskImportant("project2", "task2", true).then(() => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("project:project:task:important", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task", (done) => {
            db.setTaskImportant("project", "task", true).then(() => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        after(() => {
            client.flushdb()
        })
    })
    after(() => {
        client.quit()
    })
})
