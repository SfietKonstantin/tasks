import * as React from "react"
import * as ReactDOM from "react-dom"
import { Dispatch } from "redux"
import * as ReactRedux from "react-redux"
import { Grid, Col, ButtonGroup, Button, Alert, Form, FormGroup, FormControl, ControlLabel } from "react-bootstrap"
import { State, PrimaveraTask, PrimaveraDelay, PrimaveraTaskRelation } from "../types"
import { defineProject, addProject } from "../actions/project"
import { submit } from "../actions/overview"
import { Project } from "../../../../common/types"
import { ProjectEditor, TasksSelector, RelationsSelector, Overview } from "../connectedcomponents"

class UnconnectedMain extends React.Component<{}, {}> {
    render() {
        return <Grid>
            <Col xs={12} md={12}>
                <h1>Import from Oracle Primavera</h1>
                <p>
                    Only CSV files can be imported. Oracle Primavera Excel files should
                    be converted to CSV files, with the tabulation as separator.
                </p>
                <ProjectEditor />
                <TasksSelector />
                <RelationsSelector />
                <Overview />
            </Col>
        </Grid>
    }
    // private handleSubmit(e: React.FormEvent) {
        // this.props.onSubmit(this.props.project, this.props.tasks)
    // }
}

/*

const mapStateToProps = (state: State) => {
    let warnings = new Array<string>()
    // warnings = state.tasks.warnings.slice(0)

    const tasks = state.tasks.tasks
    const relations = state.relations.relations.filter((relation: PrimaveraTaskRelation) => {
        if (tasks.has(relation.previous) && tasks.has(relation.next)) {
            return true
        }


        if (tasks.has(relation.previous)) {
            const previousTask = tasks.get(relation.previous) as PrimaveraTask
            // Check if previous is a start milestone (not yet supported)
            if (previousTask.startDate && !previousTask.endDate) {
                warnings.push("\"" + relation.previous + "\" is a start milestone and is not yet supported")
                return false
            }
            // Check if previous is a finish milestone sharing the same date as the next task (not supported)
            if (previousTask.endDate && !previousTask.startDate) {
                if (tasks.has(relation.next)) {
                    const nextTask = tasks.get(relation.next) as PrimaveraTask
                    if (nextTask.startDate) {
                        if (nextTask.startDate.getTime() === previousTask.endDate.getTime()) {
                            warnings.push("\"" + relation.previous + "\" is an end milestone and is not yet supported")
                            return false
                        } else {
                            warnings.push("\"" + relation.previous + "\" is an end milestone and \"" + relation.next
                                          + "\" is a task with a different starting time and this is not yet supported")
                        }
                    }
                }
            }
        }

        warnings.push("Relation \"" + relation.previous + "\" to \""
                                    + relation.next + "\" do not have corresponding task")
        return false
    })
    return {
        project: state.project.project,
        tasks,
        delays: state.tasks.delays,
        relations,
        warnings
    }
}

const mapDispatchToProps = (dispatch: Dispatch<State>) => {
    return {
        onSubmit: (project: Project, tasks: Map<string, PrimaveraTask>) => {
            dispatch(submit(project, Array.from(tasks.values()), []))
        },
        dispatch
    }
}
*/

const mapStateToProps = (state: State) => {}

export const Main = ReactRedux.connect()(UnconnectedMain)
