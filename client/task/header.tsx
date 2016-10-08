import * as React from "react"
import { Col } from "react-bootstrap"
import { TabBar } from "../common/tabs"
import { Header } from "../common/header"
import { TaskHeaderTools } from "./headertools"
import { TaskBreadcrumb } from "./breadcrumb"
import { Project, Task, Modifier } from "../../core/types"

interface TaskHeaderProperties {
    project: Project
    task: Task
    tabChangedCallback: (index: number) => void
    addModifierCallback: (modifier: Modifier) => void
}

export class TaskHeader extends React.Component<TaskHeaderProperties, {}> {
    render() {
        let tabs = ["Overview", "Duration details"]
        return <Header identifier={this.props.task.identifier} name={this.props.task.name}>
            <TaskHeaderTools taskIdentifier={this.props.task.identifier} addModifierCallback={this.props.addModifierCallback} />
            <Col xs={12} md={8}>
                <TaskBreadcrumb project={this.props.project} task={this.props.task} />
            </Col>
            <TabBar tabs={tabs} tabChangedCallback={this.props.tabChangedCallback}/>
        </Header>
    }
}