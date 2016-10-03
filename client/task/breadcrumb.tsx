import * as React from "react"
import { Project, Task } from "../../core/types"

interface TaskBreadcrumbProperties {
    project: Project
    task: Task
}

export class TaskBreadcrumb extends React.Component<TaskBreadcrumbProperties, {}> {
    render() {
        let projectPath = "/project/" + this.props.project.id
        return <ol className="breadcrumb">
            <li><a href="/"><span className="glyphicon glyphicon-home" aria-hidden="true"></span></a></li>
            <li><a href={projectPath}>{this.props.project.name}</a></li>
            <li class="active">{this.props.task.name}</li>
        </ol>
    }
} 
