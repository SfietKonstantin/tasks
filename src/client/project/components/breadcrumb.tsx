import * as React from "react"
import {Project} from "../../../common/old/project"

interface BreadcrumbProperties {
    project: Project
}

export class Breadcrumb extends React.Component<BreadcrumbProperties, {}> {
    render() {
        return <div className="ui breadcrumb">
            <a className="section" href="/">Home</a>
            <i className="right angle icon divider" />
            <div className="active section">{this.props.project.name}</div>
        </div>
    }
}
