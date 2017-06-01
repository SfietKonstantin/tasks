import {IGraph} from "../../../server/graph/igraph"
import {IProjectNode} from "../../../server/graph/iprojectnode"
import {Project} from "../../../common/old/project"

export class MockGraph implements IGraph {
    projects: Map<string, IProjectNode>

    constructor() {
        this.projects = new Map<string, IProjectNode>()
    }

    load(): Promise<void> {
        return Promise.reject(new Error("MockGraph: load is not mocked"))
    }

    addProject(project: Project): Promise<IProjectNode> {
        return Promise.reject(new Error("MockGraph: addProject is not mocked"))
    }
}
