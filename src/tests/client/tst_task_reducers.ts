import * as chai from "chai"
import * as sinon from "sinon"
import * as main from "../../client/task/reducers/main"
import { requestTask, receiveTask, requestAddModifier } from "../../client/task/actions/task"
import { requestImportant, receiveImportant, requestUpdateImportant } from "../../client/task/actions/important"
import { State, TaskState, ImportantState } from "../../client/task/types"
import { Project, Task } from "../../common/types"
import { FakeResponse } from "./fakeresponse"
import { cloneObject, cloneArray, project, task, modifier } from "./testdata"
import * as states from "../../client/task/states"

describe("Task reducers", () => {
    let dispatch: Sinon.SinonSpy
    let initialState1: State
    let initialState2: State
    beforeEach(() => {
        dispatch = sinon.spy()
        initialState1 = {
            projectIdentifier: "",
            taskIdentifier: "",
            task: cloneObject(states.taskState),
            important: cloneObject(states.importantState)
        }
        initialState2 = {
            projectIdentifier: "project",
            taskIdentifier: "task",
            task: {
                isFetching: true,
                project: cloneObject(project),
                task: cloneObject(task)
            },
            important: {
                isFetching: true,
                important: true
            }
        }
    })
    describe("Task reducers", () => {
        it("Should reduce TASK_REQUEST", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, requestTask())
                chai.expect(state.task.isFetching).to.true
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASK_RECEIVE", () => {
            const checkState = (initialState: State) => {
                const action = receiveTask("project", "task", cloneObject(project), cloneObject(task))
                const state = main.mainReducer(initialState, action)
                chai.expect(state.task.isFetching).to.false
                chai.expect(state.task.project).to.deep.equal(project)
                chai.expect(state.task.task).to.deep.equal(task)
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        xit("Should reduce TASK_RECEIVE_FAILURE", () => {
        })
        it("Should reduce MODIFIER_REQUEST_ADD", () => {
            const checkState = (initialState: State) => {
                const action = requestAddModifier()
                const state = main.mainReducer(initialState, action)
                chai.expect(state.task.isFetching).to.true
            }
            checkState(initialState1)
            checkState(initialState2)
        })
    })
    describe("Important reducers", () => {
        it("Should reduce TASK_IMPORTANT_REQUEST", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, requestImportant())
                chai.expect(state.important.isFetching).to.true
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASK_IMPORTANT_RECEIVE 1", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, receiveImportant("project", "task", true))
                chai.expect(state.important.isFetching).to.false
                chai.expect(state.important.important).to.true
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASK_IMPORTANT_RECEIVE 1", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, receiveImportant("project", "task", false))
                chai.expect(state.important.isFetching).to.false
                chai.expect(state.important.important).to.false
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        xit("Should reduce TASK_IMPORTANT_RECEIVE_FAILURE", () => {
        })
        it("Should reduce TASK_IMPORTANT_REQUEST_UPDATE", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, requestUpdateImportant())
                chai.expect(state.important.isFetching).to.true
            }
            checkState(initialState1)
            checkState(initialState2)
        })
    })
    /*
    describe("Components", () => {
        describe("TaskBrowser", () => {
            it("Should map the states", () => {
                const checkMapped = (initialState: State) => {
                    const mapped = taskBrowser.mapStateToProps(initialState)
                    chai.expect(mapped.projectIdentifier).to.deep.equal(initialState.projectIdentifier)
                    chai.expect(mapped.tasks).to.deep.equal(initialState.tasks.taskList.displayedTasks)
                    chai.expect(mapped.filters).to.deep.equal(initialState.tasks.taskList.filters)
                }
                checkMapped(initialState1)
                checkMapped(initialState2)
            })
        })
    })
    */
})
