import * as React from "react"
import {TabBar} from "../../common/components/tabs"
import {Breadcrumb} from "./breadcrumb"
import {Header as CommonHeader} from "../../common/components/header"
import {Project} from "../../../common/project"

interface HeaderProperties {
    project: Project
    onTabChanged: (index: number) => void
}

export class Header extends React.Component<HeaderProperties, {}> {
    render() {
        const tabs = ["Overview", "Tasks"]
        return <CommonHeader identifier={this.props.project.identifier} name={this.props.project.name}>
            <Breadcrumb project={this.props.project}/>
            <TabBar tabs={tabs} onTabChanged={this.props.onTabChanged}/>
        </CommonHeader>
    }
}
