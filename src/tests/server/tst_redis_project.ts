import * as chai from "chai"
import * as redis from "redis"
import * as bluebird from "bluebird"
import { Project, Task } from "../../common/types"
import {
    CorruptedError, ExistsError, ProjectNotFoundError
} from "../../server/core/data/idataprovider"
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
            const project1: Project = {
                identifier: "project1",
                name: "Project 1",
                description: "Description 1"
            }

            const project2: Project = {
                identifier: "project2",
                name: "Project 2",
                description: "Description 2"
            }

            db.addProject(project1).then(() => {
                return db.addProject(project2)
            }).then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get all projects", (done) => {
            db.getAllProjects().then((projects: Array<Project>) => {
                chai.expect(projects).to.length(2)
                chai.expect(projects[0].identifier).to.equals("project1")
                chai.expect(projects[0].name).to.equals("Project 1")
                chai.expect(projects[0].description).to.equals("Description 1")
                chai.expect(projects[1].identifier).to.equals("project2")
                chai.expect(projects[1].name).to.equals("Project 2")
                chai.expect(projects[1].description).to.equals("Description 2")
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should remove project", (done) => {
            client.delAsync("project:project1").then((result) => {
                done()
            })
        })
        it("Should get all valid projects", (done) => {
            db.getAllProjects().then((projects: Array<Project>) => {
                chai.expect(projects).to.length(1)
                chai.expect(projects[0].identifier).to.equals("project2")
                chai.expect(projects[0].name).to.equals("Project 2")
                chai.expect(projects[0].description).to.equals("Description 2")
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should corrupt project properties", (done) => {
            client.setAsync("project:project1", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get all non-corrupted projects", (done) => {
            db.getAllProjects().then((projects: Array<Project>) => {
                chai.expect(projects).to.length(1)
                chai.expect(projects[0].identifier).to.equals("project2")
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
            const project1: Project = {
                identifier: "project1",
                name: "Project 1",
                description: "Description 1"
            }

            const project2: Project = {
                identifier: "project2",
                name: "Project 2",
                description: "Description 2"
            }

            db.addProject(project1).then(() => {
            }).then(() => {
                return db.addProject(project2)
            }).then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get project", (done) => {
            db.getProject("project1").then((project: Project) => {
                chai.expect(project.identifier).to.equals("project1")
                chai.expect(project.name).to.equals("Project 1")
                chai.expect(project.description).to.equals("Description 1")
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid project", (done) => {
            db.getProject("project3").then((project: Project) => {
                done(new Error("getProject should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(ProjectNotFoundError)
                done()
            })
        })
        it("Should remove project properties", (done) => {
            client.hdelAsync("project:project1", "name").then((result: number) => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted project", (done) => {
            db.getProject("project1").then((project: Project) => {
                done(new Error("getProject should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            })
        })
        it("Should corrupt project properties", (done) => {
            client.setAsync("project:project3", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted project", (done) => {
            db.getProject("project3").then((project: Project) => {
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
            const project1: Project = {
                identifier: "project1",
                name: "Project 1",
                description: "Description 1"
            }

            db.addProject(project1).then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an exception when adding existing project", (done) => {
            const project1_2: Project = {
                identifier: "project1",
                name: "Project 2",
                description: "Description 2"
            }

            db.addProject(project1_2).then(() => {
                done(new Error("addProject should not be a success"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(ExistsError)
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
