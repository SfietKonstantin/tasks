import * as React from "react"
import { Button, Modal, Alert } from "react-bootstrap"

interface WarningsButtonProperties {
    warnings: Array<String>
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
        const warningTexts = this.props.warnings.map((warning: string, index: number) => {
            return <p key={index}>{warning}</p>
        })
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
            {this.props.warnings.length} warnings
        </Button>
    }
    private open() {
        this.setState({ show: true })
    }
    private close() {
        this.setState({ show: false })
    }
}
