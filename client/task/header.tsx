import * as React from "react"
import { TabBar } from "../common/tabs"
import { Header } from "../common/header"
import { TaskHeaderTools } from "./headertools"
import { TaskBreadcrumb } from "./breadcrumb"
import { Project, Task } from "../../core/types"

interface TaskHeaderProperties {
    project: Project
    task: Task
    tabChangedCallback: (index: number) => void
}

export class TaskHeader extends React.Component<TaskHeaderProperties, {}> {
    render() {
        let tabs = ["Overview", "Causes"]
        return <Header id={this.props.task.id} name={this.props.task.name}>
            <TaskHeaderTools taskId={this.props.task.id} />
            <div className="col-xs-12 col-md-8">
                <TaskBreadcrumb project={this.props.project} task={this.props.task} />
            </div>
            <TabBar tabs={tabs} tabChangedCallback={this.props.tabChangedCallback}/>
        </Header>
    }
}