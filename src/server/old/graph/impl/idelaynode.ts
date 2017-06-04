import {IDelayNode} from "../idelaynode"
import {DelayRelation} from "../../../../common/old/delayrelation"

export interface IDelayNodeImpl extends IDelayNode {
    relations: Map<string, DelayRelation>
    compute(): void
}
