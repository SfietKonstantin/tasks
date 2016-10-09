import * as React from "react"
import { Grid, Col, Button, ButtonGroup, ListGroup, ListGroupItem } from "react-bootstrap"
import * as jquery from "jquery"
import * as apitypes from "../../common/apitypes" 

interface ProjectAllTasksProperties {
    visible: boolean
    notStarted: Array<apitypes.ApiTask>
    inProgress: Array<apitypes.ApiTask>
    done: Array<apitypes.ApiTask>
}

interface ProjectAllTasksState {
    notStartedChecked: boolean
    inProgressChecked: boolean
    doneChecked: boolean
    tasks: Array<apitypes.ApiTask>
    
}

export class ProjectAllTasks extends React.Component<ProjectAllTasksProperties, ProjectAllTasksState> {
    constructor(props: ProjectAllTasksProperties) {
        super(props)
        this.state = this.makeState(true, true, false)
    }
    render() {
        const notStartedChecked = ProjectAllTasks.getButtonStyle(this.state.notStartedChecked)
        const inProgressChecked = ProjectAllTasks.getButtonStyle(this.state.inProgressChecked)
        const doneChecked = ProjectAllTasks.getButtonStyle(this.state.doneChecked)
        const content = this.state.tasks.map((value: apitypes.ApiTask) => {
            const taskLink = "/task/" + value.identifier
            return <ListGroupItem href={taskLink}>
                {value.name}
            </ListGroupItem>
        })
        return <Grid className={this.props.visible ? "" : "hidden"}>
            <Col id="main" xs={12} md={12}>
                <div className="panel panel-default tab-table">
                    <div className="panel-heading">
                        <ButtonGroup>
                            <Button bsStyle={notStartedChecked} onClick={this.handleNotStartedClicked.bind(this)}>
                                <span className="glyphicon glyphicon-time" aria-hidden="true"></span> Not started
                            </Button>
                            <Button bsStyle={inProgressChecked} onClick={this.handleInProgress.bind(this)}>
                                <span className="glyphicon glyphicon-plane" aria-hidden="true"></span> In progress
                            </Button>
                            <Button bsStyle={doneChecked} onClick={this.handleDoneClicked.bind(this)}>
                                <span className="glyphicon glyphicon-ok" aria-hidden="true"></span> Done
                            </Button>
                        </ButtonGroup>
                    </div>
                    <ListGroup fill hover>
                        {content}
                    </ListGroup>
                </div>
            </Col>
        </Grid>
    }
    private static getButtonStyle(checked: boolean) : string {
        return checked ? "primary" : "default"
    }
    private makeState(notStartedChecked: boolean, inProgressChecked: boolean, doneChecked: boolean) : ProjectAllTasksState {
        let state: ProjectAllTasksState = {
            notStartedChecked: notStartedChecked,
            inProgressChecked: inProgressChecked,
            doneChecked: doneChecked,
            tasks: new Array<apitypes.ApiTask>()
        }

        if (state.notStartedChecked) {
            state.tasks = state.tasks.concat(this.props.notStarted)
        }
        if (state.inProgressChecked) {
            state.tasks = state.tasks.concat(this.props.inProgress)
        }
        if (state.doneChecked) {
            state.tasks = state.tasks.concat(this.props.done)
        }
        state.tasks.sort((first: apitypes.ApiTask, second: apitypes.ApiTask) => {
            return new Date(first.estimatedStartDate).valueOf() - new Date(second.estimatedStartDate).valueOf()
        })
        return state
    }
    private handleNotStartedClicked(e: React.MouseEvent) {
        e.preventDefault()
        this.setState(this.makeState(!this.state.notStartedChecked, this.state.inProgressChecked, this.state.doneChecked))
    }
    private handleInProgress(e: React.MouseEvent) {
        e.preventDefault()
        this.setState(this.makeState(this.state.notStartedChecked, !this.state.inProgressChecked, this.state.doneChecked))
    }
    private handleDoneClicked(e: React.MouseEvent) {
        e.preventDefault()
        this.setState(this.makeState(this.state.notStartedChecked, this.state.inProgressChecked, !this.state.doneChecked))
    }
}