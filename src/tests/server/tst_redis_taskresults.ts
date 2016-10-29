import * as chai from "chai"
import * as redis from "redis"
import * as bluebird from "bluebird"
import { Project, Task, Modifier, TaskResults } from "../../common/types"
import { NotFoundError } from "../../common/errors"
import { CorruptedError } from "../../server/core/data/idataprovider"
import { RedisDataProvider } from "../../server/core/data/redisdataprovider"

const redisAsync: any = bluebird.promisifyAll(redis)

declare module "redis" {
    export interface RedisClient extends NodeJS.EventEmitter {
        setAsync(...args: any[]): Promise<any>
        delAsync(...args: any[]): Promise<any>
        hmsetAsync(...args: any[]): Promise<any>
        hdelAsync(...args: any[]): Promise<any>
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
    describe("getTaskResults", () => {
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
                    const taskResults: TaskResults = {
                        startDate: new Date(2016, 9, 15),
                        duration: 40
                    }
                    return db.setTaskResults("project", "task", taskResults)
                }).then(() => {
                    done()
                })
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get task results", (done) => {
            db.getTaskResults("project", "task").then((result: TaskResults) => {
                const expected: TaskResults = {
                    startDate: new Date(2016, 9, 15),
                    duration: 40
                }
                chai.expect(result).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid task", (done) => {
            db.getTaskResults("project", "task2").then(() => {
                done(new Error("getTaskResults should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should remove task results startDate", (done) => {
            client.delAsync("task:project:task:startDate").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task results", (done) => {
            db.getTaskResults("project", "task").then(() => {
                done(new Error("getTaskResults should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should remove task results duration", (done) => {
            client.setAsync("task:project:task:startDate", +((new Date(2016, 9, 15)).getTime())).then((result) => {
                return client.delAsync("task:project:task:duration")
            }).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task results", (done) => {
            db.getTaskResults("project", "task").then(() => {
                done(new Error("getTaskResults should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should revert task results properties corruption", (done) => {
            client.setAsync("task:project:task:duration", 40).then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get task results", (done) => {
            db.getTaskResults("project", "task").then((result: TaskResults) => {
                const expected: TaskResults = {
                    startDate: new Date(2016, 9, 15),
                    duration: 40
                }
                chai.expect(result).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        after(() => {
            client.flushdb()
        })
    })
    describe("setTaskResults", () => {
        it("Should add some testing data", (done) => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then(() => {
                const task1: Task = {
                    identifier: "task1",
                    name: "Task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 30
                }
                const task2: Task = {
                    identifier: "task2",
                    name: "Task 2",
                    description: "Description 2",
                    estimatedStartDate: new Date(2016, 9, 15),
                    estimatedDuration: 15
                }

                return db.addTask("project", task1).then(() => {
                    return db.addTask("project", task2)
                }).then(() => {
                    done()
                })
            }).catch((error) => {
                done(error)
            })
        })
        it("Should set task results", (done) => {
            const taskResults1: TaskResults = {
                startDate: new Date(2016, 10, 2),
                duration: 61
            }
            const taskResults2: TaskResults = {
                startDate: new Date(2016, 9, 16),
                duration: 45
            }
            db.setTaskResults("project", "task2", taskResults1).then(() => {
                return db.setTaskResults("project", "task1", taskResults2).then(() => {
                    done()
                })
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get task results", (done) => {
            db.getTaskResults("project", "task1").then((result: TaskResults) => {
                const expected: TaskResults = {
                    startDate: new Date(2016, 9, 16),
                    duration: 45
                }
                chai.expect(result).to.deep.equal(expected)
            }).then(() => {
                return db.getTaskResults("project", "task2")
            }).then((result: TaskResults) => {
                const expected: TaskResults = {
                    startDate: new Date(2016, 10, 2),
                    duration: 61
                }
                chai.expect(result).to.deep.equal(expected)
            }).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid task", (done) => {
            const taskResults: TaskResults = {
                startDate: new Date(2016, 9, 15),
                duration: 40
            }
            db.setTaskResults("project", "task3", taskResults).then(() => {
                done(new Error("setTaskResults should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
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
