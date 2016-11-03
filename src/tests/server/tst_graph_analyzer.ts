import * as chai from "chai"
import { findCyclicDependency } from "../../server/core/graph/analyzer"
import { GraphError } from "../../server/core/graph/types"
import { Task, TaskRelation, TaskLocation } from "../../common/types"

describe("Graph analyzer", () => {
    it("Should analyze a simple graph", () => {
        const tasks: Array<Task> = [
            {
                identifier: "task1",
                name: "Task 1",
                description: "Description 1",
                estimatedStartDate: new Date(2016, 1, 1),
                estimatedDuration: 30
            },
            {
                identifier: "task2",
                name: "Task 2",
                description: "Description 2",
                estimatedStartDate: new Date(2016, 1, 1),
                estimatedDuration: 15
            }
        ]
        findCyclicDependency(tasks, [])
    })
    it("Should analyze a simple graph with relations", () => {
        const tasks: Array<Task> = [
            {
                identifier: "task1",
                name: "Task 1",
                description: "Description 1",
                estimatedStartDate: new Date(2016, 1, 1),
                estimatedDuration: 30
            },
            {
                identifier: "task2",
                name: "Task 2",
                description: "Description 2",
                estimatedStartDate: new Date(2016, 1, 1),
                estimatedDuration: 15
            }
        ]
        const relations: Array<TaskRelation> = [
            {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                lag: 0
            }
        ]
        findCyclicDependency(tasks, relations)
    })
    it("Should not take invalid relations in account", () => {
        const tasks: Array<Task> = [
            {
                identifier: "task1",
                name: "Task 1",
                description: "Description 1",
                estimatedStartDate: new Date(2016, 1, 1),
                estimatedDuration: 30
            },
            {
                identifier: "task2",
                name: "Task 2",
                description: "Description 2",
                estimatedStartDate: new Date(2016, 1, 1),
                estimatedDuration: 15
            }
        ]
        const relations: Array<TaskRelation> = [
            {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                lag: 0
            },
            {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task3",
                lag: 0
            },
            {
                previous: "task3",
                previousLocation: TaskLocation.End,
                next: "task2",
                lag: 0
            }
        ]
        findCyclicDependency(tasks, relations)
    })
    it("Should detect cyclic dependency", () => {
        const tasks: Array<Task> = [
            {
                identifier: "task1",
                name: "Task 1",
                description: "Description 1",
                estimatedStartDate: new Date(2016, 1, 1),
                estimatedDuration: 30
            },
            {
                identifier: "task2",
                name: "Task 2",
                description: "Description 2",
                estimatedStartDate: new Date(2016, 1, 1),
                estimatedDuration: 15
            },
            {
                identifier: "task3",
                name: "Task 3",
                description: "Description 3",
                estimatedStartDate: new Date(2016, 1, 1),
                estimatedDuration: 10
            }
        ]
        const relations: Array<TaskRelation> = [
            {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                lag: 0
            },
            {
                previous: "task2",
                previousLocation: TaskLocation.End,
                next: "task3",
                lag: 0
            },
            {
                previous: "task3",
                previousLocation: TaskLocation.End,
                next: "task1",
                lag: 0
            }
        ]
        chai.expect(() => { findCyclicDependency(tasks, relations) }).to.throw(GraphError)
    })
    it("Should not detect diamonds", () => {
        const tasks: Array<Task> = [
            {
                identifier: "task1",
                name: "Task 1",
                description: "Description 1",
                estimatedStartDate: new Date(2016, 1, 1),
                estimatedDuration: 30
            },
            {
                identifier: "task2",
                name: "Task 2",
                description: "Description 2",
                estimatedStartDate: new Date(2016, 1, 1),
                estimatedDuration: 15
            },
            {
                identifier: "task3",
                name: "Task 3",
                description: "Description 3",
                estimatedStartDate: new Date(2016, 1, 1),
                estimatedDuration: 10
            },
            {
                identifier: "task4",
                name: "Task 4",
                description: "Description 3",
                estimatedStartDate: new Date(2016, 1, 1),
                estimatedDuration: 5
            }
        ]
        const relations: Array<TaskRelation> = [
            {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                lag: 0
            },
            {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task3",
                lag: 0
            },
            {
                previous: "task2",
                previousLocation: TaskLocation.End,
                next: "task4",
                lag: 0
            },
            {
                previous: "task3",
                previousLocation: TaskLocation.End,
                next: "task4",
                lag: 0
            }
        ]
        findCyclicDependency(tasks, relations)
    })
})
