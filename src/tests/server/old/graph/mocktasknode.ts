import {ITaskNodeImpl} from "../../../../server/old/graph/impl/itasknode"
import {ITaskNode} from "../../../../server/old/graph/itasknode"
import {IProjectNode} from "../../../../server/old/graph/iprojectnode"
import {IDelayNode} from "../../../../server/old/graph/idelaynode"
import {Modifier} from "../../../../common/old/modifier"
import {TaskRelation} from "../../../../common/old/taskrelation"
import {IDelayNodeImpl} from "../../../../server/old/graph/impl/idelaynode"
import {DelayRelation} from "../../../../common/old/delayrelation"

export class MockTaskNode implements ITaskNodeImpl {
    project: IProjectNode
    taskIdentifier: string
    startDate: Date
    duration: number
    children: Array<ITaskNode>
    parents: Array<ITaskNode>
    delays: Array<IDelayNode>
    modifiers: Array<Modifier>
    estimatedStartDate: Date
    estimatedDuration: number
    childrenRelations: Map<string, TaskRelation>
    parentsRelations: Map<string, TaskRelation>

    constructor(project: IProjectNode, taskIdentifier: string, startDate: Date, duration: number) {
        this.project = project
        this.taskIdentifier = taskIdentifier
        this.startDate = startDate
        this.duration = duration
        this.children = []
        this.parents = []
        this.delays = []
        this.modifiers = []
        this.estimatedStartDate = startDate
        this.estimatedDuration = duration
        this.childrenRelations = new Map<string, TaskRelation>()
        this.parentsRelations = new Map<string, TaskRelation>()
    }

    compute(): Promise<void> {
        return Promise.reject(new Error("MockTaskNode: compute is not mocked"))
    }

    addModifier(modifier: Modifier): Promise<Modifier> {
        return Promise.reject(new Error("MockTaskNode: addModifier is not mocked"))
    }

    addChild(node: ITaskNodeImpl, relation: TaskRelation): Promise<void> {
        return Promise.reject(new Error("MockTaskNode: addChild is not mocked"))
    }

    addDelay(node: IDelayNodeImpl, relation: DelayRelation): void {
        throw new Error("MockTaskNode: addDelay is not mocked")
    }

    getEndDate(): Date {
        throw new Error("MockTaskNode: getEndDate is not mocked")
    }

    markAndCompute(): Promise<void> {
        return Promise.reject(new Error("MockTaskNode: markAndCompute is not mocked"))
    }
}
