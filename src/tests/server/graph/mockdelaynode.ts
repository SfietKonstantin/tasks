import {IDelayNodeImpl} from "../../../server/graph/impl/idelaynode"
import {IProjectNode} from "../../../server/graph/iprojectnode"
import {ITaskNode} from "../../../server/graph/itasknode"
import {DelayRelation} from "../../../common/old/delayrelation"

export class MockDelayNode implements IDelayNodeImpl {
    project: IProjectNode
    delayIdentifier: string
    initialMargin: number
    margin: number
    tasks: Array<ITaskNode>
    relations: Map<string, DelayRelation>

    constructor(project: IProjectNode, delayIdentifier: string) {
        this.project = project
        this.delayIdentifier = delayIdentifier
        this.initialMargin = 0
        this.margin = 0
        this.tasks = []
    }

    compute() {
        throw new Error("MockDelayNode: compute is not mocked")
    }
}
