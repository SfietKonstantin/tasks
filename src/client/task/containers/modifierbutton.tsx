import * as React from "react"
import { Col, Button, Modal, Form, FormGroup, FormControl, ControlLabel, InputGroup, Radio } from "react-bootstrap"
import { Dispatch } from "redux"
import * as ReactRedux from "react-redux"
import { State } from "../types"
import { addModifier } from "../actions/task"
import { Modifier, TaskLocation } from "../../../common/types"

interface ModifierButtonProperties {
    projectIdentifier: string
    taskIdentifier: string
    onAddModifier: (projectIdentifier: string, taskIdentifier: string, modifier: Modifier) => void
    dispatch: Dispatch<State>
}

interface ModifierButtonState {
    show: boolean,
    name: string
    description: string,
    duration: number,
    location: TaskLocation
}

export class UnconnectedModifierButton extends React.Component<ModifierButtonProperties, ModifierButtonState> {
    constructor(props: ModifierButtonProperties) {
        super(props)
        this.state = {
            show: false,
            name: "",
            description: "",
            duration: 0,
            location: TaskLocation.End
        }
    }
    render() {
        return <Button onClick={this.open.bind(this)}>
            <Modal show={this.state.show} bsSize="large" onHide={this.close.bind(this)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add task duration modifier</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form horizontal>
                        <FormGroup validationState={this.getNameValidationState()}>
                            <Col componentClass={ControlLabel} xd={12} md={2}>
                                Title
                            </Col>
                            <Col xd={12} md={10}>
                                <FormControl type="text" placeholder="Title"
                                             onInput={this.handleNameInput.bind(this)} />
                            </Col>
                        </FormGroup>
                        <FormGroup validationState={this.getDurationValidationState()}>
                            <Col componentClass={ControlLabel} xd={12} md={2}>
                                Duration
                            </Col>
                            <Col xd={12} md={10}>
                                <InputGroup>
                                    <FormControl type="number" placeholder="Duration"
                                                 onInput={this.handleDurationInput.bind(this)}/>
                                    <InputGroup.Addon>days</InputGroup.Addon>
                                </InputGroup>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} xd={12} md={2}>
                                Modifier type
                            </Col>
                            <Col xd={12} md={10}>
                                <InputGroup>
                                    <Radio checked={this.state.location === TaskLocation.Beginning}
                                           onClick={this.handleBeginningRadio.bind(this)}>
                                        At the begining of the task
                                    </Radio>
                                    <Radio checked={this.state.location === TaskLocation.End}
                                           onClick={this.handleEndRadio.bind(this)}>
                                        At the end of the task
                                    </Radio>
                                </InputGroup>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} xd={12} md={2}>
                                Description
                            </Col>
                            <Col xd={12} md={10}>
                                <FormControl type="text" componentClass="textarea" placeholder="Description"
                                             onInput={this.handleDescriptionInput.bind(this)} />
                            </Col>
                        </FormGroup>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button bsStyle="primary" disabled={!this.isButtonEnabled()}
                            onClick={this.handleSave.bind(this)}>Save</Button>
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
            duration: 0,
            location: TaskLocation.End
        })
    }
    private close() {
        this.setState(Object.assign(this.state, { show: false }))
    }
    private isButtonEnabled() {
        return this.state.name.length > 0 && this.state.duration !== Number.NaN && this.state.duration !== 0
    }
    private getNameValidationState(): "success" | "error" {
        return this.state.name.length > 0 ? "success" : "error"
    }
    private getDurationValidationState(): "success" | "error" {
        return this.state.duration !== Number.NaN && this.state.duration !== 0 ? "success" : "error"
    }
    private handleNameInput(e: React.FormEvent) {
        const input = e.target as HTMLInputElement
        this.setState(Object.assign(this.state, { name: input.value }))
    }
    private handleDurationInput(e: React.FormEvent) {
        const input = e.target as HTMLInputElement
        const duration = +input.value
        this.state.duration = duration
        this.setState(Object.assign(this.state, { duration }))

    }
    private handleDescriptionInput(e: React.FormEvent) {
        const input = e.target as HTMLInputElement
        this.setState(Object.assign(this.state, { description: input.value }))
    }
    private handleBeginningRadio(e: React.MouseEvent) {
        this.setState(Object.assign(this.state, { location: TaskLocation.Beginning }))
    }
    private handleEndRadio(e: React.MouseEvent) {
        this.setState(Object.assign(this.state, { location: TaskLocation.End }))
    }
    private handleSave(e: React.MouseEvent) {
        const modifier: Modifier = {
            name: this.state.name,
            description: this.state.description,
            duration: this.state.duration,
            location: this.state.location
        }
        this.props.onAddModifier(this.props.projectIdentifier, this.props.taskIdentifier, modifier)
        this.close()
    }
}

const mapStateToProps = (state: State) => {
    return {
        projectIdentifier: state.projectIdentifier,
        taskIdentifier: state.taskIdentifier
    }
}

const mapDispatchToProps = (dispatch: Dispatch<State>) => {
    return {
        onAddModifier: (projectIdnetifir: string, taskIdentifier: string, modifier: Modifier) => {
            dispatch(addModifier(projectIdnetifir, taskIdentifier, modifier))
        },
        dispatch
    }
}

export const ModifierButton = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(UnconnectedModifierButton)
