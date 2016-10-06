import * as React from "react"
import { TabBar } from "../common/tabs"
import { Header } from "../common/header"
import { ProjectBreadcrumb } from "./breadcrumb"
import { Project } from "../../core/types"

interface ProjectHeaderProperties {
    project: Project
    tabChangedCallback: (index: number) => void
}

export class ProjectHeader extends React.Component<ProjectHeaderProperties, {}> {
    render() {
        let tabs = ["Overview", "All tasks"]
        return <Header id={this.props.project.id} name={this.props.project.name}>
            <div className="col-xs-12 col-md-8">
                <ProjectBreadcrumb project={this.props.project} />
            </div>
            <TabBar tabs={tabs} tabChangedCallback={this.props.tabChangedCallback}/>
        </Header>
    }
}