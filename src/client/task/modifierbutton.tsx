import * as React from "react"
import { Col, Button, Modal, Form, FormGroup, FormControl, ControlLabel, InputGroup } from "react-bootstrap"
import * as jquery from "jquery"
import { Modifier } from "../../common/types"

interface TaskModifierButtonProperties {
    addModifierCallback: (modifier: Modifier) => void
}

interface TaskModifierButtonState {
    show: boolean,
    name: string
    description: string,
    duration: number
}

export class TaskModifierButton extends React.Component<TaskModifierButtonProperties, TaskModifierButtonState> {
    constructor(props: TaskModifierButtonProperties) {
        super(props)
        this.state = {
            show: false,
            name: "",
            description: "",
            duration: 0
        }
    }
    render() {
        return <Button onClick={this.open.bind(this)}>
            <Modal show={this.state.show} bsSize="large" onHide={this.close.bind(this)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add task modifier</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form horizontal>
                        <FormGroup validationState={this.getNameValidationState()}>
                            <Col componentClass={ControlLabel} xd={12} md={2}>
                                Title
                            </Col>
                            <Col xd={12} md={10}>
                                <FormControl type="text" ref="title" placeholder="Title" onInput={this.handleNameInput.bind(this)} />
                            </Col>
                        </FormGroup>
                        <FormGroup validationState={this.getDurationValidationState()}>
                            <Col componentClass={ControlLabel} xd={12} md={2}>
                                Duration
                            </Col>
                            <Col xd={12} md={10}>
                                <InputGroup>
                                    <FormControl type="number" ref="duration" placeholder="Duration" onInput={this.handleDurationInput.bind(this)}/>
                                    <InputGroup.Addon>days</InputGroup.Addon>
                                </InputGroup>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} xd={12} md={2}>
                                Description
                            </Col>
                            <Col xd={12} md={10}>
                                <FormControl type="text" ref="description" componentClass="textarea" placeholder="Description" onInput={this.handleDescriptionInput.bind(this)} />
                            </Col>
                        </FormGroup>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="primary" disabled={!this.isButtonEnabled()} onClick={this.handleSave.bind(this)}>Save</Button>
                </Modal.Footer>
            </Modal>
            {this.props.children}
        </Button>
    }
    private open() {
        this.setState({
            show: true,
            name: "",
            description: "",
            duration: 0
        })
    }
    private close() {
        this.setState({
            show: false,
            name: this.state.name,
            description: this.state.description,
            duration: this.state.duration
        })
    }
    private isButtonEnabled() {
        return this.state.name.length > 0 && this.state.duration != Number.NaN && this.state.duration != 0
    }
    private getNameValidationState() : "success" | "error" {
        return this.state.name.length > 0 ? "success" : "error"
    }
    private getDurationValidationState() : "success" | "error" {
        return this.state.duration != Number.NaN && this.state.duration != 0 ? "success" : "error"
    }
    private handleNameInput(e: React.FormEvent) {
        const input = e.target as HTMLInputElement
        this.setState({
            show: this.state.show,
            name: input.value,
            duration: this.state.duration,
            description: this.state.description,
        })
    }
    private handleDurationInput(e: React.FormEvent) {
        const input = e.target as HTMLInputElement
        const duration = +input.value
        this.state.duration = duration
        this.setState({
            show: this.state.show,
            name: this.state.name,
            duration: duration,
            description: this.state.description,
        })
    }
    private handleDescriptionInput(e: React.FormEvent) {
        const input = e.target as HTMLInputElement
        this.setState({
            show: this.state.show,
            name: this.state.name,
            duration: this.state.duration,
            description: input.value,
        })
    }
    private handleSave(e: React.MouseEvent) {
        e.preventDefault()
        const modifier: Modifier = {
            id: null,
            name: this.state.name,
            description: this.state.description,
            duration: this.state.duration
        }
        this.props.addModifierCallback(modifier)
        this.close()
    }
}