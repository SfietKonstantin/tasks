import { Action, Dispatch } from "redux"
import { State, PrimaveraTaskRelation } from "../types"
import { RelationParseResults, parseRelations } from "../imports"
import { processFile } from "../../../common/actions/files"
import { ErrorAction } from "../../../common/actions/errors"

export const RELATIONS_IMPORT_BEGIN = "RELATIONS_IMPORT_BEGIN"
export const RELATIONS_IMPORT_END = "RELATIONS_IMPORT_END"
export const RELATIONS_IMPORT_INVALID_FORMAT = "RELATIONS_IMPORT_INVALID_FORMAT"
export const RELATIONS_DISMISS_INVALID_FORMAT = "RELATIONS_DISMISS_INVALID_FORMAT"

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

const endRelationsImport = (results: RelationParseResults): RelationsAction => {
    return {
        type: RELATIONS_IMPORT_END,
        relations: results.relations,
        warnings: results.warnings
    }
}

const relationsImportInvalidFormat = (): ErrorAction => {
    return {
        type: RELATIONS_IMPORT_INVALID_FORMAT,
        message: "Invalid format for relations CSV file"
    }
}

export const importRelations = (file: File) => {
    return processFile(file, "text/csv", parseRelations,
                       beginRelationsImport, endRelationsImport,
                       relationsImportInvalidFormat)
}

export const dismissInvalidRelationsFormat = (): Action => {
    return {
        type: RELATIONS_DISMISS_INVALID_FORMAT
    }
}
