import { Project, TaskRelation, TaskLocation } from "../../common/types"
import { ApiTask, ApiInputTask, ApiInputDelay } from "../../common/apitypes"
import { PrimaveraTask, PrimaveraTaskRelation } from "../../client/imports/primavera/types"
import { RelationGraph } from "../../client/imports/primavera/graph"
import { MilestoneFilterMode, TaskListFilters } from "../../client/common/tasklistfilter"
import * as maputils from "../../common/maputils"

export const cloneObject = <T>(object: T): T => {
    return Object.assign({}, object)
}

export const cloneArray = <T>(array: Array<T>): Array<T> => {
    return array.slice(0)
}

export const cloneSet = <T>(set: Set<T>): Set<T> => {
    return new Set<T>(set)
}

export const cloneMap = <K, V>(map: Map<K, V>): Map<K, V> => {
    return new Map<K, V>(map)
}

export const mapToArray = <K, V>(map: Map<K, V>): Array<V> => {
    return Array.from(map.values())
}

export const project: Project = {
    identifier: "identifier",
    name: "Name",
    description: "Description"
}

export const emptyProject: Project = {
    identifier: "",
    name: "",
    description: ""
}

export let warnings = new Map<string, Array<string>>()
warnings.set("task1", ["Warning 1", "Warning 2"])
warnings.set("task2", ["Warning 3"])

export const noWarnings = new Map<string, Array<string>>()

export const apiTasks: Array<ApiTask> = [
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

export let primaveraTasks1 = new Map<string, PrimaveraTask>()
primaveraTasks1.set("task1", {
    identifier: "task1",
    name: "Task 1",
    duration: 30,
    startDate: new Date(2016, 9, 1),
    endDate: new Date(2016, 10, 1)
})
primaveraTasks1.set("delay", {
    identifier: "delay",
    name: "Delay",
    duration: 0,
    startDate: new Date(2016, 9, 1),
    endDate: null
})
primaveraTasks1.set("milestone1", {
    identifier: "milestone1",
    name: "Milestone 1",
    duration: 0,
    startDate: null,
    endDate: new Date(2016, 10, 1)
})

export let primaveraTasks2: Map<string, PrimaveraTask> = new Map<string, PrimaveraTask>()
primaveraTasks2.set("task1", {
    identifier: "task1",
    name: "Task 1",
    duration: 15,
    startDate: new Date(2016, 8, 1),
    endDate: new Date(2016, 8, 16)
})
primaveraTasks2.set("task2", {
    identifier: "task2",
    name: "Task 2",
    duration: 30,
    startDate: new Date(2016, 8, 25),
    endDate: new Date(2016, 9, 25)
})
primaveraTasks2.set("task3", {
    identifier: "task3",
    name: "Task 3",
    duration: 31,
    startDate: new Date(2016, 9, 15),
    endDate: new Date(2016, 10, 15)
})
primaveraTasks2.set("task4", {
    identifier: "task4",
    name: "Task 4",
    duration: 5,
    startDate: new Date(2016, 11, 5),
    endDate: new Date(2016, 11, 10)
})
primaveraTasks2.set("milestone1", {
    identifier: "milestone1",
    name: "Milestone 1",
    duration: 0,
    startDate: null,
    endDate: new Date(2016, 8, 17)
})
primaveraTasks2.set("milestone2", {
    identifier: "milestone2",
    name: "Milestone 2",
    duration: 0,
    startDate: null,
    endDate: new Date(2016, 11, 2)
})

export const filteredPrimaveraTasks2 = [
    maputils.get(primaveraTasks2, "task1"),
    maputils.get(primaveraTasks2, "task2"),
    maputils.get(primaveraTasks2, "task3"),
    maputils.get(primaveraTasks2, "task4"),
    maputils.get(primaveraTasks2, "milestone1"),
    maputils.get(primaveraTasks2, "milestone2")
]

export const emptyPrimaveraTasks = new Map<string, PrimaveraTask>()

export const primaveraRelations1: Array<PrimaveraTaskRelation> = [
    {
        previous: "task1",
        next: "milestone1",
        type: "FS",
        lag: 3
    }
]

export const noSelectedDelays = new Set<string>()

export let selectedDelays1 = new Set<string>()
selectedDelays1.add("delay")

export let selectedDelays2 = new Set<string>()
selectedDelays2.add("task3")
selectedDelays2.add("milestone1")

export const inputTasks1: Array<ApiInputTask> = [
    {
        identifier: "task1",
        name: "Task 1",
        description: "",
        estimatedStartDate: new Date(2016, 9, 1).toISOString(),
        estimatedDuration: 31
    },
    {
        identifier: "milestone1",
        name: "Milestone 1",
        description: "",
        estimatedStartDate: new Date(2016, 10, 1).toISOString(),
        estimatedDuration: 0
    }
]

export const inputTasks2: Array<ApiInputTask> = [
    {
        identifier: "task1",
        name: "Task 1",
        description: "",
        estimatedStartDate: new Date(2016, 8, 1).toISOString(),
        estimatedDuration: 15
    },
    {
        identifier: "task2",
        name: "Task 2",
        description: "",
        estimatedStartDate: new Date(2016, 8, 25).toISOString(),
        estimatedDuration: 30
    },
    {
        identifier: "task4",
        name: "Task 4",
        description: "",
        estimatedStartDate: new Date(2016, 11, 5).toISOString(),
        estimatedDuration: 5
    },
    {
        identifier: "milestone2",
        name: "Milestone 2",
        description: "",
        estimatedStartDate: new Date(2016, 11, 2).toISOString(),
        estimatedDuration: 0
    }
]

export const inputDelays1: Array<ApiInputDelay> = [
    {
        identifier: "delay",
        name: "Delay",
        description: "",
        date: new Date(2016, 9, 1).toISOString()
    }
]

export const inputDelays2: Array<ApiInputDelay> = [
    {
        identifier: "task3",
        name: "Task 3",
        description: "",
        date: new Date(2016, 10, 15).toISOString()
    },
    {
        identifier: "milestone1",
        name: "Milestone 1",
        description: "",
        date: new Date(2016, 8, 17).toISOString()
    }
]

export const inputRelations1: Array<TaskRelation> = [
    {
        previous: "task1",
        next: "milestone1",
        previousLocation: TaskLocation.End,
        lag: 3
    }
]

export const inputRelations2: Array<TaskRelation> = [
    {
        previous: "task1",
        next: "milestone1",
        previousLocation: TaskLocation.End,
        lag: 1
    },
    {
        previous: "milestone1",
        next: "task2",
        previousLocation: TaskLocation.End,
        lag: 9
    },
    {
        previous: "milestone2",
        next: "task4",
        previousLocation: TaskLocation.End,
        lag: 3
    }
]

let primaveraRelationGraph2 = new RelationGraph()
primaveraRelationGraph2.addRelation({
    previous: "task1",
    next: "milestone1",
    type: "FS",
    lag: 1
})
primaveraRelationGraph2.addRelation({
    previous: "milestone1",
    next: "task2",
    type: "FS",
    lag: 9
})
primaveraRelationGraph2.addRelation({
    previous: "milestone2",
    next: "task4",
    type: "FS",
    lag: 3
})
export const primaveraRelationNodes2 = primaveraRelationGraph2.nodes

export const taskListFilters: TaskListFilters = {
    milestoneFilterMode: MilestoneFilterMode.NoFilter,
    text: ""
}
