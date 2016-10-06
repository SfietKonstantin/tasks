import * as React from "react";
import * as ReactDOM from "react-dom";
import * as jquery from "jquery"
import { ProjectHeader } from "./project/header"
import { ProjectMain } from "./project/main"
import { ProjectAllTasks } from "./project/alltasks"
import { Project } from "../core/types"
import * as apitypes from "../core/apitypes"

interface ProjectComponentProperties {
    id: number
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
        let tabContent: JSX.Element = null
        if (this.state.project) {
            taskHeader = <ProjectHeader project={this.state.project}  
                                        tabChangedCallback={this.handleTabChange.bind(this)} />
            if (this.state.tabIndex == 0) {
                tabContent = <ProjectMain project={this.state.project} />
            } else if (this.state.tabIndex == 1) {
                const properties = ProjectComponent.makeProperties(this.state.tasks)
                tabContent = <ProjectAllTasks notStarted={properties[0]} inProgress={properties[1]} done={properties[2]} />
            }
        }
        return <div> 
            {taskHeader}
            {tabContent}
        </div>
    }
    componentDidMount() {
        jquery.get({
            url: "/api/project/" + this.props.id + "",
            dataType: 'json',
            cache: false,
            success: (project: apitypes.ApiProjectAndTasks) => {
                this.setState({
                    tabIndex: this.state.tabIndex,
                    project: project.project,
                    tasks: project.tasks
                });
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

export function render(id: number) {
    ReactDOM.render(<ProjectComponent id={id} />, document.getElementById("content"))
}