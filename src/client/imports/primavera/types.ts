import { Project, TaskRelation } from "../../../common/types"
import { ApiInputTask } from "../../../common/apitypes"
import { RelationGraphNode } from "./graph"

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
    overview: OverviewState
}

export interface PrimaveraTask {
    identifier: string
    name: string
    duration: number
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
    type: "FS" | "SF" | "FF" | "SS"
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

export enum SubmitState {
    Idle,
    Submitting,
    Submitted,
    SubmitError
}

export interface OverviewState {
    tasks: Array<ApiInputTask>
    relations: Array<TaskRelation>
    warnings: Map<string, Array<string>>
    errors: Map<string, Array<string>>
    submitState: SubmitState
}
