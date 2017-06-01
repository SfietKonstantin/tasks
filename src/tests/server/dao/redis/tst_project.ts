import * as chai from "chai"
import * as redis from "redis"
import {Project} from "../../../../common/old/project"
import {RedisProjectDao} from "../../../../server/dao/redis/old/project"
import {RedisDaoBuilder} from "../../../../server/dao/redis/builder"
import {RedisTestDataProvider} from "./testdataprovider"
import {project1, project2, project3, invalidProject} from "../../../common/testdata"
import {KeyFactory} from "../../../../server/dao/redis/utils/keyfactory"
import {NotFoundError} from "../../../../common/errors/notfound"
import {CorruptedError} from "../../../../server/dao/error/corrupted"
import {InternalError} from "../../../../server/dao/error/internal"
import {ExistsError} from "../../../../server/error/exists"

describe("Redis DAO Project", () => {
    let client: redis.RedisClient
    let dao: RedisProjectDao
    beforeEach(() => {
        return RedisTestDataProvider.dump().then((testClient: redis.RedisClient) => {
            client = testClient
            const builder = new RedisDaoBuilder(client)
            dao = builder.buildProjectDao()
        })
    })
    afterEach(() => {
        client.quit()
    })
    describe("getAllProjects", () => {
        it("Should get an empty list of projects in an empty DB", () => {
            RedisTestDataProvider.flush(client)
            return dao.getAllProjects().then((projects: Array<Project>) => {
                chai.expect(projects).to.empty
            })
        })
        it("Should get a list of projects from the DB", () => {
            return dao.getAllProjects().then((projects: Array<Project>) => {
                chai.expect(projects).to.deep.equal([project1, project2])
            })
        })
        it("Should only get projects with body from the DB", () => {
            const projectKey = KeyFactory.createProjectKey(project1.identifier)
            return RedisTestDataProvider.deleteValue(client, projectKey).then(() => {
                return dao.getAllProjects()
            }).then((projects: Array<Project>) => {
                chai.expect(projects).to.deep.equal([project2])
            })
        })
        it("Should get only projects without corrupted body from the DB", () => {
            const projectKey = KeyFactory.createProjectKey(project1.identifier)
            return RedisTestDataProvider.setValue(client, projectKey, "test").then(() => {
                return dao.getAllProjects()
            }).then((projects: Array<Project>) => {
                chai.expect(projects).to.deep.equal([project2])
            })
        })
        it("Should get an empty list of projects for a DB with corrupted keys", () => {
            const projectIdsKey = KeyFactory.createGlobalProjectKey("ids")
            return RedisTestDataProvider.deleteValue(client, projectIdsKey).then(() => {
                return RedisTestDataProvider.setValue(client, projectIdsKey, "test")
            }).then(() => {
                return dao.getAllProjects()
            }).then((projects: Array<Project>) => {
                chai.expect(projects).to.empty
            })
        })
    })
    describe("getProject", () => {
        it("Should get a project from the DB", () => {
            return dao.getProject(project1.identifier).then((project: Project) => {
                chai.expect(project).to.deep.equal(project1)
            })
        })
        it("Should get an exception for an invalid project identifier", () => {
            return dao.getProject(invalidProject.identifier).then(() => {
                throw new Error("getProject should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        it("Should get an exception for a project with corrupted name", () => {
            const projectKey = KeyFactory.createProjectKey(project1.identifier)
            return RedisTestDataProvider.deleteMember(client, projectKey, "name").then(() => {
                return dao.getProject(project1.identifier)
            }).then(() => {
                throw new Error("getProject should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a project with corrupted description", () => {
            const projectKey = KeyFactory.createProjectKey(project1.identifier)
            return RedisTestDataProvider.deleteMember(client, projectKey, "description").then(() => {
                return dao.getProject(project1.identifier)
            }).then(() => {
                throw new Error("getProject should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        it("Should get an exception for a corrupted project", () => {
            const projectKey = KeyFactory.createProjectKey(project1.identifier)
            return RedisTestDataProvider.setValue(client, projectKey, "test").then(() => {
                return dao.getProject(project1.identifier)
            }).then(() => {
                throw new Error("getProject should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
    describe("addProject", () => {
        it("Should add a project in the DB", () => {
            return dao.addProject(project3).then(() => {
                return dao.getProject(project3.identifier)
            }).then((project: Project) => {
                chai.expect(project).to.deep.equal(project3)
            })
        })
        it("Should get an exception when adding an existing project in the DB", () => {
            return dao.addProject(project1).then(() => {
                throw new Error("addProject should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(ExistsError)
            })
        })
        it("Should get an exception when adding a project in a DB with corrupted ids", () => {
            const projectIdsKey = KeyFactory.createGlobalProjectKey("ids")
            return RedisTestDataProvider.setValue(client, projectIdsKey, "test").then(() => {
                return dao.addProject(project3)
            }).then(() => {
                throw new Error("addProject should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
})
