import { Project } from "../../common/types"
import { ApiTask } from "../../common/apitypes"

export interface State {
    project: ProjectState
}

export interface ProjectState {
    isFetching: boolean
    projects: Array<Project>
}
