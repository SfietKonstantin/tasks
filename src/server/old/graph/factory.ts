import {Graph} from "./impl/graph"
import {IDaoBuilder} from "../dao/ibuilder"
import {NodeFactory} from "./impl/nodefactory"

export class GraphFactory {
    static create(daoBuilder: IDaoBuilder) {
        return new Graph(new NodeFactory(), daoBuilder)
    }
}
