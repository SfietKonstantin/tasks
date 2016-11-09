import * as React from "react"
import { Label } from "react-bootstrap"
import { Stage } from "../types"

interface StagePanelProperties {
    displayStage: Stage
    currentStage: Stage
    maxStage: Stage
    title: string
    warnings?: number
    errors?: number
    onCurrent: () => void
}

export class StagePanel extends React.Component<StagePanelProperties, {}> {
    render() {
        const headerClassName = "panel-heading" + (this.canEnable() ? " clickable" : "")
        const bodyClassName = "panel-body" + (this.isVisible() ? "" : " hidden")
        const panelClassName = this.getPanelClassName()
        let warnings: JSX.Element | null = null
        if (this.props.warnings != null) {
            if (this.props.warnings > 0) {
                warnings = <Label bsStyle="warning">{this.props.warnings}</Label>
            }
        }
        return <div className={panelClassName}>
            <div className={headerClassName} onClick={this.handleCurrent.bind(this)}>
                {this.props.title} {warnings}
            </div>
            <div className={bodyClassName}>
                {this.props.children}
            </div>
        </div>
    }
    private isVisible(): boolean {
        return this.props.currentStage === this.props.displayStage
    }
    private canEnable(): boolean {
        return this.props.maxStage >= this.props.displayStage && !this.isVisible()
    }
    private stageDone(): boolean {
        return this.props.maxStage > this.props.displayStage
    }
    private getPanelClassName(): string {
        if (this.isVisible()) {
            return "panel panel-info"
        } else if (this.stageDone()) {
            return "panel panel-primary"
        } else {
            return "panel panel-default"
        }
    }
    private handleCurrent(e: React.MouseEvent) {
        if (this.canEnable()) {
            this.props.onCurrent()
        }
    }
}

