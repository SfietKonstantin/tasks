import * as React from "react"
import {Header} from "./components/header"
import {Overview} from "./components/overview"
// import {AllTasks} from "./components/alltasks"
// import {StatusIndicator, Status} from "../common/components/statusindicator"
import {Project} from "../../common/project"
import {Task} from "../../common/task"
import {processFetch} from "../common/utils/fetch"
import {ApiTask, TaskBuilder} from "../../common/api/task"

interface MainProperties {
    projectIdentifier: string
}

interface MainState {
    tabIndex: number,
    isFetching: boolean
    project: Project | null,
    tasks: Array<Task>
}

export class Main extends React.Component<MainProperties, MainState> {
    constructor(props: MainProperties) {
        super(props)
        this.state = {
            tabIndex: 0,
            isFetching: false,
            project: null,
            tasks: []
        }
    }

    render() {
        /*
        if (this.state.project) {
            return <div>
                <Header project={this.state.project} onTabChanged={this.handleTabChange.bind(this)}/>
                <Overview visible={this.state.tabIndex === 0}/>
            </div>
            return <div>
             <Header project={this.props.project} onTabChanged={this.handleTabChange.bind(this)} />
             <Overview visible={this.state.tabIndex === 0} />
             <AllTasks visible={this.state.tabIndex === 1} />
             </div>
        } else {
            return <div /> // this.createStatusIndicator()
        }
        */
        if (this.state.project) {
            return <div>
                <Header project={this.state.project} onTabChanged={this.handleTabChange.bind(this)}/>
                <Overview visible={this.state.tabIndex === 0}/>
            </div>
        } else {
            return <div /> // this.createStatusIndicator()
        }
    }

    componentDidMount() {
        this.setState({
            isFetching: true,
            tasks: []
        })

        Promise.all([
            window.fetch(`/api/project/${this.props.projectIdentifier}`),
            window.fetch(`/api/project/${this.props.projectIdentifier}/task/list`)
        ]).then((responses: [Response, Response]) => {
            return Promise.all([
                processFetch<Project>(responses[0]),
                processFetch<Array<ApiTask>>(responses[1])
            ])
        }).then((result: [Project, Array<ApiTask>]) => {
            this.setState({
                ...this.state,
                isFetching: false,
                project: result[0],
                tasks: result[1].map(TaskBuilder.fromApiTask)
            })
        })
    }

    /*
    private createStatusIndicator() {
        if (!this.props.isFetching) {
            const message = "Cannot load project #" + this.props.projectIdentifier
            return <StatusIndicator status={Status.Error} message={message}/>
        } else {
            return <StatusIndicator status={Status.Loading}/>
        }
    }
    */

    private handleTabChange(index: number) {
        if (this.state.tabIndex !== index) {
            this.setState({tabIndex: index})
        }
    }
}
