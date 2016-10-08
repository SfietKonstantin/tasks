import * as React from "react"
import * as ReactDOM from "react-dom"
import * as jquery from "jquery"
import { TaskHeader } from "./task/header"
import { TaskMain } from "./task/main"
import { TaskDetails } from "./task/details"
import { Project, Task, TaskResults, Modifier } from "../core/types"
import * as apitypes from "../core/apitypes"

interface TaskComponentProperties {
    identifier: string
}

interface TaskComponentState {
    tabIndex: number
    project: Project
    task: Task
    taskResults: TaskResults
    modifiers: Array<Modifier>
}

class TaskComponent extends React.Component<TaskComponentProperties, TaskComponentState> {
    constructor(props: TaskComponentProperties) {
        super(props)
        this.state = {
            tabIndex: 0,
            project: null,
            task: null,
            taskResults: null,
            modifiers: null
        }
    }
    render() {
        let taskHeader: JSX.Element = null
        let tab0: JSX.Element = null
        let tab1: JSX.Element = null
        if (this.state.project && this.state.task) {
            taskHeader = <TaskHeader project={this.state.project} task={this.state.task}  
                                     tabChangedCallback={this.handleTabChange.bind(this)} 
                                     addModifierCallback={this.addModifierCallback.bind(this)} />
            tab0 = <TaskMain visible={this.state.tabIndex==0} task={this.state.task} 
                             taskResults={this.state.taskResults} />
            tab1 = <TaskDetails visible={this.state.tabIndex==1} task={this.state.task} 
                                taskResults={this.state.taskResults} modifiers={this.state.modifiers} />
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
                modifiers: this.state.modifiers
            })
        }
    }
    private update() {
        jquery.get({
            url: "/api/task/" + this.props.identifier,
            dataType: 'json',
            cache: false,
            success: (data: apitypes.ApiProjectTaskModifiers) => {
                this.setState({
                    tabIndex: this.state.tabIndex,
                    project: data.project,
                    task: apitypes.createTaskFromApiTask(data.project, data.task),
                    taskResults: apitypes.createTaskResultsFromApiTask(data.task),
                    modifiers: data.modifiers
                })
            }
        })
    }
    private addModifierCallback(modifier: Modifier) {
        jquery.post({
            url: "/api/modifier/",
            dataType: 'json',
            data: {
                "modifier": JSON.stringify(modifier),
                "task": this.props.identifier
            },
            cache: false,
            success: (data: apitypes.ApiProjectTaskModifiers) => {
                this.setState({
                    tabIndex: this.state.tabIndex,
                    project: data.project,
                    task: apitypes.createTaskFromApiTask(data.project, data.task),
                    taskResults: apitypes.createTaskResultsFromApiTask(data.task),
                    modifiers: data.modifiers
                })
            }
        })
    }
}

export function render(identifier: string) {
    ReactDOM.render(<TaskComponent identifier={identifier} />, document.getElementById("content"))
}