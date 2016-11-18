import * as chai from "chai"
import * as redis from "redis"
import * as bluebird from "bluebird"
import { Project, Task, TaskRelation, TaskLocation } from "../../common/types"
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
    describe("addTaskRelation", () => {
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
        it("Should add task relation", (done) => {
            db.addTaskRelation("project", {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                lag: 0
            }).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid project", (done) => {
            db.addTaskRelation("project2", {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                lag: 0
            }).then(() => {
                done(new Error("addTaskRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid parent task", (done) => {
            db.addTaskRelation("project", {
                previous: "task3",
                previousLocation: TaskLocation.End,
                next: "task2",
                lag: 0
            }).then(() => {
                done(new Error("addTaskRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid child task", (done) => {
            db.addTaskRelation("project", {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task3",
                lag: 0
            }).then(() => {
                done(new Error("addTaskRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("task:project:task1:relations", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted parent task", (done) => {
            db.addTaskRelation("project", {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                lag: 0
            }).then(() => {
                done(new Error("addTaskRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should revert task properties corruption", (done) => {
            client.delAsync("task:project:task1:relations").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should add task relation", (done) => {
            db.addTaskRelation("project", {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
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
    describe("getTaskRelations", () => {
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
                const task3: Task = {
                    identifier: "task3",
                    name: "Task 3",
                    description: "Description 3",
                    estimatedStartDate: new Date(2016, 10, 1),
                    estimatedDuration: 10
                }

                return db.addTask("project", task1).then(() => {
                    return db.addTask("project", task2)
                }).then(() => {
                    return db.addTask("project", task3)
                }).then(() => {
                    return db.addTaskRelation("project", {
                        previous: "task1",
                        previousLocation: TaskLocation.End,
                        next: "task2",
                        lag: 12
                    })
                }).then(() => {
                    return db.addTaskRelation("project", {
                        previous: "task1",
                        previousLocation: TaskLocation.Beginning,
                        next: "task3",
                        lag: 23
                    })
                }).then(() => {
                    done()
                })
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get task relations", (done) => {
            db.getTaskRelations("project", "task1").then((taskRelations: Array<TaskRelation>) => {
                const expected: Array<TaskRelation> = [
                    {
                        previous: "task1",
                        previousLocation: TaskLocation.End,
                        next: "task2",
                        lag: 12
                    },
                    {
                        previous: "task1",
                        previousLocation: TaskLocation.Beginning,
                        next: "task3",
                        lag: 23
                    }
                ]
                chai.expect(taskRelations).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid project", (done) => {
            db.getTaskRelations("project2", "task1").then(() => {
                done(new Error("getTaskRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid task", (done) => {
            db.getTaskRelations("project", "task4").then(() => {
                done(new Error("getTaskRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should remove task relation previousLocation", (done) => {
            client.hdelAsync("task:project:task1:relation:task2", "previousLocation").then((result: number) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task relations", (done) => {
            db.getTaskRelations("project", "task1").then(() => {
                done(new Error("getTaskRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should remove task relation lag", (done) => {
            client.hsetAsync("task:project:task1:relation:task2", "previousLocation", "End").then((result) => {
                return client.hdelAsync("task:project:task1:relation:task2", "lag")
            }).then((result: number) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task relations", (done) => {
            db.getTaskRelations("project", "task1").then(() => {
                done(new Error("getTaskRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should set an invalid task relation previousLocation", (done) => {
            client.hsetAsync("task:project:task1:relation:task2", "lag", "12").then((result) => {
                return client.hsetAsync("task:project:task1:relation:task2", "previousLocation", "")
            }).then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task relations", (done) => {
            db.getTaskRelations("project", "task1").then(() => {
                done(new Error("getTaskRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should revert relation properties corruption", (done) => {
            client.hsetAsync("task:project:task1:relation:task2", "previousLocation", "End").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get task relations", (done) => {
            db.getTaskRelations("project", "task1").then((taskRelations: Array<TaskRelation>) => {
                const expected: Array<TaskRelation> = [
                    {
                        previous: "task1",
                        previousLocation: TaskLocation.End,
                        next: "task2",
                        lag: 12
                    },
                    {
                        previous: "task1",
                        previousLocation: TaskLocation.Beginning,
                        next: "task3",
                        lag: 23
                    }
                ]
                chai.expect(taskRelations).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should delete task relation", (done) => {
            client.delAsync("task:project:task1:relation:task2").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task", (done) => {
            db.getTaskRelations("project", "task1").then(() => {
                done(new Error("getTaskRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should restore task relation", (done) => {
            db.addTaskRelation("project", {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                lag: 12
            }).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get task relations", (done) => {
            db.getTaskRelations("project", "task1").then((taskRelations: Array<TaskRelation>) => {
                const expected: Array<TaskRelation> = [
                    {
                        previous: "task1",
                        previousLocation: TaskLocation.End,
                        next: "task2",
                        lag: 12
                    },
                    {
                        previous: "task1",
                        previousLocation: TaskLocation.Beginning,
                        next: "task3",
                        lag: 23
                    }
                ]
                chai.expect(taskRelations).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("task:project:task1:relations", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task", (done) => {
            db.getTaskRelations("project", "task1").then(() => {
                done(new Error("getTaskRelations should not be a success"))
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
