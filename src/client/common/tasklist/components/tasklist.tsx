import * as React from "react"
import * as ReactDOM from "react-dom"
import { Row, Col, ListGroup, FormGroup, FormControl } from "react-bootstrap"
import { TaskListFiltersToolbar } from "./tasklistfilterstoolbar"
import { TaskListFilters, Task } from "../types"
import { StatusIndicator, Status } from "../../../common/components/statusindicator"
import { assign } from "../../../common/assign"

export interface TaskListProperties<T extends Task, F extends TaskListFilters> {
    tasks: Array<T>
    filters: F
    onFiltersChanged: (filters: F) => void
}

interface TaskListState {
    textFilter: string
}

export abstract class TaskList<T extends Task,
                               F extends TaskListFilters,
                               Properties extends TaskListProperties<T, F>
                              >
                extends React.Component<Properties, TaskListState> {
    constructor(props: Properties) {
        super(props)
        this.state = {
            textFilter: ""
        }
    }
    render() {
        const content: Array<JSX.Element> = this.props.tasks.map((task: T) => {
            return this.createElement(task)
        })
        const emptyIndicator = this.createEmptyIndicator()
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
                {emptyIndicator}
            </div>
        </div>
    }
    protected abstract createElement(task: T): JSX.Element
    private createEmptyIndicator(): JSX.Element | null {
        if (this.props.tasks.length > 0) {
            return null
        }
        return <StatusIndicator status={Status.Info} message="Nothing to show" />
    }
    private handleTextChange(e: React.FormEvent) {
        const input = e.target as HTMLInputElement
        this.state.textFilter = input.value
    }
    private handleBlur(e: React.FocusEvent) {
        this.handleFiltersChanged()
    }
    private handleTextSubmit(e: React.FormEvent) {
        e.preventDefault()
        this.handleFiltersChanged()
    }
    private handleFiltersChanged() {
        const text = this.state.textFilter
        this.props.onFiltersChanged(assign(this.props.filters, { text }))
    }
}
