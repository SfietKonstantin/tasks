import {
    Stage, Stages, TasksState, RelationsState, DelaysTaskListState, DelaysSelectionState,
    DelaysState, OverviewState, PrimaveraTask, SubmitState
} from "./types"
import { RelationGraphNode, GraphDiff } from "./graph"
import { MilestoneFilterMode } from "../../common/tasklist/types"
import { Project } from "../../../common/types"

export const stage: Stages = {
    current: Stage.Project,
    max: Stage.Project
}

export const project: Project = {
    identifier: "",
    name: "",
    description: ""
}

export const tasks: TasksState = {
    length: 0,
    tasks: new Map<string, PrimaveraTask>(),
    warnings: new Map<string, Array<string>>(),
    isImporting: false,
    isInvalidFormat: false
}

export const relations: RelationsState = {
    length: 0,
    relations: new Map<string, RelationGraphNode>(),
    warnings: new Map<string, Array<string>>(),
    isImporting: false,
    isInvalidFormat: false
}

export const delaysFilters: DelaysTaskListState = {
    tasks: [],
    filteredTasks: [],
    filters: {
        milestoneFilterMode: MilestoneFilterMode.NoFilter,
        text: ""
    }
}

export const delaysSelection: DelaysSelectionState = {
    selection: new Set<string>(),
    diffs: [],
    warnings: new Map<string, Array<string>>()
}

export const delays: DelaysState = {
    taskList: delaysFilters,
    selection: delaysSelection
}

export const overview: OverviewState = {
    tasks: [],
    delays: [],
    taskRelations: [],
    delayRelations: [],
    warnings: new Map<string, Array<string>>(),
    submitState: SubmitState.Idle
}
