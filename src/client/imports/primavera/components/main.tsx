import * as React from "react"
import { Grid, Col } from "react-bootstrap"
import { ProjectEditor, TasksSelector, RelationsSelector, DelaysSelector, Overview } from "../connectedcomponents"

export class Main extends React.Component<{}, {}> {
    render() {
        return <Grid>
            <Col xs={12} sm={12}>
                <h1>Import from Oracle Primavera</h1>
                <p>
                    Only CSV files can be imported. Oracle Primavera Excel files should
                    be converted to CSV files, with the tabulation as separator.
                </p>
                <ProjectEditor />
                <TasksSelector />
                <RelationsSelector />
                <DelaysSelector />
                <Overview />
            </Col>
        </Grid>
    }
}
