import * as chai from "chai"
import * as sinon from "sinon"
import * as main from "../../client/project/reducers/main"
import { requestProject, receiveProject, receiveFailureProject } from "../../client/project/actions/project"
import { requestTasks, receiveTasks, receiveFailureTasks, filterTasks } from "../../client/project/actions/tasks"
import * as taskBrowser from "../../client/project/components/taskbrowser"
import {
    State, ProjectState, TaskFilters, TasksState
} from "../../client/project/types"
import { MilestoneFilterMode } from "../../client/common/tasklist/types"
import { Project, Task } from "../../common/types"
import { FakeResponse } from "./fakeresponse"
import { cloneObject, project, tasks, cloneArray } from "./testdata"
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
                main: {
                    isFetching: true
                },
                taskList: {
                    tasks: cloneArray(tasks),
                    filters: {
                        notStartedChecked: true,
                        inProgressChecked: true,
                        doneChecked: true,
                        milestoneFilterMode: MilestoneFilterMode.TasksOnly,
                        text: "Some filter",
                        today: new Date(2016, 9, 1)
                    },
                    filteredTasks: cloneArray(tasks),
                    displayedTasks: cloneArray(tasks),
                    currentPage: 0,
                    maxPage: 1
                },
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
                chai.expect(state.tasks.main.isFetching).to.true
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_RECEIVE", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, receiveTasks())
                chai.expect(state.tasks.main.isFetching).to.false
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_RECEIVE_FAILURE", () => {
            const checkState = (initialState: State) => {
                const state = main.mainReducer(initialState, receiveFailureTasks())
                chai.expect(state.tasks.main.isFetching).to.false
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce FILTERS_UPDATE 1", () => {
            const checkState = (initialState: State) => {
                initialState.tasks.taskList.tasks = cloneArray(tasks)
                const filters: TaskFilters = {
                    notStartedChecked: true,
                    inProgressChecked: false,
                    doneChecked: false,
                    milestoneFilterMode: MilestoneFilterMode.NoFilter,
                    text: "",
                    today: new Date()
                }
                const state = main.mainReducer(initialState, filterTasks("identifier", filters))
                chai.expect(state.tasks.taskList.filters).to.deep.equal(filters)
                chai.expect(state.tasks.taskList.filteredTasks).to.deep.equal([
                    tasks[4],
                    tasks[2]
                ])
                chai.expect(state.tasks.taskList.displayedTasks).to.deep.equal([
                    tasks[4],
                    tasks[2]
                ])
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_FILTER_DISPLAY 2", () => {
            const checkState = (initialState: State) => {
                initialState.tasks.taskList.tasks = cloneArray(tasks)
                const filters: TaskFilters = {
                    notStartedChecked: false,
                    inProgressChecked: true,
                    doneChecked: false,
                    milestoneFilterMode: MilestoneFilterMode.NoFilter,
                    text: "",
                    today: new Date()
                }
                const state = main.mainReducer(initialState, filterTasks("identifier", filters))
                chai.expect(state.tasks.taskList.filters).to.deep.equal(filters)
                chai.expect(state.tasks.taskList.filteredTasks).to.deep.equal([
                    tasks[1]
                ])
                chai.expect(state.tasks.taskList.displayedTasks).to.deep.equal([
                    tasks[1]
                ])
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_FILTER_DISPLAY 3", () => {
            const checkState = (initialState: State) => {
                initialState.tasks.taskList.tasks = cloneArray(tasks)
                const filters: TaskFilters = {
                    notStartedChecked: false,
                    inProgressChecked: false,
                    doneChecked: true,
                    milestoneFilterMode: MilestoneFilterMode.NoFilter,
                    text: "",
                    today: new Date()
                }
                const state = main.mainReducer(initialState, filterTasks("identifier", filters))
                chai.expect(state.tasks.taskList.filters).to.deep.equal(filters)
                chai.expect(state.tasks.taskList.filteredTasks).to.deep.equal([
                    tasks[0],
                    tasks[3]
                ])
                chai.expect(state.tasks.taskList.displayedTasks).to.deep.equal([
                    tasks[0],
                    tasks[3]
                ])
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce TASKS_FILTER_DISPLAY 4", () => {
            const checkState = (initialState: State) => {
                initialState.tasks.taskList.tasks = cloneArray(tasks)
                const filters: TaskFilters = {
                    notStartedChecked: true,
                    inProgressChecked: true,
                    doneChecked: true,
                    milestoneFilterMode: MilestoneFilterMode.NoFilter,
                    text: "",
                    today: null
                }
                const state = main.mainReducer(initialState, filterTasks("identifier", filters))
                chai.expect(state.tasks.taskList.filters).to.deep.equal(filters)
                chai.expect(state.tasks.taskList.filteredTasks).to.empty
                chai.expect(state.tasks.taskList.displayedTasks).to.empty
            }
            checkState(initialState1)
            checkState(initialState2)
        })
    })
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
})
