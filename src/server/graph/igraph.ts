import {IProjectNode} from "./iprojectnode"
import {Project} from "../../common/project"

export interface IGraph {
    nodes: Map<string, IProjectNode>
    addProject(project: Project): Promise<IProjectNode>
}
