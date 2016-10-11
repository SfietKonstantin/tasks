import * as React from "react"
import * as ReactDOM from "react-dom"
import { Dispatch } from "redux"
import * as ReactRedux from "react-redux"
import { Grid, Col, ButtonGroup, Button, Alert, Form, FormGroup, FormControl, ControlLabel } from "react-bootstrap"
import { State } from "../types"
import { defineProject, addProject } from "../actions/project"
import { importTasks, dismissInvalidFormat, addTasks } from "../actions/tasks"
import { Project } from "../../../../common/types"
import { ApiImportTask } from "../../../../common/apitypes"

interface MainProperties {
    project: Project
    tasks: Map<string, ApiImportTask>
    warnings: Array<string>
    isTaskImporting: boolean
    invalidFormat: boolean
    onTasksFileSelected: (file: File) => void
    onProjectChanged: (identifier: string, name: string, description: string) => void
    onDismissInvalidFormat: () => void
    onSubmit: (project: Project, tasks: Map<string, ApiImportTask>) => void
    dispatch: Dispatch<State>
}

class UnconnectedMain extends React.Component<MainProperties, {}> {
    render() {
        let alert: JSX.Element = null
        if (this.props.invalidFormat) {
            alert = <Alert bsStyle="danger" onDismiss={this.props.onDismissInvalidFormat}>
                Only CSV format is supported 
            </Alert>
        }
        const identifierValidation: "success" | "error" = this.props.project.identifier.length > 0 ? "success" : "error"
        const tasksColor = this.props.tasks.size > 0 ? "success" : "default"
        const relationsColor = "default"
        const canImportRelations = this.props.tasks.size > 0
        const canImport = this.props.project.identifier.length > 0
                          && this.props.project.name.length > 0 
                          && this.props.tasks.size > 0 // && ???
        const tasksButtonText = this.props.tasks.size > 0 ? "Imported " + this.props.tasks.size + " tasks"
                                                          : "Import tasks"
        let warnings: JSX.Element = null
        if (this.props.warnings.length > 0) {
            const warningTexts = this.props.warnings.map((warning: string) => {
                return <p>{warning}</p>
            })
            warnings = <FormGroup>
                <Col componentClass={ControlLabel} xd={12} md={2}>
                    Warnings
                </Col>
                <Col xd={12} md={10}>
                    <Alert bsStyle="warning">
                        {warningTexts}
                    </Alert>
                </Col>
            </FormGroup>
        }
        return <Grid>
            <Col xs={12} md={12}>
                <h1>Import from Oracle Primavera</h1>
                <p>Only CSV files can be imported. Oracle Primavera Excel files should be converted to CSV files, with the tabulation as separator.</p>
                {alert}
                <Form horizontal>
                    <input type="file" ref="input" className="hidden" onChange={this.handleImportTasksFile.bind(this)}/>
                    <FormGroup validationState={identifierValidation}>
                        <Col componentClass={ControlLabel} xd={12} md={2}>
                            Project identifier
                        </Col>
                        <Col xd={12} md={10}>
                            <FormControl type="text" placeholder="Project identifier" onInput={this.handleIdentifierInput.bind(this)} />
                        </Col>
                    </FormGroup>
                    <FormGroup validationState={this.getNameValidationState()}>
                        <Col componentClass={ControlLabel} xd={12} md={2}>
                            Project name
                        </Col>
                        <Col xd={12} md={10}>
                            <FormControl type="text" placeholder="Project name" onInput={this.handleNameInput.bind(this)} />
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col componentClass={ControlLabel} xd={12} md={2}>
                            Tasks
                        </Col>
                        <Col xd={12} md={10}>
                            <ButtonGroup>
                                <Button bsStyle={tasksColor} disabled={this.props.isTaskImporting} 
                                        onClick={this.handleImportTasks.bind(this)}>{tasksButtonText}</Button>
                                <Button bsStyle={relationsColor} disabled={!canImportRelations}>Import task relations</Button>
                            </ButtonGroup>
                        </Col>
                    </FormGroup>
                    {warnings}
                    <FormGroup>
                        <Button bsStyle="primary" disabled={!canImport} onClick={this.handleSubmit.bind(this)}>Import</Button>
                    </FormGroup>
                </Form>
            </Col>
        </Grid>
    }
    private handleIdentifierInput(e: React.FormEvent) {
        const input = e.target as HTMLInputElement
        this.props.onProjectChanged(input.value, this.props.project.name, this.props.project.description)
    }
    private getNameValidationState() : "success" | "error" {
        return this.props.project.name.length > 0 ? "success" : "error"
    }
    private handleNameInput(e: React.FormEvent) {
        const input = e.target as HTMLInputElement
        this.props.onProjectChanged(this.props.project.identifier, input.value, this.props.project.description)
    }
    private handleImportTasks(e: React.MouseEvent) {
        e.preventDefault()
        const input = ReactDOM.findDOMNode(this.refs["input"]) as HTMLInputElement
        input.click()
    }
    private handleImportTasksFile(e: React.FormEvent) {
        e.preventDefault()
        const input = ReactDOM.findDOMNode(this.refs["input"]) as HTMLInputElement
        const file = input.files[0]
        this.props.onTasksFileSelected(file)
    }
    private handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        this.props.onSubmit(this.props.project, this.props.tasks)

    }
}

function mapStateToProps(state: State) {
    return {
        project: state.project,
        tasks: state.tasks.tasks,
        warnings: state.tasks.warnings,
        isTaskImporting: state.tasks.isImporting,
        invalidFormat: state.tasks.invalidFormat
    }
}

function addProjectAndTasks(project: Project, tasks: Map<string, ApiImportTask>) {
    return function(dispatch: Dispatch<State>) {
        return addProject(project)(dispatch).then(() => {
            return addTasks(project.identifier, tasks)(dispatch)
        })
    }
}

function mapDispatchToProps(dispatch: Dispatch<State>) {
    return {
        onProjectChanged: (identifier: string, name: string, description: string) => {
            dispatch(defineProject(identifier, name, description))
        },
        onTasksFileSelected: (file: File) => {
            dispatch(importTasks(file))
        },
        onDismissInvalidFormat: () => {
            dispatch(dismissInvalidFormat())
        },
        onSubmit: (project: Project, tasks: Map<string, ApiImportTask>) => {
            dispatch(addProjectAndTasks(project, tasks))
        },
        dispatch
    }
}

export const Main = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(UnconnectedMain)