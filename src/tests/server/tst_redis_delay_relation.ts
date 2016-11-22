import * as chai from "chai"
import * as redis from "redis"
import * as bluebird from "bluebird"
import { Project, TaskDefinition, TaskRelation, TaskLocation, Delay, DelayRelation } from "../../common/types"
import { NotFoundError } from "../../common/errors"
import { CorruptedError, InternalError } from "../../server/core/data/idataprovider"
import { RedisDataProvider } from "../../server/core/data/redisdataprovider"

const redisAsync: any = bluebird.promisifyAll(redis)

declare module "redis" {
    export interface RedisClient extends NodeJS.EventEmitter {
        setAsync(...args: any[]): Promise<any>
        delAsync(...args: any[]): Promise<any>
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
    describe("addDelayRelation", () => {
        it("Should add some testing data", (done) => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then(() => {
                const task: TaskDefinition = {
                    identifier: "task",
                    name: "Task",
                    description: "Description",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 30
                }
                const delay: Delay = {
                    identifier: "delay",
                    name: "Delay",
                    description: "Description",
                    date: new Date(2016, 9, 15)
                }

                return db.addTask("project", task).then(() => {
                    return db.addDelay("project", delay)
                }).then(() => {
                    done()
                })
            }).catch((error) => {
                done(error)
            })
        })
        it("Should add delay relation", (done) => {
            db.addDelayRelation("project", {
                task: "task",
                delay: "delay",
                lag: 0
            }).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid project", (done) => {
            db.addDelayRelation("project2", {
                task: "task",
                delay: "delay",
                lag: 0
            }).then(() => {
                done(new Error("addDelayRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid task", (done) => {
            db.addDelayRelation("project2", {
                task: "task2",
                delay: "delay",
                lag: 0
            }).then(() => {
                done(new Error("addDelayRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid delay", (done) => {
            db.addDelayRelation("project", {
                task: "task",
                delay: "delay2",
                lag: 0
            }).then(() => {
                done(new Error("addDelayRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("delay:project:delay:relations", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted delay", (done) => {
            db.addDelayRelation("project", {
                task: "task",
                delay: "delay",
                lag: 0
            }).then(() => {
                done(new Error("addDelayRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should revert delay properties corruption", (done) => {
            client.delAsync("delay:project:delay:relations").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should add delay relation", (done) => {
            db.addDelayRelation("project", {
                task: "task",
                delay: "delay",
                lag: 0
            }).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        after(() => {
            client.flushdb()
        })
    })
    describe("getDelayRelations", () => {
        it("Should add some testing data", (done) => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then(() => {
                const task1: TaskDefinition = {
                    identifier: "task1",
                    name: "Task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 30
                }
                const task2: TaskDefinition = {
                    identifier: "task2",
                    name: "Task 2",
                    description: "Description 2",
                    estimatedStartDate: new Date(2016, 9, 15),
                    estimatedDuration: 15
                }
                const delay: Delay = {
                    identifier: "delay",
                    name: "Delay",
                    description: "Description",
                    date: new Date(2016, 10, 1)
                }

                return db.addTask("project", task1).then(() => {
                    return db.addTask("project", task2)
                }).then(() => {
                    return db.addDelay("project", delay)
                }).then(() => {
                    return db.addDelayRelation("project", {
                        task: "task1",
                        delay: "delay",
                        lag: 13
                    })
                }).then(() => {
                    return db.addDelayRelation("project", {
                        task: "task2",
                        delay: "delay",
                        lag: 23
                    })
                }).then(() => {
                    done()
                })
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get delay relations", (done) => {
            db.getDelayRelations("project", "delay").then((delayRelations: Array<DelayRelation>) => {
                const expected: Array<DelayRelation> = [
                    {
                        delay: "delay",
                        task: "task1",
                        lag: 13
                    },
                    {
                        delay: "delay",
                        task: "task2",
                        lag: 23
                    }
                ]
                chai.expect(delayRelations).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid project", (done) => {
            db.getDelayRelations("project2", "delay").then(() => {
                done(new Error("getDelayRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid delay", (done) => {
            db.getDelayRelations("project", "delay2").then(() => {
                done(new Error("getDelayRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should remove delay relation lag", (done) => {
            client.hsetAsync("delay:project:delay:relation:task2", "test", "test").then((result: number) => {
                return client.hdelAsync("delay:project:delay:relation:task2", "lag")
            }).then((result: number) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted delay relations", (done) => {
            db.getDelayRelations("project", "delay").then(() => {
                done(new Error("getDelayRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should revert relation properties corruption", (done) => {
            client.hdelAsync("delay:project:delay:relation:task2", "test").then((result: number) => {
                return client.hsetAsync("delay:project:delay:relation:task2", "lag", 23)
            }).then((result: number) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get delay relations", (done) => {
            db.getDelayRelations("project", "delay").then((delayRelations: Array<DelayRelation>) => {
                const expected: Array<DelayRelation> = [
                    {
                        delay: "delay",
                        task: "task1",
                        lag: 13
                    },
                    {
                        delay: "delay",
                        task: "task2",
                        lag: 23
                    }
                ]
                chai.expect(delayRelations).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should delete delay relation", (done) => {
            client.delAsync("delay:project:delay:relation:task1").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted delay", (done) => {
            db.getDelayRelations("project", "delay").then(() => {
                done(new Error("getDelayRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should restore delay relation", (done) => {
            db.addDelayRelation("project", {
                delay: "delay",
                task: "task1",
                lag: 13
            }).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get delay relations", (done) => {
            db.getDelayRelations("project", "delay").then((delayRelations: Array<DelayRelation>) => {
                const expected: Array<DelayRelation> = [
                    {
                        delay: "delay",
                        task: "task1",
                        lag: 13
                    },
                    {
                        delay: "delay",
                        task: "task2",
                        lag: 23
                    }
                ]
                chai.expect(delayRelations).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should corrupt delay properties", (done) => {
            client.setAsync("delay:project:delay:relations", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted delay", (done) => {
            db.getDelayRelations("project", "delay").then(() => {
                done(new Error("getDelayRelations should not be a success"))
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
