import * as chai from "chai"
import * as redis from "redis"
import * as bluebird from "bluebird"
import { Project, Task, Modifier, TaskResults } from "../../common/types"
import { CorruptedError, TaskNotFoundError } from "../../server/core/data/idataprovider"
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
                    projectIdentifier: "project",
                    identifier: "task",
                    name: "Task",
                    description: "Description",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 30
                }

                return db.addTask(task).then(() => {
                    let taskResults: TaskResults = {
                        projectIdentifier: "project",
                        taskIdentifier: "task",
                        startDate: new Date(2016, 9, 15),
                        duration: 40
                    }
                    return db.setTaskResults(taskResults)
                }).then(() => {
                    done()
                })
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get task results", (done) => {
            db.getTaskResults("project", "task").then((result: TaskResults) => {
                chai.expect(result.taskIdentifier).to.equals("task")
                chai.expect(result.startDate.getTime()).to.equals(new Date(2016, 9, 15).getTime())
                chai.expect(result.duration).to.equals(40)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid task", (done) => {
            db.getTaskResults("project", "task2").then((result: TaskResults) => {
                done(new Error("getTaskResults should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(TaskNotFoundError)
                done()
            })
        })
        it("Should corrupt task results properties", (done) => {
            client.delAsync("task:project:task:startDate").then((result) => {
                return client.hmsetAsync("task:project:task:startDate", {"test": "test"})
            }).then((result) => {
                return client.delAsync("task:project:task:duration")
            }).then((result) => {
                return client.hmsetAsync("task:project:task:duration", {"test": "test"})
            }).then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task results", (done) => {
            db.getTaskResults("project", "task").then((result: TaskResults) => {
                done(new Error("getTaskResults should not be a success"))
                done()
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            })
        })
        it("Should delete task results properties", (done) => {
            client.delAsync("task:project:task:startDate").then((result) => {
                return client.hmsetAsync("task:project:task:startDate", {"test": "test"})
            }).then((result) => {
                return client.delAsync("task:project:task:duration")
            }).then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task results", (done) => {
            db.getTaskResults("project", "task").then((result: TaskResults) => {
                done(new Error("getTaskResults should not be a success"))
                done()
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
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
                    projectIdentifier: "project",
                    identifier: "task1",
                    name: "Task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 30
                }
                const task2: Task = {
                    projectIdentifier: "project",
                    identifier: "task2",
                    name: "Task 2",
                    description: "Description 2",
                    estimatedStartDate: new Date(2016, 9, 15),
                    estimatedDuration: 15
                }

                return db.addTask(task1).then(() => {
                    return db.addTask(task2)
                }).then(() => {
                    done()
                })
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should set task results", (done) => {
            const taskResults1: TaskResults = {
                projectIdentifier: "project",
                taskIdentifier: "task2",
                startDate: new Date(2016, 10, 2),
                duration: 61
            }
            const taskResults2: TaskResults = {
                projectIdentifier: "project",
                taskIdentifier: "task1",
                startDate: new Date(2016, 9, 16),
                duration: 45
            }
            db.setTaskResults(taskResults1).then(() => {
                return db.setTaskResults(taskResults2).then(() => {
                    done()
                })
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get task results", (done) => {
            db.getTaskResults("project", "task1").then((result: TaskResults) => {
                chai.expect(result.taskIdentifier).to.equals("task1")
                chai.expect(result.startDate.getTime()).to.equals(new Date(2016, 9, 16).getTime())
                chai.expect(result.duration).to.equals(45)
            }).then(() => {
                return db.getTaskResults("project", "task2")
            }).then((result: TaskResults) => {
                chai.expect(result.taskIdentifier).to.equals("task2")
                chai.expect(result.startDate.getTime()).to.equals(new Date(2016, 10, 2).getTime())
                chai.expect(result.duration).to.equals(61)
            }).then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid task", (done) => {
            let taskResults: TaskResults = {
                projectIdentifier: "project",
                taskIdentifier: "task3",
                startDate: new Date(2016, 9, 15),
                duration: 40
            }
            db.setTaskResults(taskResults).then(() => {
                done(new Error("setTaskResults should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(TaskNotFoundError)
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
