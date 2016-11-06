import * as React from "react"
import { Col } from "react-bootstrap"
import { TabBar } from "../../common/components/tabs"
import * as CommonHeader from "../../common/components/header"
import { HeaderTools } from "./headertools"
import { Breadcrumb } from "./breadcrumb"
import { Project, Task, Modifier } from "../../../common/types"

interface HeaderProperties {
    project: Project
    task: Task
    tabChangedCallback: (index: number) => void
}

export class Header extends React.Component<HeaderProperties, {}> {
    render() {
        const tabs = ["Overview", "Duration details"]
        return <CommonHeader.Header identifier={this.props.task.identifier} name={this.props.task.name}>
            <HeaderTools />
            <Col xs={12} sm={8}>
                <Breadcrumb project={this.props.project} task={this.props.task} />
            </Col>
            <TabBar tabs={tabs} onTabChanged={this.props.tabChangedCallback}/>
        </CommonHeader.Header>
    }
}
