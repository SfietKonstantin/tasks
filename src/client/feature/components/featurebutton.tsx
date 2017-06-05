import * as React from "react"
import {Col, Button, Modal, Form, FormGroup, FormControl, ControlLabel, InputGroup, Radio} from "react-bootstrap"
import {ApiFeature} from "../../../common/api/feature"
import {generateColor} from "../utils/color";

interface FeatureButtonProperties {
    onAddFeature: (feature: ApiFeature) => void
}

interface FeatureButtonState {
    show: boolean,
    identifier: string
    name: string
    description: string
    color: string
}

export class FeatureButton extends React.Component<FeatureButtonProperties, FeatureButtonState> {
    constructor(props: FeatureButtonProperties) {
        super(props)
        this.state = {
            show: false,
            identifier: "",
            name: "",
            description: "",
            color: generateColor()
        }
    }

    render() {
        const style = {
            background: this.state.color
        }
        return <Button onClick={this.open.bind(this)}>
            <Modal show={this.state.show} bsSize="large" onHide={this.close.bind(this)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add feature</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form horizontal>
                        <FormGroup validationState={this.getIdentifierValidationState()}>
                            <Col componentClass={ControlLabel} xs={12} md={2}>
                                Identifier
                            </Col>
                            <Col xs={12} sm={10}>
                                <FormControl type="text" placeholder="Identifier"
                                             onInput={this.handleIdentifierInput.bind(this)}/>
                            </Col>
                        </FormGroup>
                        <FormGroup validationState={this.getNameValidationState()}>
                            <Col componentClass={ControlLabel} xs={12} md={2}>
                                Title
                            </Col>
                            <Col xs={12} md={10}>
                                <FormControl type="text" placeholder="Title"
                                             onInput={this.handleNameInput.bind(this)}/>
                            </Col>
                        </FormGroup>
                        <FormGroup validationState={this.getColorValidationState()}>
                            <Col componentClass={ControlLabel} xs={12} md={2}>
                                Color
                            </Col>
                            <Col xs={12} md={10}>
                                <InputGroup>
                                    <FormControl type="text" placeholder="#FF0000"
                                                 defaultValue={this.state.color}
                                                 onInput={this.handleColorInput.bind(this)}/>
                                    <InputGroup.Addon>
                                        <span className="color-indicator-large" style={style}/>
                                    </InputGroup.Addon>
                                </InputGroup>
                            </Col>
                        </FormGroup>
                        <FormGroup>
                            <Col componentClass={ControlLabel} xs={12} md={2}>
                                Description
                            </Col>
                            <Col xs={12} md={10}>
                                <FormControl type="text" componentClass="textarea" placeholder="Description"
                                             onInput={this.handleDescriptionInput.bind(this)}/>
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
            identifier: "",
            name: "",
            description: "",
            color: generateColor()
        })
    }

    private close() {
        this.setState({...this.state, show: false})
    }

    private isButtonEnabled() {
        return this.state.identifier.length > 0 && this.state.name.length > 0 && this.isColorValid()
    }

    private isColorValid() {
        return this.state.color.match("^\\#[0-9a-fA-F]{6}$")
    }

    private getIdentifierValidationState(): "success" | "error" {
        return this.state.identifier.length > 0 ? "success" : "error"
    }

    private getNameValidationState(): "success" | "error" {
        return this.state.name.length > 0 ? "success" : "error"
    }

    private getColorValidationState(): "success" | "error" {
        return this.isColorValid() ? "success" : "error"
    }

    private handleIdentifierInput(e: React.FormEvent<HTMLInputElement>) {
        this.setState({...this.state, identifier: e.currentTarget.value})
    }

    private handleNameInput(e: React.FormEvent<HTMLInputElement>) {
        this.setState({...this.state, name: e.currentTarget.value})
    }

    private handleColorInput(e: React.FormEvent<HTMLInputElement>) {
        this.setState({...this.state, color: e.currentTarget.value})
    }

    private handleDescriptionInput(e: React.FormEvent<HTMLInputElement>) {
        this.setState({...this.state, description: e.currentTarget.value})
    }

    private handleSave() {
        const feature: ApiFeature = {
            identifier: this.state.identifier,
            name: this.state.name,
            description: this.state.description,
            color: this.state.color
        }
        this.props.onAddFeature(feature)
        this.close()
    }
}

