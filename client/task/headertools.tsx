import * as React from "react"
import * as jquery from "jquery"

interface TaskToolsProperties {
    taskId: number
}

interface TaskToolsState {
    enabled: boolean
    important: boolean
}

export class TaskHeaderTools extends React.Component<TaskToolsProperties, TaskToolsState> {
    constructor(props: TaskToolsProperties) {
        super(props)
        this.state = { enabled: false, important: false}
    }
    render() {
        return <div className="col-xs-1 col-md-4"> 
            <form className="task-header-tools" onSubmit={this.handleSubmit.bind(this)}> 
                <button className={this.getClassName()} type="submit">
                    <span className="glyphicon glyphicon-star" aria-hidden="true"></span>
                    <span className="visible-md-inline visible-lg-inline"> {this.getLabel()}</span>
                </button>
            </form>
        </div>
    }
    componentDidMount() {
        jquery.get({
            url: "/api/task/" + this.props.taskId + "/important",
            dataType: 'json',
            cache: false,
            success: (data: TaskToolsState) => {
                this.setState(TaskHeaderTools.makeState(data, true));
            }
        })
    }
    private handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (this.state.enabled) {
            this.setState(TaskHeaderTools.makeState(this.state, false));
            jquery.ajax({
                type: this.state.important ? "DELETE" : "PUT",
                url: "/api/task/" + this.props.taskId + "/important",
                success: (data: TaskToolsState) => {
                    this.setState(TaskHeaderTools.makeState(data, true));
                }
            })
        }
    }
    private getClassName() : string {
        let className = this.state.important ? "btn btn-danger" : "btn btn-default"
        if (!this.state.enabled) {
            className += " disabled"
        } 
        return className 
    }
    private getLabel() : string {
        return this.state.important ? "Important" : "Set as important"
    }
    private static makeState(state: TaskToolsState, enabled: boolean) {
        return {important: state.important, enabled: enabled}
    }
}