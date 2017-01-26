import * as chai from "chai"
import * as redis from "redis"
import {Project} from "../../../common/project"
import {RedisProjectDao} from "../../../server/dao/redis/redisprojectdao"
import {RedisTestDataProvider} from "./redistestdataprovider"
import {project1, project2, invalidProject, project3} from "../testdata"
import {KeyFactory} from "../../../server/dao/redis/utils/keyfactory"
import {NotFoundError} from "../../../common/errors/notfound"
import {CorruptedError} from "../../../server/dao/error/corrupted"
import {InternalError} from "../../../server/dao/error/internal"
import {ExistsError} from "../../../server/dao/error/exists"

describe("Redis project DAO", () => {
    let client: redis.RedisClient
    let dao: RedisProjectDao
    beforeEach((done) => {
        RedisTestDataProvider.dump().then((testClient: redis.RedisClient) => {
            client = testClient
            dao = new RedisProjectDao(client)
            done()
        })
    })
    afterEach(() => {
        client.quit()
    })
    describe("getAllProjects", () => {
        it("Should get an empty list of projects in an empty DB", (done) => {
            RedisTestDataProvider.flush(client)
            dao.getAllProjects().then((projects: Array<Project>) => {
                chai.expect(projects).to.empty
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get a list of projects from the DB", (done) => {
            dao.getAllProjects().then((projects: Array<Project>) => {
                chai.expect(projects).to.deep.equal([project1, project2])
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get only projects with body from the DB", (done) => {
            const projectKey = KeyFactory.createProjectKey(project1.identifier)
            RedisTestDataProvider.delete(client, projectKey).then(() => {
                return dao.getAllProjects().then((projects: Array<Project>) => {
                    chai.expect(projects).to.deep.equal([project2])
                    done()
                })
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get only projects without corrupted body from the DB", (done) => {
            const projectKey = KeyFactory.createProjectKey(project1.identifier)
            RedisTestDataProvider.set(client, projectKey, "test").then(() => {
                return dao.getAllProjects().then((projects: Array<Project>) => {
                    chai.expect(projects).to.deep.equal([project2])
                    done()
                })
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an empty list of projects for a DB with corrupted keys", (done) => {
            RedisTestDataProvider.delete(client, "project:ids").then(() => {
                RedisTestDataProvider.set(client, "project:ids", "test")
            }).then(() => {
                return dao.getAllProjects().then((projects: Array<Project>) => {
                    chai.expect(projects).to.empty
                    done()
                })
            }).catch((error) => {
                done(error)
            })
        })
    })
    describe("getProject", () => {
        it("Should get a project from the DB", (done) => {
            dao.getProject(project1.identifier).then((project: Project) => {
                chai.expect(project).to.deep.equal(project1)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid for an project identifier", (done) => {
            dao.getProject(invalidProject.identifier).then(() => {
                done(new Error("getProject should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on project with corrupted name", (done) => {
            const projectKey = KeyFactory.createProjectKey(project1.identifier)
            RedisTestDataProvider.deleteMember(client, projectKey, "name").then(() => {
                return dao.getProject(project1.identifier).then(() => {
                    done(new Error("getProject should not be a success"))
                })
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on project with corrupted description", (done) => {
            const projectKey = KeyFactory.createProjectKey(project1.identifier)
            RedisTestDataProvider.deleteMember(client, projectKey, "description").then(() => {
                return dao.getProject(project1.identifier).then(() => {
                    done(new Error("getProject should not be a success"))
                })
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted project", (done) => {
            const projectKey = KeyFactory.createProjectKey(project1.identifier)
            RedisTestDataProvider.set(client, projectKey, "test").then(() => {
                return dao.getProject(project1.identifier).then(() => {
                    done(new Error("getProject should not be a success"))
                })
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
    describe("addProject", () => {
        it("Should add a project in the DB", (done) => {
            dao.addProject(project3).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding an existing project in the DB", (done) => {
            dao.addProject(project1).then(() => {
                done(new Error("addProject should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(ExistsError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding a project with corrupted ids", (done) => {
            RedisTestDataProvider.set(client, "project:ids", "test").then(() => {
                return dao.addProject(project3).then(() => {
                    done(new Error("addProject should not be a success"))
                })
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
