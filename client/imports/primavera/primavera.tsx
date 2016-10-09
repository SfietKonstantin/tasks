import * as React from "react"
import * as ReactDOM from "react-dom"
import { Grid, Col, ButtonGroup, Button, Alert, Form, FormGroup, FormControl, ControlLabel } from "react-bootstrap"
import { Project, Task } from "../../../core/types"

interface PrimaveraState {
    alertVisible: boolean
    tasksImporting: boolean
    relationsImporting: boolean
    project: Project
    tasks: Array<Task>
    // relations: ???
}

export class Primavera extends React.Component<{}, PrimaveraState> {
    constructor() {
        super()
        this.state = {
            alertVisible: false,
            tasksImporting: false,
            relationsImporting: false,
            project: {
                identifier: "",
                name: "",
                description: ""
            },
            tasks: new Array<Task>()
        }
    }
    render() {
        let alert: JSX.Element = null
        if (this.state.alertVisible) {
            alert = <Alert bsStyle="danger">
                Only CSV format is supported 
            </Alert>
        }
        const tasksColor = this.state.tasks.length > 0 ? "success" : "default"
        const relationsColor = "default"
        const canImport = this.state.project.identifier.length > 0
                          && this.state.project.name.length > 0 
                          && this.state.tasks.length > 0 // && ???

        return <Grid>
            <Col xs={12} md={12}>
                <h1>Import from Oracle Primavera</h1>
                <p>Only CSV files can be imported. Oracle Primavera Excel files should be converted to CSV files, with the tabulation as separator.</p>
                {alert}
                <Form horizontal>
                    <input type="file" ref="input" className="hidden" onChange={this.handleLoadListFile.bind(this)}/>
                    <FormGroup validationState={this.getProjectIdentifierValidationState()}>
                            <Col componentClass={ControlLabel} xd={12} md={2}>
                                Title
                            </Col>
                            <Col xd={12} md={10}>
                                <FormControl type="text" ref="title" placeholder="Title" onInput={this.handleProjectIdentifierInput.bind(this)} />
                            </Col>
                        </FormGroup>
                    <ButtonGroup>
                        <Button bsStyle={tasksColor} onClick={this.handleLoadList.bind(this)}>Load task list</Button>
                        <Button bsStyle={relationsColor}>Load task relations</Button>
                        <Button bsStyle="primary" disabled={!canImport}>Import</Button>
                    </ButtonGroup>
                </Form>
            </Col>
        </Grid>
    }
    private getProjectIdentifierValidationState() : "success" | "error" {
        return this.state.project.identifier.length > 0 ? "success" : "error"
    }
    private handleProjectIdentifierInput(e: React.FormEvent) {
        const input = e.target as HTMLInputElement
        this.setState({
            alertVisible: this.state.alertVisible,
            tasksImporting: this.state.tasksImporting,
            relationsImporting: this.state.relationsImporting,
            project: this.state.project,
            tasks: this.state.tasks
        })
    }
    private handleLoadList(e: React.MouseEvent) {
        e.preventDefault()

        this.setState({
            alertVisible: false,
            tasksImporting: true,
            relationsImporting: this.state.relationsImporting,
            project: this.state.project,
            tasks: this.state.tasks
        })
        const input = ReactDOM.findDOMNode(this.refs["input"]) as HTMLInputElement
        input.click()
    }
    private handleLoadListFile(e: React.FormEvent) {
        e.preventDefault()

        const input = ReactDOM.findDOMNode(this.refs["input"]) as HTMLInputElement
        const reader = new FileReader()
        reader.onload = this.parseList.bind(this, reader)
        const file = input.files[0]
        if (file.type == "text/csv") {
            reader.readAsText(input.files[0])
        } else {
            this.setState({
                alertVisible: this.state.alertVisible,
                tasksImporting: false,
                relationsImporting: this.state.relationsImporting,
                project: this.state.project,
                tasks: this.state.tasks
            })
        }
    }
    private parseList(reader: FileReader) {
        const content: string = reader.result
        content.split("\n")
        console.log(content)
    }
}