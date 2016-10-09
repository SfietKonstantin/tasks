import * as React from "react"
import { Grid, Col } from "react-bootstrap"
import * as jquery from "jquery"
import { Task, TaskResults } from "../../core/types"
import { TaskOverview } from "./overview"

interface TaskMainProperties {
    visible: boolean
    task: Task
    taskResults: TaskResults
}

export class TaskMain extends React.Component<TaskMainProperties, {}> {
    render() {
        return <Grid className={this.props.visible ? "" : "hidden"}>
            <Col id="main" xs={12} md={10}>
                <h2 className="title-h2">Overview</h2>
                <TaskOverview task={this.props.task} taskResults={this.props.taskResults} />
            </Col>
            <Col id="sidebar" xs={3} md={2}>
                <h2 className="title-h2">Tags</h2>
                <p>(Under construction)</p>
            </Col>
        </Grid>
    }
} 
