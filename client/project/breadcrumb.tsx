import * as React from "react"
import { Project } from "../../core/types"

interface TaskBreadcrumbProperties {
    project: Project
}

export class ProjectBreadcrumb extends React.Component<TaskBreadcrumbProperties, {}> {
    render() {
        return <ol className="breadcrumb">
            <li><a href="/"><span className="glyphicon glyphicon-home" aria-hidden="true"></span></a></li>
            <li class="active">{this.props.project.name}</li>
        </ol>
    }
} 
