import * as React from "react"
import * as jquery from "jquery"
import * as apitypes from "../../core/apitypes"

interface ProjectAllTasksProperties {
    notStarted: Array<apitypes.ApiTask>
    inProgress: Array<apitypes.ApiTask>
    done: Array<apitypes.ApiTask>
}

interface ProjectAllTasksState {
    notStartedChecked: boolean
    inProgressChecked: boolean
    doneChecked: boolean
    tasks: Array<apitypes.ApiTask>
    
}

export class ProjectAllTasks extends React.Component<ProjectAllTasksProperties, ProjectAllTasksState> {
    constructor(props: ProjectAllTasksProperties) {
        super(props)
        this.state = this.makeState(true, true, false)
    }
    render() {
        const notStartedChecked = ProjectAllTasks.getButtonClassName(this.state.notStartedChecked)
        const inProgressChecked = ProjectAllTasks.getButtonClassName(this.state.inProgressChecked)
        const doneChecked = ProjectAllTasks.getButtonClassName(this.state.doneChecked)
        const content = this.state.tasks.map((value: apitypes.ApiTask) => {
            const taskLink = "/task/" + value.id
            return <tr>
                <td>
                    <a href={taskLink}><b>{value.name}</b></a>
                </td>
            </tr>
        })
        return <div className="container">
            <div id="main" className="col-xs-12 col-md-12">
                <div className="panel panel-default project-alltasks-table">
                    <div className="panel-heading">
                        <div className="btn-group">
                            <button type="button" className={notStartedChecked} onClick={this.handleNotStartedClicked.bind(this)}>
                                <span className="glyphicon glyphicon-time" aria-hidden="true"></span> Not started
                            </button>
                            <button type="button" className={inProgressChecked} onClick={this.handleInProgress.bind(this)}>
                                <span className="glyphicon glyphicon-plane" aria-hidden="true"></span> In progress
                            </button>
                            <button type="button" className={doneChecked} onClick={this.handleDoneClicked.bind(this)}>
                                <span className="glyphicon glyphicon-ok" aria-hidden="true"></span> Done
                            </button>
                        </div>
                    </div>
                    <table className="table table-hover">
                        <tbody>
                            {content}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    }
    private static getButtonClassName(checked: boolean) : string {
        return checked ? "btn btn-primary" : "btn btn-default"
    }
    private makeState(notStartedChecked: boolean, inProgressChecked: boolean, doneChecked: boolean) : ProjectAllTasksState {
        let state: ProjectAllTasksState = {
            notStartedChecked: notStartedChecked,
            inProgressChecked: inProgressChecked,
            doneChecked: doneChecked,
            tasks: new Array<apitypes.ApiTask>()
        }

        if (state.notStartedChecked) {
            state.tasks = state.tasks.concat(this.props.notStarted)
        }
        if (state.inProgressChecked) {
            state.tasks = state.tasks.concat(this.props.inProgress)
        }
        if (state.doneChecked) {
            state.tasks = state.tasks.concat(this.props.done)
        }
        state.tasks.sort((first: apitypes.ApiTask, second: apitypes.ApiTask) => {
            return first.id - second.id
        })
        return state
    }
    private handleNotStartedClicked(e: React.MouseEvent) {
        e.preventDefault()
        this.setState(this.makeState(!this.state.notStartedChecked, this.state.inProgressChecked, this.state.doneChecked))
    }
    private handleInProgress(e: React.MouseEvent) {
        e.preventDefault()
        this.setState(this.makeState(this.state.notStartedChecked, !this.state.inProgressChecked, this.state.doneChecked))
    }
    private handleDoneClicked(e: React.MouseEvent) {
        e.preventDefault()
        this.setState(this.makeState(this.state.notStartedChecked, this.state.inProgressChecked, !this.state.doneChecked))
    }
}