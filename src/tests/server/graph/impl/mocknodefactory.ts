import {INodeFactory} from "../../../../server/graph/impl/inodefactory"
import {IDaoBuilder} from "../../../../server/dao/ibuilder"
import {Graph} from "../../../../server/graph/impl/graph"
import {IProjectNode} from "../../../../server/graph/iprojectnode"
import {IProjectNodeImpl} from "../../../../server/graph/impl/iprojectnode"
import {ITaskNodeImpl} from "../../../../server/graph/impl/itasknode"
import {IDelayNodeImpl} from "../../../../server/graph/impl/idelaynode"

export class MockNodeFactory implements INodeFactory {
    createProjectNode(daoBuilder: IDaoBuilder, parent: Graph, projectIdentifier: string): IProjectNodeImpl {
        throw new Error("MockNodeFactory: createProjectNode is not mocked")
    }

    createTaskNode(daoBuilder: IDaoBuilder, parent: IProjectNode, taskIdentifier: string,
                   estimatedStartDate: Date, estimatedDuration: number): ITaskNodeImpl {
        throw new Error("MockNodeFactory: createTaskNode is not mocked")
    }

    createDelayNode(parent: IProjectNode, delayIdentifier: string, date: Date): IDelayNodeImpl {
        throw new Error("MockNodeFactory: createDelayNode is not mocked")
    }
}
