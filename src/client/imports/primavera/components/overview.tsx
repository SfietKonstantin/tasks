import * as React from "react"
import { Dispatch } from "redux"
import { Button, ButtonGroup, Badge } from "react-bootstrap"
import { State, Stage, SubmitState } from "../types"
import { StagePanel } from "./stagepanel"
import { WarningsButton } from "./warningsbutton"
import { defineStage, defineMaxStage } from "../actions/stages"
import { submit } from "../actions/overview"
import { Project, TaskRelation } from "../../../../common/types"
import { ApiInputTask } from "../../../../common/apitypes"
import * as maputils from "../../../../common/maputils"

interface OverviewProperties {
    stage: Stage
    maxStage: Stage
    totalTasks: number
    project: Project
    tasks: Array<ApiInputTask>
    totalRelations: number
    relations: Array<TaskRelation>
    warnings: Map<string, Array<string>>
    submitState: SubmitState
    onCurrentStage: () => void
    onSubmit: (project: Project, tasks: Array<ApiInputTask>, relations: Array<TaskRelation>) => void
}

export class Overview extends React.Component<OverviewProperties, {}> {
    render() {
        let totalWarnings = maputils.lengthOfMapOfList(this.props.warnings)
        const tasksLength = this.props.tasks.length
        const relationsLength = this.props.relations.length
        let warningsButton: JSX.Element | null = null
        if (totalWarnings > 0) {
            warningsButton = <WarningsButton warnings={this.props.warnings} />
        }
        const projectIdentifierLength = this.props.project.identifier.length
        const canImport = projectIdentifierLength > 0
                          && this.props.project.name.length > 0
                          && tasksLength > 0 && relationsLength > 0
                          && this.props.submitState !== SubmitState.Submitted
        return <StagePanel displayStage={Stage.Overview}
                           currentStage={this.props.stage}
                           maxStage={this.props.maxStage} title="4. Overview"
                           warnings={totalWarnings}
                           onCurrent={this.props.onCurrentStage.bind(this)}>
            <p><Badge>{tasksLength}</Badge> of the {this.props.totalTasks} tasks will be imported</p>
            <p><Badge>{relationsLength}</Badge> of the {this.props.totalRelations} relations will be imported</p>
            <ButtonGroup>
                <Button bsStyle={this.getButtonStyle()} disabled={!canImport} onClick={this.handleSubmit.bind(this)}>
                    {this.getButtonText()}
                </Button>
                {warningsButton}
            </ButtonGroup>
        </StagePanel>
    }
    private handleSubmit(e: React.MouseEvent) {
        this.props.onSubmit(this.props.project, this.props.tasks, this.props.relations)
    }
    private getButtonStyle(): string {
        switch (this.props.submitState) {
            case SubmitState.Idle:
                return "primary"
            case SubmitState.Submitting:
                return "default"
            case SubmitState.Submitted:
                return "success"
            case SubmitState.SubmitError:
                return "danger"
        }
    }
    private getButtonText(): string {
        switch (this.props.submitState) {
            case SubmitState.Idle:
                return "Import"
            case SubmitState.Submitting:
                return "Importing"
            case SubmitState.Submitted:
                return "Import successful"
            case SubmitState.SubmitError:
                return "Import failed"
        }
    }
}

export const mapStateToProps = (state: State) => {
    return {
        stage: state.stage.current,
        maxStage: state.stage.max,
        project: state.project.project,
        totalTasks: state.tasks.length,
        tasks: state.overview.tasks,
        totalRelations: state.relations.length,
        relations: state.overview.relations,
        warnings: state.overview.warnings,
        submitState: state.overview.submitState,
    }
}

export const mapDispatchToProps = (dispatch: Dispatch<State>) => {
    return {
        onCurrentStage: () => {
            dispatch(defineStage(Stage.Relations))
        },
        onSubmit: (project: Project, tasks: Array<ApiInputTask>, relations: Array<TaskRelation>) => {
            dispatch(submit(project, tasks, relations))
        },
    }
}
