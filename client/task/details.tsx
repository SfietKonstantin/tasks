import * as React from "react"
import { Grid, Panel, Col, Label, Table } from "react-bootstrap"
import * as jquery from "jquery"
import * as dateutils from "../common/dateutils"
import { Task, TaskResults, Impact } from "../../core/types"

interface TaskDetailsMilestoneProperties {
    date: Date
    label: string
} 

class TaskDetailsMilestone extends React.Component<TaskDetailsMilestoneProperties, {}> {
    render() {
        return <div className="task-details-milestone">
            <b>{dateutils.getDateLabel(this.props.date)}</b> {this.props.label}
        </div>
    }
}

interface TaskDetailsDurationProperties {
    duration: string
    label: string
    color?: string
} 

class TaskDetailsDuration extends React.Component<TaskDetailsDurationProperties, {}> {
    render() {
        return <div className="task-details-duration">
            <Label bsStyle={this.props.color}>{this.props.duration} days</Label> {this.props.label}
        </div>
    }
}

interface TaskDetailsProperties {
    visible: boolean
    task: Task
    taskResults: TaskResults
    impacts: Array<Impact>
}

export class TaskDetails extends React.Component<TaskDetailsProperties, {}> {
    constructor(props: TaskDetailsProperties) {
        super(props)
    }
    render() {
        /*
        let startDelay: [JSX.Element, JSX.Element] = [null, null]
        const startDateDiff = dateutils.getDateDiff(this.props.task.estimatedStartDate, this.props.taskResults.startDate)
        if (startDateDiff != 0) {
            startDelay = [<TaskDetailsDuration duration={"" + startDateDiff} label="Impact due to xxxx (TODO)" 
                                               color="warning" />,
                          <TaskDetailsMilestone date={this.props.taskResults.startDate} label="Start date" />]
        }
        let endDate = dateutils.addDays(this.props.taskResults.startDate, this.props.task.estimatedDuration)
        let impacts = new Array<JSX.Element>()
        impacts.push(<TaskDetailsMilestone date={endDate} label="" />)
        this.props.impacts.forEach((value: Impact) => {
            endDate = dateutils.addDays(endDate, value.duration)
            const color = value.duration > 0 ? "warning" : "success"
            impacts.push(<TaskDetailsDuration duration={"" + value.duration} label={value.name}
                                              color={color} />)
            impacts.push(<TaskDetailsMilestone date={endDate} label="" />)
        })

        impacts.pop()

        return <Grid className={this.props.visible ? "" : "hidden"}>
            <Col id="main" xs={12} md={12}>
                <Panel className="tab-table">
                    <TaskDetailsMilestone date={this.props.task.estimatedStartDate} label="Planned start date" />
                    {startDelay}
                    <TaskDetailsDuration duration={"" + this.props.task.estimatedDuration} label="Planned duration" />
                    {impacts}
                    <TaskDetailsMilestone date={this.getEndDate()} label="End date" />
                </Panel>
            </Col>
        </Grid>
        */
        return <Grid className={this.props.visible ? "" : "hidden"}>
            <Col id="main" xs={12} md={12}>
            </Col>
            // TODO: make it in D3
        </Grid>
    }
    private getEndDate() {
        let returned = new Date(this.props.taskResults.startDate.valueOf())
        returned.setDate(returned.getDate() + this.props.taskResults.duration)
        return returned
    }
}