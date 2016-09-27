import * as chai from "chai"
import * as redis from "redis"
import * as bluebird from "bluebird"
import { Project, Task, Impact, TaskResults } from "../core/types"
import { TaskNotFoundError, InvalidInputError, TransactionError } from "../core/data/idataprovider"
import { RedisDataProvider } from "../core/data/redisdataprovider"

const redisAsync: any = bluebird.promisifyAll(redis);

declare module 'redis' {
    export interface RedisClient extends NodeJS.EventEmitter {
        setAsync(...args: any[]): Promise<any>;
        delAsync(...args: any[]): Promise<any>;
        hmsetAsync(...args: any[]): Promise<any>;
        hdelAsync(...args: any[]): Promise<any>;
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
            let project = new Project(null)
            project.name = "Project"
            project.description = "Description"

            db.addProject(project).then((projectId: number) => {
                chai.expect(projectId).to.equals(1)
                
                let task = new Task(null, projectId)
                task.name = "Task"
                task.description = "Description"
                task.estimatedStartDate = new Date(2016, 9, 1)
                task.estimatedDuration = 30
                
                return db.addTask(projectId, task).then((taskId: number) => {
                    chai.expect(taskId).to.equals(1)

                    return db.setTasksResults([new TaskResults(taskId, new Date(2016, 9, 15), 40)])
                }).then(() => {
                    done()
                })
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get task results", (done) => {
            db.getTaskResults(1).then((result: TaskResults) => {
                chai.expect(result.taskId).to.equals(1)
                chai.expect(result.startDate.getTime()).to.equals(new Date(2016, 9, 15).getTime())
                chai.expect(result.duration).to.equals(40)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid task", (done) => {
            db.getTaskResults(2).then((result: TaskResults) => {
                done(new Error("getTaskResults should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(TaskNotFoundError)
                done()
            })
        })
        it("Should corrupt task results properties", (done) => {
            client.delAsync("task:1:startDate").then((result) => {
                return client.hmsetAsync("task:1:startDate", {"test": "test"})
            }).then((result) => {
                return client.delAsync("task:1:duration")
            }).then((result) => {
                return client.hmsetAsync("task:1:duration", {"test": "test"})
            }).then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get task results", (done) => {
            db.getTaskResults(1).then((result: TaskResults) => {
                chai.expect(result.taskId).to.equals(1)
                chai.expect(result.startDate).to.null
                chai.expect(result.duration).to.null
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should delete task results properties", (done) => {
            client.delAsync("task:1:startDate").then((result) => {
                return client.hmsetAsync("task:1:startDate", {"test": "test"})
            }).then((result) => {
                return client.delAsync("task:1:duration")
            }).then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get task results", (done) => {
            db.getTaskResults(1).then((result: TaskResults) => {
                chai.expect(result.taskId).to.equals(1)
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
            let project = new Project(null)
            project.name = "Project"
            project.description = "Description"

            db.addProject(project).then((projectId: number) => {
                chai.expect(projectId).to.equals(1)
                
                let task1 = new Task(null, projectId)
                task1.name = "Task 1"
                task1.description = "Description 1"
                task1.estimatedStartDate = new Date(2016, 9, 1)
                task1.estimatedDuration = 30

                let task2 = new Task(null, projectId)
                task2.name = "Task 2"
                task2.description = "Description 2"
                task2.estimatedStartDate = new Date(2016, 9, 15)
                task2.estimatedDuration = 15
                
                return db.addTask(projectId, task1).then((result: number) => {
                    chai.expect(result).to.equals(1)
                }).then(() => {
                    return db.addTask(projectId, task2)
                }).then((result: number) => {
                    chai.expect(result).to.equals(2)
                    done()
                })
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should set task results", (done) => {
            db.setTasksResults([
                new TaskResults(1, new Date(2016, 9, 15), 40),
                new TaskResults(2, new Date(2016, 10, 1), 60)
            ]).then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get and set task results", (done) => {
            db.setTasksResults([
                new TaskResults(2, new Date(2016, 10, 2), 61),
                new TaskResults(1, new Date(2016, 9, 16), 45)
            ]).then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get task results", (done) => {
            db.getTaskResults(1).then((result: TaskResults) => {
                chai.expect(result.taskId).to.equals(1)
                chai.expect(result.startDate.getTime()).to.equals(new Date(2016, 9, 16).getTime())
                chai.expect(result.duration).to.equals(45)
            }).then(() => {
                return db.getTaskResults(2)
            }).then((result: TaskResults) => {
                chai.expect(result.taskId).to.equals(2)
                chai.expect(result.startDate.getTime()).to.equals(new Date(2016, 10, 2).getTime())
                chai.expect(result.duration).to.equals(61)
            }).then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid task", (done) => {
            db.setTasksResults([
                new TaskResults(2, new Date(2016, 10, 1), 60),
                new TaskResults(3, new Date(2016, 9, 15), 40)
            ]).then(() => {
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

            db.watchTasksImpacts([1]).then(() => {
                let impact = new Impact(null)
                impact.name = "Transactional impact"
                impact.description = "Transactional impact description"
                impact.duration = 10
                return otherDb.addImpact(impact)
            }).then((id: number) => {
                return otherDb.setImpactForTask(id, 1)
            }).then(() => {
                return db.setTasksResults([
                    new TaskResults(1, new Date(2016, 9, 16), 45),
                    new TaskResults(2, new Date(2016, 10, 2), 61)
                ])
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

            db.watchTasksImpacts([1]).then(() => {
                let impact = new Impact(null)
                impact.name = "Transactional impact"
                impact.description = "Transactional impact description"
                impact.duration = 10
                return otherDb.addImpact(impact)
            }).then((id: number) => {
                return otherDb.setImpactForTask(id, 1)
            }).then(() => {
                return db.setTasksResults([
                    new TaskResults(1, new Date(2016, 9, 16), 45),
                    new TaskResults(2, new Date(2016, 10, 2), 61)
                ])
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