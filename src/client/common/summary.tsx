import * as React from "react"

export enum SummaryType {
    None,
    Primary,
    Info,
    Success,
    Warning,
    Danger
}

interface SummaryProperties {
    type: SummaryType
    title: string
}

export class Summary extends React.Component<SummaryProperties, {}> {
    constructor(props: SummaryProperties) {
        super(props)
    }
    render() {
        return <div className="col-xs-6 col-md-3">
            <div className={this.getState()}>
                <div className="panel-heading">
                    <h3 className="panel-title">{this.props.title}</h3>
                </div>
                <div className="panel-body">
                    {this.props.children}
                </div>
            </div>
        </div>
    }
    private getState() : string {
        switch(this.props.type) {
            case SummaryType.Primary:
            return "panel panel-primary"
            case SummaryType.Info:
            return "panel panel-info"
            case SummaryType.Success:
            return "panel panel-success"
            case SummaryType.Warning:
            return "panel panel-warning"
            case SummaryType.Danger:
            return "panel panel-danger"
            default:
            return "panel panel-default"
        }
    }
}