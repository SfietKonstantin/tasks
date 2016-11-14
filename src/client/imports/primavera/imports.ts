import { PrimaveraTask, PrimaveraDelay, PrimaveraTaskRelation } from "./types"
import { RelationGraph, RelationGraphNode } from "./graph"
import { InvalidFormatError } from "../../common/actions/files"
import { ApiInputTask, ApiInputDelay } from "../../../common/apitypes"
import { TaskRelation, TaskLocation } from "../../../common/types"
import * as dateutils from "../../../common/dateutils"
import * as maputils from "../../../common/maputils"

export interface TasksParseResults {
    length: number
    tasks: Map<string, PrimaveraTask>
    warnings: Map<string, Array<string>>
}

const convertDate = (date: string): Date | null => {
    const convertedDate = date.replace(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+):(\d+)/, "$2/$1/$3")
    const returned = new Date(convertedDate)
    return Number.isNaN(returned.getTime()) ? null : returned
}

export const parseTasks = (content: string): TasksParseResults => {
    const splitted = content.split("\n")
    if (splitted.length < 2) {
        throw new InvalidFormatError("Task file should have at least two lines")
    }

    splitted.shift()
    splitted.shift()

    let tasks = new Map<string, PrimaveraTask>()
    let warnings = new Map<string, Array<string>>()
    let length = splitted.length
    splitted.forEach((line: string) =>  {
        if (line.length === 0) {
            --length
            return
        }
        const splittedLine = line.split("\t")
        if (splittedLine.length < 9) {
            throw new InvalidFormatError("Task file should have at least 9 columns. Line content: \"" + line + "\"")
        }

        const identifier = splittedLine[0]
        const name = splittedLine[4]
        let duration = +splittedLine[5]
        const startDate = convertDate(splittedLine[7])
        const endDate = convertDate(splittedLine[8])

        if (identifier.length === 0) {
            --length
            return
        }

        if (Number.isNaN(duration)) {
            maputils.addToMapOfList(warnings, identifier, "Task do not have a valid duration")
            return
        }

        if (startDate == null && endDate == null) {
            maputils.addToMapOfList(warnings, identifier, "Task do not have valid dates")
            return
        } else {
            if (duration > 0 && startDate != null && endDate != null) {
                const computedDuration = dateutils.getDateDiff(startDate, endDate)
                if (duration !== computedDuration) {
                    maputils.addToMapOfList(warnings, identifier, "Duration do not match with the computed duration")
                }
            }
            if (startDate == null || endDate == null) {
                if (duration > 0) {
                    duration = 0
                    maputils.addToMapOfList(warnings, identifier, "A milestone cannot have a duration")
                }
            }
        }

        if (tasks.has(identifier)) {
            maputils.addToMapOfList(warnings, identifier, "Duplicated task")
            return
        }

        tasks.set(identifier, {
            identifier,
            name,
            startDate,
            endDate,
            duration
        })
    })

    return { length, tasks, warnings }
}

const parseType = (type: string): "FS" | "SF" | "FF" | "SS" | null => {
    switch (type) {
        case "FS":
            return "FS"
        case "SF":
            return "SF"
        case "FF":
            return "FF"
        case "SS":
            return "SS"
        default:
            return null
    }
}

export interface RelationsParseResults {
    length: number
    relations: Map<string, RelationGraphNode>
    warnings: Map<string, Array<string>>
}

export const parseRelations = (content: string): RelationsParseResults => {
    const splitted = content.split("\n")
    if (splitted.length < 2) {
        throw new InvalidFormatError("Relations file should have at least two lines")
    }

    splitted.shift()
    splitted.shift()

    let graph = new RelationGraph()
    let warnings = new Map<string, Array<string>>()
    let length = splitted.length
    splitted.forEach((line: string) =>  {
        if (line.length === 0) {
            --length
            return
        }
        const splittedLine = line.split("\t")
        if (splittedLine.length < 10) {
            throw new InvalidFormatError("Relations file should have at least 10 columns. Line content: \""
                                         + line + "\"")
        }

        let previous = splittedLine[0]
        let next = splittedLine[1]
        let type = parseType(splittedLine[2])
        let lag = +splittedLine[9]

        if (type == null) {
            maputils.addToMapOfList(warnings, previous + " - " + next,
                                    "Relation have an invalid type")
            return
        }

        if (isNaN(lag)) {
            maputils.addToMapOfList(warnings, previous + " - " + next,
                                    "Relation have an invalid lag")
            return
        }

        if (type === "SF") {
            let oldPrevious = previous
            let oldNext = next
            previous = oldNext
            next = oldPrevious
            lag = -lag
            type = "FS"
            maputils.addToMapOfList(warnings, oldPrevious + " - " + oldNext,
                                    "SF relation have been converted to FS relation")
        }

        let relation: PrimaveraTaskRelation = {
            previous,
            next,
            type,
            lag
        }

        try {
            graph.addRelation(relation)
        } catch (error) {
            maputils.addToMapOfList(warnings, relation.previous + " - " + relation.next, error.message)
        }
    })

    return { length, relations: graph.nodes, warnings }
}

export const mapTasks = (tasks: Map<string, PrimaveraTask>, delays: Set<string>): Array<ApiInputTask> => {
    const filtered = Array.from(tasks.values()).filter((task: PrimaveraTask) => {
        return !delays.has(task.identifier)
    })
    return filtered.map((task: PrimaveraTask) => {
        let date = task.startDate
        let estimatedDuration = 0
        if (task.startDate == null) {
            date = task.endDate
        }
        if (task.startDate != null && task.endDate != null) {
            estimatedDuration = dateutils.getDateDiff(task.startDate, task.endDate)
        } else {
            estimatedDuration = 0
        }
        const estimatedStartDate = (date as Date).toISOString()

        const returned: ApiInputTask = {
            identifier: task.identifier,
            name: task.name,
            description: "",
            estimatedStartDate,
            estimatedDuration
        }
        return returned
    })
}

export const mapDelays = (tasks: Map<string, PrimaveraTask>, delays: Set<string>): Array<ApiInputDelay> => {
    const filtered = Array.from(tasks.values()).filter((task: PrimaveraTask) => {
        return delays.has(task.identifier)
    })
    return filtered.map((task: PrimaveraTask) => {
        let date = task.startDate
        if (task.startDate == null) {
            date = task.endDate
        }
        const convertedDate = (date as Date).toISOString()

        const returned: ApiInputDelay = {
            identifier: task.identifier,
            name: task.name,
            description: "",
            date: convertedDate
        }
        return returned
    })
}

export interface FilterRelationsResults {
    relations: Array<TaskRelation>
    warnings: Map<string, Array<string>>
}

export const filterRelations = (tasks: Map<string, PrimaveraTask>,
                                relations: Map<string, RelationGraphNode>): FilterRelationsResults => {
    let warnings = new Map<string, Array<string>>()
    let filtered = new Array<PrimaveraTaskRelation>()
    Array.from(relations.values(), (node: RelationGraphNode) => {
        Array.from(node.children.values(), (relation: PrimaveraTaskRelation) => {
            if (!tasks.has(relation.previous) || !tasks.has(relation.next)) {
                maputils.addToMapOfList(warnings, relation.previous + " - " + relation.next,
                                        "No corresponding tasks")
                return
            }
            if (relation.type === "FF") {
                maputils.addToMapOfList(warnings, relation.previous + " - " + relation.next,
                                        "FF relation is not supported")
                return
            }
            filtered.push(relation)
        })
    })

    const mappedRelations = filtered.map((relation: PrimaveraTaskRelation) => {
        let previousLocation = TaskLocation.End
        if (relation.type === "SS") {
            previousLocation = TaskLocation.Beginning
        }

        const returned: TaskRelation = {
            previous: relation.previous,
            next: relation.next,
            previousLocation,
            lag: relation.lag
        }
        return returned
    })

    return { relations: mappedRelations, warnings }
}
