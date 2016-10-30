import * as React from "react"
import { Col, Form, FormGroup, ControlLabel, Button, ButtonGroup } from "react-bootstrap"
import { Stage } from "../types"
import { StagePanel } from "./stagepanel"
import { WarningsButton } from "./warningsbutton"

interface FileSelectorProperties {
    displayStage: Stage
    currentStage: Stage
    maxStage: Stage
    title: string
    formLabel: string
    buttonText: string
    itemCount: number
    warnings: Array<string>
    isImporting: boolean
    onFileSelected: (file: File) => void
    onCurrentStage: () => void
    onNextStage: () => void
}

export class FileSelector extends React.Component<FileSelectorProperties, {}> {
    render() {
        const canNext = this.props.itemCount > 0 && !this.props.isImporting
        const buttonColor = this.props.itemCount > 0 ? "success" : "default"
        const hasWarnings = this.props.warnings.length > 0
        let warningsButton: JSX.Element | null = null
        if (hasWarnings) {
            warningsButton = <WarningsButton warnings={this.props.warnings} />
        }
        return <StagePanel displayStage={this.props.displayStage}
                           currentStage={this.props.currentStage}
                           maxStage={this.props.maxStage} title={this.props.title}
                           warnings={this.props.warnings.length}
                           onCurrent={this.props.onCurrentStage.bind(this)}>
            <Form horizontal>
                <FormGroup>
                    <input type="file" ref="input" className="hidden"
                           onChange={this.handleFile.bind(this)}/>
                    <Col componentClass={ControlLabel} xd={12} md={2}>
                        {this.props.formLabel}
                    </Col>
                    <Col xd={12} md={10}>
                        <ButtonGroup>
                            <Button bsStyle={buttonColor} disabled={this.props.isImporting}
                                    onClick={this.handleImport.bind(this)}>
                                {this.props.buttonText}
                            </Button>
                            {warningsButton}
                        </ButtonGroup>
                    </Col>
                </FormGroup>
                <Button bsStyle="primary" disabled={!canNext} onClick={this.handleNext.bind(this)}>Next</Button>
            </Form>
        </StagePanel>
    }
    private handleImport(e: React.MouseEvent) {
        const input = this.refs["input"] as HTMLInputElement
        input.click()
    }
    private handleFile(e: React.FormEvent) {
        const input = this.refs["input"] as HTMLInputElement
        const fileList = input.files as FileList
        const file = fileList[0]
        this.props.onFileSelected(file)
    }
    private handleNext(e: React.MouseEvent) {
        this.props.onNextStage()
    }
}
