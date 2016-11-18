import { Action } from "redux"
import { RelationsState, PrimaveraTaskRelation } from "../types"
import { RelationGraphNode } from "../graph"
import { relations } from "../states"
import {
    RelationsAction,
    RELATIONS_IMPORT_BEGIN,
    RELATIONS_IMPORT_END,
    RELATIONS_IMPORT_INVALID_FORMAT,
    RELATIONS_DISMISS_INVALID_FORMAT,
} from "../actions/relations"

export const relationsReducer = (state: RelationsState = relations, action: Action): RelationsState => {
    switch (action.type) {
        case RELATIONS_IMPORT_BEGIN:
            return Object.assign({}, state, {
                isImporting: true,
                isInvalidFormat: false
            })
        case RELATIONS_IMPORT_END:
            const relationsAction = action as RelationsAction
            return Object.assign({}, state, {
                length: relationsAction.length,
                relations: relationsAction.relations,
                warnings: relationsAction.warnings,
                isImporting: false,
                isInvalidFormat: false
            })
        case RELATIONS_IMPORT_INVALID_FORMAT:
            return Object.assign({}, state, {
                length: 0,
                relations: new Map<string, RelationGraphNode>(),
                warnings: new Map<string, Array<string>>(),
                isImporting: false,
                isInvalidFormat: true
            })
        case RELATIONS_DISMISS_INVALID_FORMAT:
            return Object.assign({}, state, {
                isInvalidFormat: false
            })
        default:
            return state
    }
}
