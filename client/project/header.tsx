import * as React from "react"
import { Col } from "react-bootstrap"
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
        let tabs = ["Overview", "Tasks"]
        return <Header identifier={this.props.project.identifier} name={this.props.project.name}>
            <Col xs={12} md={8}>
                <ProjectBreadcrumb project={this.props.project} />
            </Col>
            <TabBar tabs={tabs} tabChangedCallback={this.props.tabChangedCallback}/>
        </Header>
    }
}