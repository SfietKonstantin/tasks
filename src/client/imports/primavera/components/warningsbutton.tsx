import * as React from "react"
import { Button, Modal, Alert } from "react-bootstrap"
import * as maputils from "../../../../common/maputils"

interface WarningsButtonProperties {
    warnings: Map<string, Array<string>>
}

interface WarningButtonState {
    show: boolean,
}

export class WarningsButton extends React.Component<WarningsButtonProperties, WarningButtonState> {
    constructor(props: WarningsButtonProperties) {
        super(props)
        this.state = {
            show: false
        }
    }
    render() {
        let warningTexts = new Array<JSX.Element>()
        this.props.warnings.forEach((warnings: Array<string>, identifier: string) => {
            warnings.forEach((warning: string, index: number) => {
                const key = identifier + "-" + index
                warningTexts.push(<p key={key}>
                    <strong>{identifier}</strong> {warning}
                </p>)
            })
        })
        let totalWarnings = maputils.lengthOfMapOfList(this.props.warnings)
        return <Button bsStyle="warning" onClick={this.open.bind(this)}>
            <Modal show={this.state.show} bsSize="large" onHide={this.close.bind(this)}>
                <Modal.Header closeButton>
                    <Modal.Title>Warnings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="import-primavera-warning-content">
                        <Alert bsStyle="warning">
                            {warningTexts}
                        </Alert>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.close.bind(this)}>Close</Button>
                </Modal.Footer>
            </Modal>
            {totalWarnings} warnings
        </Button>
    }
    private open() {
        this.setState({ show: true })
    }
    private close() {
        this.setState({ show: false })
    }
}
