import * as React from "react"
import * as jquery from "jquery"
import { Task, TaskResults } from "../../core/types"

interface TaskOverviewStateIndicatorProperties {
    icon: string
    text: string
}

class TaskOverviewStateIndicator extends React.Component<TaskOverviewStateIndicatorProperties, {}> {
    render() {
        const className = "glyphicon glyphicon-" + this.props.icon
        return <span className="task-overview-state">
            <span className={className} aria-hidden="true"></span> {this.props.text}
        </span>
    }
}

interface TaskOverviewProgressProperties {
    progress: number
}

class TaskOverviewProgress extends React.Component<TaskOverviewProgressProperties, {}> {
    render() {
        const css: React.CSSProperties = {
            width: +this.props.progress + "%"
        }
        return <div className="task-overview-progress progress">
            <div className="progress-bar" role="progressbar" style={css}></div>
        </div>
    }
}

interface TaskOverviewTimeProperties {
    className: string
    color: string
    state: string
    date: string
    days: string
}

class TaskOverviewTime extends React.Component<TaskOverviewTimeProperties, {}> {
    render() {
        const className = "col-xs-12 col-md-6 " + this.props.className
        const stateClassName = "label label-" + this.props.color
        return <div className={className}>
            <div className="task-overview-label">
                <span className={stateClassName}>{this.props.state}</span>
            </div>
            <div className="task-overview-time">{this.props.date}</div>
            <div>{this.props.days}</div>
        </div>
    }
}

interface TaskOverviewProperties {
    task: Task
    taskResults: TaskResults
}

interface TaskOverviewState {
    started: boolean,
    done: boolean,
    daysBeforeStart: number
    daysBeforeEnd: number
}

export class TaskOverview extends React.Component<TaskOverviewProperties, TaskOverviewState> {
    constructor(props: TaskOverviewProperties) {
        super(props)
        let daysBeforeStart = this.getDaysBeforeStart()
        let daysBeforeEnd = this.getDaysBeforeEnd()
        this.state = {
            started: daysBeforeStart < 0,
            done: daysBeforeEnd < 0,
            daysBeforeStart: daysBeforeStart,
            daysBeforeEnd: daysBeforeEnd
        }
    }
    render() {
        const stateInfo = this.getStateInfo()
        const progressInfo = this.getProgressInfo()
        const startInfo = this.getStartInfo()
        const endInfo = this.getEndInfo()

        return <div className="task-overview panel panel-default">
            <div className="panel-body">
                <TaskOverviewStateIndicator icon={stateInfo[0]} text={stateInfo[1]} />
                <TaskOverviewProgress progress={progressInfo[0]} />
                <div className="row">
                    <TaskOverviewTime className="task-overview-start" color={startInfo[0]} state={startInfo[1]}
                                        date={startInfo[2]} days={startInfo[3]} />
                    <TaskOverviewTime className="task-overview-end" color={endInfo[0]} state={endInfo[1]}
                                        date={endInfo[2]} days={endInfo[3]} />
                </div>
            </div>
        </div>
    }
    private static computeDateDiff(first: Date, second: Date) {
        const MS_PER_DAY = 1000 * 60 * 60 * 24;

        // Discard the time and time-zone information.
        var utcFirst = Date.UTC(first.getFullYear(), first.getMonth(), first.getDate());
        var utcSecond = Date.UTC(second.getFullYear(), second.getMonth(), second.getDate());

        return Math.floor((utcSecond - utcFirst) / MS_PER_DAY);
    }
    private static getDateLabel(date: Date) { 
        return "" + date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
    }
    private getDaysBeforeStart() {
        return TaskOverview.computeDateDiff(new Date(), this.props.taskResults.startDate)
    }
    private getEndDate() {
        let returned = new Date(this.props.taskResults.startDate.valueOf())
        returned.setDate(returned.getDate() + this.props.taskResults.duration)
        return returned
    }
    private getEstimatedEndDate() {
        let returned = new Date(this.props.task.estimatedStartDate.valueOf())
        returned.setDate(returned.getDate() + this.props.task.estimatedDuration)
        return returned
    }
    private getDaysBeforeEnd() {
        return TaskOverview.computeDateDiff(new Date(), this.getEndDate())
    }
    private getStateInfo(): [string, string] {
        if (!this.state.started) {
            return ["time", "Not started"]
        } else if (this.state.started && !this.state.done) {
            return ["plane", "In progress"]
        } else if (this.state.done) {
            return ["ok", "Done"]
        } else {
            return ["remove", "Unknown state :()"]
        }
    }
    private getProgressInfo(): [number] {
        if (!this.state.started) {
            return [0]
        } else if (this.state.started && !this.state.done) {
            const startTime = this.props.taskResults.startDate.getTime()
            const endTime = this.getEndDate().getTime()
            const currentTime = (new Date()).getTime()

            const ratio = Math.round(100 * (currentTime - startTime) / (endTime - startTime))

            return [ratio]
        } else if (this.state.done) {
            return [100]
        } else {
            return null
        }
    }
    private getStartInfo() : [string, string, string, string] {
        let color: string = null
        let state: string = null
        let date: string = null
        let days: string = null

        const startDateLabel = TaskOverview.getDateLabel(this.props.taskResults.startDate)
        const diff = TaskOverview.computeDateDiff(this.props.task.estimatedStartDate, this.props.taskResults.startDate)
        const todayDiff = TaskOverview.computeDateDiff(new Date(), this.props.taskResults.startDate)
        
        if (diff <= 0) {
            color = "success"
            state = "On time"
        } else {
            color = "warning"
            state = "Late " + diff + " days"
        }

        if (this.state.started) {
            date = "Started the " + startDateLabel
        } else {
            date = "Starting the " + startDateLabel
        }

        if (todayDiff > 0) {
            days = "In " + todayDiff + " days"
        } else if (todayDiff < 0) {
            days = +(-todayDiff) + " days ago"
        }
        
        return [color, state, date, days]
    }
    private getEndInfo() : [string, string, string, string] {
        let color: string = null
        let state: string = null
        let date: string = null
        let days: string = null

        const endDate = this.getEndDate()
        const endDateLabel = TaskOverview.getDateLabel(endDate)
        const diff = TaskOverview.computeDateDiff(this.getEstimatedEndDate(), endDate)
        const todayDiff = TaskOverview.computeDateDiff(new Date(), endDate)
        
        if (diff <= 0) {
            color = "success"
            state = "On time"
        } else {
            color = "warning"
            state = "Late " + diff + " days"
        }

        if (this.state.done) {
            date = "Done the " + endDateLabel
        } else {
            date = "Ending the " + endDateLabel
        }

        if (todayDiff > 0) {
            days = "In " + todayDiff + " days"
        } else if (todayDiff < 0) {
            days = +(-todayDiff) + " days ago"
        }
        
        return [color, state, date, days]
    }
}