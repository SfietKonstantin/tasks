import * as chai from "chai"
import {ImportantTaskApiProvider} from "../../../../server/old/api/importanttask"
import {project1, taskd1} from "../../../common/old/testdata"
import {MockGraph} from "../graph/mockgraph"
import {MockDaoBuilder} from "../dao/mockbuilder"
import {RequestError} from "../../../../server/error/request"
import {InternalError} from "../../../../server/dao/error/internal"
import {FakeError} from "../../api/fakeerror"
import {NotFoundError} from "../../../../common/errors/notfound"

describe("API important task", () => {
    let daoBuilder: MockDaoBuilder
    let graph: MockGraph
    let apiProvider: ImportantTaskApiProvider
    beforeEach(() => {
        daoBuilder = new MockDaoBuilder()
        graph = new MockGraph()
        apiProvider = new ImportantTaskApiProvider(daoBuilder, graph)
    })
    afterEach(() => {
        daoBuilder.verify()
    })
    describe("isTaskImportant", () => {
        xit("Should get if a task is important (true)", () => {
            daoBuilder.mockTaskDao.expects("isTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier)
                .returns(Promise.resolve(true))

            return apiProvider.isTaskImportant(project1.identifier, taskd1.identifier).then((important: boolean) => {
                chai.expect(important).to.be.true
            })
        })
        xit("Should get if a task is important (false)", () => {
            daoBuilder.mockTaskDao.expects("isTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier)
                .returns(Promise.resolve(false))

            return apiProvider.isTaskImportant(project1.identifier, taskd1.identifier).then((important: boolean) => {
                chai.expect(important).to.be.false
            })
        })
        xit("Should get an exception on internal error", () => {
            daoBuilder.mockTaskDao.expects("isTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier)
                .returns(Promise.reject(new InternalError("Some error")))

            return apiProvider.isTaskImportant(project1.identifier, taskd1.identifier).then(() => {
                throw new Error("isTaskImportant should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
            })
        })
        xit("Should get an exception on not found error", () => {
            daoBuilder.mockTaskDao.expects("isTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier)
                .returns(Promise.reject(new NotFoundError("Some error")))

            return apiProvider.isTaskImportant(project1.identifier, taskd1.identifier).then(() => {
                throw new Error("isTaskImportant should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
            })
        })
        xit("Should get an exception on other error", () => {
            daoBuilder.mockTaskDao.expects("isTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier)
                .returns(Promise.reject(new FakeError("Some error")))

            return apiProvider.isTaskImportant(project1.identifier, taskd1.identifier).then(() => {
                throw new Error("isTaskImportant should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
            })
        })
    })
    describe("setTaskImportant", () => {
        xit("Should set if a task is important (true)", () => {
            daoBuilder.mockTaskDao.expects("setTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier, true)
                .returns(Promise.resolve(true))

            return apiProvider.setTaskImportant(project1.identifier, taskd1.identifier, true)
                .then((important: boolean) => {
                chai.expect(important).to.be.true
            })
        })
        xit("Should set if a task is important (false)", () => {
            daoBuilder.mockTaskDao.expects("setTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier, false)
                .returns(Promise.resolve(true))

            return apiProvider.setTaskImportant(project1.identifier, taskd1.identifier, false)
                .then((important: boolean) => {
                chai.expect(important).to.be.false
            })
        })
        xit("Should get an exception on internal error", () => {
            daoBuilder.mockTaskDao.expects("setTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier, true)
                .returns(Promise.reject(new InternalError("Some error")))

            return apiProvider.setTaskImportant(project1.identifier, taskd1.identifier, true).then(() => {
                throw new Error("setTaskImportant should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
            })
        })
        xit("Should get an exception on not found error", () => {
            daoBuilder.mockTaskDao.expects("setTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier, true)
                .returns(Promise.reject(new NotFoundError("Some error")))

            return apiProvider.setTaskImportant(project1.identifier, taskd1.identifier, true).then(() => {
                throw new Error("setTaskImportant should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
            })
        })
        xit("Should get an exception on other error", () => {
            daoBuilder.mockTaskDao.expects("setTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier, true)
                .returns(Promise.reject(new FakeError("Some error")))

            return apiProvider.setTaskImportant(project1.identifier, taskd1.identifier, true).then(() => {
                throw new Error("setTaskImportant should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
            })
        })
    })
})