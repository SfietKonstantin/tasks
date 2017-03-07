import * as chai from "chai"
import {ProjectApiProvider} from "../../../server/api/project"
import {Project} from "../../../common/project"
import {project1, project2} from "../../common/testdata"
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
    describe("getAllProjects", () => {
        it("Should get a list of projects", () => {
            const expected: Array<Project> = [project1, project2]
            daoBuilder.mockProjectDao.expects("getAllProjects").once()
                .returns(Promise.resolve(expected))

            return apiProvider.getProjects().then((projects: Array<Project>) => {
                chai.expect(projects).to.equal(expected)
            })
        })
        it("Should get an exception on internal error", () => {
            daoBuilder.mockProjectDao.expects("getAllProjects").once()
                .returns(Promise.reject(new InternalError("Some error")))

            return apiProvider.getProjects().then(() => {
                throw new Error("getProjects should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
            })
        })
        it("Should get an exception on other error", () => {
            daoBuilder.mockProjectDao.expects("getAllProjects").once()
                .returns(Promise.reject(new FakeError("Some error")))

            return apiProvider.getProjects().then(() => {
                throw new Error("getProjects should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
            })
        })
    })
    describe("getProject", () => {
        it("Should get a project", () => {
            daoBuilder.mockProjectDao.expects("getProject").once()
                .withExactArgs(project1.identifier)
                .returns(Promise.resolve(project1))

            return apiProvider.getProject(project1.identifier).then((project: Project) => {
                chai.expect(project).to.equal(project1)
            })
        })
        it("Should get an exception on not found error", () => {
            daoBuilder.mockProjectDao.expects("getProject").once()
                .withExactArgs(project1.identifier)
                .returns(Promise.reject(new NotFoundError("Some error")))

            return apiProvider.getProject(project1.identifier).then(() => {
                throw new Error("getProject should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
            })
        })
        it("Should get an exception on internal error", () => {
            daoBuilder.mockProjectDao.expects("getProject").once()
                .withExactArgs(project1.identifier)
                .returns(Promise.reject(new InternalError("Some error")))

            return apiProvider.getProject(project1.identifier).then(() => {
                throw new Error("getProject should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
            })
        })
        it("Should get an exception on other error", () => {
            daoBuilder.mockProjectDao.expects("getProject").once()
                .withExactArgs(project1.identifier)
                .returns(Promise.reject(new FakeError("Some error")))

            return apiProvider.getProject(project1.identifier).then(() => {
                throw new Error("getProject should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
            })
        })
    })
})
