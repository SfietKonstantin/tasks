import * as React from "react"
import { Dispatch } from "redux"
import * as ReactRedux from "react-redux"
import { State } from "../types"
import { fetchProject } from "../actions/project"
import { Header } from "../components/header"
import { Overview } from "../components/overview"
import { AllTasks } from "../components/alltasks"
import { Project } from "../../../common/types"

interface MainProperties {
    projectIdentifier: string
    project: Project | null
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
            taskHeader = <Header project={this.props.project}
                                        onTabChanged={this.handleTabChange.bind(this)} />
            tab0 = <Overview visible={this.state.tabIndex === 0} />
            tab1 = <AllTasks visible={this.state.tabIndex === 1} />
        }
        return <div>
            {taskHeader}
            {tab0}
            {tab1}
        </div>
    }
    componentDidMount() {
        this.props.dispatch(fetchProject(this.props.projectIdentifier))
    }
    private handleTabChange(index: number) {
        if (this.state.tabIndex !== index) {
            this.setState({ tabIndex: index })
        }
    }
}

const mapStateToProps = (state: State) => {
    return {
        projectIdentifier: state.projectIdentifier,
        project: state.project.project
    }
}

export const Main = ReactRedux.connect(mapStateToProps)(UnconnectedMain)
