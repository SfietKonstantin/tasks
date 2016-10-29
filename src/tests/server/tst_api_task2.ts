import * as chai from "chai"
import * as sinon from "sinon"
import { Project, Task, Modifier } from "../../common/types"
import { NotFoundError } from "../../common/errors"
import { ApiTask } from "../../common/apitypes"
import { IDataProvider, CorruptedError, InternalError } from "../../server/core/data/idataprovider"
import { Api, RequestError } from "../../server/core/api"
import { ProjectNode, TaskNode } from "../../server/core/graph/graph"
import { FakeDataProvider } from "./fakedataprovider"
import { FakeGraph } from "./fakegraph"
import * as maputils from "../../common/maputils"

describe("API", () => {
    describe("isTaskImportant", () => {
        it("Should get if task is important 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("isTaskImportant").once().withExactArgs("project", "task").returns(Promise.resolve(true))

            api.isTaskImportant("project", "task").then((important: boolean) => {
                chai.expect(important).to.be.true
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get if task is important 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("isTaskImportant").once().withExactArgs("project", "task").returns(Promise.resolve(false))

            api.isTaskImportant("project", "task").then((important: boolean) => {
                chai.expect(important).to.be.false
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting if task is important 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("isTaskImportant").once().withExactArgs("project", "task")
                .returns(Promise.reject(new InternalError("Some error")))

            api.isTaskImportant("project", "task").then(() => {
                done(new Error("isTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting if task is important 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("isTaskImportant").once().withExactArgs("project", "task")
                .returns(Promise.reject(new NotFoundError("Some error")))

            api.isTaskImportant("project", "task").then(() => {
                done(new Error("isTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting if task is important 3", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            api.isTaskImportant({ test: "test" }, "task").then(() => {
                done(new Error("isTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting if task is important 4", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            api.isTaskImportant("project", { test: "test" }).then(() => {
                done(new Error("isTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
    describe("setTaskImportant", () => {
        it("Should set if task is important 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("setTaskImportant").once().withExactArgs("project", "task", true)
                .returns(Promise.resolve(true))

            api.setTaskImportant("project", "task", true).then((important: boolean) => {
                chai.expect(important).to.be.true
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should set if task is important 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("setTaskImportant").once().withExactArgs("project", "task", false)
                .returns(Promise.resolve(false))

            api.setTaskImportant("project", "task", false).then((important: boolean) => {
                chai.expect(important).to.be.false
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when setting if task is important 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("setTaskImportant").once().withExactArgs("project", "task", true)
                .returns(Promise.reject(new CorruptedError("Some error")))

            api.setTaskImportant("project", "task", true).then(() => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when setting if task is important 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("setTaskImportant").once().withExactArgs("project", "task", true)
                .returns(Promise.reject(new InternalError("Some error")))

            api.setTaskImportant("project", "task", true).then(() => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when setting if task is important 3", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("setTaskImportant").once().withExactArgs("project", "task", true)
                .returns(Promise.reject(new NotFoundError("Some error")))

            api.setTaskImportant("project", "task", true).then(() => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when setting if task is important 4", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            api.setTaskImportant({ test: "test" }, "task", true).then(() => {
                done(new CorruptedError("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when setting if task is important 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("setTaskImportant").once().withExactArgs("project", "task", false)
                .returns(Promise.reject(new InternalError("Some error")))

            api.setTaskImportant("project", "task", false).then(() => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when setting if task is important 5", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            api.setTaskImportant("project", { test: "test" }, true).then(() => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            })
        })
    })
})
