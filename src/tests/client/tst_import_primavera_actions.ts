import * as chai from "chai"
import * as sinon from "sinon"
import {
    ProjectAction, PROJECT_DEFINE, PROJECT_REQUEST_ADD, PROJECT_RECEIVE_ADD, PROJECT_RECEIVE_ADD_FAILURE,
    defineProject, addProject
} from "../../client/imports/primavera/actions/project"
import {
    TasksAction, TASKS_DISMISS_INVALID_FORMAT, importTasks, dismissInvalidTasksFormat
} from "../../client/imports/primavera/actions/tasks"
import {
    RelationsAction, RELATIONS_IMPORT_BEGIN, RELATIONS_IMPORT_END,
    RELATIONS_IMPORT_INVALID_FORMAT, RELATIONS_DISMISS_INVALID_FORMAT,
    importRelations, dismissInvalidRelationsFormat
} from "../../client/imports/primavera/actions/relations"
import { Project } from "../../common/types"
import { FakeResponse } from "./fakeresponse"
import { FakeFile } from "./fakefile"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"

describe("Primavera actions", () => {
    describe("Project", () => {
        describe("Synchronous", () => {
            it("Should create PROJECT_DEFINE", () => {
                chai.expect(defineProject("identifier", "Name", "Description")).to.deep.equal({
                    type: PROJECT_DEFINE,
                    identifier: "identifier",
                    name: "Name",
                    description: "Description"
                })
            })
        })
        describe("Asynchronous", () => {
            let sandbox: Sinon.SinonSandbox
            let dispatch: Sinon.SinonSpy
            let fetchMock: Sinon.SinonExpectation

            beforeEach(() => {
                addFakeGlobal()
                sandbox = sinon.sandbox.create()
                dispatch = sinon.spy()
                fetchMock = sandbox.mock(global).expects("fetch")
            })
            afterEach(() => {
                sandbox.restore()
                clearFakeGlobal()
            })
            it("Should PUT a project", (done) => {
                // Mock
                const project: Project = {
                    identifier: "identifier",
                    name: "Name",
                    description: "Description"
                }
                const response = new FakeResponse(true, {})
                fetchMock.once().returns(Promise.resolve(response))

                // Test
                addProject(project)(dispatch).then(() => {
                    chai.expect(dispatch.calledTwice).to.true
                    chai.expect(dispatch.calledWith({type: PROJECT_RECEIVE_ADD})).to.true
                    done()
                }).catch((error) => {
                    done(error)
                })

                chai.expect(dispatch.calledOnce).to.true
                chai.expect(dispatch.calledWith({type: PROJECT_REQUEST_ADD})).to.true

                chai.expect(fetchMock.calledOnce).to.true
                chai.expect(fetchMock.args).to.length(1)
                chai.expect(fetchMock.args[0]).to.length(2)
                chai.expect(fetchMock.args[0][0]).to.equal("/api/project")
                const requestInit = fetchMock.args[0][1] as RequestInit
                chai.expect(requestInit.method).to.equal("PUT")
                const body = JSON.parse(requestInit.body as string)
                chai.expect(body).to.haveOwnProperty("project")
                chai.expect(body.project).to.deep.equal(project)

            })
            it("Should react to PUT error from server", (done) => {
                // Mock
                const response = new FakeResponse(false, {error: "Error message"})
                fetchMock.once().returns(Promise.resolve(response))

                // Test
                addProject({
                    identifier: "identifier",
                    name: "Name",
                    description: "Description"
                })(dispatch).then(() => {
                    chai.expect(dispatch.calledTwice).to.true
                    chai.expect(dispatch.calledWith({
                        type: PROJECT_RECEIVE_ADD_FAILURE,
                        message: "Error message"
                    })).to.true
                    done()
                }).catch((error) => {
                    done(error)
                })

                chai.expect(dispatch.calledOnce).to.true
                chai.expect(dispatch.calledWith({type: PROJECT_REQUEST_ADD})).to.true
            })
            it("Should react to PUT error from server without cause", (done) => {
                // Mock
                const response = new FakeResponse(false, {})
                fetchMock.once().returns(Promise.resolve(response))

                // Test
                addProject({
                    identifier: "identifier",
                    name: "Name",
                    description: "Description"
                })(dispatch).then(() => {
                    chai.expect(dispatch.calledTwice).to.true
                    chai.expect(dispatch.calledWith({
                        type: PROJECT_RECEIVE_ADD_FAILURE,
                        message: "Unknown error"
                    })).to.true
                    done()
                }).catch((error) => {
                    done(error)
                })

                chai.expect(dispatch.calledOnce).to.true
                chai.expect(dispatch.calledWith({type: PROJECT_REQUEST_ADD})).to.true
            })
            it("Should react to PUT result JSON parsing error", (done) => {
                // Mock
                const response = new FakeResponse(false, {}, true)
                fetchMock.once().returns(Promise.resolve(response))

                // Test
                addProject({
                    identifier: "identifier",
                    name: "Name",
                    description: "Description"
                })(dispatch).then(() => {
                    chai.expect(dispatch.calledTwice).to.true
                    chai.expect(dispatch.calledWith({
                        type: PROJECT_RECEIVE_ADD_FAILURE,
                        message: "Unknown error"
                    })).to.true
                    done()
                }).catch((error) => {
                    done(error)
                })

                chai.expect(dispatch.calledOnce).to.true
                chai.expect(dispatch.calledWith({type: PROJECT_REQUEST_ADD})).to.true
            })
        })
    })
    describe("Tasks", () => {
        describe("Synchronous", () => {
            it("Should create TASKS_DISMISS_INVALID_FORMAT", () => {
                chai.expect(dismissInvalidTasksFormat()).to.deep.equal({
                    type: TASKS_DISMISS_INVALID_FORMAT
                })
            })
        })
        describe("Asynchronous", () => {
            it("Should parse a file", (done) => {
                done()
            })
        })
    })
    describe("Relations", () => {
        describe("Synchronous", () => {
            it("Should create RELATIONS_DISMISS_INVALID_FORMAT", () => {
                chai.expect(dismissInvalidRelationsFormat()).to.deep.equal({
                    type: RELATIONS_DISMISS_INVALID_FORMAT
                })
            })
        })
        describe("Asynchronous", () => {
            /*it("Should parse a file", (done) => {
                const dispatch = sinon.spy()
                let file = new FakeFile("text/csv")
                importTasks(file)(dispatch).then(() => {
                    done()
                }).catch((error) => {
                    done(error)
                })
            })*/
        })
    })
})
