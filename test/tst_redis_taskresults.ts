import * as chai from "chai"
import * as redis from "redis"
import * as bluebird from "bluebird"
import { Project, Task, Impact, TaskResults } from "../core/types"
import { TaskNotFoundError, InvalidInputError, TransactionError } from "../core/data/idataprovider"
import { RedisDataProvider } from "../core/data/redisdataprovider"

const redisAsync: any = bluebird.promisifyAll(redis)

declare module 'redis' {
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
                    projectIdentifier: "project",
                    name: "Task",
                    description: "Description",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 30
                }
                
                return db.addTask(task).then(() => {
                    let taskResults: Array<TaskResults> = [
                        {taskIdentifier: "task", startDate: new Date(2016, 9, 15), duration: 40}
                    ]
                    return db.setTasksResults(taskResults)
                }).then(() => {
                    done()
                })
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get task results", (done) => {
            db.getTaskResults("task").then((result: TaskResults) => {
                chai.expect(result.taskIdentifier).to.equals("task")
                chai.expect(result.startDate.getTime()).to.equals(new Date(2016, 9, 15).getTime())
                chai.expect(result.duration).to.equals(40)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid task", (done) => {
            db.getTaskResults("task2").then((result: TaskResults) => {
                done(new Error("getTaskResults should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(TaskNotFoundError)
                done()
            })
        })
        it("Should corrupt task results properties", (done) => {
            client.delAsync("task:task:startDate").then((result) => {
                return client.hmsetAsync("task:task:startDate", {"test": "test"})
            }).then((result) => {
                return client.delAsync("task:task:duration")
            }).then((result) => {
                return client.hmsetAsync("task:task:duration", {"test": "test"})
            }).then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get task results", (done) => {
            db.getTaskResults("task").then((result: TaskResults) => {
                chai.expect(result.taskIdentifier).to.equals("task")
                chai.expect(result.startDate).to.null
                chai.expect(result.duration).to.null
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should delete task results properties", (done) => {
            client.delAsync("task:1:startDate").then((result) => {
                return client.hmsetAsync("task:task:startDate", {"test": "test"})
            }).then((result) => {
                return client.delAsync("task:task:duration")
            }).then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get task results", (done) => {
            db.getTaskResults("task").then((result: TaskResults) => {
                chai.expect(result.taskIdentifier).to.equals("task")
                chai.expect(result.startDate).to.null
                chai.expect(result.duration).to.null
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        after(() => {
            client.flushdb()
        })
    })
    describe("setTasksResults", () => {
        it("Should add some testing data", (done) => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then(() => {
                const task1: Task = {
                    identifier: "task1",
                    projectIdentifier: "project",
                    name: "Task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 30
                }
                const task2: Task = {
                    identifier: "task2",
                    projectIdentifier: "project",
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
            let taskResults: Array<TaskResults> = [
                {taskIdentifier: "task2", startDate: new Date(2016, 10, 2), duration: 61},
                {taskIdentifier: "task1", startDate: new Date(2016, 9, 16), duration: 45}
            ]
            db.setTasksResults(taskResults).then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get task results", (done) => {
            db.getTaskResults("task1").then((result: TaskResults) => {
                chai.expect(result.taskIdentifier).to.equals("task1")
                chai.expect(result.startDate.getTime()).to.equals(new Date(2016, 9, 16).getTime())
                chai.expect(result.duration).to.equals(45)
            }).then(() => {
                return db.getTaskResults("task2")
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
            let taskResults: Array<TaskResults> = [
                {taskIdentifier: "task2", startDate: new Date(2016, 10, 1), duration: 60},
                {taskIdentifier: "task3", startDate: new Date(2016, 9, 15), duration: 40}
            ]
            db.setTasksResults(taskResults).then(() => {
                done(new Error("setTasksResults should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(TaskNotFoundError)
                done()
            })
        })
        it("Should get an exception on transactional error (caused by adding impacts)", (done) => {
            let otherClient = redis.createClient()
            otherClient.select(3)
            let otherDb = new RedisDataProvider(otherClient)

            db.watchTasksImpacts(["task1"]).then(() => {
                let impact: Impact = {
                    id: null,
                    name: "Transactional impact",
                    description: "Transactional impact description",
                    duration: 10
                }
                return otherDb.addImpact(impact)
            }).then((id: number) => {
                return otherDb.setImpactForTask(id, "task1")
            }).then(() => {
                let taskResults: Array<TaskResults> = [
                    {taskIdentifier: "task1", startDate: new Date(2016, 9, 16), duration: 45},
                    {taskIdentifier: "task2", startDate: new Date(2016, 10, 2), duration: 61}
                ]
                return db.setTasksResults(taskResults)
            }).then(() => {
                done(new Error("setTasksResults should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(TransactionError)
                done()
            })
        })
        xit("Should get an exception on transactional error (caused by updating impacts)", (done) => {
            
        })
        it("Should get an exception on transactional error (caused by modifying node)", (done) => {
            let otherClient = redis.createClient()
            otherClient.select(3)
            let otherDb = new RedisDataProvider(otherClient)

            db.watchTasksImpacts(["task1"]).then(() => {
                const impact: Impact = {
                    id: null,
                    name: "Transactional impact",
                    description: "Transactional impact description",
                    duration: 10
                }
                return otherDb.addImpact(impact)
            }).then((id: number) => {
                return otherDb.setImpactForTask(id, "task1")
            }).then(() => {
                let taskResults: Array<TaskResults> = [
                    {taskIdentifier: "task1", startDate: new Date(2016, 9, 16), duration: 45},
                    {taskIdentifier: "task2", startDate: new Date(2016, 10, 2), duration: 61}
                ]
                return db.setTasksResults(taskResults)
            }).then(() => {
                done(new Error("setTasksResults should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(TransactionError)
                done()
            })
        })
        after(() => {
            client.flushdb()
        })
    })
})