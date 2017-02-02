import {IProjectNodeImpl} from "../../../server/graph/impl/iprojectnode"
import {IGraph} from "../../../server/graph/igraph"
import {ITaskNode} from "../../../server/graph/itasknode"
import {IDelayNode} from "../../../server/graph/idelaynode"
import {TaskDefinition} from "../../../common/task"
import {DelayDefinition} from "../../../common/delay"
import {TaskRelation} from "../../../common/taskrelation"
import {DelayRelation} from "../../../common/delayrelation"

export class MockProjectNode implements IProjectNodeImpl {
    parent: IGraph
    projectIdentifier: string
    nodes: Map<string, ITaskNode>
    delays: Map<string, IDelayNode>

    constructor(parent: IGraph, projectIdentifier: string) {
        this.parent = parent
        this.projectIdentifier = projectIdentifier
        this.nodes = new Map<string, ITaskNode>()
        this.delays = new Map<string, IDelayNode>()
    }

    load(): Promise<void> {
        return Promise.reject(new Error("MockProjectNode: load is not mocked"))
    }

    addTask(task: TaskDefinition): Promise<ITaskNode> {
        return Promise.reject(new Error("MockProjectNode: addTask is not mocked"))
    }

    addDelay(delay: DelayDefinition): Promise<IDelayNode> {
        return Promise.reject(new Error("MockProjectNode: addDelay is not mocked"))
    }

    addTaskRelation(relation: TaskRelation): Promise<void> {
        return Promise.reject(new Error("MockProjectNode: addTaskRelation is not mocked"))
    }

    addDelayRelation(relation: DelayRelation): Promise<void> {
        return Promise.reject(new Error("MockProjectNode: addDelayRelation is not mocked"))
    }
}
