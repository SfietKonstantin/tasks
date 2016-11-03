import * as React from "react"
import { Col, Form, FormGroup, ControlLabel, Button, ButtonGroup, Alert } from "react-bootstrap"
import { Stage } from "../types"
import { StagePanel } from "./stagepanel"
import { WarningsButton } from "./warningsbutton"
import * as maputils from "../../../../common/maputils"

interface FileSelectorProperties {
    displayStage: Stage
    currentStage: Stage
    maxStage: Stage
    title: string
    formLabel: string
    buttonText: string
    itemCount: number
    warnings: Map<string, Array<string>>
    isImporting: boolean
    isInvalidFormat: boolean
    onFileSelected: (file: File) => void
    onCurrentStage: () => void
    onNextStage: () => void
    onDismissInvalidFormat: () => void
}

export class FileSelector extends React.Component<FileSelectorProperties, {}> {
    render() {
        const canNext = this.props.itemCount > 0 && !this.props.isImporting
        const buttonColor = this.props.itemCount > 0 ? "success" : "default"
        let totalWarnings = maputils.lengthOfMapOfList(this.props.warnings)
        let warningsButton: JSX.Element | null = null
        if (totalWarnings > 0) {
            warningsButton = <WarningsButton warnings={this.props.warnings} />
        }
        let alert: JSX.Element | null = null
        if (this.props.isInvalidFormat) {
            alert = <Alert bsStyle="danger" onDismiss={this.props.onDismissInvalidFormat}>
                Invalid file format
            </Alert>
        }
        return <StagePanel displayStage={this.props.displayStage}
                           currentStage={this.props.currentStage}
                           maxStage={this.props.maxStage} title={this.props.title}
                           warnings={totalWarnings}
                           onCurrent={this.props.onCurrentStage.bind(this)}>
            {alert}
            <Form horizontal>
                <FormGroup>
                    <input type="file" ref="input" className="hidden"
                           onChange={this.handleFile.bind(this)}/>
                    <Col componentClass={ControlLabel} xd={12} sm={2}>
                        {this.props.formLabel}
                    </Col>
                    <Col xd={12} sm={10}>
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
