import * as React from "react"
import { Dispatch } from "redux"
import * as ReactRedux from "react-redux"
import { State } from "../types"
import { fetchTask } from "../actions/task"
import { Header } from "../components/header"
import { Overview } from "../components/overview"
import { Project, Task, Modifier } from "../../../common/types"
import * as apitypes from "../../../common/apitypes"

interface MainProperties {
    projectIdentifier: string
    taskIdentifier: string
    project: Project
    task: Task
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
        let taskHeader: JSX.Element | null = null
        let tab0: JSX.Element | null = null
        let tab1: JSX.Element | null = null
        if (this.props.project) {
            taskHeader = <Header project={this.props.project} task={this.props.task}
                                 tabChangedCallback={this.handleTabChange.bind(this)} />
            tab0 = <Overview visible={this.state.tabIndex === 0} task={this.props.task} />
            // tab1 = <AllTasks visible={this.state.tabIndex==1} />
        }
        return <div>
            {taskHeader}
            {tab0}
            {tab1}
        </div>
    }
    componentDidMount() {
        this.props.dispatch(fetchTask(this.props.projectIdentifier, this.props.taskIdentifier))
    }
    private handleTabChange(index: number) {
        if (this.state.tabIndex !== index) {
            this.setState({ tabIndex: index })
        }
    }
}

const mapStateToProps = (state: State) => {
    const project = state.task.project
    const task = state.task.task
    return {
        projectIdentifier: state.projectIdentifier,
        taskIdentifier: state.taskIdentifier,
        project,
        task
    }
}

export const Main = ReactRedux.connect(mapStateToProps)(UnconnectedMain)
