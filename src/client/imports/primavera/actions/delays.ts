import { Action, Dispatch } from "redux"
import { State, PrimaveraTask } from "../types"
import { RelationGraphNode } from "../graph"
import { TaskListFilters } from "../../../common/tasklistfilter"

export const DELAY_FILTERS_DEFINE = "DELAY_FILTERS_DEFINE"
export const DELAY_SELECTION_DEFINE = "DELAY_SELECTION_DEFINE"

export interface DelayFiltersAction extends Action {
    type: string,
    tasks: Array<PrimaveraTask>
    filters: TaskListFilters
}

export const defineDelayFilters = (tasks: Map<string, PrimaveraTask>,
                                   filters: TaskListFilters): DelayFiltersAction => {
    return {
        type: DELAY_FILTERS_DEFINE,
        tasks: Array.from(tasks.values()),
        filters
    }
}

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
