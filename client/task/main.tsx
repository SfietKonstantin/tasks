import * as React from "react"
import * as jquery from "jquery"
import { Task, TaskResults } from "../../core/types"
import { TaskOverview } from "./overview"

interface TaskMainProperties {
    task: Task
    taskResults: TaskResults
}

export class TaskMain extends React.Component<TaskMainProperties, {}> {
    render() {
        return <div className="container">
            <div id="main" className="col-xs-12 col-md-10">
                <h2>Overview</h2>
                <TaskOverview task={this.props.task} taskResults={this.props.taskResults} />
                <h2>Duration details</h2>
                <h2>Impacts</h2>
                <p>(Under construction)</p>
            </div>
            <div id="sidebar" className="col-xs-3 col-md-2">
                <h2>Tags</h2>
                <p>(Under construction)</p>
            </div>
        </div>
    }
} 
