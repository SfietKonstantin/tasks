import * as React from "react"
import { Col } from "react-bootstrap"
import { TabBar } from "../../common/tabs"
import * as CommonHeader from "../../common/header"
import { Breadcrumb } from "./breadcrumb"
import { Project } from "../../../common/types"

interface HeaderProperties {
    project: Project
    tabChangedCallback: (index: number) => void
}

export class Header extends React.Component<HeaderProperties, {}> {
    render() {
        let tabs = ["Overview", "Tasks"]
        return <CommonHeader.Header identifier={this.props.project.identifier} name={this.props.project.name}>
            <Col xs={12} md={8}>
                <Breadcrumb project={this.props.project} />
            </Col>
            <TabBar tabs={tabs} tabChangedCallback={this.props.tabChangedCallback}/>
        </CommonHeader.Header>
    }
}
