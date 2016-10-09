import * as React from "react"
import * as ReactDOM from "react-dom"
import { Dispatch } from "redux"
import * as ReactRedux from "react-redux"
import { Grid, Col, ButtonGroup, Button, Alert, Form, FormGroup, FormControl, ControlLabel } from "react-bootstrap"
import { State } from "../types"
import { defineProject } from "../actions/project"
import { importTasks } from "../actions/tasks"
import { Project, Task } from "../../../../common/types"

interface MainProperties {
    project: Project
    tasks: Array<Task>
    isImporting: boolean
    invalidFormat: boolean
    onTasksFileSelected: (file: File) => void
    onProjectChanged: (identifier: string, name: string, description: string) => void
    dispatch: Dispatch<State>
}

class UnconnectedMain extends React.Component<MainProperties, {}> {
    render() {
        let alert: JSX.Element = null
        if (this.props.invalidFormat) {
            alert = <Alert bsStyle="danger">
                Only CSV format is supported 
            </Alert>
        }
        const tasksColor = this.props.tasks.length > 0 ? "success" : "default"
        const relationsColor = "default"
        const canImport = this.props.project.identifier.length > 0
                          && this.props.project.name.length > 0 
                          && this.props.tasks.length > 0 // && ???

        return <Grid>
            <Col xs={12} md={12}>
                <h1>Import from Oracle Primavera</h1>
                <p>Only CSV files can be imported. Oracle Primavera Excel files should be converted to CSV files, with the tabulation as separator.</p>
                {alert}
                <Form horizontal>
                    <input type="file" ref="input" className="hidden" onChange={this.handleLoadListFile.bind(this)}/>
                    <FormGroup validationState={this.getIdentifierValidationState()}>
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
                    <Col xd={12} md={12}>
                        <ButtonGroup>
                            <Button bsStyle={tasksColor} onClick={this.handleLoadList.bind(this)}>Load task list</Button>
                            <Button bsStyle={relationsColor}>Load task relations</Button>
                            <Button bsStyle="primary" disabled={!canImport}>Import</Button>
                        </ButtonGroup>
                    </Col>
                </Form>
            </Col>
        </Grid>
    }
    private getIdentifierValidationState() : "success" | "error" {
        return this.props.project.identifier.length > 0 ? "success" : "error"
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
    private handleLoadList(e: React.MouseEvent) {
        e.preventDefault()
        const input = ReactDOM.findDOMNode(this.refs["input"]) as HTMLInputElement
        input.click()
    }
    private handleLoadListFile(e: React.FormEvent) {
        e.preventDefault()
        const input = ReactDOM.findDOMNode(this.refs["input"]) as HTMLInputElement
        const file = input.files[0]
        this.props.onTasksFileSelected(file)
    }
}

function mapStateToProps(state: State) {
    return {
        project: state.project,
        tasks: state.tasks.tasks,
        isImporting: state.tasks.isImporting,
        invalidFormat: state.tasks.invalidFormat
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
        dispatch
    }
}

export const Main = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(UnconnectedMain)