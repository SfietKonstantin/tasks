import * as chai from "chai"
import * as sinon from "sinon"
import { Action } from "redux"
import { ErrorAction } from "../../client/common/actions/errors"
import {
    ProjectAction, PROJECT_REQUEST, PROJECT_RECEIVE,
    PROJECT_RECEIVE_FAILURE, fetchProject
} from "../../client/project/actions/project"
import { TaskFilters } from "../../client/project/types"
import {
    TasksAction, TaskFiltersAction, TASKS_REQUEST, TASKS_RECEIVE,
    TASKS_RECEIVE_FAILURE, TASKS_FILTER_DISPLAY, fetchTasks, filterTasks
} from "../../client/project/actions/tasks"
import { MilestoneFilterMode } from "../../client/common/tasklistfilters"
import { Project } from "../../common/types"
import { ApiTask } from "../../common/apitypes"
import { FakeResponse } from "./fakeresponse"
import { addFakeGlobal, clearFakeGlobal } from "./fakeglobal"
import { project } from "./testdata"

describe("Project actions", () => {
    describe("Project", () => {
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
            const response = new FakeResponse(true, project)
            fetchMock.once().returns(Promise.resolve(response))

            // Test
            fetchProject("identifier")(dispatch).then(() => {
                const expected: ProjectAction = {
                    type: PROJECT_RECEIVE,
                    projectIdentifier: "identifier",
                    project
                 }
                chai.expect(dispatch.calledTwice).to.true
                chai.expect(dispatch.calledWithExactly(expected)).to.true
                done()
            }).catch((error) => {
                done(error)
            })

            const expected: Action = { type: PROJECT_REQUEST }
            chai.expect(dispatch.calledOnce).to.true
            chai.expect(dispatch.calledWithExactly(expected)).to.true

            chai.expect(fetchMock.calledOnce).to.true
            chai.expect(fetchMock.args[0]).to.length(1)
            chai.expect(fetchMock.args[0][0]).to.equal("/api/project/identifier")
        })
        it("Should react to GET error from server", (done) => {
            // Mock
            const response = new FakeResponse(false, {error: "Error message"})
            fetchMock.once().returns(Promise.resolve(response))

            // Test
            fetchProject("identifier")(dispatch).then(() => {
                const expected: Action = { type: PROJECT_RECEIVE_FAILURE }
                chai.expect(dispatch.calledTwice).to.true
                chai.expect(dispatch.calledWithExactly(expected)).to.true
                done()
            }).catch((error) => {
                done(error)
            })

            const expected: Action = { type: PROJECT_REQUEST }
            chai.expect(dispatch.calledOnce).to.true
            chai.expect(dispatch.calledWithExactly({type: PROJECT_REQUEST})).to.true
        })
    })
    describe("Tasks", () => {
        describe("Synchronous", () => {
            let sandbox: Sinon.SinonSandbox
            let localStorageSetterMock: Sinon.SinonExpectation
            beforeEach(() => {
                addFakeGlobal()
                sandbox = sinon.sandbox.create()
                localStorageSetterMock = sandbox.mock(global.localStorage).expects("setItem")
                sandbox.useFakeTimers(new Date(2016, 2, 6).getTime())
            })
            afterEach(() => {
                sandbox.restore()
                clearFakeGlobal()
            })
            it("Should create PROJECT_DEFINE", () => {
                const filters: TaskFilters = {
                    notStartedChecked: false,
                    inProgressChecked: true,
                    doneChecked: false,
                    milestoneFilterMode: MilestoneFilterMode.TasksOnly,
                    text: "hello"
                }
                const expected: TaskFiltersAction = {
                    type: TASKS_FILTER_DISPLAY,
                    filters,
                    today: new Date(2016, 2, 6)
                }
                chai.expect(filterTasks("project", filters)).to.deep.equal(expected)
                const args = {
                    notStartedChecked: false,
                    inProgressChecked: true,
                    doneChecked: false
                }
                chai.expect(localStorageSetterMock.calledOnce).to.true
                chai.expect(localStorageSetterMock.calledWithExactly("project", JSON.stringify(args))).to.true
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
            it("Should GET tasks", (done) => {
                // Mock
                const tasks: Array<ApiTask> = [
                    {
                        identifier: "task1",
                        name: "Task 1",
                        description: "Description 1",
                        estimatedStartDate: new Date(2016, 9, 1).toISOString(),
                        estimatedDuration: 30,
                        startDate: new Date(2016, 9, 1).toISOString(),
                        duration: 30
                    },
                    {
                        identifier: "task2",
                        name: "Task 2",
                        description: "Description 2",
                        estimatedStartDate: new Date(2016, 10, 1).toISOString(),
                        estimatedDuration: 15,
                        startDate: new Date(2016, 10, 1).toISOString(),
                        duration: 15
                    }
                ]
                const response = new FakeResponse(true, tasks)
                fetchMock.once().returns(Promise.resolve(response))

                // Test
                fetchTasks("identifier")(dispatch).then(() => {
                    const expected: TasksAction = {
                        type: TASKS_RECEIVE,
                        tasks
                    }
                    chai.expect(dispatch.calledTwice).to.true
                    chai.expect(dispatch.calledWithExactly(expected)).to.true
                    done()
                }).catch((error) => {
                    done(error)
                })

                const expected: Action = { type: TASKS_REQUEST }
                chai.expect(dispatch.calledOnce).to.true
                chai.expect(dispatch.calledWithExactly(expected)).to.true

                chai.expect(fetchMock.calledOnce).to.true
                chai.expect(fetchMock.args[0]).to.length(1)
                chai.expect(fetchMock.args[0][0]).to.equal("/api/project/identifier/tasks")
            })
            it("Should react to GET error from server", (done) => {
                // Mock
                const response = new FakeResponse(false, {error: "Error message"})
                fetchMock.once().returns(Promise.resolve(response))

                // Test
                fetchTasks("identifier")(dispatch).then(() => {
                    const expected: Action = { type: TASKS_RECEIVE_FAILURE }
                    chai.expect(dispatch.calledTwice).to.true
                    chai.expect(dispatch.calledWithExactly(expected)).to.true
                    done()
                }).catch((error) => {
                    done(error)
                })

                const expected: Action = { type: TASKS_REQUEST }
                chai.expect(dispatch.calledOnce).to.true
                chai.expect(dispatch.calledWithExactly(expected)).to.true
            })
        })
    })
})
