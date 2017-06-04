import * as chai from "chai"
import {ProjectApiProvider} from "../../../../server/old/api/project"
import {Project} from "../../../../common/old/project"
import {project1, project2} from "../../../common/old/testdata"
import {MockGraph} from "../graph/mockgraph"
import {MockDaoBuilder} from "../dao/mockbuilder"
import {RequestError} from "../../../../server/error/request"
import {InternalError} from "../../../../server/dao/error/internal"
import {FakeError} from "../../api/fakeerror"
import {NotFoundError} from "../../../../common/errors/notfound"

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
        xit("Should get a list of projects", () => {
            const expected: Array<Project> = [project1, project2]
            daoBuilder.mockProjectDao.expects("getAllProjects").once()
                .returns(Promise.resolve(expected))

            return apiProvider.getProjects().then((projects: Array<Project>) => {
                chai.expect(projects).to.equal(expected)
            })
        })
        xit("Should get an exception on internal error", () => {
            daoBuilder.mockProjectDao.expects("getAllProjects").once()
                .returns(Promise.reject(new InternalError("Some error")))

            return apiProvider.getProjects().then(() => {
                throw new Error("getProjects should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
            })
        })
        xit("Should get an exception on other error", () => {
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
        xit("Should get a project", () => {
            daoBuilder.mockProjectDao.expects("getProject").once()
                .withExactArgs(project1.identifier)
                .returns(Promise.resolve(project1))

            return apiProvider.getProject(project1.identifier).then((project: Project) => {
                chai.expect(project).to.equal(project1)
            })
        })
        xit("Should get an exception on not found error", () => {
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
        xit("Should get an exception on internal error", () => {
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
        xit("Should get an exception on other error", () => {
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