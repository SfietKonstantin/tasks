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
    describe("getAllProjects", () => {
        it("Should get an empty list of projects", (done) => {
            db.getAllProjects().then((projects: Array<Project>) => {
                chai.expect(projects).to.empty
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should add some testing data", (done) => {
            let project1 = new Project(null)
            project1.name = "Project 1"
            project1.description = "Description 1"

            let project2 = new Project(null)
            project2.name = "Project 2"
            project2.description = "Description 2"

            db.addProject(project1).then((result: number) => {
                chai.expect(project1.id).to.equals(1)
                chai.expect(result).to.equals(1)
            }).then(() => {
                return db.addProject(project2)
            }).then((result: number) => {
                chai.expect(project2.id).to.equals(2)
                chai.expect(result).to.equals(2)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get all projects", (done) => {
            db.getAllProjects().then((projects: Array<Project>) => {
                chai.expect(projects).to.length(2)
                chai.expect(projects[0].id).to.equals(1)
                chai.expect(projects[0].name).to.equals("Project 1")
                chai.expect(projects[0].description).to.equals("Description 1")
                chai.expect(projects[1].id).to.equals(2)
                chai.expect(projects[1].name).to.equals("Project 2")
                chai.expect(projects[1].description).to.equals("Description 2")
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should remove project", (done) => {
            client.delAsync("project:1").then((result) => {
                done()
            })
        })
        it("Should get all valid projects", (done) => {
            db.getAllProjects().then((projects: Array<Project>) => {
                chai.expect(projects).to.length(1)
                chai.expect(projects[0].id).to.equals(2)
                chai.expect(projects[0].name).to.equals("Project 2")
                chai.expect(projects[0].description).to.equals("Description 2")
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should corrupt project properties", (done) => {
            client.setAsync("project:1", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get all non-corrupted projects", (done) => {
            db.getAllProjects().then((projects: Array<Project>) => {
                chai.expect(projects).to.length(1)
                chai.expect(projects[0].id).to.equals(2)
                chai.expect(projects[0].name).to.equals("Project 2")
                chai.expect(projects[0].description).to.equals("Description 2")
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should corrupt project id properties", (done) => {
            client.delAsync("project:ids").then((result) => {
                client.setAsync("project:ids", "test")
            }).then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an empty list of projects", (done) => {
            db.getAllProjects().then((projects: Array<Project>) => {
                chai.expect(projects).to.empty
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        after(() => {
            client.flushdb()
        })
    })
    describe("getProject", () => {
        it("Should add some testing data", (done) => {
let project1 = new Project(null)
            project1.name = "Project 1"
            project1.description = "Description 1"

            let project2 = new Project(null)
            project2.name = "Project 2"
            project2.description = "Description 2"

            db.addProject(project1).then((result: number) => {
                chai.expect(project1.id).to.equals(1)
                chai.expect(result).to.equals(1)
            }).then(() => {
                return db.addProject(project2)
            }).then((result: number) => {
                chai.expect(project2.id).to.equals(2)
                chai.expect(result).to.equals(2)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get project", (done) => {
            db.getProject(1).then((project: Project) => {
                chai.expect(project.id).to.equals(1)
                chai.expect(project.name).to.equals("Project 1")
                chai.expect(project.description).to.equals("Description 1")
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid project", (done) => {
            db.getProject(3).then((project: Project) => {
                done(new Error("getProject should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(ProjectNotFoundError)
                done()
            })
        })
        it("Should remove project properties", (done) => {
            client.hdelAsync("project:1", "name").then((result: number) => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get project", (done) => {
            db.getProject(1).then((project: Project) => {
                chai.expect(project.id).to.equals(1)
                chai.expect(project.name).to.null
                chai.expect(project.description).to.equals("Description 1")
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should corrupt project properties", (done) => {
            client.setAsync("project:3", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted project", (done) => {
            db.getProject(3).then((project: Project) => {
                done(new Error("getProject should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.not.null
                done()
            })
        })
        after(() => {
            client.flushdb()
        })
    })
    describe("addProject", () => {
        it("Should add project", (done) => {
            let project = new Project(null)
            project.name = "Project 1"
            project.description = "Description 1"

            db.addProject(project).then((id: number) => {
                chai.expect(id).to.equals(1)
                chai.expect(project.id).to.equal(1)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should corrupt next project properties", (done) => {
            client.setAsync("project:2", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding project", (done) => {
            let project = new Project(null)
            project.name = "Project 2"
            project.description = "Description 2"

            db.addProject(project).then((id: number) => {
                done(new Error("addProject should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.not.null
                done()
            })
        })
        it("Should add next project", (done) => {
            let project = new Project(null)
            project.name = "Project 3"
            project.description = "Description 3"

            db.addProject(project).then((id: number) => {
                chai.expect(id).to.equals(3)
                chai.expect(project.id).to.equal(3)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should corrupt project id properties", (done) => {
            client.delAsync("project:ids").then((result) => {
                client.setAsync("project:ids", "test")
            }).then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding project", (done) => {
            let project = new Project(null)
            project.name = "Project"
            project.description = "Description"

            db.addProject(project).then((id: number) => {
                done(new Error("addProject should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.not.null
                done()
            })
        })      
        after(() => {
            client.flushdb()
        })
    })
    describe("setProjectRootTask", () => {
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
                
                return db.addTask(projectId, task).then((id: number) => {
                    chai.expect(id).to.equal(1)
                    done()
                })
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should set project root task", (done) => {
            db.setProjectRootTask(1, 1).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid project", (done) => {
            db.setProjectRootTask(2, 1).then(() => {
                done(new Error("setProjectRootTask should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(ProjectNotFoundError)
                done()
            })
        })
        it("Should get an exception on invalid task", (done) => {
            db.setProjectRootTask(1, 2).then(() => {
                done(new Error("setProjectRootTask should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(TaskNotFoundError)
                done()
            })
        })
        it("Should corrupt project properties", (done) => {
            client.delAsync("project:1:root").then((result) => {
                return client.hmsetAsync("project:1:root", {"test": "test"})
            }).then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should set project root task", (done) => {
            db.setProjectRootTask(1, 1).then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        after(() => {
            client.flushdb()
        })
    })
    describe("getProjectRootTask", () => {
        it("Should add some testing data", (done) => {
            let project = new Project(null)
            project.name = "Project"
            project.description = "Description"

            db.addProject(project).then((projectId: number) => {
                chai.expect(projectId).to.equals(1)

                let task1 = new Task(null, projectId)
                task1.name = "Task 1"
                task1.description = "Description"
                task1.estimatedStartDate = new Date(2016, 9, 1)
                task1.estimatedDuration = 30

                let task2 = new Task(null, projectId)
                task2.name = "Task 2"
                task2.description = "Description"
                task2.estimatedStartDate = new Date(2016, 9, 15)
                task2.estimatedDuration = 15

                return db.addTask(projectId, task1).then((result: number) => {
                    chai.expect(result).to.equals(1)
                }).then(() => {
                    return db.addTask(projectId, task2)
                }).then((result: number) => {
                    chai.expect(result).to.equals(2)
                }).then(() => {
                    return db.setProjectRootTask(projectId, 2)
                }).then(() => {
                    done()
                })
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get project root task", (done) => {
            db.getProjectRootTask(1).then((id: number) => {
                chai.expect(id).to.equals(2)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid project", (done) => {
            db.getProjectRootTask(2).then(() => {
                done(new Error("getProjectRootTask should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(ProjectNotFoundError)
                done()
            })
        })
        it("Should corrupt project properties", (done) => {
            client.delAsync("project:1:root").then((result) => {
                return client.hmsetAsync("project:1:root", {"test": "test"})
            }).then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        after(() => {
            client.flushdb()
        })
        it("Should get an exception on corrupted project", (done) => {
            db.getProjectRootTask(1).then((id: number) => {
                done(new Error("getProjectRootTask should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.not.null
                done()
            })
        })
    })
})