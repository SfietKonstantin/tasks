import {IGraph} from "../../../server/graph/igraph"
import {IProjectNode} from "../../../server/graph/iprojectnode"
import {Project} from "../../../common/project"

export class MockGraph implements IGraph {
    projects: Map<string, IProjectNode>

    constructor() {
        this.projects = new Map<string, IProjectNode>()
    }

    addProject(project: Project): Promise<IProjectNode> {
        return Promise.reject(new Error("MockGraph: addProject is not mocked"))
    }
}
