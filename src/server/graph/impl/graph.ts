import {IGraph} from "../igraph"
import {INodeFactory} from "./inodefactory"
import {IProjectNode} from "../iprojectnode"
import {Project} from "../../../common/project"
import {IDaoBuilder} from "../../dao/ibuilder"
import {IProjectDao} from "../../dao/iproject"
import {ExistsError} from "../../error/exists"

export class Graph implements IGraph {
    projects: Map<string, IProjectNode>
    private readonly nodeFactory: INodeFactory
    private readonly daoBuilder: IDaoBuilder
    private readonly dao: IProjectDao

    constructor(nodeFactory: INodeFactory, daoBuilder: IDaoBuilder) {
        this.nodeFactory = nodeFactory
        this.daoBuilder = daoBuilder
        this.dao = daoBuilder.buildProjectDao()
        this.projects = new Map<string, IProjectNode>()
    }

    load(): Promise<void> {
        return this.dao.getAllProjects().then((projects: Array<Project>) => {
            return Promise.all(projects.map((project: Project) => {
                let node = this.nodeFactory.createProjectNode(this.daoBuilder, this, project.identifier)
                return node.load().then(() => {
                    this.projects.set(project.identifier, node)
                })
            })).then(() => {})
        })
    }

    addProject(project: Project): Promise<IProjectNode> {
        if (this.projects.has(project.identifier)) {
            return Promise.reject(new ExistsError(`Project "${project.identifier}" is already present`))
        }
        return this.dao.addProject(project).then(() => {
            const node = this.nodeFactory.createProjectNode(this.daoBuilder, this, project.identifier)
            this.projects.set(project.identifier, node)
            return node
        })
    }
}
