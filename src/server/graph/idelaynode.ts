import {IProjectNode} from "./iprojectnode"
import {ITaskNode} from "./itasknode"

export interface IDelayNode {
    parent: IProjectNode
    delayIdentifier: string
    initialMargin: number
    margin: number
    tasks: Array<ITaskNode>
}
