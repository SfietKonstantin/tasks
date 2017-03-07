import * as React from "react"
import {Container} from "semantic-ui-react"

interface HeaderProperties {
    identifier: string
    name: string
}

export class Header extends React.Component<HeaderProperties, {}> {
    render() {
        return <div className="page-header">
            <Container>
                <h1 className="ui header">{this.props.name}
                    <small>#{this.props.identifier}</small>
                </h1>
                {this.props.children}
            </Container>
        </div>
    }
}
