import * as React from "react"
import { Dispatch } from "redux"
import * as ReactRedux from "react-redux"
import { State } from "../types"
import { fetchTask } from "../actions/task"
import { Header } from "../components/header"
import { Overview } from "../components/overview"
import { Project, Task, TaskResults, Modifier } from "../../../common/types"
import * as apitypes from "../../../common/apitypes"

interface MainProperties {
    identifier: string
    project: Project
    task: Task,
    taskResults: TaskResults
    dispatch: Dispatch<State>
}

interface MainState {
    tabIndex: number
}

class UnconnectedMain extends React.Component<MainProperties, MainState> {
    constructor(props: MainProperties) {
        super(props)
        this.state = { tabIndex: 0 }
    }
    render() {
        let taskHeader: JSX.Element = null
        let tab0: JSX.Element = null
        let tab1: JSX.Element = null
        if (this.props.project) {
            taskHeader = <Header project={this.props.project} task={this.props.task}
                                 tabChangedCallback={this.handleTabChange.bind(this)} />
            tab0 = <Overview visible={this.state.tabIndex==0} task={this.props.task} 
                             taskResults={this.props.taskResults} />
            //tab1 = <AllTasks visible={this.state.tabIndex==1} />
        }
        return <div> 
            {taskHeader}
            {tab0}
            {tab1}
        </div>
    }
    componentDidMount() {
        this.props.dispatch(fetchTask(this.props.identifier))
    }
    private handleTabChange(index: number) {
        if (this.state.tabIndex != index) {
            this.setState({ tabIndex: index })
        }
    }
}

function mapStateToProps(state: State) {
    const task = state.task.project && state.task.task ? apitypes.createTaskFromApiTask(state.task.project, state.task.task) : null
    const taskResults = state.task.task ? apitypes.createTaskResultsFromApiTask(state.task.task) : null
    return {
        identifier: state.identifier,
        project: state.task.project,
        task: task,
        taskResults: taskResults
    }
}

export const Main = ReactRedux.connect(mapStateToProps)(UnconnectedMain)