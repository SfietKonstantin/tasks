import { PrimaveraTask, PrimaveraDelay } from "./types"
import * as dateutils from "../../../common/dateutils"

export class InvalidFormatError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}

export interface TaskParseResults {
    tasks: Map<string, PrimaveraTask>
    delays: Map<string, PrimaveraDelay>
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
            warnings.push("Task identifier \"" + identifier + "\" is duplicated")
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
