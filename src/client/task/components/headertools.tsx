import * as React from "react"
import { Col, Button, ButtonGroup } from "react-bootstrap"
import { ImportantButton } from "../containers/importantbutton"
import { ModifierButton } from "../containers/modifierbutton"

export class HeaderTools extends React.Component<{}, {}> {
    render() {
        return <Col xs={4} md={4}>
            <div className="task-header-tools">
                <ButtonGroup>
                    <ModifierButton>
                        <span className="glyphicon glyphicon-plus" aria-hidden="true"></span>
                        <span className="visible-md-inline visible-lg-inline"> Add duration modifier</span>
                    </ModifierButton>
                    <ImportantButton />
                </ButtonGroup>
            </div>
        </Col>
    }
}
