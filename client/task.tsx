import * as React from "react"
import * as ReactDOM from "react-dom"
import * as jquery from "jquery"
import { TaskHeader } from "./task/header"
import { TaskMain } from "./task/main"
import { TaskDetails } from "./task/details"
import { Project, Task, TaskResults, Impact } from "../core/types"
import * as apitypes from "../core/apitypes"

interface TaskComponentProperties {
    id: number
}

interface TaskComponentState {
    tabIndex: number
    project: Project
    task: Task
    taskResults: TaskResults
    impacts: Array<Impact>
}

class TaskComponent extends React.Component<TaskComponentProperties, TaskComponentState> {
    constructor(props: TaskComponentProperties) {
        super(props)
        this.state = {
            tabIndex: 0,
            project: null,
            task: null,
            taskResults: null,
            impacts: null
        }
    }
    render() {
        let taskHeader: JSX.Element = null
        let tab0: JSX.Element = null
        let tab1: JSX.Element = null
        if (this.state.project && this.state.task) {
            taskHeader = <TaskHeader project={this.state.project} task={this.state.task}  
                                     tabChangedCallback={this.handleTabChange.bind(this)} 
                                     addImpactCallback={this.addImpact.bind(this)} />
            tab0 = <TaskMain visible={this.state.tabIndex==0} task={this.state.task} 
                             taskResults={this.state.taskResults} />
            tab1 = <TaskDetails visible={this.state.tabIndex==1} task={this.state.task} 
                                taskResults={this.state.taskResults} impacts={this.state.impacts} />
        }
        return <div> 
            {taskHeader}
            {tab0}
            {tab1}
        </div>
    }
    componentDidMount() {
        this.update()
    }
    private handleTabChange(index: number) {
        if (this.state.tabIndex != index) {
            this.setState({
                tabIndex: index,
                project: this.state.project, 
                task: this.state.task,
                taskResults: this.state.taskResults,
                impacts: this.state.impacts
            })
        }
    }
    private update() {
        jquery.get({
            url: "/api/task/" + this.props.id,
            dataType: 'json',
            cache: false,
            success: (data: apitypes.ApiProjectTaskImpacts) => {
                this.setState({
                    tabIndex: this.state.tabIndex,
                    project: data.project,
                    task: apitypes.createTaskFromApiTask(data.project, data.task),
                    taskResults: apitypes.createTaskResultsFromApiTask(data.task),
                    impacts: data.impacts
                })
            }
        })
    }
    private addImpact(impact: Impact) {
        jquery.post({
            url: "/api/impact/",
            dataType: 'json',
            data: {
                "impact": JSON.stringify(impact),
                "task": this.props.id
            },
            cache: false,
            success: (data: apitypes.ApiProjectTaskImpacts) => {
                this.setState({
                    tabIndex: this.state.tabIndex,
                    project: data.project,
                    task: apitypes.createTaskFromApiTask(data.project, data.task),
                    taskResults: apitypes.createTaskResultsFromApiTask(data.task),
                    impacts: data.impacts
                })
            }
        })
    }
}

export function render(id: number) {
    ReactDOM.render(<TaskComponent id={id} />, document.getElementById("content"))
}