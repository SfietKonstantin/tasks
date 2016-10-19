import * as chai from "chai"
import * as redis from "redis"
import * as bluebird from "bluebird"
import { Project, Task } from "../../common/types"
import {
    CorruptedError, ExistsError, ProjectNotFoundError, TaskNotFoundError
} from "../../server/core/data/idataprovider"
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
    describe("hasTask", () => {
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
                }).then(() => {
                    return db.addTask(task2)
                }).then(() => {
                    done()
                })
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should have task", (done) => {
            db.hasTask("project", "task1").then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid task", (done) => {
            db.hasTask("project", "task3").then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(TaskNotFoundError)
                done()
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
                }).then(() => {
                    return db.addTask(task2)
                }).then(() => {
                    done()
                })
            }).catch((error: Error) => {
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
                chai.expect(tasks).to.length(2)
                chai.expect(tasks[0].identifier).to.equals("task2")
                chai.expect(tasks[0].name).to.equals("Task 2")
                chai.expect(tasks[0].description).to.equals("Description 2")
                chai.expect(tasks[0].estimatedStartDate.getTime()).to.equals(new Date(2016, 9, 15).getTime())
                chai.expect(tasks[0].estimatedDuration).to.equals(15)
                chai.expect(tasks[1].identifier).to.equals("task1")
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
            client.delAsync("task:project:task1").then((result) => {
                done()
            })
        })
        it("Should get valid tasks", (done) => {
            db.getTasks("project", ["task2", "task1"]).then((tasks: Array<Task>) => {
                chai.expect(tasks).to.length(2)
                chai.expect(tasks[0].identifier).to.equals("task2")
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
            client.setAsync("task:project:task1", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get valid tasks", (done) => {
            db.getTasks("project", ["task2", "task1"]).then((tasks: Array<Task>) => {
                chai.expect(tasks).to.length(2)
                chai.expect(tasks[0].identifier).to.equals("task2")
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
                }).then(() => {
                    return db.addTask(task2)
                }).then(() => {
                    done()
                })
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get task", (done) => {
            db.getTask("project", "task1").then((task: Task) => {
                chai.expect(task.identifier).to.equals("task1")
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
            db.getTask("project", "task3").then((task: Task) => {
                done(new Error("getTask should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(TaskNotFoundError)
                done()
            })
        })
        it("Should remove task name", (done) => {
            client.hdelAsync("task:project:task1", "name").then((result: number) => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task", (done) => {
            db.getTask("project", "task1").then((task: Task) => {
                done(new Error("getTask should not be a success"))
                done()
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            })
        })
        it("Should remove task description", (done) => {
            client.hsetAsync("task:project:task1", "name", "Task 1").then((result: number) => {
                return client.hdelAsync("task:project:task1", "description")
            }).then((result: number) => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task", (done) => {
            db.getTask("project", "task1").then((task: Task) => {
                done(new Error("getTask should not be a success"))
                done()
            }).catch((error: Error) => {
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
                identifier: "project",
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should add task", (done) => {
            const task1: Task = {
                projectIdentifier: "project",
                identifier: "task1",
                name: "Task 1",
                description: "Description 1",
                estimatedStartDate: new Date(2016, 9, 1),
                estimatedDuration: 30
            }

            db.addTask(task1).then(() => {
               done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception when adding task on invalid project", (done) => {
            const task2: Task = {
                projectIdentifier: "project2",
                identifier: "task2",
                name: "Task 2",
                description: "Description 2",
                estimatedStartDate: new Date(2016, 9, 1),
                estimatedDuration: 30
            }

            db.addTask(task2).then(() => {
                done(new Error("addTask should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(ProjectNotFoundError)
                done()
            })
        })
        it("Should get an exception when adding an existing task", (done) => {
            const task1_2: Task = {
                projectIdentifier: "project",
                identifier: "task1",
                name: "Task 2",
                description: "Description 2",
                estimatedStartDate: new Date(2016, 9, 1),
                estimatedDuration: 30
            }

            db.addTask(task1_2).then(() => {
                done(new Error("addTask should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(ExistsError)
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
        it("Should set task relation", (done) => {
            db.setTaskRelation("project", "task1", "task2").then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid parent task", (done) => {
            db.setTaskRelation("project", "task3", "task2").then(() => {
                done(new Error("setTaskRelation should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(TaskNotFoundError)
                done()
            })
        })
        it("Should get an exception on invalid child task", (done) => {
            db.setTaskRelation("project", "task1", "task3").then(() => {
                done(new Error("setTaskRelation should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(TaskNotFoundError)
                done()
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("task:project:task1:children", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        xit("Should get an exception on corrupted parent task", (done) => {
            db.setTaskRelation("project", "task1", "task2").then(() => {
                done(new Error("setTaskRelation should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.not.null
                done()
            })
        })
        it("Should revert task properties corruption", (done) => {
            client.delAsync("task:project:task1:children").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should set task relation", (done) => {
            db.setTaskRelation("project", "task1", "task2").then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("task:project:task2:parents", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        xit("Should get an exception on corrupted children task", (done) => {
            db.setTaskRelation("project", "task1", "task2").then(() => {
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
                const task3: Task = {
                    projectIdentifier: "project",
                    identifier: "task3",
                    name: "Task 3",
                    description: "Description 3",
                    estimatedStartDate: new Date(2016, 10, 1),
                    estimatedDuration: 10
                }

                return db.addTask(task1).then(() => {
                    return db.addTask(task2)
                }).then(() => {
                    return db.addTask(task3)
                }).then(() => {
                    return db.setTaskRelation("project", "task2", "task1")
                }).then(() => {
                    return db.setTaskRelation("project", "task3", "task1")
                }).then(() => {
                    done()
                })
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get parent task ids", (done) => {
            db.getParentTaskIdentifiers("project", "task1").then((ids: Array<string>) => {
                chai.expect(ids).to.length(2)
                chai.expect(ids[0]).to.equals("task2")
                chai.expect(ids[1]).to.equals("task3")
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid task", (done) => {
            db.getParentTaskIdentifiers("project", "task4").then((ids: Array<string>) => {
                done(new Error("getParentTaskIds should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(TaskNotFoundError)
                done()
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("task:project:task1:parents", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task", (done) => {
            db.getParentTaskIdentifiers("project", "task1").then((ids: Array<string>) => {
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
                const task3: Task = {
                    projectIdentifier: "project",
                    identifier: "task3",
                    name: "Task 3",
                    description: "Description 3",
                    estimatedStartDate: new Date(2016, 10, 1),
                    estimatedDuration: 10
                }

                return db.addTask(task1).then(() => {
                    return db.addTask(task2)
                }).then(() => {
                    return db.addTask(task3)
                }).then(() => {
                    return db.setTaskRelation("project", "task1", "task2")
                }).then(() => {
                    return db.setTaskRelation("project", "task1", "task3")
                }).then(() => {
                    done()
                })
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get children task ids", (done) => {
            db.getChildrenTaskIdentifiers("project", "task1").then((ids: Array<string>) => {
                chai.expect(ids).to.length(2)
                chai.expect(ids[0]).to.equals("task2")
                chai.expect(ids[1]).to.equals("task3")
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid task", (done) => {
            db.getChildrenTaskIdentifiers("project", "task4").then((ids: Array<string>) => {
                done(new Error("getChildrenTaskIds should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(TaskNotFoundError)
                done()
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("task:project:task1:children", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted task", (done) => {
            db.getChildrenTaskIdentifiers("project", "task1").then((ids: Array<string>) => {
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
    after(() => {
        client.quit()
    })
})
