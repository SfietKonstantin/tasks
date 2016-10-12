import * as React from "react"
import { Row, Col, Panel, ProgressBar, Label } from "react-bootstrap"
import { Task, TaskResults } from "../../../common/types"
import * as dateutils from "../../../common/dateutils"

interface StatusIndicatorProperties {
    icon: string
    text: string
}

class StatusIndicator extends React.Component<StatusIndicatorProperties, {}> {
    render() {
        const className = "glyphicon glyphicon-" + this.props.icon
        return <div className="task-overview-state">
            <span className={className} aria-hidden="true"></span> {this.props.text}
        </div>
    }
}

interface StatusTimeProperties {
    className: string
    color: string
    state: string
    date: string
    days: string
}

class StatusTime extends React.Component<StatusTimeProperties, {}> {
    render() {
        return <Col className={this.props.className} xs={12} md={6}>
            <div className="task-overview-label">
                <Label bsStyle={this.props.color}>{this.props.state}</Label>
            </div>
            <div className="task-overview-time">{this.props.date}</div>
            <div>{this.props.days}</div>
        </Col>
    }
}

interface StatusProperties {
    task: Task
    taskResults: TaskResults
}

export class Status extends React.Component<StatusProperties, {}> {
    render() {
        const daysBeforeStart = this.getDaysBeforeStart()
        const daysBeforeEnd = this.getDaysBeforeEnd()
        const started = daysBeforeStart < 0
        const done = daysBeforeEnd < 0

        const stateInfo = this.getStateInfo(started, done)
        const progressInfo = this.getProgressInfo(started, done)
        const startInfo = this.getStartInfo(started)
        const endInfo = this.getEndInfo(done)

        return <Panel className="task-overview">
            <StatusIndicator icon={stateInfo[0]} text={stateInfo[1]} />
            <ProgressBar className="task-overview-progress" now={progressInfo[0]} />
            <Row>
                <StatusTime className="task-overview-start" color={startInfo[0]} state={startInfo[1]}
                                    date={startInfo[2]} days={startInfo[3]} />
                <StatusTime className="task-overview-end" color={endInfo[0]} state={endInfo[1]}
                                    date={endInfo[2]} days={endInfo[3]} />
            </Row>
        </Panel>
    }
    private getDaysBeforeStart() {
        return dateutils.getDateDiff(new Date(), this.props.taskResults.startDate)
    }
    private getEndDate() {
        let returned = new Date(this.props.taskResults.startDate.getTime())
        returned.setDate(returned.getDate() + this.props.taskResults.duration)
        return returned
    }
    private getEstimatedEndDate() {
        let returned = new Date(this.props.task.estimatedStartDate.getTime())
        returned.setDate(returned.getDate() + this.props.task.estimatedDuration)
        return returned
    }
    private getDaysBeforeEnd() {
        return dateutils.getDateDiff(new Date(), this.getEndDate())
    }
    private getStateInfo(started: boolean, done: boolean): [string, string] {
        if (!started) {
            return ["time", "Not started"]
        } else if (started && !done) {
            return ["plane", "In progress"]
        } else if (done) {
            return ["ok", "Done"]
        } else {
            return ["remove", "Unknown state :()"]
        }
    }
    private getProgressInfo(started: boolean, done: boolean): [number] {
        if (!started) {
            return [0]
        } else if (started && !done) {
            const startTime = this.props.taskResults.startDate.getTime()
            const endTime = this.getEndDate().getTime()
            const currentTime = (new Date()).getTime()

            const ratio = Math.round(100 * (currentTime - startTime) / (endTime - startTime))

            return [ratio]
        } else if (done) {
            return [100]
        } else {
            return null
        }
    }
    private getStartInfo(started: boolean) : [string, string, string, string] {
        let color: string = null
        let state: string = null
        let date: string = null
        let days: string = null

        const startDateLabel = dateutils.getDateLabel(this.props.taskResults.startDate)
        const diff = dateutils.getDateDiff(this.props.task.estimatedStartDate, this.props.taskResults.startDate)
        const todayDiff = dateutils.getDateDiff(new Date(), this.props.taskResults.startDate)
        
        if (diff <= 0) {
            color = "success"
            state = "On time"
        } else {
            color = "warning"
            state = "Late " + diff + " days"
        }

        if (started) {
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
    private getEndInfo(done: boolean) : [string, string, string, string] {
        let color: string = null
        let state: string = null
        let date: string = null
        let days: string = null

        const endDate = this.getEndDate()
        const endDateLabel = dateutils.getDateLabel(endDate)
        const diff = dateutils.getDateDiff(this.getEstimatedEndDate(), endDate)
        const todayDiff = dateutils.getDateDiff(new Date(), endDate)
        
        if (diff <= 0) {
            color = "success"
            state = "On time"
        } else {
            color = "warning"
            state = "Late " + diff + " days"
        }

        if (done) {
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