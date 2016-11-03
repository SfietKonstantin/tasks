import * as React from "react"
import { Dispatch } from "redux"
import { Stage, State, PrimaveraTask } from "../types"
import { FileSelector } from "./fileselector"
import { defineStage, defineMaxStage } from "../actions/stages"
import { importTasks, dismissInvalidTasksFormat } from "../actions/tasks"

interface TasksSelectorProperties {
    stage: Stage
    maxStage: Stage
    tasks: Map<string, PrimaveraTask>
    warnings: Map<string, Array<string>>
    isImporting: boolean
    isInvalidFormat: boolean
    onFileSelected: (file: File) => void
    onCurrentStage: () => void
    onNextStage: () => void
    onDismissInvalidFormat: () => void
}

export class TasksSelector extends React.Component<TasksSelectorProperties, {}> {
    render() {
        const tasksLength = this.props.tasks.size
        const buttonText = tasksLength > 0 ? "Imported " + tasksLength + " tasks" : "Import tasks"

        return <FileSelector displayStage={Stage.Tasks} currentStage={this.props.stage}
                             maxStage={this.props.maxStage} title="2. Select tasks"
                             formLabel="Tasks" buttonText={buttonText} itemCount={tasksLength}
                             warnings={this.props.warnings} isImporting={this.props.isImporting}
                             isInvalidFormat={this.props.isInvalidFormat}
                             onFileSelected={this.props.onFileSelected.bind(this)}
                             onCurrentStage={this.props.onCurrentStage.bind(this)}
                             onNextStage={this.props.onNextStage.bind(this)}
                             onDismissInvalidFormat={this.props.onDismissInvalidFormat.bind(this)} />
    }
}

export const mapStateToProps = (state: State) => {
    return {
        stage: state.stage.current,
        maxStage: state.stage.max,
        tasks: state.tasks.tasks,
        warnings: state.tasks.warnings,
        isImporting: state.tasks.isImporting,
        isInvalidFormat: state.tasks.isInvalidFormat
    }
}

export const mapDispatchToProps = (dispatch: Dispatch<State>) => {
    return {
        onFileSelected: (file: File) => {
            dispatch(importTasks(file))
        },
        onCurrentStage: () => {
            dispatch(defineStage(Stage.Tasks))
        },
        onNextStage: () => {
            dispatch(defineStage(Stage.Relations))
            dispatch(defineMaxStage(Stage.Relations))
        },
        onDismissInvalidFormat: () => {
            dispatch(dismissInvalidTasksFormat())
        }
    }
}
