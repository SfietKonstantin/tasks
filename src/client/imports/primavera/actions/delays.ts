import { Action, Dispatch } from "redux"
import { State, PrimaveraTask } from "../types"
import { RelationGraphNode } from "../graph"

export const DELAY_SELECTION_DEFINE = "DELAY_SELECTION_DEFINE"

export interface DelaySelectionAction extends Action {
    type: string,
    tasks: Map<string, PrimaveraTask>,
    relations: Map<string, RelationGraphNode>,
    identifier: string,
    selected: boolean
}

export const defineDelaySelection = (tasks: Map<string, PrimaveraTask>,
                                     relations: Map<string, RelationGraphNode>,
                                     identifier: string, selected: boolean): DelaySelectionAction => {
    return {
        type: DELAY_SELECTION_DEFINE,
        tasks,
        relations,
        identifier,
        selected
    }
}
