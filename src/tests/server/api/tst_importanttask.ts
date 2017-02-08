import * as chai from "chai"
import {ImportantTaskApiProvider} from "../../../server/api/importanttask"
import {project1, taskd1} from "../testdata"
import {MockGraph} from "../graph/mockgraph"
import {MockDaoBuilder} from "../dao/mockbuilder"
import {RequestError} from "../../../server/error/requesterror"
import {InternalError} from "../../../server/dao/error/internal"
import {FakeError} from "./fakeerror"
import {NotFoundError} from "../../../common/errors/notfound"

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
        it("Should get if a task is important (true)", (done) => {
            daoBuilder.mockTaskDao.expects("isTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier)
                .returns(Promise.resolve(true))

            apiProvider.isTaskImportant(project1.identifier, taskd1.identifier).then((important: boolean) => {
                chai.expect(important).to.be.true
                daoBuilder.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get if a task is important (false)", (done) => {
            daoBuilder.mockTaskDao.expects("isTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier)
                .returns(Promise.resolve(false))

            apiProvider.isTaskImportant(project1.identifier, taskd1.identifier).then((important: boolean) => {
                chai.expect(important).to.be.false
                daoBuilder.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on internal error", (done) => {
            daoBuilder.mockTaskDao.expects("isTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier)
                .returns(Promise.reject(new InternalError("Some error")))

            apiProvider.isTaskImportant(project1.identifier, taskd1.identifier).then(() => {
                done(new Error("isTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                daoBuilder.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on not found error", (done) => {
            daoBuilder.mockTaskDao.expects("isTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier)
                .returns(Promise.reject(new NotFoundError("Some error")))

            apiProvider.isTaskImportant(project1.identifier, taskd1.identifier).then(() => {
                done(new Error("isTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                daoBuilder.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on other error", (done) => {
            daoBuilder.mockTaskDao.expects("isTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier)
                .returns(Promise.reject(new FakeError("Some error")))

            apiProvider.isTaskImportant(project1.identifier, taskd1.identifier).then(() => {
                done(new Error("isTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
                daoBuilder.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
    describe("setTaskImportant", () => {
        it("Should set if a task is important (true)", (done) => {
            daoBuilder.mockTaskDao.expects("setTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier, true)
                .returns(Promise.resolve(true))

            apiProvider.setTaskImportant(project1.identifier, taskd1.identifier, true).then((important: boolean) => {
                chai.expect(important).to.be.true
                daoBuilder.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should set if a task is important (false)", (done) => {
            daoBuilder.mockTaskDao.expects("setTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier, false)
                .returns(Promise.resolve(true))

            apiProvider.setTaskImportant(project1.identifier, taskd1.identifier, false).then((important: boolean) => {
                chai.expect(important).to.be.false
                daoBuilder.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on internal error", (done) => {
            daoBuilder.mockTaskDao.expects("setTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier, true)
                .returns(Promise.reject(new InternalError("Some error")))

            apiProvider.setTaskImportant(project1.identifier, taskd1.identifier, true).then(() => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                daoBuilder.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on not found error", (done) => {
            daoBuilder.mockTaskDao.expects("setTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier, true)
                .returns(Promise.reject(new NotFoundError("Some error")))

            apiProvider.setTaskImportant(project1.identifier, taskd1.identifier, true).then(() => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                daoBuilder.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on other error", (done) => {
            daoBuilder.mockTaskDao.expects("setTaskImportant").once()
                .withExactArgs(project1.identifier, taskd1.identifier, true)
                .returns(Promise.reject(new FakeError("Some error")))

            apiProvider.setTaskImportant(project1.identifier, taskd1.identifier, true).then(() => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
                daoBuilder.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
