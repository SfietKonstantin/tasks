import * as chai from "chai"
import {
    TaskListFilters, TaskListFilterInterface, MilestoneFilterMode, filterTaskList
} from "../../client/common/tasklistfilters"
import { FakeTask, isMilestone, getIdentifier, getName } from "./faketask"

const tasks: Array<FakeTask> = [
    {
        identifier: "task1",
        name: "My first",
        isMilestone: false
    },
    {
        identifier: "task2",
        name: "A second",
        isMilestone: false
    },
    {
        identifier: "task3",
        name: "A third",
        isMilestone: false
    },
    {
        identifier: "milestone1",
        name: "Milestone",
        isMilestone: true
    },
    {
        identifier: "milestone2",
        name: "My milestone",
        isMilestone: true
    }
]

const filterInterface: TaskListFilterInterface<FakeTask> = {
    isMilestone,
    getIdentifier,
    getName
}

describe("Task list filter", () => {
    it("Filter tasks 1", () => {
        const filters: TaskListFilters = {
            milestoneFilterMode: MilestoneFilterMode.NoFilter,
            text: ""
        }
        const result = filterTaskList(tasks, filters, filterInterface)
        chai.expect(result).to.deep.equal([ tasks[0], tasks[1], tasks[2], tasks[3], tasks[4] ])
    })
    it("Filter tasks 2", () => {
        const filters: TaskListFilters = {
            milestoneFilterMode: MilestoneFilterMode.TasksOnly,
            text: ""
        }
        const result = filterTaskList(tasks, filters, filterInterface)
        chai.expect(result).to.deep.equal([ tasks[0], tasks[1], tasks[2] ])
    })
    it("Filter tasks 3", () => {
        const filters: TaskListFilters = {
            milestoneFilterMode: MilestoneFilterMode.MilestonesOnly,
            text: ""
        }
        const result = filterTaskList(tasks, filters, filterInterface)
        chai.expect(result).to.deep.equal([ tasks[3], tasks[4] ])
    })
    it("Filter tasks 4", () => {
        const filters: TaskListFilters = {
            milestoneFilterMode: MilestoneFilterMode.NoFilter,
            text: "1"
        }
        const result = filterTaskList(tasks, filters, filterInterface)
        chai.expect(result).to.deep.equal([ tasks[0], tasks[3] ])
    })
    it("Filter tasks 5", () => {
        const filters: TaskListFilters = {
            milestoneFilterMode: MilestoneFilterMode.NoFilter,
            text: "Ta"
        }
        const result = filterTaskList(tasks, filters, filterInterface)
        chai.expect(result).to.deep.equal([ tasks[0], tasks[1], tasks[2] ])
    })
    it("Filter tasks 6", () => {
        const filters: TaskListFilters = {
            milestoneFilterMode: MilestoneFilterMode.NoFilter,
            text: "my"
        }
        const result = filterTaskList(tasks, filters, filterInterface)
        chai.expect(result).to.deep.equal([ tasks[0], tasks[4] ])
    })
})
