import * as React from "react"
import * as ReactDOM from "react-dom"
import { Row, Col, ListGroup, FormGroup, FormControl } from "react-bootstrap"
import { TaskListFiltersToolbar } from "./tasklistfilterstoolbar"

export enum MilestoneFilterMode {
    NoFilter,
    TasksOnly,
    MilestonesOnly
}

export interface TaskListFilters {
    milestoneFilterMode: MilestoneFilterMode
    text: string
}

interface TaskListProperties<T> {
    tasks: Array<T>
    createElement: (item: T) => JSX.Element
    filters: TaskListFilters
    onFiltersChanged: (filters: TaskListFilters) => void
}

interface TaskListState {
    textFilter: string
}

export class TaskList<T> extends React.Component<TaskListProperties<T>, TaskListState> {
    constructor(props: TaskListProperties<T>) {
        super(props)
        this.state = {
            textFilter: ""
        }
    }
    render() {
        const content: Array<JSX.Element> = this.props.tasks.map((item) => {
            return this.props.createElement(item)
        })
        return <div className="tab-table">
            <Row>
                <Col xs={12} sm={6}>
                    <form action="#" onSubmit={this.handleTextSubmit.bind(this)}>
                        <FormGroup>
                            <FormControl type="text" ref="filter" placeholder="Search"
                                         onInput={this.handleTextChange.bind(this)}
                                         onBlur={this.handleBlur.bind(this)} />
                        </FormGroup>
                    </form>
                </Col>
                <Col xs={12} sm={6}>
                    <TaskListFiltersToolbar filters={this.props.filters}
                                            onFiltersChanged={this.props.onFiltersChanged.bind(this)} />
                </Col>
            </Row>
            <div className="panel panel-default">
                <div className="panel-heading">
                    {this.props.children}
                </div>
                <ListGroup fill hover>
                    {content}
                </ListGroup>
            </div>
        </div>
    }
    private handleTextChange(e: React.FormEvent) {
        const input = e.target as HTMLInputElement
        this.state.textFilter = input.value
    }
    private handleBlur(e: React.FocusEvent) {
        this.handleFiltersChanged()
    }
    private handleTextSubmit(e: React.FormEvent) {
        this.handleFiltersChanged()
    }
    private handleFiltersChanged() {
        const text = this.state.textFilter
        this.props.onFiltersChanged(Object.assign(this.props.filters, { text }))
    }
}
