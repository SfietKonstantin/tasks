import * as chai from "chai"
import * as sinon from "sinon"
import * as main from "../../client/project/reducers/main"
import { requestProject, receiveProject, receiveFailureProject } from "../../client/project/actions/project"
import { requestTasks, receiveTasks, receiveFailureTasks, filterTasks } from "../../client/project/actions/tasks"
import {
    State, ProjectState, TaskFilters, TasksState
} from "../../client/project/types"
import { MilestoneFilterMode } from "../../client/common/tasklistfilter"
import { Project } from "../../common/types"
import { ApiTask } from "../../common/apitypes"
import { FakeResponse } from "./fakeresponse"
import { cloneObject, project, apiTasks, cloneArray } from "./testdata"
import * as states from "../../client/project/states"

describe("Project reducers", () => {
    let sandbox: Sinon.SinonSandbox
    let dispatch: Sinon.SinonSpy
    let initialState1: State
    let initialState2: State
    beforeEach(() => {
        sandbox = sinon.sandbox.create()
        sandbox.useFakeTimers(new Date(2016, 9, 1).getTime())
        dispatch = sinon.spy()
        initialState1 = {
            projectIdentifier: "",
            project: cloneObject(states.project),
            tasks: cloneObject(states.tasks)
        }
        initialState2 = {
            projectIdentifier: "project",
            project: {
                isFetching: true,
                project: cloneObject(project)
            },
            tasks: {
                isFetching: true,
                tasks: cloneArray(apiTasks),
                filters: {
                    notStartedChecked: true,
                    inProgressChecked: true,
                    doneChecked: true,
                    filters: {
                        milestoneFilterMode: MilestoneFilterMode.TasksOnly,
                        text: "Some filter"
                    }
                },
                today: new Date(2016, 9, 1),
                filteredTasks: cloneArray(apiTasks)
            }
        }
    })
    afterEach(() => {
        sandbox.restore()
    })
    describe("Project reducers", () => {
        it("Should reduce PROJECT_REQUEST", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, requestProject("identifier"))
                chai.expect(state.project.isFetching).to.true
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce PROJECT_RECEIVE", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, receiveProject("identifier", cloneObject(project)))
                chai.expect(state.project.isFetching).to.false
                chai.expect(state.project.project).to.deep.equal(project)
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce PROJECT_RECEIVE_FAILURE", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, receiveFailureProject())
                chai.expect(state.project.isFetching).to.false
            }
            checkState(initialState1)
            checkState(initialState2)
        })
    })
    describe("Tasks reducers", () => {
        it("Should reduce TASKS_REQUEST", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, requestTasks())
                chai.expect(state.tasks.isFetching).to.true
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_RECEIVE", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, receiveTasks(cloneArray(apiTasks)))
                const expected: Array<ApiTask> = [
                    apiTasks[0],
                    apiTasks[3],
                    apiTasks[1],
                    apiTasks[4],
                    apiTasks[2]
                ]
                chai.expect(state.tasks.isFetching).to.false
                chai.expect(state.tasks.tasks).to.deep.equal(expected)
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_RECEIVE_FAILURE", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, receiveFailureTasks())
                chai.expect(state.tasks.isFetching).to.false
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_FILTER_DISPLAY 1", () => {
            const checkState = (initialState: State) => {
                initialState.tasks.tasks = cloneArray(apiTasks)
                const filters: TaskFilters = {
                    notStartedChecked: true,
                    inProgressChecked: false,
                    doneChecked: false,
                    filters: {
                        milestoneFilterMode: MilestoneFilterMode.NoFilter,
                        text: ""
                    }
                }
                const state = main.mainReducer(initialState, filterTasks("identifier", filters))
                chai.expect(state.tasks.filters).to.deep.equal(filters)
                chai.expect(state.tasks.today).to.deep.equal(new Date(2016, 9, 1))
                chai.expect(state.tasks.filteredTasks).to.deep.equal([
                    apiTasks[4],
                    apiTasks[2]
                ])
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_FILTER_DISPLAY 2", () => {
            const checkState = (initialState: State) => {
                initialState.tasks.tasks = cloneArray(apiTasks)
                const filters: TaskFilters = {
                    notStartedChecked: false,
                    inProgressChecked: true,
                    doneChecked: false,
                    filters: {
                        milestoneFilterMode: MilestoneFilterMode.NoFilter,
                        text: ""
                    }
                }
                const state = main.mainReducer(initialState, filterTasks("identifier", filters))
                chai.expect(state.tasks.filters).to.deep.equal(filters)
                chai.expect(state.tasks.today).to.deep.equal(new Date(2016, 9, 1))
                chai.expect(state.tasks.filteredTasks).to.deep.equal([ apiTasks[1] ])
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_FILTER_DISPLAY 3", () => {
            const checkState = (initialState: State) => {
                initialState.tasks.tasks = cloneArray(apiTasks)
                const filters: TaskFilters = {
                    notStartedChecked: false,
                    inProgressChecked: false,
                    doneChecked: true,
                    filters: {
                        milestoneFilterMode: MilestoneFilterMode.NoFilter,
                        text: ""
                    }
                }
                const state = main.mainReducer(initialState, filterTasks("identifier", filters))
                chai.expect(state.tasks.filters).to.deep.equal(filters)
                chai.expect(state.tasks.today).to.deep.equal(new Date(2016, 9, 1))
                chai.expect(state.tasks.filteredTasks).to.deep.equal([
                    apiTasks[0],
                    apiTasks[3]
                ])
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_FILTER_DISPLAY 4", () => {
            const checkState = (initialState: State) => {
                initialState.tasks.tasks = cloneArray(apiTasks)
                const filters: TaskFilters = {
                    notStartedChecked: true,
                    inProgressChecked: true,
                    doneChecked: true,
                    filters: {
                        milestoneFilterMode: MilestoneFilterMode.TasksOnly,
                        text: ""
                    }
                }
                const state = main.mainReducer(initialState, filterTasks("identifier", filters))
                chai.expect(state.tasks.filters).to.deep.equal(filters)
                chai.expect(state.tasks.today).to.deep.equal(new Date(2016, 9, 1))
                chai.expect(state.tasks.filteredTasks).to.deep.equal([
                    apiTasks[0],
                    apiTasks[1],
                    apiTasks[2]
                ])
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_FILTER_DISPLAY 5", () => {
            const checkState = (initialState: State) => {
                initialState.tasks.tasks = cloneArray(apiTasks)
                const filters: TaskFilters = {
                    notStartedChecked: true,
                    inProgressChecked: true,
                    doneChecked: true,
                    filters: {
                        milestoneFilterMode: MilestoneFilterMode.MilestonesOnly,
                        text: ""
                    }
                }
                const state = main.mainReducer(initialState, filterTasks("identifier", filters))
                chai.expect(state.tasks.filters).to.deep.equal(filters)
                chai.expect(state.tasks.today).to.deep.equal(new Date(2016, 9, 1))
                chai.expect(state.tasks.filteredTasks).to.deep.equal([
                    apiTasks[3],
                    apiTasks[4]
                ])
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_FILTER_DISPLAY 5", () => {
            const checkState = (initialState: State) => {
                initialState.tasks.tasks = cloneArray(apiTasks)
                const filters: TaskFilters = {
                    notStartedChecked: true,
                    inProgressChecked: true,
                    doneChecked: true,
                    filters: {
                        milestoneFilterMode: MilestoneFilterMode.NoFilter,
                        text: "1"
                    }
                }
                const state = main.mainReducer(initialState, filterTasks("identifier", filters))
                chai.expect(state.tasks.filters).to.deep.equal(filters)
                chai.expect(state.tasks.today).to.deep.equal(new Date(2016, 9, 1))
                chai.expect(state.tasks.filteredTasks).to.deep.equal([
                    apiTasks[0],
                    apiTasks[3]
                ])
            }
            checkState(initialState1)
            checkState(initialState2)
        })
    })
})
