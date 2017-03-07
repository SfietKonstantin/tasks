import * as React from "react"
import {Container} from "semantic-ui-react"
import {makeActiveClassName} from "../../common/utils/active"

interface OverviewProperties {
    visible: boolean
}

export class Overview extends React.Component<OverviewProperties, {}> {
    render() {
        const className = makeActiveClassName("ui basic segment tab", this.props.visible)
        return <Container className={className}>
            <h2>Overview</h2>
            <p>(Under construction)</p>
        </Container>
    }
}
