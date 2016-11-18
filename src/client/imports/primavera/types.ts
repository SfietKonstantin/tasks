import { Project, TaskRelation, DelayRelation } from "../../../common/types"
import { ApiInputTask, ApiInputDelay } from "../../../common/apitypes"
import { RelationGraphNode, GraphDiff } from "./graph"
import { TaskListFilters } from "../../common/tasklistfilter"

export enum Stage {
    Project,
    Tasks,
    Relations,
    Delays,
    Overview
}

export interface Stages {
    current: Stage
    max: Stage
}

export interface State {
    stage: Stages
    project: Project
    tasks: TasksState
    relations: RelationsState
    delays: DelaysState
    overview: OverviewState
}

export interface PrimaveraTask {
    identifier: string
    name: string
    startDate: Date | null
    endDate: Date | null
}

export interface PrimaveraDelay {
    identifier: string
    name: string
    start: Date
}

export interface PrimaveraTaskRelation {
    previous: string
    next: string
    type: "FS" | "FF" | "SS"
    lag: number
}

export interface TasksState {
    length: number
    tasks: Map<string, PrimaveraTask>
    warnings: Map<string, Array<string>>
    isImporting: boolean
    isInvalidFormat: boolean
}

export interface RelationsState {
    length: number
    relations: Map<string, RelationGraphNode>
    warnings: Map<string, Array<string>>
    isImporting: boolean
    isInvalidFormat: boolean
}

export interface DelaysState {
    filters: TaskListFilters
    tasks: Array<PrimaveraTask>
    selection: Set<string>
    diffs: Array<GraphDiff>
    warnings: Map<string, Array<string>>
}

export enum SubmitState {
    Idle,
    Submitting,
    Submitted,
    SubmitError
}

export interface OverviewState {
    tasks: Array<ApiInputTask>
    delays: Array<ApiInputDelay>
    taskRelations: Array<TaskRelation>
    delayRelations: Array<DelayRelation>
    warnings: Map<string, Array<string>>
    submitState: SubmitState
}
