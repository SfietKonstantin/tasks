import { Project } from "../../../common/types"

export enum Stage {
    Project,
    Tasks,
    Relations,
    Overview
}

export interface Stages {
    current: Stage
    max: Stage
}

export interface State {
    stage: Stages
    project: ProjectState
    tasks: TasksState
    relations: RelationsState
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

export interface ProjectState {
    project: Project
    error: string | null
}

export interface TasksState {
    tasks: Map<string, PrimaveraTask>
    delays: Map<string, PrimaveraDelay>
    warnings: Array<string>
    isImporting: boolean
    invalidFormat: boolean
}

export interface RelationsState {
    relations: Array<PrimaveraTaskRelation>
    warnings: Array<string>
    isImporting: boolean
    invalidFormat: boolean
}
