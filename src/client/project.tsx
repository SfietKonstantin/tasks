import * as React from "react"
import * as ReactDOM from "react-dom"
import * as jquery from "jquery"
import { ProjectHeader } from "./project/header"
import { ProjectMain } from "./project/main"
import { ProjectAllTasks } from "./project/alltasks"
import { Project } from "../common/types"
import * as apitypes from "../common/apitypes"

interface ProjectComponentProperties {
    identifier: string
}

interface ProjectComponentState {
    tabIndex: number
    project: Project
    tasks: Array<apitypes.ApiTask>
}

class ProjectComponent extends React.Component<ProjectComponentProperties, ProjectComponentState> {
    constructor(props: ProjectComponentProperties) {
        super(props)
        this.state = {
            tabIndex: 0,
            project: null,
            tasks: null
        }
    }
    render() {
        let taskHeader: JSX.Element = null
        let tab0: JSX.Element = null
        let tab1: JSX.Element = null
        if (this.state.project) {
            const properties = ProjectComponent.makeProperties(this.state.tasks)
            taskHeader = <ProjectHeader project={this.state.project}
                                        tabChangedCallback={this.handleTabChange.bind(this)} />
            tab0 = <ProjectMain visible={this.state.tabIndex==0} project={this.state.project} />
            tab1 = <ProjectAllTasks visible={this.state.tabIndex==1} notStarted={properties[0]} inProgress={properties[1]} done={properties[2]} />
        }
        return <div> 
            {taskHeader}
            {tab0}
            {tab1}
        </div>
    }
    componentDidMount() {
        jquery.get({
            url: "/api/project/" + this.props.identifier + "",
            dataType: 'json',
            cache: false,
            success: (project: apitypes.ApiProjectTasks) => {
                this.setState({
                    tabIndex: this.state.tabIndex,
                    project: project.project,
                    tasks: project.tasks
                })
            }
        })
    }
    private static getEndDate(task: apitypes.ApiTask) : Date {
        let returned = new Date(task.startDate)
        returned.setDate(returned.getDate() + task.duration)
        return returned
    }
    private static makeProperties(tasks: Array<apitypes.ApiTask>) : [Array<apitypes.ApiTask>, 
                                                                     Array<apitypes.ApiTask>, 
                                                                     Array<apitypes.ApiTask>] {
        let today = new Date()
        return [tasks.filter((task: apitypes.ApiTask) => {
                const startDate = new Date(task.startDate)
                return startDate.getTime() >= today.getTime()
            }),
            tasks.filter((task: apitypes.ApiTask) => {
                const startDate = new Date(task.startDate)
                return startDate.getTime() < today.getTime() && 
                       ProjectComponent.getEndDate(task).getTime() >= today.getTime()
            }),
            tasks.filter((task: apitypes.ApiTask) => {
                return ProjectComponent.getEndDate(task).getTime() < today.getTime()
            })
        ]
    }
    private handleTabChange(index: number) {
        if (this.state.tabIndex != index) {
            this.setState({
                tabIndex: index,
                project: this.state.project,
                tasks: this.state.tasks
            })
        }
    }
}

export function render(identifier: string) {
    ReactDOM.render(<ProjectComponent identifier={identifier} />, document.getElementById("content"))
}