import * as React from "react"
import { Dispatch } from "redux"
import { State, TasksFilter } from "../types"
import { fetchTasks, filterTasks } from "../actions/tasks"
import { Grid, Col, Button, ButtonGroup, ListGroup, ListGroupItem } from "react-bootstrap"
import { FilterButton } from "../components/filterbutton"
import { ApiTask } from "../../../common/apitypes"

interface AllTasksContentProperties {
    identifier: string
    tasks: Array<ApiTask>
    filter: TasksFilter
    onFilterChanged: (filter: TasksFilter) => void
    dispatch: Dispatch<State>
}

export class UnconnectedAllTasks extends React.Component<AllTasksContentProperties, {}> {
    render() {
        const notStartedChecked = UnconnectedAllTasks.getButtonStyle(this.props.filter.notStartedChecked)
        const inProgressChecked = UnconnectedAllTasks.getButtonStyle(this.props.filter.inProgressChecked)
        const doneChecked = UnconnectedAllTasks.getButtonStyle(this.props.filter.doneChecked)
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
                    <FilterButton milestonesOnly={this.props.filter.milestonesOnlyChecked} 
                                  onToggleMilestonesOnly={this.handleToggleMilestonesOnly.bind(this)} />
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
        const notStartedChecked = !this.props.filter.notStartedChecked
        this.handleFilterTasks(Object.assign({}, this.props.filter, {notStartedChecked}))
    }
    private handleInProgress(e: React.MouseEvent) {
        e.preventDefault()
        const inProgressChecked = !this.props.filter.inProgressChecked
        this.handleFilterTasks(Object.assign({}, this.props.filter, {inProgressChecked}))
    }
    private handleDoneClicked(e: React.MouseEvent) {
        e.preventDefault()
        const doneChecked = !this.props.filter.doneChecked
        this.handleFilterTasks(Object.assign({}, this.props.filter, {doneChecked}))
    }
    private handleToggleMilestonesOnly() {
        const milestonesOnlyChecked = !this.props.filter.milestonesOnlyChecked
        this.handleFilterTasks(Object.assign({}, this.props.filter, {milestonesOnlyChecked}))
    }
    private handleFilterTasks(filter: TasksFilter) {
        localStorage.setItem(this.props.identifier, JSON.stringify(filter))
        this.props.onFilterChanged(filter)
    }
}

const mapStateToProps = (state: State) => {
    return {
        identifier: state.identifier,
        tasks: state.tasks.filteredTasks,
        filter: state.tasks.filter
    }
}

const mapDispatchToProps = (dispatch: Dispatch<State>) => {
    return {
        onFilterChanged: (tasksFilter: TasksFilter) => {
            dispatch(filterTasks(tasksFilter))
        },
        dispatch
    }
}

const AllTasksContent = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(UnconnectedAllTasks)

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
