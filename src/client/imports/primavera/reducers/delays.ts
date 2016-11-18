import { Action } from "redux"
import {
    DelayFiltersAction, DELAY_FILTERS_DEFINE, DelaySelectionAction, DELAY_SELECTION_DEFINE
} from "../actions/delays"
import { DelaysState, PrimaveraTask } from "../types"
import { GraphDiff, RelationGraph } from "../graph"
import { delays } from "../states"
import {
    MilestoneFilterMode, TaskListFilters, TaskListFilterInterface, filterTaskList
} from "../../../common/tasklistfilter"
import { sortStrings } from "../../../../common/stringutils"

const filterTasks = (tasks: Array<PrimaveraTask>, filters: TaskListFilters): Array<PrimaveraTask> => {
    const filterInterface: TaskListFilterInterface<PrimaveraTask> = {
        isMilestone: (task: PrimaveraTask): boolean => {
            return task.startDate == null || task.endDate == null
        },
        getIdentifier: (task: PrimaveraTask): string => {
            return task.identifier
        },
        getName: (task: PrimaveraTask): string => {
            return task.name
        }
    }

    return filterTaskList(tasks, filters, filterInterface).sort((first: PrimaveraTask, second: PrimaveraTask) => {
        return sortStrings(first.identifier, second.identifier)
    })
}

export const delaysReducer = (state: DelaysState = delays, action: Action): DelaysState => {
    switch (action.type) {
        case DELAY_FILTERS_DEFINE:
            const filtersAction = action as DelayFiltersAction
            return Object.assign({}, state, {
                filters: filtersAction.filters,
                tasks: filterTasks(filtersAction.tasks, filtersAction.filters)
            })
        case DELAY_SELECTION_DEFINE:
            const selectionAction = action as DelaySelectionAction
            if (selectionAction.selected) {
                state.selection.add(selectionAction.identifier)
            } else {
                state.selection.delete(selectionAction.identifier)
            }
            const graph = RelationGraph.fromNodes(selectionAction.relations)
            const selectionResults = graph.createSelectionDiff(state.selection, selectionAction.tasks)
            return Object.assign({}, state, {
                selection: state.selection,
                diffs: selectionResults.diffs,
                warnings: selectionResults.warnings
            })
        default:
            return state
    }
}
