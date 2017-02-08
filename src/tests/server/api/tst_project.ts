import * as chai from "chai"
import {ProjectApiProvider} from "../../../server/api/project"
import {Project} from "../../../common/project"
import {project1, project2} from "../testdata"
import {MockGraph} from "../graph/mockgraph"
import {MockDaoBuilder} from "../dao/mockbuilder"
import {RequestError} from "../../../server/error/requesterror"
import {InternalError} from "../../../server/dao/error/internal"
import {FakeError} from "./fakeerror"
import {NotFoundError} from "../../../common/errors/notfound"

describe("API Project", () => {
    let daoBuilder: MockDaoBuilder
    let graph: MockGraph
    let apiProvider: ProjectApiProvider
    beforeEach(() => {
        daoBuilder = new MockDaoBuilder()
        graph = new MockGraph()
        apiProvider = new ProjectApiProvider(daoBuilder, graph)
    })
    afterEach(() => {
        daoBuilder.verify()
    })
    describe("getProjectIdentifier", () => {
        it("Should get an exception for an invalid input", (done) => {
            try {
                ProjectApiProvider.getProjectIdentifier({value: "test"})
                done(new Error("getProjectIdentifier should not be a success"))
            } catch (error) {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }
        })
    })
    describe("getAllProjects", () => {
        it("Should get a list of projects", (done) => {
            const expected: Array<Project> = [project1, project2]
            daoBuilder.mockProjectDao.expects("getAllProjects").once()
                .returns(Promise.resolve(expected))

            apiProvider.getProjects().then((projects: Array<Project>) => {
                chai.expect(projects).to.equal(expected)
                daoBuilder.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on internal error", (done) => {
            daoBuilder.mockProjectDao.expects("getAllProjects").once()
                .returns(Promise.reject(new InternalError("Some error")))

            apiProvider.getProjects().then(() => {
                done(new Error("getProjects should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on other error", (done) => {
            daoBuilder.mockProjectDao.expects("getAllProjects").once()
                .returns(Promise.reject(new FakeError("Some error")))

            apiProvider.getProjects().then(() => {
                done(new Error("getProjects should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
    describe("getProject", () => {
        it("Should get a project", (done) => {
            daoBuilder.mockProjectDao.expects("getProject").once()
                .withExactArgs(project1.identifier)
                .returns(Promise.resolve(project1))

            apiProvider.getProject(project1.identifier).then((project: Project) => {
                chai.expect(project).to.equal(project1)
                daoBuilder.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on not found error", (done) => {
            daoBuilder.mockProjectDao.expects("getProject").once()
                .withExactArgs(project1.identifier)
                .returns(Promise.reject(new NotFoundError("Some error")))

            apiProvider.getProject(project1.identifier).then(() => {
                done(new Error("getProject should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on internal error", (done) => {
            daoBuilder.mockProjectDao.expects("getProject").once()
                .withExactArgs(project1.identifier)
                .returns(Promise.reject(new InternalError("Some error")))

            apiProvider.getProject(project1.identifier).then(() => {
                done(new Error("getProject should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on other error", (done) => {
            daoBuilder.mockProjectDao.expects("getProject").once()
                .withExactArgs(project1.identifier)
                .returns(Promise.reject(new FakeError("Some error")))

            apiProvider.getProject(project1.identifier).then(() => {
                done(new Error("getProject should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
