import * as React from "react"
import { Dispatch } from "redux"
import { Col, Form, FormGroup, FormControl, ControlLabel, Button } from "react-bootstrap"
import { State, Stage } from "../types"
import { Project } from "../../../../common/types"
import { StagePanel } from "./stagepanel"
import { defineStage, defineMaxStage } from "../actions/stages"
import { defineProject } from "../actions/project"

interface ProjectEditorProperties {
    stage: Stage
    project: Project
    onProjectChanged: (projectIdentifier: string, name: string, description: string) => void
    onCurrentStage: () => void
    onNextStage: () => void
}

export class ProjectEditor extends React.Component<ProjectEditorProperties, {}> {
    render() {
        const canNext = this.props.project.identifier.length > 0 && this.props.project.name.length > 0
        return <StagePanel displayStage={Stage.Project} currentStage={this.props.stage}
                           maxStage={Stage.Tasks} title="1. Define project"
                           onCurrent={this.props.onCurrentStage.bind(this)}>
            <Form horizontal>
                <FormGroup validationState={this.getIdentifierValidationState()}>
                    <Col componentClass={ControlLabel} xd={12} md={2}>
                        Project identifier
                    </Col>
                    <Col xd={12} md={10}>
                        <FormControl type="text" placeholder="Project identifier"
                                     onInput={this.handleIdentifierInput.bind(this)} />
                    </Col>
                </FormGroup>
                <FormGroup validationState={this.getNameValidationState()}>
                    <Col componentClass={ControlLabel} xd={12} md={2}>
                        Project name
                    </Col>
                    <Col xd={12} md={10}>
                        <FormControl type="text" placeholder="Project name"
                                     onInput={this.handleNameInput.bind(this)} />
                    </Col>
                </FormGroup>
                <Button bsStyle="primary" disabled={!canNext} onClick={this.handleNext.bind(this)}>Next</Button>
            </Form>
        </StagePanel>
    }
    private getIdentifierValidationState(): "success" | "error" {
        return this.props.project.identifier.length > 0 ? "success" : "error"
    }
    private handleIdentifierInput(e: React.FormEvent) {
        const input = e.target as HTMLInputElement
        this.props.onProjectChanged(input.value, this.props.project.name, this.props.project.description)
    }
    private getNameValidationState(): "success" | "error" {
        return this.props.project.name.length > 0 ? "success" : "error"
    }
    private handleNameInput(e: React.FormEvent) {
        const input = e.target as HTMLInputElement
        this.props.onProjectChanged(this.props.project.identifier, input.value, this.props.project.description)
    }
    private handleNext(e: React.MouseEvent) {
        this.props.onNextStage()
    }
}

export const mapStateToProps = (state: State) => {
    return {
        stage: state.stage.current,
        project: state.project
    }
}

export const mapDispatchToProps = (dispatch: Dispatch<State>) => {
    return {
        onProjectChanged: (projectIdentifier: string, name: string, description: string) => {
            dispatch(defineProject(projectIdentifier, name, description))
        },
        onCurrentStage: () => {
            dispatch(defineStage(Stage.Project))
        },
        onNextStage: () => {
            dispatch(defineStage(Stage.Tasks))
            dispatch(defineMaxStage(Stage.Tasks))
        }
    }
}
