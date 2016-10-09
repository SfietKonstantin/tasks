import * as React from "react"
import { Col, Button, ButtonGroup } from "react-bootstrap"
import { TaskModifierButton } from "./modifierbutton"
import * as jquery from "jquery"
import { Modifier } from "../../common/types"

interface TaskToolsProperties {
    taskIdentifier: string
    addModifierCallback: (modifier: Modifier) => void
}

interface TaskToolsState {
    importantEnabled: boolean
    important: boolean
}

export class TaskHeaderTools extends React.Component<TaskToolsProperties, TaskToolsState> {
    constructor(props: TaskToolsProperties) {
        super(props)
        this.state = { 
            importantEnabled: false, 
            important: false
        }
    }
    render() {
        return <Col xs={4} md={4}> 
            <div className="task-header-tools"> 
                <ButtonGroup>
                    <TaskModifierButton addModifierCallback={this.props.addModifierCallback}>
                        <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                        <span className="visible-md-inline visible-lg-inline"> Add duration modifier</span>
                    </TaskModifierButton>
                    <Button bsStyle={this.getImportantStyle()} onClick={this.handleImportant.bind(this)} 
                            disabled={!this.state.importantEnabled} >
                        <span className="glyphicon glyphicon-star" aria-hidden="true"></span>
                        <span className="visible-md-inline visible-lg-inline"> {this.getLabel()}</span>
                    </Button>
                </ButtonGroup>
            </div>
        </Col>
    }
    componentDidMount() {
        jquery.get({
            url: "/api/task/" + this.props.taskIdentifier + "/important",
            dataType: 'json',
            cache: false,
            success: (data: TaskToolsState) => {
                this.setState({
                    important: data.important, 
                    importantEnabled: true
                })
            }
        })
    }
    private handleImportant(e: React.FormEvent) {
        e.preventDefault()
        if (this.state.importantEnabled) {
            this.setState({
                important: this.state.important, 
                importantEnabled: false
            })
            jquery.ajax({
                type: this.state.important ? "DELETE" : "PUT",
                url: "/api/task/" + this.props.taskIdentifier + "/important",
                success: (data: TaskToolsState) => {
                    this.setState({
                        important: data.important, 
                        importantEnabled: true
                    })
                }
            })
        }
    }
    private getImportantStyle() : string {
        return this.state.important ? "danger" : "default"
    }
    private getLabel() : string {
        return this.state.important ? "Important" : "Set as important"
    }
}