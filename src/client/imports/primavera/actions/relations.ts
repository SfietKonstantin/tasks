import { Action, Dispatch } from "redux"
import { State, PrimaveraTaskRelation } from "../types"
import { RelationGraphNode } from "../graph"
import { RelationsParseResults, parseRelations } from "../imports"
import { processFile } from "../../../common/actions/files"
import { ErrorAction } from "../../../common/actions/errors"

export const RELATIONS_IMPORT_BEGIN = "RELATIONS_IMPORT_BEGIN"
export const RELATIONS_IMPORT_END = "RELATIONS_IMPORT_END"
export const RELATIONS_IMPORT_INVALID_FORMAT = "RELATIONS_IMPORT_INVALID_FORMAT"
export const RELATIONS_DISMISS_INVALID_FORMAT = "RELATIONS_DISMISS_INVALID_FORMAT"

export interface RelationsAction extends Action {
    length: number
    type: string,
    relations: Map<string, RelationGraphNode>
    warnings: Map<string, Array<string>>
}

export const beginRelationsImport = (): Action => {
    return {
        type: RELATIONS_IMPORT_BEGIN
    }
}

export const endRelationsImport = (results: RelationsParseResults): RelationsAction => {
    return {
        length: results.length,
        type: RELATIONS_IMPORT_END,
        relations: results.relations,
        warnings: results.warnings
    }
}

export const relationsImportInvalidFormat = (): ErrorAction => {
    return {
        type: RELATIONS_IMPORT_INVALID_FORMAT,
        message: "Invalid format for relations CSV file"
    }
}

export const importRelations = (file: File) => {
    return processFile(file, parseRelations,
                       beginRelationsImport, endRelationsImport,
                       relationsImportInvalidFormat)
}

export const dismissInvalidRelationsFormat = (): Action => {
    return {
        type: RELATIONS_DISMISS_INVALID_FORMAT
    }
}
