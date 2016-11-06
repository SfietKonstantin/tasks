import * as React from "react"
import { Dispatch } from "redux"
import { State, TaskFilters } from "../types"
import { fetchTasks, filterTasks } from "../actions/tasks"
import { Grid, Col, Button, ButtonGroup, ListGroup, ListGroupItem } from "react-bootstrap"
import { ItemList } from "../../common/components/itemlist"
import { FilterButton } from "../components/filterbutton"
import { TasksHeader } from "../components/tasksheader"
import { ApiTask } from "../../../common/apitypes"

interface AllTasksContentProperties {
    projectIdentifier: string
    tasks: Array<ApiTask>
    filters: TaskFilters
    onFilterChanged: (projectIdentifier: string, filters: TaskFilters) => void
    dispatch: Dispatch<State>
}

class ApiTaskList extends ItemList<ApiTask> {}

export class UnconnectedAllTasks extends React.Component<AllTasksContentProperties, {}> {
    render() {
        const content = this.props.tasks.map((task: ApiTask) => {
            const taskLink = "/project/" + this.props.projectIdentifier + "/task/" + task.identifier
            return <ListGroupItem  href={taskLink}>
                {task.name}
            </ListGroupItem>
        })
        return <Col id="main" xs={12} sm={12} className="tab-table">
            <ApiTaskList items={this.props.tasks} createElement={this.createTaskElement.bind(this)}
                         onTextFilter={this.handleTextFilter.bind(this)} >
                <TasksHeader filters={this.props.filters}
                             onFilterChanged={this.props.onFilterChanged.bind(this, this.props.projectIdentifier)} />
                <FilterButton milestonesOnly={this.props.filters.milestonesOnlyChecked}
                              onToggleMilestonesOnly={this.handleToggleMilestonesOnly.bind(this)} />
            </ApiTaskList>
        </Col>
    }
    componentDidMount() {
        this.props.dispatch(fetchTasks(this.props.projectIdentifier))
    }
    private createTaskElement(task: ApiTask): JSX.Element {
        const taskLink = "/project/" + this.props.projectIdentifier + "/task/" + task.identifier
        return <ListGroupItem href={taskLink}>
            {task.name}
        </ListGroupItem>
    }
    private handleToggleMilestonesOnly() {
        const milestonesOnlyChecked = !this.props.filters.milestonesOnlyChecked
        this.handleFilterTasks(Object.assign({}, this.props.filters, {milestonesOnlyChecked}))
    }
    private handleTextFilter(text: string) {
        this.handleFilterTasks(Object.assign({}, this.props.filters, {text}))
    }
    private handleFilterTasks(filter: TaskFilters) {
        this.props.onFilterChanged(this.props.projectIdentifier, filter)
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
        onFilterChanged: (projectIdentifier: string, taskFilters: TaskFilters) => {
            dispatch(filterTasks(projectIdentifier, taskFilters))
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
