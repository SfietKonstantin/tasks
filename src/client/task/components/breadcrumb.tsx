import * as React from "react"
import { Project, Task } from "../../../common/types"

interface BreadcrumbProperties {
    project: Project
    task: Task
}

export class Breadcrumb extends React.Component<BreadcrumbProperties, {}> {
    render() {
        const name = this.renderName()
        let projectPath = "/project/" + this.props.project.identifier
        return <ol className="breadcrumb">
            <li><a href="/"><span className="glyphicon glyphicon-home" aria-hidden="true"></span></a></li>
            <li><a href={projectPath}>{this.props.project.name}</a></li>
            <li class="active">{name}</li>
        </ol>
    }
    private renderName() {
        let name = this.props.task.name
        if (name.length < 50) {
            return name
        } else {
            return name.slice(0, 50) + " ..."
        }
    }
}
