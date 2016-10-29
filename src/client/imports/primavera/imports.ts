import { PrimaveraTask, PrimaveraDelay, PrimaveraTaskRelation } from "./types"
import { InvalidFormatError } from "../../common/actions/files"
import * as dateutils from "../../../common/dateutils"

export interface TaskParseResults {
    tasks: Map<string, PrimaveraTask>
    delays: Map<string, PrimaveraDelay>
    warnings: Array<string>
}

export interface RelationParseResults {
    relations: Array<PrimaveraTaskRelation>
    warnings: Array<string>
}

const convertDate = (date: string): Date | null => {
    const convertedDate = date.replace(/(\d+)\/(\d+)\/(\d+) (\d+):(\d+):(\d+)/, "$2/$1/$3")
    const returned = new Date(convertedDate)
    return Number.isNaN(returned.getTime()) ? null : returned
}

export const parseTasks = (content: string): TaskParseResults => {
    const splitted = content.split("\n")
    if (splitted.length < 2) {
        throw new InvalidFormatError("Task file should have at least two lines")
    }

    splitted.shift()
    splitted.shift()

    let tasks = new Map<string, PrimaveraTask>()
    let delays = new Map<string, PrimaveraDelay>()
    let warnings = new Array<string>()
    splitted.forEach((line: string) =>  {
        if (line.length === 0) {
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
            return
        }

        if (Number.isNaN(duration) || (startDate == null && endDate == null)) {
            return
        }

        if (duration > 0 && startDate != null && endDate != null) {
            const computedDuration = dateutils.getDateDiff(startDate, endDate)
            if (duration !== computedDuration) {
                warnings.push("Task \"" + identifier + "\"'s duration do not match with the computed duration")
            }
        }
        if (startDate == null || endDate == null) {
            if (duration > 0) {
                duration = 0
                warnings.push("Task \"" + identifier + "\" is a milestone but have a duration")
            }
        }

        if (tasks.has(identifier)) {
            warnings.push("Task \"" + identifier + "\" is duplicated")
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

    return { tasks, delays, warnings }
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

export const parseRelations = (content: string): RelationParseResults => {
    const splitted = content.split("\n")
    if (splitted.length < 2) {
        throw new InvalidFormatError("Relations file should have at least two lines")
    }

    splitted.shift()
    splitted.shift()

    let relations = new Array<PrimaveraTaskRelation>()
    let warnings = new Array<string>()
    splitted.forEach((line: string) =>  {
        if (line.length === 0) {
            return
        }
        const splittedLine = line.split("\t")
        if (splittedLine.length < 10) {
            throw new InvalidFormatError("Relations file should have at least 10 columns. Line content: \""
                                         + line + "\"")
        }

        const previous = splittedLine[0]
        const next = splittedLine[1]
        const type = parseType(splittedLine[2])
        const lag = +splittedLine[9]

        if (Number.isNaN(lag) || type == null) {
            return
        }

        let relation: PrimaveraTaskRelation = {
            previous,
            next,
            type,
            lag
        }

        if (relation.type === "SF") {
            if (relation.lag === 0) {
                warnings.push("Relation between task \"" + relation.previous + "\" and task \""
                            + relation.next + "\" is of type SF and has been flipped")
                const previous = relation.next
                const next = relation.previous
                Object.assign(relation, {
                    previous,
                    next,
                    type: "FS"
                })
            } else {
                warnings.push("Relation between task \"" + relation.previous + "\" and task \""
                            + relation.next + "\" is of type SF with a lag. This is not supported.")
                return
            }
        }

        relations.push(relation)
    })

    return { relations, warnings }
}
