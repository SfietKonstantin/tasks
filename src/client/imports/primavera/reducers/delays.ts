import { combineReducers, Action } from "redux"
import { DelaySelectionAction, DELAY_SELECTION_DEFINE } from "../actions/delays"
import { DelaysState, DelaysSelectionState, DelaysFiltersState, PrimaveraTask } from "../types"
import { GraphDiff, RelationGraph } from "../graph"
import { delaysFilters, delaysSelection } from "../states"
import { MilestoneFilterMode, TaskListFilters } from "../../../common/tasklist/types"
import { filtersReducer } from "../../../common/tasklist/reducers"
import { filterTaskList } from "../../../common/tasklist/filters"
import { sortStrings } from "../../../../common/stringutils"
import { copyAssign } from "../../../common/assign"

const filterTasks = (tasks: Array<PrimaveraTask>, filters: TaskListFilters): Array<PrimaveraTask> => {
    return filterTaskList(tasks, filters).sort((first: PrimaveraTask, second: PrimaveraTask) => {
        return sortStrings(first.identifier, second.identifier)
    })
}

const delaysFiltersReducer = filtersReducer(delaysFilters, filterTasks)

const delaysSelectionReducer = (state: DelaysSelectionState = delaysSelection,
                                action: Action): DelaysSelectionState => {
    switch (action.type) {
        case DELAY_SELECTION_DEFINE:
            const selectionAction = action as DelaySelectionAction
            if (selectionAction.selected) {
                state.selection.add(selectionAction.identifier)
            } else {
                state.selection.delete(selectionAction.identifier)
            }
            const graph = RelationGraph.fromNodes(selectionAction.relations)
            const selectionResults = graph.createSelectionDiff(state.selection, selectionAction.tasks)
            return copyAssign(state, {
                selection: state.selection,
                diffs: selectionResults.diffs,
                warnings: selectionResults.warnings
            })
        default:
            return state
    }
}

export const delaysReducer = combineReducers<DelaysState>({
    filters: delaysFiltersReducer,
    selection: delaysSelectionReducer
})
