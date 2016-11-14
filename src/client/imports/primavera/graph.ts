import * as maputils from "../../../common/maputils"
import { PrimaveraTask, PrimaveraTaskRelation } from "./types"

export interface GraphDiff {
    added: Array<PrimaveraTaskRelation>
    removed: Array<[string, string]>
}

export interface SelectionDiffResults {
    diffs: Array<GraphDiff>
    warnings: Map<string, Array<string>>
}

export class RelationGraph {
    nodes: Map<string, RelationGraphNode>
    constructor() {
        this.nodes = new Map<string, RelationGraphNode>()
    }
    static fromNodes(nodes: Map<string, RelationGraphNode>): RelationGraph {
        let returned = new RelationGraph()
        returned.nodes = nodes
        return returned
    }
    addRelation(relation: PrimaveraTaskRelation) {
        let previousNode = this.pushNode(relation.previous)
        let nextNode = this.pushNode(relation.next)
        if (previousNode.children.has(relation.next)
            || nextNode.children.has(relation.previous)) {
            throw new Error("Duplicated relation")
        }
        previousNode.children.set(relation.next, relation)
        nextNode.parents.set(relation.previous, relation)
    }
    applyDiff(graphDiff: GraphDiff) {
        graphDiff.removed.forEach((entry: [string, string]) => {
            maputils.get(this.nodes, entry[0]).children.delete(entry[1])
            maputils.get(this.nodes, entry[1]).parents.delete(entry[1])
        })
        graphDiff.added.forEach((entry: PrimaveraTaskRelation) => {
            maputils.get(this.nodes, entry.previous).children.set(entry.next, entry)
            maputils.get(this.nodes, entry.next).parents.set(entry.previous, entry)
        })
    }
    createSelectionDiff(selection: Set<string>, tasks: Map<string, PrimaveraTask>): SelectionDiffResults {
        let results: SelectionDiffResults = {
            diffs: new Array<GraphDiff>(),
            warnings: new Map<string, Array<string>>()
        }

        selection.forEach((identifier: string) => {
            this.createNodeDiff(identifier, selection, tasks, results.diffs, results.warnings)
        })
        return results
    }
    private pushNode(identifier: string) {
        if (!this.nodes.has(identifier)) {
            this.nodes.set(identifier, {
                identifier,
                parents: new Map<string, PrimaveraTaskRelation>(),
                children: new Map<string, PrimaveraTaskRelation>()
            })
        }
        return maputils.get(this.nodes, identifier)
    }
    private static matchType(previousType: "FS" | "FF" | "SS",
                             nextType: "FS" | "FF" | "SS"): "FS" | "FF" | "SS" {
        return previousType[0] + nextType[1] as ("FS" | "FF" | "SS")
    }
    private createNodeDiff(identifier: string, selection: Set<string>, tasks: Map<string, PrimaveraTask>,
                           diffs: Array<GraphDiff>, warnings: Map<string, Array<string>>) {
        if (!this.nodes.has(identifier)) {
            return
        }

        const task = maputils.get(tasks, identifier)
        if (task.startDate != null && task.endDate != null) {
            // TODO: do something about "standard tasks"
            return
        }

        const node = maputils.get(this.nodes, identifier)
        let diff: GraphDiff = {
            added: new Array<PrimaveraTaskRelation>(),
            removed: new Array<[string, string]>()
        }
        Array.from(node.parents.keys(), (parent: string) => {
            diff.removed.push([parent, identifier])
        })
        Array.from(node.children.keys(), (child: string) => {
            diff.removed.push([identifier, child])
        })

        // Since the selected node is a milestone, any relation from parent to
        // the node can be considered as *S, so we don't filter the relation between
        // parent to node.
        //
        // However, we filter relations from node to children as we want those relations
        // to be of type *S
        node.parents.forEach((parentToNodeRelation: PrimaveraTaskRelation) => {
            if (selection.has(parentToNodeRelation.previous)) {
                maputils.addToMapOfList(warnings, parentToNodeRelation.previous + " - " + parentToNodeRelation.next,
                                            "Relation between " + identifier + " and another delay will be lost")
                return
            }
            node.children.forEach((nodeToChildRelation: PrimaveraTaskRelation) => {
                if (selection.has(nodeToChildRelation.next)) {
                    maputils.addToMapOfList(warnings, parentToNodeRelation.previous + " - " + parentToNodeRelation.next,
                                            "Relation between " + identifier + " and another delay will be lost")
                    return
                }
                if (nodeToChildRelation.type === "FS" || nodeToChildRelation.type === "SS") {
                    diff.added.push({
                        previous: parentToNodeRelation.previous,
                        next: nodeToChildRelation.next,
                        type: RelationGraph.matchType(parentToNodeRelation.type, nodeToChildRelation.type),
                        lag: parentToNodeRelation.lag + nodeToChildRelation.lag
                    })
                } else {
                    maputils.addToMapOfList(warnings, nodeToChildRelation.previous + " - " + nodeToChildRelation.next,
                                            "Unable to handle \"" + nodeToChildRelation.type + "\" when selecting "
                                            + identifier + " as a delay")
                }
            })
        })
        diffs.push(diff)
    }
}


export interface RelationGraphNode {
    identifier: string
    parents: Map<string, PrimaveraTaskRelation>
    children: Map<string, PrimaveraTaskRelation>
}
