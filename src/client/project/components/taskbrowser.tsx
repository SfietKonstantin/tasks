import * as React from "react"
import { Dispatch } from "redux"
import { State, TaskFilters } from "../types"
import { fetchTasks, filterTasks } from "../actions/tasks"
import { ListGroupItem } from "react-bootstrap"
import { TaskList } from "../../common/components/tasklist"
import { TaskListFilters } from "../../common/tasklistfilter"
import { TasksHeader } from "../components/tasksheader"
import { ApiTask } from "../../../common/apitypes"

interface TaskBrowserProperties {
    projectIdentifier: string
    tasks: Array<ApiTask>
    filters: TaskFilters
    onFiltersChanged: (projectIdentifier: string, filters: TaskFilters) => void
    onFetchTasks: (projectIdentifier: string) => void
}

class ApiTaskList extends TaskList<ApiTask> {}

export class TaskBrowser extends React.Component<TaskBrowserProperties, {}> {
    render() {
        return <ApiTaskList tasks={this.props.tasks} createElement={this.createTaskElement.bind(this)}
                            filters={this.props.filters.filters}
                            onFiltersChanged={this.handleFiltersChanged.bind(this)} >
            <TasksHeader filters={this.props.filters}
                         onFiltersChanged={this.props.onFiltersChanged.bind(this, this.props.projectIdentifier)} />
        </ApiTaskList>
    }
    componentDidMount() {
        this.props.onFetchTasks(this.props.projectIdentifier)
    }
    private createTaskElement(task: ApiTask): JSX.Element {
        const taskLink = "/project/" + this.props.projectIdentifier + "/task/" + task.identifier
        const milestoneIndicator = TaskBrowser.createMilestoneIndicator(task)
        return <ListGroupItem href={taskLink} key={task.identifier}>
            <span className="common-task-indicator">{milestoneIndicator}</span>
            <span>{task.name} </span>
            <span className="text-muted">#{task.identifier}</span>
        </ListGroupItem>
    }
    private static createMilestoneIndicator(task: ApiTask): JSX.Element | null {
        if (task.estimatedDuration != 0) {
            return null
        }
        return <span className="glyphicon glyphicon-flag"></span>
    }
    private handleFiltersChanged(filters: TaskListFilters) {
        this.props.onFiltersChanged(this.props.projectIdentifier, Object.assign(this.props.filters, {filters}))
    }
}

export const mapStateToProps = (state: State) => {
    return {
        projectIdentifier: state.projectIdentifier,
        tasks: state.tasks.filteredTasks,
        filters: state.tasks.filters
    }
}

export const mapDispatchToProps = (dispatch: Dispatch<State>) => {
    return {
        onFiltersChanged: (projectIdentifier: string, taskFilters: TaskFilters) => {
            dispatch(filterTasks(projectIdentifier, taskFilters))
        },
        onFetchTasks: (projectIdentifier: string) => {
            dispatch(fetchTasks(projectIdentifier))
        }
    }
}
