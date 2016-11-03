import * as React from "react"
import { Dispatch } from "redux"
import { State, Stage, PrimaveraTask, PrimaveraTaskRelation } from "../types"
import { FileSelector } from "./fileselector"
import { defineStage, defineMaxStage } from "../actions/stages"
import { importRelations, dismissInvalidRelationsFormat } from "../actions/relations"
import { filterForOverview } from "../actions/overview"

interface RelationsSelectorProperties {
    stage: Stage
    maxStage: Stage
    tasks: Map<string, PrimaveraTask>
    relations: Array<PrimaveraTaskRelation>
    warnings: Map<string, Array<string>>
    isImporting: boolean
    isInvalidFormat: boolean
    onFileSelected: (file: File) => void
    onCurrentStage: () => void
    onNextStage: (tasks: Map<string, PrimaveraTask>, relations: Array<PrimaveraTaskRelation>) => void
    onDismissInvalidFormat: () => void
}

export class RelationsSelector extends React.Component<RelationsSelectorProperties, {}> {
    render() {
        const relationsLength = this.props.relations.length
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
        onNextStage: (tasks: Map<string, PrimaveraTask>, relations: Array<PrimaveraTaskRelation>) => {
            dispatch(defineStage(Stage.Overview))
            dispatch(defineMaxStage(Stage.Overview))
            dispatch(filterForOverview(tasks, relations))
        },
        onDismissInvalidFormat: () => {
            dispatch(dismissInvalidRelationsFormat())
        }
    }
}
