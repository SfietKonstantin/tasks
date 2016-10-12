import * as React from "react"
import { Dispatch } from "redux"
import { State } from "../types"
import { fetchTasks, displayTaskFilter } from "../actions/tasks"
import { Grid, Col, Button, ButtonGroup, ListGroup, ListGroupItem } from "react-bootstrap"
import { ApiTask } from "../../../common/apitypes"

interface AllTasksContentProperties {
    identifier: string
    tasks: Array<ApiTask>
    notStartedChecked: boolean
    inProgressChecked: boolean
    doneChecked: boolean
    onFilterChanged: (notStarted: boolean, inProgress: boolean, done: boolean) => void
    dispatch: Dispatch<State>
}

export class UnconnectedAllTasksContent extends React.Component<AllTasksContentProperties, {}> {
    render() {
        const notStartedChecked = UnconnectedAllTasksContent.getButtonStyle(this.props.notStartedChecked)
        const inProgressChecked = UnconnectedAllTasksContent.getButtonStyle(this.props.inProgressChecked)
        const doneChecked = UnconnectedAllTasksContent.getButtonStyle(this.props.doneChecked)
        const content = this.props.tasks.map((value: ApiTask) => {
            const taskLink = "/task/" + value.identifier
            return <ListGroupItem href={taskLink}>
                {value.name}
            </ListGroupItem>
        })
        return <Col id="main" xs={12} md={12}>
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
    }
    componentDidMount() {
        this.props.dispatch(fetchTasks(this.props.identifier))
    }
    private static getButtonStyle(checked: boolean): string {
        return checked ? "primary" : "default"
    }
    private handleNotStartedClicked(e: React.MouseEvent) {
        e.preventDefault()
        this.props.onFilterChanged(!this.props.notStartedChecked, this.props.inProgressChecked, this.props.doneChecked)
    }
    private handleInProgress(e: React.MouseEvent) {
        e.preventDefault()
        this.props.onFilterChanged(this.props.notStartedChecked, !this.props.inProgressChecked, this.props.doneChecked)
    }
    private handleDoneClicked(e: React.MouseEvent) {
        e.preventDefault()
        this.props.onFilterChanged(this.props.notStartedChecked, this.props.inProgressChecked, !this.props.doneChecked)
    }
}

const mapStateToProps = (state: State) => {
    return {
        identifier: state.identifier,
        tasks: state.tasks.filteredTasks,
        notStartedChecked: state.tasks.filters[0],
        inProgressChecked: state.tasks.filters[1],
        doneChecked: state.tasks.filters[2]
    }
}

const mapDispatchToProps = (dispatch: Dispatch<State>) => {
    return {
        onFilterChanged: (notStarted: boolean, inProgress: boolean, done: boolean) => {
            dispatch(displayTaskFilter(notStarted, inProgress, done))
        },
        dispatch
    }
}

const AllTasksContent = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(UnconnectedAllTasksContent)

interface AllTasksProperties {
    visible: boolean
}

export class AllTasks extends React.Component<AllTasksProperties, {}> {
    render() {
        return <Grid className={this.props.visible ? "" : "hidden"}>
            <AllTasksContent />
        </Grid>
    }
}
