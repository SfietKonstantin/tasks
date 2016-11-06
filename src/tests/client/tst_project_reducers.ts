import * as chai from "chai"
import * as sinon from "sinon"
import * as main from "../../client/project/reducers/main"
import { requestProject, receiveProject, receiveFailureProject } from "../../client/project/actions/project"
import { requestTasks, receiveTasks, receiveFailureTasks, filterTasks } from "../../client/project/actions/tasks"

import {
    State, ProjectState, TaskFilters, TasksState
} from "../../client/project/types"
import { MilestoneFilterMode } from "../../client/common/components/tasklist"
import { Project } from "../../common/types"
import { ApiTask } from "../../common/apitypes"
import { FakeResponse } from "./fakeresponse"

const project: Project = {
    identifier: "identifier",
    name: "Name",
    description: "Description"
}

const tasks: Array<ApiTask> = [
    {
        identifier: "task1",
        name: "Task 1",
        description: "Description 1",
        estimatedStartDate: new Date(2016, 8, 1).toISOString(),
        estimatedDuration: 15,
        startDate: new Date(2016, 8, 1).toISOString(),
        duration: 15
    },
    {
        identifier: "task2",
        name: "Task 2",
        description: "Description 2",
        estimatedStartDate: new Date(2016, 8, 15).toISOString(),
        estimatedDuration: 30,
        startDate: new Date(2016, 8, 15).toISOString(),
        duration: 30
    },
    {
        identifier: "task3",
        name: "Task 3",
        description: "Description 3",
        estimatedStartDate: new Date(2016, 9, 15).toISOString(),
        estimatedDuration: 30,
        startDate: new Date(2016, 9, 15).toISOString(),
        duration: 30
    },
    {
        identifier: "milestone1",
        name: "Milestone 1",
        description: "Description 4",
        estimatedStartDate: new Date(2016, 8, 14).toISOString(),
        estimatedDuration: 0,
        startDate: new Date(2016, 8, 14).toISOString(),
        duration: 0
    },
    {
        identifier: "milestone2",
        name: "Milestone 2",
        description: "Description 5",
        estimatedStartDate: new Date(2016, 9, 14).toISOString(),
        estimatedDuration: 0,
        startDate: new Date(2016, 9, 14).toISOString(),
        duration: 0
    }
]

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
            project: {
                isFetching: false,
                project: null
            },
            tasks: {
                isFetching: false,
                tasks: [],
                filters: {
                    notStartedChecked: false,
                    inProgressChecked: false,
                    doneChecked: false,
                    filters: {
                        milestoneFilterMode: MilestoneFilterMode.NoFilter,
                        text: ""
                    }
                },
                today: null,
                filteredTasks: []
            }
        }
        initialState2 = {
            projectIdentifier: "project",
            project: {
                isFetching: true,
                project: Object.assign({}, project)
            },
            tasks: {
                isFetching: true,
                tasks: tasks.slice(0),
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
                filteredTasks: tasks.slice(0)
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
                const state = main.mainReducer(initialState, receiveProject("identifier", Object.assign({}, project)))
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
                const state = main.mainReducer(initialState, receiveTasks(tasks.slice(0)))
                const expected: Array<ApiTask> = [
                    tasks[0],
                    tasks[3],
                    tasks[1],
                    tasks[4],
                    tasks[2]
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
                initialState.tasks.tasks = tasks.slice(0)
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
                chai.expect(state.tasks.filteredTasks).to.deep.equal([ tasks[4], tasks[2] ])
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_FILTER_DISPLAY 2", () => {
            const checkState = (initialState: State) => {
                initialState.tasks.tasks = tasks.slice(0)
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
                chai.expect(state.tasks.filteredTasks).to.deep.equal([ tasks[1] ])
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_FILTER_DISPLAY 3", () => {
            const checkState = (initialState: State) => {
                initialState.tasks.tasks = tasks.slice(0)
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
                chai.expect(state.tasks.filteredTasks).to.deep.equal([ tasks[0], tasks[3] ])
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_FILTER_DISPLAY 4", () => {
            const checkState = (initialState: State) => {
                initialState.tasks.tasks = tasks.slice(0)
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
                chai.expect(state.tasks.filteredTasks).to.deep.equal([ tasks[0], tasks[1], tasks[2] ])
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_FILTER_DISPLAY 5", () => {
            const checkState = (initialState: State) => {
                initialState.tasks.tasks = tasks.slice(0)
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
                chai.expect(state.tasks.filteredTasks).to.deep.equal([ tasks[3], tasks[4] ])
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_FILTER_DISPLAY 5", () => {
            const checkState = (initialState: State) => {
                initialState.tasks.tasks = tasks.slice(0)
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
                chai.expect(state.tasks.filteredTasks).to.deep.equal([ tasks[0], tasks[3] ])
            }
            checkState(initialState1)
            checkState(initialState2)
        })
    })
})
