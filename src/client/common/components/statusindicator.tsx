import * as React from "react"

export enum Status {
    Loading,
    Error,
    Info
}

interface StatusIndicatorProperties {
    status: Status
    message?: string
}

export class StatusIndicator extends React.Component<StatusIndicatorProperties, {}> {
    render() {
        const className = this.getClassName()
        const messageElement = this.getMessageElement()
        return <div className="common-loading">
            <span className={className} aria-hidden="true"></span>
            {messageElement}
        </div>
    }
    private getClassName(): string {
        switch (this.props.status) {
            case Status.Loading:
                return "glyphicon glyphicon-hourglass"
            case Status.Error:
                return "glyphicon glyphicon-remove"
            case Status.Info:
                return "glyphicon glyphicon-info-sign"
            default:
                return ""
        }
    }
    private getMessageElement(): JSX.Element | null {
        if (this.props.message && this.props.message.length > 0) {
            return <p>{this.props.message}</p>
        } else {
            return null
        }
    }
}
