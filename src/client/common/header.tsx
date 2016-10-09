import * as React from "react"
import * as ReactDOM from "react-dom"
import { Grid, Col } from "react-bootstrap"

interface HeaderProperties {
    identifier: string
    name: string
}

export class Header extends React.Component<HeaderProperties, {}> {
    render() {
        return <div className="page-header navbar-default">
            <Grid className="page-header-container">
                <Col xs={8} md={8}>
                    <h1 className="title-h1">{this.props.name} <small>#{this.props.identifier}</small></h1>
                </Col>
                {this.props.children}
            </Grid>
        </div>
    }
}