import * as React from "react";
import * as ReactDOM from "react-dom";
import * as jquery from "jquery"
import { TaskHeader } from "./task/header"
import { TaskMain } from "./task/main"
import { Project, Task, TaskResults } from "../core/types"
import * as apitypes from "../core/apitypes"

interface TaskComponentProperties {
    id: number
}

interface TaskComponentState {
    tabIndex: number
    project: Project
    task: Task
    taskResults: TaskResults
}

class TaskComponent extends React.Component<TaskComponentProperties, TaskComponentState> {
    constructor(props: TaskComponentProperties) {
        super(props)
        this.state = {
            tabIndex: 0,
            project: null,
            task: null,
            taskResults: null
        }
    }
    render() {
        let taskHeader: JSX.Element = null
        let tabContent: JSX.Element = null
        if (this.state.project && this.state.task) {
            taskHeader = <TaskHeader project={this.state.project} task={this.state.task}  
                                     tabChangedCallback={this.handleTabChange.bind(this)} />
            if (this.state.tabIndex == 0) {
                tabContent = <TaskMain task={this.state.task} taskResults={this.state.taskResults} />
            } 
        }
        return <div> 
            {taskHeader}
            {tabContent}
        </div>
    }
    componentDidMount() {
        jquery.get({
            url: "/api/task/" + this.props.id + "",
            dataType: 'json',
            cache: false,
            success: (data: apitypes.ApiProjectAndTask) => {
                this.setState({
                    tabIndex: this.state.tabIndex,
                    project: data.project,
                    task: apitypes.createTaskFromApiTask(data.project, data.task),
                    taskResults: apitypes.createTaskResultsFromApiTask(data.task)
                });
            }
        })
    }
    private handleTabChange(index: number) {
        if (this.state.tabIndex != index) {
            this.setState({
                tabIndex: index,
                project: this.state.project, 
                task: this.state.task,
                taskResults: this.state.taskResults
            })
        }
    }
}

export function render(id: number) {
    ReactDOM.render(<TaskComponent id={id} />, document.getElementById("content"))
}