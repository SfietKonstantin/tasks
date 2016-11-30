import * as React from "react"
import { Dispatch } from "redux"
import { State, Stage, PrimaveraTask, PrimaveraTaskRelation } from "../types"
import { RelationGraphNode } from "../graph"
import { FileSelector } from "./fileselector"
import { defineStage, defineMaxStage } from "../actions/stages"
import { importRelations, dismissInvalidRelationsFormat } from "../actions/relations"
import { updateTasks, updateFilters } from "../../../common/tasklist/actions"
import { MilestoneFilterMode, TaskListFilters } from "../../../common/tasklist/types"

interface RelationsSelectorProperties {
    stage: Stage
    maxStage: Stage
    tasks: Map<string, PrimaveraTask>
    relations: Map<string, RelationGraphNode>
    warnings: Map<string, Array<string>>
    isImporting: boolean
    isInvalidFormat: boolean
    onFileSelected: (file: File) => void
    onCurrentStage: () => void
    onNextStage: (tasks: Map<string, PrimaveraTask>, relations: Map<string, RelationGraphNode>) => void
    onDismissInvalidFormat: () => void
}

export class RelationsSelector extends React.Component<RelationsSelectorProperties, {}> {
    render() {
        const relationsLength = RelationsSelector.countRelations(this.props.relations)
        const buttonText = relationsLength > 0 ? "Imported " + relationsLength + " relations" : "Import relations"

        return <FileSelector displayStage={Stage.Relations} currentStage={this.props.stage}
                             maxStage={this.props.maxStage} title="3. Select relations"
                             formLabel="Relations" buttonText={buttonText} itemCount={relationsLength}
                             warnings={this.props.warnings} isImporting={this.props.isImporting}
                             isInvalidFormat={this.props.isInvalidFormat}
                             onFileSelected={this.props.onFileSelected.bind(this)}
                             onCurrentStage={this.props.onCurrentStage.bind(this)}
                             onNextStage={this.handleNextStage.bind(this)}
                             onDismissInvalidFormat={this.props.onDismissInvalidFormat.bind(this)} />
    }
    private handleNextStage() {
        this.props.onNextStage(this.props.tasks, this.props.relations)
    }
    private static countRelations(relations: Map<string, RelationGraphNode>) {
        return Array.from(relations.values(), (node: RelationGraphNode) => {
            return node.children.size
        }).reduce((first: number, second: number) => {
            return first + second
        }, 0)
    }
}

export const mapStateToProps = (state: State) => {
    return {
        stage: state.stage.current,
        maxStage: state.stage.max,
        tasks: state.tasks.tasks,
        relations: state.relations.relations,
        warnings: state.relations.warnings,
        isImporting: state.relations.isImporting,
        isInvalidFormat: state.relations.isInvalidFormat
    }
}

export const mapDispatchToProps = (dispatch: Dispatch<State>) => {
    return {
        onFileSelected: (file: File) => {
            dispatch(importRelations(file))
        },
        onCurrentStage: () => {
            dispatch(defineStage(Stage.Relations))
        },
        onNextStage: (tasks: Map<string, PrimaveraTask>, relations: Map<string, RelationGraphNode>) => {
            dispatch(defineStage(Stage.Delays))
            dispatch(defineMaxStage(Stage.Delays))
            const filters: TaskListFilters = {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            }
            dispatch(updateTasks(Array.from(tasks.values())))
            dispatch(updateFilters(filters))
        },
        onDismissInvalidFormat: () => {
            dispatch(dismissInvalidRelationsFormat())
        }
    }
}
