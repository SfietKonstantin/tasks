import * as chai from "chai"
import * as redis from "redis"
import * as bluebird from "bluebird"
import { Project, Task } from "../core/types"
import { ProjectNotFoundError, TaskNotFoundError } from "../core/data/idataprovider"
import { RedisDataProvider } from "../core/data/redisdataprovider"

const redisAsync: any = bluebird.promisifyAll(redis);

declare module 'redis' {
    export interface RedisClient extends NodeJS.EventEmitter {
        setAsync(...args: any[]): Promise<any>;
        delAsync(...args: any[]): Promise<any>;
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
    describe("getTasks", () => {
        it("Should add some testing data", (done) => {
            const project: Project = {
                id: null,
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then((projectId: number) => {
                chai.expect(projectId).to.equals(1)
                
                const task1: Task = {
                    id: null,
                    projectId: projectId,
                    name: "Task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 30
                }
                const task2: Task = {
                    id: null,
                    projectId: projectId,
                    name: "Task 2",
                    description: "Description 2",
                    estimatedStartDate: new Date(2016, 9, 15),
                    estimatedDuration: 15
                }
                
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
        it("Should get an empty list", (done) => {
            db.getTasks([]).then((tasks: Array<Task>) => {
                chai.expect(tasks).to.length(0)
                done()
            })
        })
        it("Should get tasks", (done) => {
            db.getTasks([2, 1]).then((tasks: Array<Task>) => {
                chai.expect(tasks).to.length(2)
                chai.expect(tasks[0].id).to.equals(2)
                chai.expect(tasks[0].name).to.equals("Task 2")
                chai.expect(tasks[0].description).to.equals("Description 2")
                chai.expect(tasks[0].estimatedStartDate.getTime()).to.equals(new Date(2016, 9, 15).getTime())
                chai.expect(tasks[0].estimatedDuration).to.equals(15)
                chai.expect(tasks[1].id).to.equals(1)
                chai.expect(tasks[1].name).to.equals("Task 1")
                chai.expect(tasks[1].description).to.equals("Description 1")
                chai.expect(tasks[1].estimatedStartDate.getTime()).to.equals(new Date(2016, 9, 1).getTime())
                chai.expect(tasks[1].estimatedDuration).to.equals(30)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should remove task", (done) => {
            client.delAsync("task:1").then((result) => {
                done()
            })
        })
        it("Should get valid tasks", (done) => {
            db.getTasks([2, 1]).then((tasks: Array<Task>) => {
                chai.expect(tasks).to.length(2)
                chai.expect(tasks[0].id).to.equals(2)
                chai.expect(tasks[0].name).to.equals("Task 2")
                chai.expect(tasks[0].description).to.equals("Description 2")
                chai.expect(tasks[0].estimatedStartDate.getTime()).to.equals(new Date(2016, 9, 15).getTime())
                chai.expect(tasks[0].estimatedDuration).to.equals(15)
                chai.expect(tasks[1]).to.null
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("task:1", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get valid tasks", (done) => {
            db.getTasks([2, 1]).then((tasks: Array<Task>) => {
                chai.expect(tasks).to.length(2)
                chai.expect(tasks[0].id).to.equals(2)
                chai.expect(tasks[0].name).to.equals("Task 2")
                chai.expect(tasks[0].description).to.equals("Description 2")
                chai.expect(tasks[0].estimatedStartDate.getTime()).to.equals(new Date(2016, 9, 15).getTime())
                chai.expect(tasks[0].estimatedDuration).to.equals(15)
                chai.expect(tasks[1]).to.null
                done()
            }).catch((error: Error) => {
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
                id: null,
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then((projectId: number) => {
                chai.expect(projectId).to.equals(1)

                const task1: Task = {
                    id: null,
                    projectId: projectId,
                    name: "Task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 30
                }
                const task2: Task = {
                    id: null,
                    projectId: projectId,
                    name: "Task 2",
                    description: "Description 2",
                    estimatedStartDate: new Date(2016, 9, 15),
                    estimatedDuration: 15
                }
                
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
        it("Should get task", (done) => {
            db.getTask(1).then((task: Task) => {
                chai.expect(task.id).to.equals(1)
                chai.expect(task.name).to.equals("Task 1")
                chai.expect(task.description).to.equals("Description 1")
                chai.expect(task.estimatedStartDate.getTime()).to.equals(new Date(2016, 9, 1).getTime())
                chai.expect(task.estimatedDuration).to.equals(30)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid task", (done) => {
            db.getTask(3).then((task: Task) => {
                done(new Error("getTask should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(TaskNotFoundError)
                done()
            })
        })
        it("Should remove task properties", (done) => {
            client.hdelAsync("task:1", "name").then((result: number) => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get task", (done) => {
            db.getTask(1).then((task: Task) => {
                chai.expect(task.id).to.equals(1)
                chai.expect(task.name).to.null
                chai.expect(task.description).to.equals("Description 1")
                chai.expect(task.estimatedStartDate.getTime()).to.equals(new Date(2016, 9, 1).getTime())
                chai.expect(task.estimatedDuration).to.equals(30)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("task:3", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task", (done) => {
            db.getTask(3).then((task: Task) => {
                done(new Error("getTask should not be a success"))
            }).catch((error: Error) => {
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
                id: null,
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then((id: number) => {
                chai.expect(id).to.equals(1)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should add task", (done) => {
            const task1: Task = {
                id: null,
                projectId: null,
                name: "Task 1",
                description: "Description 1",
                estimatedStartDate: new Date(2016, 9, 1),
                estimatedDuration: 30
            }

            db.addTask(1, task1).then((id: number) => {
                chai.expect(id).to.equals(1)
                chai.expect(task1.id).to.equal(1)
                chai.expect(task1.projectId).to.equal(1)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception when adding task on invalid project", (done) => {
            const task1: Task = {
                id: null,
                projectId: null,
                name: "Task 1",
                description: "Description 1",
                estimatedStartDate: new Date(2016, 9, 1),
                estimatedDuration: 30
            }

            db.addTask(2, task1).then((id: number) => {
                done(new Error("addTask should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(ProjectNotFoundError)
                done()
            })
        })
        it("Should corrupt next task properties", (done) => {
            client.setAsync("task:2", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding task", (done) => {
            const task2: Task = {
                id: null,
                projectId: null,
                name: "Task 2",
                description: "Description 2",
                estimatedStartDate: new Date(2016, 9, 15),
                estimatedDuration: 15
            }

            db.addTask(1, task2).then((id: number) => {
                done(new Error("addTask should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.not.null
                done()
            })
        })
        it("Should add next task", (done) => {
            const task3: Task = {
                id: null,
                projectId: null,
                name: "Task 3",
                description: "Description 3",
                estimatedStartDate: new Date(2016, 10, 1),
                estimatedDuration: 10
            }

            db.addTask(1, task3).then((id: number) => {
                chai.expect(id).to.equals(3)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should corrupt task id properties", (done) => {
            client.delAsync("task:ids").then((result) => {
                return client.setAsync("task:ids", "test")
            }).then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding task", (done) => {
            const task: Task = {
                id: null,
                projectId: null,
                name: "Task",
                description: "Description",
                estimatedStartDate: new Date(2016, 12, 1),
                estimatedDuration: 100
            }

            db.addTask(1, task).then((id: number) => {
                done(new Error("addTask should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.not.null
                done()
            })
        })     
        after(() => {
            client.flushdb()
        })
    })
    describe("setTaskRelation", () => {
        it("Should add some testing data", (done) => {
            const project: Project = {
                id: null,
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then((projectId: number) => {
                chai.expect(projectId).to.equals(1)

                const task1: Task = {
                    id: null,
                    projectId: projectId,
                    name: "Task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 30
                }
                const task2: Task = {
                    id: null,
                    projectId: projectId,
                    name: "Task 2",
                    description: "Description 2",
                    estimatedStartDate: new Date(2016, 9, 15),
                    estimatedDuration: 15
                }
                
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
        it("Should set task relation", (done) => {
            db.setTaskRelation(1, 2).then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid parent task", (done) => {
            db.setTaskRelation(3, 2).then(() => {
                done(new Error("setTaskRelation should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(TaskNotFoundError)
                done()
            })
        })
        it("Should get an exception on invalid child task", (done) => {
            db.setTaskRelation(1, 3).then(() => {
                done(new Error("setTaskRelation should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(TaskNotFoundError)
                done()
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("task:1:children", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        xit("Should get an exception on corrupted parent task", (done) => {
            db.setTaskRelation(1, 2).then(() => {
                done(new Error("setTaskRelation should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.not.null
                done()
            })
        })
        it("Should revert task properties corruption", (done) => {
            client.delAsync("task:1:children").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should set task relation", (done) => {
            db.setTaskRelation(1, 2).then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("task:2:parents", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        xit("Should get an exception on corrupted children task", (done) => {
            db.setTaskRelation(1, 2).then(() => {
                done(new Error("setTaskRelation should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.not.null
                done()
            })
        })
        after(() => {
            client.flushdb()
        })
    })
    describe("getParentTaskIds", () => {
        it("Should add some testing data", (done) => {
            const project: Project = {
                id: null,
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then((projectId: number) => {
                chai.expect(projectId).to.equals(1)

                const task1: Task = {
                    id: null,
                    projectId: projectId,
                    name: "Task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 30
                }
                const task2: Task = {
                    id: null,
                    projectId: projectId,
                    name: "Task 2",
                    description: "Description 2",
                    estimatedStartDate: new Date(2016, 9, 15),
                    estimatedDuration: 15
                }
                const task3: Task = {
                    id: null,
                    projectId: projectId,
                    name: "Task 3",
                    description: "Description 3",
                    estimatedStartDate: new Date(2016, 10, 1),
                    estimatedDuration: 10
                }
                
                return db.addTask(projectId, task1).then((result: number) => {
                    chai.expect(result).to.equals(1)
                }).then(() => {
                    return db.addTask(projectId, task2)
                }).then((result: number) => {
                    chai.expect(result).to.equals(2)
                }).then(() => {
                    return db.addTask(projectId, task2)
                }).then((result: number) => {
                    chai.expect(result).to.equals(3)
                }).then(() => {
                    return db.setTaskRelation(2, 1)
                }).then(() => {
                    return db.setTaskRelation(3, 1)
                }).then(() => {
                    done()
                })
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get parent task ids", (done) => {
            db.getParentTaskIds(1).then((ids: Array<number>) => {
                chai.expect(ids).to.length(2)
                chai.expect(ids[0]).to.equals(2)
                chai.expect(ids[1]).to.equals(3)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid task", (done) => {
            db.getParentTaskIds(4).then((ids: Array<number>) => {
                done(new Error("getParentTaskIds should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(TaskNotFoundError)
                done()
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("task:1:parents", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task", (done) => {
            db.getParentTaskIds(1).then((ids: Array<number>) => {
                done(new Error("getParentTaskIds should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.not.null
                done()
            })
        })
        after(() => {
            client.flushdb()
        })
    })
    describe("getChildrenTaskIds", () => {
        it("Should add some testing data", (done) => {
            const project: Project = {
                id: null,
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then((projectId: number) => {
                chai.expect(projectId).to.equals(1)

                const task1: Task = {
                    id: null,
                    projectId: projectId,
                    name: "Task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 30
                }
                const task2: Task = {
                    id: null,
                    projectId: projectId,
                    name: "Task 2",
                    description: "Description 2",
                    estimatedStartDate: new Date(2016, 9, 15),
                    estimatedDuration: 15
                }
                const task3: Task = {
                    id: null,
                    projectId: projectId,
                    name: "Task 3",
                    description: "Description 3",
                    estimatedStartDate: new Date(2016, 10, 1),
                    estimatedDuration: 10
                }
                
                return db.addTask(projectId, task1).then((result: number) => {
                    chai.expect(result).to.equals(1)
                }).then(() => {
                    return db.addTask(projectId, task2)
                }).then((result: number) => {
                    chai.expect(result).to.equals(2)
                }).then(() => {
                    return db.addTask(projectId, task2)
                }).then((result: number) => {
                    chai.expect(result).to.equals(3)
                }).then(() => {
                    return db.setTaskRelation(1, 2)
                }).then(() => {
                    return db.setTaskRelation(1, 3)
                }).then(() => {
                    done()
                })
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get children task ids", (done) => {
            db.getChildrenTaskIds(1).then((ids: Array<number>) => {
                chai.expect(ids).to.length(2)
                chai.expect(ids[0]).to.equals(2)
                chai.expect(ids[1]).to.equals(3)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid task", (done) => {
            db.getChildrenTaskIds(4).then((ids: Array<number>) => {
                done(new Error("getChildrenTaskIds should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(TaskNotFoundError)
                done()
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("task:1:children", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task", (done) => {
            db.getChildrenTaskIds(1).then((ids: Array<number>) => {
                done(new Error("getChildrenTaskIds should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.not.null
                done()
            })
        })
        after(() => {
            client.flushdb()
        })
    })
})