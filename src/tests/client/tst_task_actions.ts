import * as chai from "chai"
import * as sinon from "sinon"
import { Action } from "redux"
import {
    TaskAction, ModifierAddAction, TASK_REQUEST, TASK_RECEIVE,
    MODIFIER_REQUEST_ADD, fetchTask, addModifier
} from "../../client/task/actions/task"
import {
    ImportantAction, TASK_IMPORTANT_REQUEST, TASK_IMPORTANT_RECEIVE,
    TASK_IMPORTANT_REQUEST_UPDATE, fetchImportant, updateImportant
} from "../../client/task/actions/important"
import { Project, Task } from "../../common/types"
import { ApiTaskResults } from "../../common/apitypes"
import { FakeResponse } from "./fakeresponse"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"
import { project, task, apiTask, modifier } from "./testdata"

describe("Task actions", () => {
    describe("Task", () => {
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
        it("Should GET a project", (done) => {
            // Mock
            const results: ApiTaskResults = {
                project,
                task: apiTask,
                modifiers: [],
                delays: []
            }
            const response = new FakeResponse(true, results)
            fetchMock.once().returns(Promise.resolve(response))

            // Test
            fetchTask("project", "task")(dispatch).then(() => {
                const expected: TaskAction = {
                    type: TASK_RECEIVE,
                    projectIdentifier: "project",
                    taskIdentifier: "task",
                    project,
                    task
                 }
                chai.expect(dispatch.calledTwice).to.true
                chai.expect(dispatch.calledWithExactly(expected)).to.true
                done()
            }).catch((error) => {
                done(error)
            })

            const expected: Action = { type: TASK_REQUEST }
            chai.expect(dispatch.calledOnce).to.true
            chai.expect(dispatch.calledWithExactly(expected)).to.true

            chai.expect(fetchMock.calledOnce).to.true
            chai.expect(fetchMock.args[0]).to.length(1)
            chai.expect(fetchMock.args[0][0]).to.equal("/api/project/project/task/task")
        })
        xit("Should react to GET error from server", (done) => {
        })
        it("Should PUT a modifier", (done) => {
            // Mock
            const results: ApiTaskResults = {
                project,
                task: apiTask,
                modifiers: [],
                delays: []
            }
            const response = new FakeResponse(true, results)
            fetchMock.once().returns(Promise.resolve(response))

            // Test
            addModifier("project", "task", modifier)(dispatch).then(() => {
                const expected: TaskAction = {
                    type: TASK_RECEIVE,
                    projectIdentifier: "project",
                    taskIdentifier: "task",
                    project,
                    task
                 }
                chai.expect(dispatch.calledTwice).to.true
                chai.expect(dispatch.calledWithExactly(expected)).to.true
                done()
            }).catch((error) => {
                done(error)
            })

            const expected: Action = { type: MODIFIER_REQUEST_ADD }
            chai.expect(dispatch.calledOnce).to.true
            chai.expect(dispatch.calledWithExactly(expected)).to.true

            chai.expect(fetchMock.calledOnce).to.true
            chai.expect(fetchMock.args[0]).to.length(2)
            chai.expect(fetchMock.args[0][0]).to.equal("/api/modifier")
            const requestInit = fetchMock.args[0][1] as RequestInit
            chai.expect(requestInit.method).to.equal("PUT")
            const body = JSON.parse(requestInit.body as string)
            chai.expect(body).to.haveOwnProperty("projectIdentifier")
            chai.expect(body.projectIdentifier).to.equal("project")
            chai.expect(body).to.haveOwnProperty("taskIdentifier")
            chai.expect(body.taskIdentifier).to.equal("task")
            chai.expect(body).to.haveOwnProperty("modifier")
            chai.expect(body.modifier).to.deep.equal(modifier)
        })
        xit("Should react to PUT error from server", (done) => {
        })
    })
    describe("Important", () => {
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
        it("Should GET important", (done) => {
            // Mock
            const response = new FakeResponse(true, { important: true })
            fetchMock.once().returns(Promise.resolve(response))

            // Test
            fetchImportant("project", "task")(dispatch).then(() => {
                const expected: ImportantAction = {
                    type: TASK_IMPORTANT_RECEIVE,
                    projectIdentifier: "project",
                    taskIdentifier: "task",
                    important: true
                 }
                chai.expect(dispatch.calledTwice).to.true
                chai.expect(dispatch.calledWithExactly(expected)).to.true
                done()
            }).catch((error) => {
                done(error)
            })

            const expected: Action = { type: TASK_IMPORTANT_REQUEST }
            chai.expect(dispatch.calledOnce).to.true
            chai.expect(dispatch.calledWithExactly(expected)).to.true

            chai.expect(fetchMock.calledOnce).to.true
            chai.expect(fetchMock.args[0]).to.length(1)
            chai.expect(fetchMock.args[0][0]).to.equal("/api/project/project/task/task/important")
        })
        xit("Should react to GET error from server", (done) => {
        })
        it("Should UPDATE important 1", (done) => {
            // Mock
            const response = new FakeResponse(true, { important: true })
            fetchMock.once().returns(Promise.resolve(response))

            // Test
            updateImportant("project", "task", true)(dispatch).then(() => {
                const expected: ImportantAction = {
                    type: TASK_IMPORTANT_RECEIVE,
                    projectIdentifier: "project",
                    taskIdentifier: "task",
                    important: true
                 }
                chai.expect(dispatch.calledTwice).to.true
                chai.expect(dispatch.calledWithExactly(expected)).to.true
                done()
            }).catch((error) => {
                done(error)
            })

            const expected: Action = { type: TASK_IMPORTANT_REQUEST_UPDATE }
            chai.expect(dispatch.calledOnce).to.true
            chai.expect(dispatch.calledWithExactly(expected)).to.true

            chai.expect(fetchMock.calledOnce).to.true
            chai.expect(fetchMock.args[0]).to.length(2)
            chai.expect(fetchMock.args[0][0]).to.equal("/api/project/project/task/task/important")
            const requestInit = fetchMock.args[0][1] as RequestInit
            chai.expect(requestInit.method).to.equal("PUT")
        })
        it("Should UPDATE important 2", (done) => {
            // Mock
            const response = new FakeResponse(true, { important: true })
            fetchMock.once().returns(Promise.resolve(response))

            // Test
            updateImportant("project", "task", false)(dispatch).then(() => {
                const expected: ImportantAction = {
                    type: TASK_IMPORTANT_RECEIVE,
                    projectIdentifier: "project",
                    taskIdentifier: "task",
                    important: true
                 }
                chai.expect(dispatch.calledTwice).to.true
                chai.expect(dispatch.calledWithExactly(expected)).to.true
                done()
            }).catch((error) => {
                done(error)
            })

            const expected: Action = { type: TASK_IMPORTANT_REQUEST_UPDATE }
            chai.expect(dispatch.calledOnce).to.true
            chai.expect(dispatch.calledWithExactly(expected)).to.true

            chai.expect(fetchMock.calledOnce).to.true
            chai.expect(fetchMock.args[0]).to.length(2)
            chai.expect(fetchMock.args[0][0]).to.equal("/api/project/project/task/task/important")
            const requestInit = fetchMock.args[0][1] as RequestInit
            chai.expect(requestInit.method).to.equal("DELETE")
        })
        xit("Should react to UPDATE error from server", (done) => {
        })
    })
})
