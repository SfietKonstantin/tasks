import * as React from "react"
import { Grid, Col } from "react-bootstrap"
import { TaskBrowser } from "../connectedcomponents"

interface AllTasksProperties {
    visible: boolean
}

export class AllTasks extends React.Component<AllTasksProperties, {}> {
    render() {
        return <Grid className={this.props.visible ? "" : "hidden"}>
            <Col id="main" xs={12} sm={12} className="tab-table">
                <TaskBrowser />
            </Col>
        </Grid>
    }
}
