import * as chai from "chai"
import * as redis from "redis"
import * as bluebird from "bluebird"
import { Project, Task, TaskRelation, TaskLocation } from "../../common/types"
import { NotFoundError, ExistsError } from "../../common/errors"
import { CorruptedError } from "../../server/core/data/idataprovider"
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
    describe("getTasks", () => {
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
        it("Should get an empty list", (done) => {
            db.getTasks("project", []).then((tasks: Array<Task>) => {
                chai.expect(tasks).to.empty
                done()
            })
        })
        it("Should get tasks", (done) => {
            db.getTasks("project", ["task2", "task1"]).then((tasks: Array<Task>) => {
                const expected: Array<Task> = [
                    {
                        identifier: "task2",
                        name: "Task 2",
                        description: "Description 2",
                        estimatedStartDate: new Date(2016, 9, 15),
                        estimatedDuration: 15
                    },
                    {
                        identifier: "task1",
                        name: "Task 1",
                        description: "Description 1",
                        estimatedStartDate: new Date(2016, 9, 1),
                        estimatedDuration: 30
                    }
                ]
                chai.expect(tasks).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should remove task", (done) => {
            client.delAsync("task:project:task1").then((result) => {
                done()
            })
        })
        it("Should get valid tasks", (done) => {
            db.getTasks("project", ["task2", "task1"]).then((tasks: Array<Task>) => {
                const expected: Array<Task | null> = [
                    {
                        identifier: "task2",
                        name: "Task 2",
                        description: "Description 2",
                        estimatedStartDate: new Date(2016, 9, 15),
                        estimatedDuration: 15
                    },
                    null
                ]
                chai.expect(tasks).to.deep.equal(expected)
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
        it("Should get valid tasks", (done) => {
            db.getTasks("project", ["task2", "task1"]).then((tasks: Array<Task>) => {
                const expected: Array<Task | null> = [
                    {
                        identifier: "task2",
                        name: "Task 2",
                        description: "Description 2",
                        estimatedStartDate: new Date(2016, 9, 15),
                        estimatedDuration: 15
                    },
                    null
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
    describe("getTasks", () => {
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
        it("Should get an exception on invalid task", (done) => {
            db.getTask("project", "task3").then((task: Task) => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
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
            db.getTask("project", "task1").then((task: Task) => {
                done(new Error("getTask should not be a success"))
                done()
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            })
        })
        it("Should remove task description", (done) => {
            client.hsetAsync("task:project:task1", "name", "Task 1").then((result: number) => {
                return client.hdelAsync("task:project:task1", "description")
            }).then((result: number) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task", (done) => {
            db.getTask("project", "task1").then((task: Task) => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            })
        })
        it("Should remove task estimatedStartDate", (done) => {
            client.hsetAsync("task:project:task1", "description", "Description 1").then((result: number) => {
                return client.delAsync("task:project:task1:estimatedStartDate")
            }).then((result: number) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task", (done) => {
            db.getTask("project", "task1").then((task: Task) => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            })
        })
        it("Should remove task estimatedDuration", (done) => {
            client.setAsync("task:project:task1:estimatedStartDate", "0").then((result: number) => {
                return client.delAsync("task:project:task1:estimatedDuration")
            }).then((result: number) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task", (done) => {
            db.getTask("project", "task1").then((task: Task) => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
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
            db.getTask("project", "task3").then((task: Task) => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.not.null
                done()
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
            })
        })
        after(() => {
            client.flushdb()
        })
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
                nextLocation: TaskLocation.Beginning,
                lag: 0
            }).then(() => {
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
                nextLocation: TaskLocation.Beginning,
                lag: 0
            }).then(() => {
                done(new Error("addTaskRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            })
        })
        it("Should get an exception on invalid child task", (done) => {
            db.addTaskRelation("project", {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task3",
                nextLocation: TaskLocation.Beginning,
                lag: 0
            }).then(() => {
                done(new Error("addTaskRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
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
                nextLocation: TaskLocation.Beginning,
                lag: 0
            }).then(() => {
                done(new Error("addTaskRelation should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.not.null
                done()
            })
        })
        it("Should revert task properties corruption", (done) => {
            client.delAsync("task:project:task1:relations").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should set task relation", (done) => {
            db.addTaskRelation("project", {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                nextLocation: TaskLocation.Beginning,
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
                        nextLocation: TaskLocation.Beginning,
                        lag: 12
                    })
                }).then(() => {
                    return db.addTaskRelation("project", {
                        previous: "task1",
                        previousLocation: TaskLocation.Beginning,
                        next: "task3",
                        nextLocation: TaskLocation.End,
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
                        nextLocation: TaskLocation.Beginning,
                        lag: 12
                    },
                    {
                        previous: "task1",
                        previousLocation: TaskLocation.Beginning,
                        next: "task3",
                        nextLocation: TaskLocation.End,
                        lag: 23
                    }
                ]
                chai.expect(taskRelations).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid task", (done) => {
            db.getTaskRelations("project", "task4").then((taskRelations: Array<TaskRelation>) => {
                done(new Error("getTaskRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
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
            db.getTaskRelations("project", "task1").then((taskRelations: Array<TaskRelation>) => {
                done(new Error("getTaskRelations should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.not.null
                done()
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
