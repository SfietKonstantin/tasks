import * as React from "react"
import * as ReactDOM from "react-dom"
import { Dispatch } from "redux"
import * as ReactRedux from "react-redux"
import { Grid, Col, ButtonGroup, Button, Alert, Form, FormGroup, FormControl, ControlLabel } from "react-bootstrap"
import { State, PrimaveraTask, PrimaveraDelay, PrimaveraTaskRelation } from "../types"
import { defineProject, addProject } from "../actions/project"
import { importTasks, dismissInvalidTasksFormat, addTasks } from "../actions/tasks"
import { importRelations, dismissInvalidRelationsFormat } from "../actions/relations"
import { Project } from "../../../../common/types"

interface MainProperties {
    project: Project
    tasks: Map<string, PrimaveraTask>
    delays: Map<string, PrimaveraDelay>
    relations: Array<PrimaveraTaskRelation>
    warnings: Array<string>
    isTasksImporting: boolean
    isRelationsImporting: boolean
    invalidTasksFormat: boolean
    invalidRelationsFormat: boolean
    onTasksFileSelected: (file: File) => void
    onRelationsFileSelected: (file: File) => void
    onProjectChanged: (identifier: string, name: string, description: string) => void
    onDismissInvalidTasksFormat: () => void
    onDismissInvalidRelationsFormat: () => void
    onSubmit: (project: Project, tasks: Map<string, PrimaveraTask>) => void
    dispatch: Dispatch<State>
}

class UnconnectedMain extends React.Component<MainProperties, {}> {
    render() {
        let tasksAlert: JSX.Element | null = null
        if (this.props.invalidTasksFormat) {
            tasksAlert = <Alert bsStyle="danger" onDismiss={this.props.onDismissInvalidTasksFormat}>
                Invalid format for tasks. Please check that you are trying to import a CSV file.
            </Alert>
        }
        let relationsAlert: JSX.Element | null = null
        if (this.props.invalidRelationsFormat) {
            relationsAlert = <Alert bsStyle="danger" onDismiss={this.props.onDismissInvalidRelationsFormat}>
                Invalid format for relations. Please check that you are trying to import a CSV file.
            </Alert>
        }
        const identifierLength = this.props.project.identifier.length
        const tasksLength = this.props.tasks.size + this.props.delays.size
        const relationsLength = this.props.relations.length

        const identifierValidation: "success" | "error" = identifierLength > 0 ? "success" : "error"
        const tasksColor = tasksLength > 0 ? "success" : "default"
        const relationsColor = relationsLength > 0 ? "success" : "default"
        const canImport = identifierLength > 0
                          && this.props.project.name.length > 0
                          && tasksLength > 0 && relationsLength > 0
        const tasksButtonText = tasksLength > 0 ? "Imported " + tasksLength + " tasks" : "Import tasks"
        const relationsButtonText = relationsLength > 0 ? "Imported " + relationsLength + " relations"
                                                        : "Import relations"
        let warnings: JSX.Element | null = null
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
                <p>
                    Only CSV files can be imported. Oracle Primavera Excel files should
                    be converted to CSV files, with the tabulation as separator.
                </p>
                {tasksAlert}
                {relationsAlert}
                <Form horizontal>
                    <input type="file" ref="tasksInput" className="hidden"
                           onChange={this.handleImportTasksFile.bind(this)}/>
                    <input type="file" ref="relationsInput" className="hidden"
                           onChange={this.handleImportRelationsFile.bind(this)}/>
                    <FormGroup validationState={identifierValidation}>
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
                    <FormGroup>
                        <Col componentClass={ControlLabel} xd={12} md={2}>
                            Tasks
                        </Col>
                        <Col xd={12} md={10}>
                            <ButtonGroup>
                                <Button bsStyle={tasksColor} disabled={this.props.isTasksImporting}
                                        onClick={this.handleImportTasks.bind(this)}>{tasksButtonText}</Button>
                                <Button bsStyle={relationsColor} disabled={this.props.isRelationsImporting}
                                        onClick={this.handleImportRelations.bind(this)}>{relationsButtonText}</Button>
                            </ButtonGroup>
                        </Col>
                    </FormGroup>
                    {warnings}
                    <FormGroup>
                        <Button bsStyle="primary" disabled={!canImport}
                                onClick={this.handleSubmit.bind(this)}>Import</Button>
                    </FormGroup>
                </Form>
            </Col>
        </Grid>
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
    private handleImportTasks(e: React.MouseEvent) {
        e.preventDefault()
        const input = ReactDOM.findDOMNode(this.refs["tasksInput"]) as HTMLInputElement
        input.click()
    }
    private handleImportTasksFile(e: React.FormEvent) {
        e.preventDefault()
        const input = ReactDOM.findDOMNode(this.refs["tasksInput"]) as HTMLInputElement
        const fileList = input.files as FileList
        const file = fileList[0]
        this.props.onTasksFileSelected(file)
    }
    private handleImportRelations(e: React.FormEvent) {
        e.preventDefault()
        const input = ReactDOM.findDOMNode(this.refs["relationsInput"]) as HTMLInputElement
        input.click()
    }
    private handleImportRelationsFile(e: React.FormEvent) {
        e.preventDefault()
        const input = ReactDOM.findDOMNode(this.refs["relationsInput"]) as HTMLInputElement
        const fileList = input.files as FileList
        const file = fileList[0]
        this.props.onRelationsFileSelected(file)
    }
    private handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        this.props.onSubmit(this.props.project, this.props.tasks)

    }
}

const mapStateToProps = (state: State) => {
    let warnings = new Array<string>()
    warnings = warnings.concat(state.tasks.warnings, state.relations.warnings)
    
    const tasks = state.tasks.tasks
    const relations = state.relations.relations.filter((relation: PrimaveraTaskRelation) => {
        if (tasks.has(relation.previous) && tasks.has(relation.next)) {
            return true;
        }
            
        
        if (tasks.has(relation.previous)) {
            const previousTask = tasks.get(relation.previous) as PrimaveraTask
            // Check if previous is a start milestone (not yet supported)
            if (previousTask.startDate && !previousTask.endDate) {
                warnings.push("\"" + relation.previous + "\" is a start milestone and is not yet supported")
                return false
            }
            // Check if previous is a finish milestone sharing the same date as the next task (not supported)
            if (previousTask.endDate && !previousTask.startDate) {
                if (tasks.has(relation.next)) {
                    const nextTask = tasks.get(relation.next) as PrimaveraTask
                    if (nextTask.startDate) {
                        if (nextTask.startDate.getTime() == previousTask.endDate.getTime()) {
                            warnings.push("\"" + relation.previous + "\" is an end milestone and is not yet supported")
                            return false
                        } else {
                            warnings.push("\"" + relation.previous + "\" is an end milestone and \"" + relation.next 
                                            + "\" is a task with a different starting time and this is not yet supported")
                        }
                    }
                }
            }
        }       

        warnings.push("Relation \"" + relation.previous + "\" to \"" 
                                    + relation.next + "\" do not have corresponding task")
        return false
    })
    return {
        project: state.project,
        tasks,
        delays: state.tasks.delays,
        relations,
        warnings,
        isTasksImporting: state.tasks.isImporting,
        isRelationsImporting: state.relations.isImporting,
        invalidTasksFormat: state.tasks.invalidFormat,
        invalidRelationsFormat: state.relations.invalidFormat
    }
}

const addProjectAndTasks = (project: Project, tasks: Map<string, PrimaveraTask>) => {
    return (dispatch: Dispatch<State>) => {
        return addProject(project)(dispatch).then(() => {
            return addTasks(project.identifier, tasks)(dispatch)
        })
    }
}

const mapDispatchToProps = (dispatch: Dispatch<State>) => {
    return {
        onProjectChanged: (identifier: string, name: string, description: string) => {
            dispatch(defineProject(identifier, name, description))
        },
        onTasksFileSelected: (file: File) => {
            dispatch(importTasks(file))
        },
        onRelationsFileSelected: (file: File) => {
            dispatch(importRelations(file))
        },
        onDismissInvalidTasksFormat: () => {
            dispatch(dismissInvalidTasksFormat())
        },
        onDismissInvalidRelationsFormat: () => {
            dispatch(dismissInvalidRelationsFormat())
        },
        onSubmit: (project: Project, tasks: Map<string, PrimaveraTask>) => {
            dispatch(addProjectAndTasks(project, tasks))
        },
        dispatch
    }
}

export const Main = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(UnconnectedMain)
