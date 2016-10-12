import { Action, Dispatch } from "redux"
import { State, PrimaveraTaskRelation } from "../types"
import * as dateutils from "../../../../common/dateutils"

export const RELATIONS_IMPORT_BEGIN = "RELATIONS_IMPORT_BEGIN"
export const RELATIONS_IMPORT_END = "RELATIONS_IMPORT_END"
export const RELATIONS_IMPORT_INVALID_FORMAT = "RELATIONS_IMPORT_INVALID_FORMAT"
export const RELATIONS_DISMISS_INVALID_FORMAT = "RELATIONS_DISMISS_INVALID_FORMAT"
export const RELATIONS_REQUEST_ADD = "RELATIONS_REQUEST_ADD"
export const RELATIONS_RECEIVE_ADD = "RELATIONS_RECEIVE_ADD"

export interface RelationsAction extends Action {
    type: string,
    relations: Array<PrimaveraTaskRelation>
    warnings: Array<string>
}

const beginRelationsImport = (): Action => {
    return {
        type: RELATIONS_IMPORT_BEGIN
    }
}

const endRelationsImport = (relations: Array<PrimaveraTaskRelation>, warnings: Array<string>): RelationsAction => {
    return {
        type: RELATIONS_IMPORT_END,
        relations,
        warnings
    }
}

const relationsImportInvalidFormat = (): Action => {
    return {
        type: RELATIONS_IMPORT_INVALID_FORMAT
    }
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

const parseRelations = (reader: FileReader, dispatch: Dispatch<State>, resolve: () => void) => {
    const content: string = reader.result
    const splitted = content.split("\n")
    if (splitted.length < 2) {
        dispatch(relationsImportInvalidFormat())
        return
    }

    splitted.shift()
    splitted.shift()

    let relations = new Array<PrimaveraTaskRelation>()
    let warnings = new Array<string>()
    splitted.forEach((line: string) =>  {
        const splittedLine = line.split("\t")
        if (splittedLine.length < 10) {
            return
        }

        const previous = splittedLine[0]
        const next = splittedLine[1]
        const type = parseType(splittedLine[2])
        const lag = +splittedLine[9]

        if (Number.isNaN(lag) || type == null) {
            return
        }

        const relation: PrimaveraTaskRelation = {
            previous,
            next,
            type,
            lag
        }

        if (relation.lag > 0) {
            warnings.push("Relation \"" + relation.previous + "\" to \""
                                        + relation.next + "\" have lag and is not supported")
            return
        }

        if (relation.type !== "FS") {
            warnings.push("Relation \"" + relation.previous + "\" to \""
                                        + relation.next + "\" have type " + type + " and is not supported")
            return
        }

        relations.push(relation)
    })

    dispatch(endRelationsImport(relations, warnings))
    resolve()
}

export const importRelations = (file: File) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(beginRelationsImport())
        return new Promise<void>((resolve, reject) => {
            if (file.type === "text/csv") {
                const reader = new FileReader()
                reader.onload = parseRelations.bind(reader, reader, dispatch, resolve)
                reader.readAsText(file)
            } else {
                dispatch(relationsImportInvalidFormat())
                resolve()
            }
        })
    }
}

export const dismissInvalidRelationsFormat = (): Action => {
    return {
        type: RELATIONS_DISMISS_INVALID_FORMAT
    }
}

const requestAddRelations = (): Action => {
    return {
        type: RELATIONS_REQUEST_ADD
    }
}

const receiveAddRelations = (): Action => {
    return {
        type: RELATIONS_RECEIVE_ADD
    }
}

/*
export const addRelations = (projectIdentifier: string, relations: Map<string, PrimaveraTaskRelation>) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestAddRelations())
        return Promise.all(Array.from(relations.values(), ((task: PrimaveraTaskRelation) => {
            let inputRelation: ApiInputRelation = {
                identifier: task.identifier,
                projectIdentifier,
                name: task.name,
                description: "",
                estimatedStartDate: task.startDate.toISOString(),
                estimatedDuration: task.duration
            }
            const requestInit: RequestInit = {
                method: "PUT",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    task: inputRelation
                })
            }
            return fetch("/api/task", requestInit)
        }))).then(() => {
            dispatch(receiveAddRelations())
        })
    }
}
*/
