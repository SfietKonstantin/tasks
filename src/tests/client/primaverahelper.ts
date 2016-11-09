import { PrimaveraTaskRelation } from "../../client/imports/primavera/types"
import { RelationGraph, RelationGraphNode } from "../../client/imports/primavera/graph"

export const makeRelations = (relations: Array<PrimaveraTaskRelation>): Map<string, RelationGraphNode> => {
    let graph = new RelationGraph()
    relations.forEach((relation: PrimaveraTaskRelation) => {
        graph.addRelation(Object.assign({}, relation))
    })
    return graph.nodes
}