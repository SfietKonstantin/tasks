import { Action } from "redux"
import { RelationsState, PrimaveraTaskRelation } from "../types"
import {
    RelationsAction,
    RELATIONS_IMPORT_BEGIN,
    RELATIONS_IMPORT_END,
    RELATIONS_IMPORT_INVALID_FORMAT,
    RELATIONS_DISMISS_INVALID_FORMAT,
    RELATIONS_REQUEST_ADD,
    RELATIONS_RECEIVE_ADD
} from "../actions/relations"

const initialState: RelationsState = {
    relations: new Array<PrimaveraTaskRelation>(),
    warnings: new Array<string>(),
    isImporting: false,
    invalidFormat: false
}

export const relationsReducer = (state: RelationsState = initialState, action: Action): RelationsState => {
    switch (action.type) {
        case RELATIONS_IMPORT_BEGIN:
            return Object.assign({}, state, {
                isImporting: true,
                invalidFormat: false
            })
        case RELATIONS_IMPORT_END:
            const relationsAction = action as RelationsAction
            return Object.assign({}, state, {
                relations: relationsAction.relations,
                warnings: relationsAction.warnings,
                isImporting: false,
                invalidFormat: false
            })
        case RELATIONS_IMPORT_INVALID_FORMAT:
            return Object.assign({}, state, {
                relations: new Array<PrimaveraTaskRelation>(),
                warnings: new Array<string>(),
                isImporting: false,
                invalidFormat: true
            })
        case RELATIONS_DISMISS_INVALID_FORMAT:
            return Object.assign({}, state, {
                invalidFormat: false
            })
        default:
            return state
    }
}
