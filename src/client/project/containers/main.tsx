import * as React from "react"
import { Dispatch } from "redux"
import * as ReactRedux from "react-redux"
import { State } from "../types"
import { fetchProject } from "../actions/project"
import { Header } from "../components/header"
import { Overview } from "../components/overview"
import { AllTasks } from "../components/alltasks"
import { StatusIndicator, Status } from "../../common/components/statusindicator"
import { Project } from "../../../common/types"

interface MainProperties {
    projectIdentifier: string
    isFetching: boolean
    project: Project | null
    onFetchProject: (projectIdentifier: string) => void
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
        if (this.props.project) {
            return <div>
                <Header project={this.props.project} onTabChanged={this.handleTabChange.bind(this)} />
                <Overview visible={this.state.tabIndex === 0} />
                <AllTasks visible={this.state.tabIndex === 1} />
            </div>
        } else {
            return this.createStatusIndicator()
        }
    }
    componentDidMount() {
        this.props.onFetchProject(this.props.projectIdentifier)
    }
    private createStatusIndicator() {
        if (!this.props.isFetching) {
            const message = "Cannot load project #" + this.props.projectIdentifier
            return <StatusIndicator status={Status.Error} message={message}/>
        } else {
            return <StatusIndicator status={Status.Loading} />
        }
    }
    private handleTabChange(index: number) {
        if (this.state.tabIndex !== index) {
            this.setState({ tabIndex: index })
        }
    }
}

export const mapStateToProps = (state: State) => {
    return {
        projectIdentifier: state.projectIdentifier,
        isFetching: state.project.isFetching,
        project: state.project.project
    }
}

export const mapDispatchToProps = (dispatch: Dispatch<State>) => {
    return {
        onFetchProject: (projectIdentifier: string) => {
            dispatch(fetchProject(projectIdentifier))
        }
    }
}

export const Main = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(UnconnectedMain)
