import { Project } from "../../../common/types"
import { ApiImportTask } from "../../../common/apitypes"

export interface State {
    project: Project
    tasks: TasksState
    // relations: RelationsState ???
}

export interface TasksState {
    tasks: Map<string, ApiImportTask>
    warnings: Array<string>
    isImporting: boolean
    invalidFormat: boolean
}