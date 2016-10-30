import * as React from "react"
import { Dispatch } from "redux"
import { State, Stage, PrimaveraTaskRelation } from "../types"
import { FileSelector } from "./fileselector"
import { defineStage, defineMaxStage } from "../actions/stages"
import { importRelations } from "../actions/relations"

interface RelationsSelectorProperties {
    stage: Stage
    maxStage: Stage
    relations: Array<PrimaveraTaskRelation>
    warnings: Array<string>
    isImporting: boolean
    onFileSelected: (file: File) => void
    onCurrentStage: () => void
    onNextStage: () => void
}

export class RelationsSelector extends React.Component<RelationsSelectorProperties, {}> {
    render() {
        const relationsLength = this.props.relations.length
        const buttonText = relationsLength > 0 ? "Imported " + relationsLength + " relations" : "Import relations"

        return <FileSelector displayStage={Stage.Relations} currentStage={this.props.stage}
                             maxStage={this.props.maxStage} title="3. Select relations"
                             formLabel="Tasks" buttonText={buttonText} itemCount={relationsLength}
                             warnings={this.props.warnings} isImporting={this.props.isImporting}
                             onFileSelected={this.props.onFileSelected.bind(this)}
                             onCurrentStage={this.props.onCurrentStage.bind(this)}
                             onNextStage={this.props.onNextStage.bind(this)} />
    }
}

export const mapStateToProps = (state: State) => {
    return {
        stage: state.stage.current,
        maxStage: state.stage.max,
        relations: state.relations.relations,
        warnings: state.relations.warnings,
        isImporting: state.relations.isImporting
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
        onNextStage: () => {
            dispatch(defineStage(Stage.Overview))
            dispatch(defineMaxStage(Stage.Overview))
        }
    }
}
