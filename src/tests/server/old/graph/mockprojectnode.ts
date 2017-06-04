import {IProjectNodeImpl} from "../../../../server/old/graph/impl/iprojectnode"
import {IGraph} from "../../../../server/old/graph/igraph"
import {ITaskNode} from "../../../../server/old/graph/itasknode"
import {IDelayNode} from "../../../../server/old/graph/idelaynode"
import {TaskDefinition} from "../../../../common/old/task"
import {DelayDefinition} from "../../../../common/old/delay"
import {TaskRelation} from "../../../../common/old/taskrelation"
import {DelayRelation} from "../../../../common/old/delayrelation"

export class MockProjectNode implements IProjectNodeImpl {
    graph: IGraph
    projectIdentifier: string
    tasks: Map<string, ITaskNode>
    delays: Map<string, IDelayNode>

    constructor(graph: IGraph, projectIdentifier: string) {
        this.graph = graph
        this.projectIdentifier = projectIdentifier
        this.tasks = new Map<string, ITaskNode>()
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