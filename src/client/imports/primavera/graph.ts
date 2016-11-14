import * as maputils from "../../../common/maputils"
import { PrimaveraTask, PrimaveraTaskRelation } from "./types"

export interface RelationGraphNode {
    identifier: string
    parents: Map<string, PrimaveraTaskRelation>
    children: Map<string, PrimaveraTaskRelation>
}

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
            maputils.get(this.nodes, entry[1]).parents.delete(entry[0])
        })
        graphDiff.added.forEach((entry: PrimaveraTaskRelation) => {
            maputils.get(this.nodes, entry.previous).children.set(entry.next, entry)
            maputils.get(this.nodes, entry.next).parents.set(entry.previous, entry)
        })
    }
    createSelectionDiff(selection: Set<string>, tasks: Map<string, PrimaveraTask>): SelectionDiffResults {
        let results: SelectionDiffResults = {
            diffs: [],
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
        const node = maputils.get(this.nodes, identifier)

        if (task.startDate != null && task.endDate != null) {
            // The selected node is a task. Modelling a delay
            // by a task (is questionnable and) means that
            // the delay happens at the end of the task
            //
            // Any task having an FF relation, with the
            // selected task should be taken. However, tasks
            // not having an FF relation will be filtered out.
            this.createNodeDiffWithFilter(node, selection, tasks, (relation: PrimaveraTaskRelation) => {
                if (relation.type !== "FF") {
                    if (!selection.has(relation.previous)) {
                        maputils.addToMapOfList(warnings, relation.previous + " - " + relation.next,
                                                "Non FF relation will be lost")
                    }
                    return false
                }
                return true
            }, diffs, warnings)
        } else {
            // Since the selected node is a milestone, any relation from parent to
            // the node can be considered as *S, so we don't filter the relation between
            // parent to node.
            this.createNodeDiffWithFilter(node, selection, tasks, (relation: PrimaveraTaskRelation) => {
                return true
            }, diffs, warnings)
        }
    }
    private createNodeDiffWithFilter(node: RelationGraphNode, selection: Set<string>, tasks: Map<string, PrimaveraTask>,
                                     parentRelationsFilter: (relation: PrimaveraTaskRelation) => boolean,
                                     diffs: Array<GraphDiff>, warnings: Map<string, Array<string>>) {
        const identifier = node.identifier
        let diff: GraphDiff = {
            added: [],
            removed: []
        }
        Array.from(node.parents.keys(), (parent: string) => {
            diff.removed.push([parent, identifier])
        })
        Array.from(node.children.keys(), (child: string) => {
            diff.removed.push([identifier, child])
        })

        const filteredParentRelations = Array.from(node.parents.values()).filter(parentRelationsFilter)
        filteredParentRelations.forEach((parentRelation: PrimaveraTaskRelation) => {
            if (selection.has(parentRelation.previous)) {
                maputils.addToMapOfList(warnings, parentRelation.previous + " - " + parentRelation.next,
                                        "Relation between " + identifier + " and another delay will be lost")
                return
            }
            node.children.forEach((childRelation: PrimaveraTaskRelation) => {
                if (selection.has(childRelation.next)) {
                    maputils.addToMapOfList(warnings, parentRelation.previous + " - " + parentRelation.next,
                                            "Relation between " + identifier + " and another delay will be lost")
                    return
                }
                // We do not want FF relations: a delay should never condition
                // the end of another task.
                if (childRelation.type === "FS" || childRelation.type === "SS") {
                    diff.added.push({
                        previous: parentRelation.previous,
                        next: childRelation.next,
                        type: RelationGraph.matchType(parentRelation.type, childRelation.type),
                        lag: parentRelation.lag + childRelation.lag
                    })
                } else {
                    maputils.addToMapOfList(warnings, childRelation.previous + " - " + childRelation.next,
                                            "Unable to handle \"" + childRelation.type + "\" when selecting "
                                            + identifier + " as a delay")
                }
            })
        })

        diffs.push(diff)
    }
}
