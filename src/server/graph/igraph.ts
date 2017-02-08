import {IProjectNode} from "./iprojectnode"
import {Project} from "../../common/project"

export interface IGraph {
    projects: Map<string, IProjectNode>
    load(): Promise<void>
    addProject(project: Project): Promise<IProjectNode>
}
