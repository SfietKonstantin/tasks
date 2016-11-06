import * as React from "react"
import { Col } from "react-bootstrap"
import { TabBar } from "../../common/components/tabs"
import * as CommonHeader from "../../common/components/header"
import { Breadcrumb } from "./breadcrumb"
import { Project } from "../../../common/types"

interface HeaderProperties {
    project: Project
    onTabChanged: (index: number) => void
}

export class Header extends React.Component<HeaderProperties, {}> {
    render() {
        const tabs = ["Overview", "Tasks"]
        return <CommonHeader.Header identifier={this.props.project.identifier} name={this.props.project.name}>
            <Col xs={12} sm={8}>
                <Breadcrumb project={this.props.project} />
            </Col>
            <TabBar tabs={tabs} onTabChanged={this.props.onTabChanged}/>
        </CommonHeader.Header>
    }
}
