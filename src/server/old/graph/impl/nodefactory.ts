import {INodeFactory} from "./inodefactory"
import {IDaoBuilder} from "../../dao/ibuilder"
import {Graph} from "./graph"
import {IProjectNode} from "../iprojectnode"
import {ProjectNode} from "./projectnode"
import {TaskNode} from "./tasknode"
import {DelayNode} from "./delaynode"

export class NodeFactory implements INodeFactory {
    createProjectNode(daoBuilder: IDaoBuilder, parent: Graph, projectIdentifier: string): ProjectNode {
        return new ProjectNode(this, daoBuilder, parent, projectIdentifier)
    }

    createTaskNode(daoBuilder: IDaoBuilder, parent: IProjectNode, taskIdentifier: string,
                   estimatedStartDate: Date, estimatedDuration: number): TaskNode {
        return new TaskNode(daoBuilder, parent, taskIdentifier, estimatedStartDate, estimatedDuration)
    }

    createDelayNode(parent: IProjectNode, delayIdentifier: string, date: Date): DelayNode {
        return new DelayNode(parent, delayIdentifier, date)
    }
}
