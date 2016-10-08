import * as React from "react"
import { Grid, Col } from "react-bootstrap"
import * as jquery from "jquery"
import { Project } from "../../core/types"

interface ProjectMainProperties {
    visible: boolean
    project: Project
}

export class ProjectMain extends React.Component<ProjectMainProperties, {}> {
    render() {
        return <Grid className={this.props.visible ? "" : "hidden"}>
            <Col id="main" xs={12} md={10}>
                <h2>Overview</h2>
                <p>(Under construction)</p>
            </Col>
        </Grid>
    }
} 
