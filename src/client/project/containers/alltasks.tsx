import * as React from "react"
import { Dispatch } from "redux"
import { State, TaskFilters } from "../types"
import { fetchTasks, filterTasks } from "../actions/tasks"
import { Grid, Col, Button, ButtonGroup, ListGroup, ListGroupItem } from "react-bootstrap"
import { FilterButton } from "../components/filterbutton"
import { ApiTask } from "../../../common/apitypes"

interface AllTasksContentProperties {
    projectIdentifier: string
    tasks: Array<ApiTask>
    filters: TaskFilters
    onFilterChanged: (filters: TaskFilters) => void
    dispatch: Dispatch<State>
}

export class UnconnectedAllTasks extends React.Component<AllTasksContentProperties, {}> {
    render() {
        const notStartedChecked = UnconnectedAllTasks.getButtonStyle(this.props.filters.notStartedChecked)
        const inProgressChecked = UnconnectedAllTasks.getButtonStyle(this.props.filters.inProgressChecked)
        const doneChecked = UnconnectedAllTasks.getButtonStyle(this.props.filters.doneChecked)
        const content = this.props.tasks.map((task: ApiTask) => {
            const taskLink = "/project/" + this.props.projectIdentifier + "/task/" + task.identifier
            return <ListGroupItem href={taskLink}>
                {task.name}
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
                    <FilterButton milestonesOnly={this.props.filters.milestonesOnlyChecked}
                                  onToggleMilestonesOnly={this.handleToggleMilestonesOnly.bind(this)} />
                </div>
                <ListGroup fill hover>
                    {content}
                </ListGroup>
            </div>
        </Col>
    }
    componentDidMount() {
        this.props.dispatch(fetchTasks(this.props.projectIdentifier))
    }
    private static getButtonStyle(checked: boolean): string {
        return checked ? "primary" : "default"
    }
    private handleNotStartedClicked(e: React.MouseEvent) {
        e.preventDefault()
        const notStartedChecked = !this.props.filters.notStartedChecked
        this.handleFilterTasks(Object.assign({}, this.props.filters, {notStartedChecked}))
    }
    private handleInProgress(e: React.MouseEvent) {
        e.preventDefault()
        const inProgressChecked = !this.props.filters.inProgressChecked
        this.handleFilterTasks(Object.assign({}, this.props.filters, {inProgressChecked}))
    }
    private handleDoneClicked(e: React.MouseEvent) {
        e.preventDefault()
        const doneChecked = !this.props.filters.doneChecked
        this.handleFilterTasks(Object.assign({}, this.props.filters, {doneChecked}))
    }
    private handleToggleMilestonesOnly() {
        const milestonesOnlyChecked = !this.props.filters.milestonesOnlyChecked
        this.handleFilterTasks(Object.assign({}, this.props.filters, {milestonesOnlyChecked}))
    }
    private handleFilterTasks(filter: TaskFilters) {
        localStorage.setItem(this.props.projectIdentifier, JSON.stringify(filter))
        this.props.onFilterChanged(filter)
    }
}

const mapStateToProps = (state: State) => {
    return {
        projectIdentifier: state.projectIdentifier,
        tasks: state.tasks.filteredTasks,
        filters: state.tasks.filters
    }
}

const mapDispatchToProps = (dispatch: Dispatch<State>) => {
    return {
        onFilterChanged: (taskFilters: TaskFilters) => {
            dispatch(filterTasks(taskFilters))
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
