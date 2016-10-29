import * as chai from "chai"
import * as redis from "redis"
import * as bluebird from "bluebird"
import { Project, Task } from "../../common/types"
import { NotFoundError, ExistsError } from "../../common/errors"
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
    describe("getProjectTasks", () => {
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
                }).then(() => {
                    return db.addTask("project", task2)
                }).then(() => {
                    done()
                })
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get project tasks", (done) => {
            db.getProjectTasks("project").then((tasks: Array<Task>) => {
                const expected: Array<Task> = [
                    {
                        identifier: "task1",
                        name: "Task 1",
                        description: "Description 1",
                        estimatedStartDate: new Date(2016, 9, 1),
                        estimatedDuration: 30
                    },
                    {
                        identifier: "task2",
                        name: "Task 2",
                        description: "Description 2",
                        estimatedStartDate: new Date(2016, 9, 15),
                        estimatedDuration: 15
                    }
                ]
                chai.expect(tasks).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid project", (done) => {
            db.getProjectTasks("project2").then(() => {
                done(new Error("getProjectTasks should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("task:project:task1", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get non corrupted project tasks", (done) => {
            db.getProjectTasks("project").then((tasks: Array<Task>) => {
                const expected: Array<Task> = [
                    {
                        identifier: "task2",
                        name: "Task 2",
                        description: "Description 2",
                        estimatedStartDate: new Date(2016, 9, 15),
                        estimatedDuration: 15
                    }
                ]
                chai.expect(tasks).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        after(() => {
            client.flushdb()
        })
    })
    describe("getTask", () => {
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
                }).then(() => {
                    return db.addTask("project", task2)
                }).then(() => {
                    done()
                })
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get task", (done) => {
            db.getTask("project", "task1").then((task: Task) => {
                const expected: Task = {
                    identifier: "task1",
                    name: "Task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 30
                }
                chai.expect(task).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid project", (done) => {
            db.getTask("project2", "task1").then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid task", (done) => {
            db.getTask("project", "task3").then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should remove task name", (done) => {
            client.hdelAsync("task:project:task1", "name").then((result: number) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task", (done) => {
            db.getTask("project", "task1").then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should remove task description", (done) => {
            client.hsetAsync("task:project:task1", "name", "Task 1").then((result) => {
                return client.hdelAsync("task:project:task1", "description")
            }).then((result: number) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task", (done) => {
            db.getTask("project", "task1").then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should remove task estimatedStartDate", (done) => {
            client.hsetAsync("task:project:task1", "description", "Description 1").then((result) => {
                return client.delAsync("task:project:task1:estimatedStartDate")
            }).then((result: number) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task", (done) => {
            db.getTask("project", "task1").then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should remove task estimatedDuration", (done) => {
            client.setAsync("task:project:task1:estimatedStartDate", +((new Date(2016, 9, 1).getTime())))
                  .then((result: number) => {
                return client.delAsync("task:project:task1:estimatedDuration")
            }).then((result: number) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task", (done) => {
            db.getTask("project", "task1").then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should revert task properties corruption", (done) => {
            client.setAsync("task:project:task1:estimatedDuration", "30").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get task", (done) => {
            db.getTask("project", "task1").then((task: Task) => {
                const expected: Task = {
                    identifier: "task1",
                    name: "Task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 30
                }
                chai.expect(task).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("task:project:task3", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task", (done) => {
            db.getTask("project", "task3").then(() => {
                done(new Error("getTask should not be a success"))
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
    describe("addTask", () => {
        it("Should add some testing data", (done) => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should add task", (done) => {
            const task1: Task = {
                identifier: "task1",
                name: "Task 1",
                description: "Description 1",
                estimatedStartDate: new Date(2016, 9, 1),
                estimatedDuration: 30
            }

            db.addTask("project", task1).then(() => {
               done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding task on invalid project", (done) => {
            const task2: Task = {
                identifier: "task2",
                name: "Task 2",
                description: "Description 2",
                estimatedStartDate: new Date(2016, 9, 1),
                estimatedDuration: 30
            }

            db.addTask("project2", task2).then(() => {
                done(new Error("addTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding an existing task", (done) => {
            const task1_2: Task = {
                identifier: "task1",
                name: "Task 2",
                description: "Description 2",
                estimatedStartDate: new Date(2016, 9, 1),
                estimatedDuration: 30
            }

            db.addTask("project", task1_2).then(() => {
                done(new Error("addTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(ExistsError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("project:project:tasks", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding task", (done) => {
            const task2: Task = {
                identifier: "task2",
                name: "Task 2",
                description: "Description 2",
                estimatedStartDate: new Date(2016, 9, 1),
                estimatedDuration: 30
            }

            db.addTask("project", task2).then(() => {
                done(new Error("addTask should not be a success"))
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
