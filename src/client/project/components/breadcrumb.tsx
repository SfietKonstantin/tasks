import * as React from "react"
import { Project } from "../../../common/types"

interface BreadcrumbProperties {
    project: Project
}

export class Breadcrumb extends React.Component<BreadcrumbProperties, {}> {
    render() {
        return <ol className="breadcrumb">
            <li><a href="/"><span className="glyphicon glyphicon-home" aria-hidden="true"></span></a></li>
            <li class="active">{this.props.project.name}</li>
        </ol>
    }
}
