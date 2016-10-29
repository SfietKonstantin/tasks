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
    describe("getAllProjects", () => {
        it("Should get projects", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const expected: Array<Project> = [
                {
                    identifier: "project1",
                    name: "Project 1",
                    description: "Description 1"
                },
                {
                    identifier: "project2",
                    name: "Project 2",
                    description: "Description 2"
                }
            ]
            mock.expects("getAllProjects").once().returns(Promise.resolve(expected))

            api.getProjects().then((projects: Array<Project>) => {
                chai.expect(projects).to.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting projects 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getAllProjects").once().returns(Promise.reject(new CorruptedError("Some error")))

            api.getProjects().then((projects: Array<Project>) => {
                done(new Error("getProjects should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting projects 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getAllProjects").once().returns(Promise.reject(new InternalError("Some error")))

            api.getProjects().then((projects: Array<Project>) => {
                done(new Error("getProjects should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting projects 3", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getAllProjects").once().returns(Promise.reject(new InternalError("Some error")))

            api.getProjects().then((projects: Array<Project>) => {
                done(new Error("getProjects should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
    describe("getProject", () => {
        it("Should get project", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const expected: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            mock.expects("getProject").once().withExactArgs("project").returns(Promise.resolve(expected))

            api.getProject("project").then((project: Project) => {
                chai.expect(project).to.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting project 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getProject").once().withExactArgs("project").returns(Promise.reject(new CorruptedError("Some error")))

            api.getProject("project").then((project: Project) => {
                done(new Error("getProject should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting project 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getProject").once().withExactArgs("project").returns(Promise.reject(new InternalError("Some error")))

            api.getProject("project").then((project: Project) => {
                done(new Error("getProject should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting project 3", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getProject").once().withExactArgs("project")
                .returns(Promise.reject(new NotFoundError("Some error")))

            api.getProject("project").then((project: Project) => {
                done(new Error("getProject should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting project 4", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            api.getProject({value: "test"}).then((project: Project) => {
                done(new Error("getProject should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})