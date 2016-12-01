import * as chai from "chai"
import * as sinon from "sinon"
import * as reducers from "../../client/common/tasklist/reducers"
import { updateTasks, updateFilters, previousTasksPage, nextTasksPage } from "../../client/common/tasklist/actions"
import { State, Task, TaskListFilters, MilestoneFilterMode } from "../../client/common/tasklist/types"
import { filterTaskList } from "../../client/common/tasklist/filters"
import { cloneArray, cloneObject } from "./testdata"

describe("TaskList reducers", () => {
    let dispatch: Sinon.SinonSpy
    let initialState1: State<Task, TaskListFilters>
    let initialState2: State<Task, TaskListFilters>
    const tasks: Array<Task> = [
        {
            identifier: "task1",
            name: "My first",
            duration: 10
        },
        {
            identifier: "task2",
            name: "A second",
            duration: 20
        },
        {
            identifier: "task3",
            name: "A third",
            duration: 30
        },
        {
            identifier: "milestone1",
            name: "Milestone",
            duration: 0
        },
        {
            identifier: "milestone2",
            name: "My milestone",
            duration: 0
        }
    ]
    beforeEach(() => {
        dispatch = sinon.spy()
        initialState1 = {
            tasksPerPage: 10,
            filters: {
                text: "",
                milestoneFilterMode: MilestoneFilterMode.NoFilter
            },
            tasks: [],
            filteredTasks: [],
            displayedTasks: [],
            currentPage: 1,
            maxPage: 2
        }
        initialState2 = {
            tasksPerPage: 10,
            filters: {
                text: "",
                milestoneFilterMode: MilestoneFilterMode.NoFilter
            },
            tasks: cloneArray(tasks),
            filteredTasks: cloneArray(tasks),
            displayedTasks: cloneArray(tasks),
            currentPage: 0,
            maxPage: 1
        }
    })
    describe("TaskList reducers", () => {
        it("Should reduce TASKS_UPDATE", () => {
            const checkState = (initialState: State<Task, TaskListFilters>) => {
                const action = updateTasks(tasks)
                const state = reducers.filtersReducer(initialState, filterTaskList)(initialState, action)
                chai.expect(state.tasks).to.deep.equal(tasks)
                chai.expect(state.currentPage).to.equal(0)
                chai.expect(state.maxPage).to.equal(0)
            }
            checkState(initialState1)
            checkState(initialState2)
        })
        it("Should reduce FILTERS_UPDATE 1", () => {
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            const state1 = reducers.filtersReducer(initialState1, filterTaskList)(initialState1, updateFilters(filters))
            chai.expect(state1.filteredTasks).to.empty
            chai.expect(state1.displayedTasks).to.empty
            chai.expect(state1.filters).to.deep.equal(filters)
            const state2 = reducers.filtersReducer(initialState2, filterTaskList)(initialState2, updateFilters(filters))
            chai.expect(state2.filteredTasks).to.deep.equal([ tasks[0], tasks[1], tasks[2], tasks[3], tasks[4] ])
            chai.expect(state2.displayedTasks).to.deep.equal([ tasks[0], tasks[1], tasks[2], tasks[3], tasks[4] ])
            chai.expect(state2.filters).to.deep.equal(filters)
        })
        it("Should reduce FILTERS_UPDATE 2", () => {
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.TasksOnly,
                text: ""
            }
            const state1 = reducers.filtersReducer(initialState1, filterTaskList)(initialState1, updateFilters(filters))
            chai.expect(state1.filteredTasks).to.empty
            chai.expect(state1.displayedTasks).to.empty
            chai.expect(state1.filters).to.deep.equal(filters)
            const state2 = reducers.filtersReducer(initialState2, filterTaskList)(initialState2, updateFilters(filters))
            chai.expect(state2.filteredTasks).to.deep.equal([ tasks[0], tasks[1], tasks[2] ])
            chai.expect(state2.displayedTasks).to.deep.equal([ tasks[0], tasks[1], tasks[2] ])
            chai.expect(state2.filters).to.deep.equal(filters)
        })
        it("Should reduce FILTERS_UPDATE 3", () => {
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.MilestonesOnly,
                text: ""
            }
            const state1 = reducers.filtersReducer(initialState1, filterTaskList)(initialState1, updateFilters(filters))
            chai.expect(state1.filteredTasks).to.empty
            chai.expect(state1.displayedTasks).to.empty
            chai.expect(state1.filters).to.deep.equal(filters)
            const state2 = reducers.filtersReducer(initialState2, filterTaskList)(initialState2, updateFilters(filters))
            chai.expect(state2.filteredTasks).to.deep.equal([ tasks[3], tasks[4] ])
            chai.expect(state2.displayedTasks).to.deep.equal([ tasks[3], tasks[4] ])
            chai.expect(state2.filters).to.deep.equal(filters)
        })
        it("Should reduce FILTERS_UPDATE 4", () => {
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: "1"
            }
            const state1 = reducers.filtersReducer(initialState1, filterTaskList)(initialState1, updateFilters(filters))
            chai.expect(state1.filteredTasks).to.empty
            chai.expect(state1.displayedTasks).to.empty
            chai.expect(state1.filters).to.deep.equal(filters)
            const state2 = reducers.filtersReducer(initialState2, filterTaskList)(initialState2, updateFilters(filters))
            chai.expect(state2.filteredTasks).to.deep.equal([ tasks[0], tasks[3] ])
            chai.expect(state2.displayedTasks).to.deep.equal([ tasks[0], tasks[3] ])
            chai.expect(state2.filters).to.deep.equal(filters)
        })
        it("Should reduce FILTERS_UPDATE 5", () => {
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: "Ta"
            }
            const state1 = reducers.filtersReducer(initialState1, filterTaskList)(initialState1, updateFilters(filters))
            chai.expect(state1.filteredTasks).to.empty
            chai.expect(state1.displayedTasks).to.empty
            chai.expect(state1.filters).to.deep.equal(filters)
            const state2 = reducers.filtersReducer(initialState2, filterTaskList)(initialState2, updateFilters(filters))
            chai.expect(state2.filteredTasks).to.deep.equal([ tasks[0], tasks[1], tasks[2] ])
            chai.expect(state2.displayedTasks).to.deep.equal([ tasks[0], tasks[1], tasks[2] ])
            chai.expect(state2.filters).to.deep.equal(filters)
        })
        it("Should reduce FILTERS_UPDATE 6", () => {
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: "my"
            }
            const state1 = reducers.filtersReducer(initialState1, filterTaskList)(initialState1, updateFilters(filters))
            chai.expect(state1.filteredTasks).to.empty
            chai.expect(state1.displayedTasks).to.empty
            chai.expect(state1.filters).to.deep.equal(filters)
            const state2 = reducers.filtersReducer(initialState2, filterTaskList)(initialState2, updateFilters(filters))
            chai.expect(state2.filteredTasks).to.deep.equal([ tasks[0], tasks[4] ])
            chai.expect(state2.displayedTasks).to.deep.equal([ tasks[0], tasks[4] ])
            chai.expect(state2.filters).to.deep.equal(filters)
        })
        it("Should reduce FILTERS_UPDATE 7", () => {
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            const initialState = cloneObject(initialState2)
            initialState.tasksPerPage = 2
            const state = reducers.filtersReducer(initialState2, filterTaskList)(initialState, updateFilters(filters))
            chai.expect(state.filteredTasks).to.deep.equal([ tasks[0], tasks[1], tasks[2], tasks[3], tasks[4] ])
            chai.expect(state.displayedTasks).to.deep.equal([ tasks[0], tasks[1] ])
            chai.expect(state.filters).to.deep.equal(filters)
            chai.expect(state.maxPage).to.equal(2)
        })
        it("Should reduce TASKS_PAGE_PREVIOUS 1", () => {
            const initialState: State<Task, TaskListFilters> = {
                tasksPerPage: 2,
                filters: {
                    text: "",
                    milestoneFilterMode: MilestoneFilterMode.NoFilter
                },
                tasks: cloneArray(tasks),
                filteredTasks: cloneArray(tasks),
                displayedTasks: [ tasks[0], tasks[1] ],
                currentPage: 0,
                maxPage: 2
            }
            const state = reducers.filtersReducer(initialState2, filterTaskList)(initialState, previousTasksPage())
            chai.expect(state.displayedTasks).to.deep.equal([ tasks[0], tasks[1] ])
            chai.expect(state.currentPage).to.equal(0)
        })
        it("Should reduce TASKS_PAGE_PREVIOUS 2", () => {
            const initialState: State<Task, TaskListFilters> = {
                tasksPerPage: 2,
                filters: {
                    text: "",
                    milestoneFilterMode: MilestoneFilterMode.NoFilter
                },
                tasks: cloneArray(tasks),
                filteredTasks: cloneArray(tasks),
                displayedTasks: [ tasks[2], tasks[3] ],
                currentPage: 1,
                maxPage: 2
            }
            const state = reducers.filtersReducer(initialState2, filterTaskList)(initialState, previousTasksPage())
            chai.expect(state.displayedTasks).to.deep.equal([ tasks[0], tasks[1] ])
            chai.expect(state.currentPage).to.equal(0)
        })
        it("Should reduce TASKS_PAGE_NEXT 1", () => {
            const initialState: State<Task, TaskListFilters> = {
                tasksPerPage: 2,
                filters: {
                    text: "",
                    milestoneFilterMode: MilestoneFilterMode.NoFilter
                },
                tasks: cloneArray(tasks),
                filteredTasks: cloneArray(tasks),
                displayedTasks: [ tasks[2], tasks[3] ],
                currentPage: 1,
                maxPage: 2
            }
            const state = reducers.filtersReducer(initialState2, filterTaskList)(initialState, nextTasksPage())
            chai.expect(state.displayedTasks).to.deep.equal([ tasks[4] ])
            chai.expect(state.currentPage).to.equal(2)
        })
        it("Should reduce TASKS_PAGE_NEXT 2", () => {
            const initialState: State<Task, TaskListFilters> = {
                tasksPerPage: 2,
                filters: {
                    text: "",
                    milestoneFilterMode: MilestoneFilterMode.NoFilter
                },
                tasks: cloneArray(tasks),
                filteredTasks: cloneArray(tasks),
                displayedTasks: [ tasks[4] ],
                currentPage: 2,
                maxPage: 2
            }
            const state = reducers.filtersReducer(initialState2, filterTaskList)(initialState, nextTasksPage())
            chai.expect(state.displayedTasks).to.deep.equal([ tasks[4] ])
            chai.expect(state.currentPage).to.equal(2)
        })
    })
})
