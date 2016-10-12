import { Project } from "../../../common/types"

export interface State {
    project: Project
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
