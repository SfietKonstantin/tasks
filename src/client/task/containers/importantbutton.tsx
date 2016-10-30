import * as React from "react"
import { Button } from "react-bootstrap"
import { Dispatch } from "redux"
import * as ReactRedux from "react-redux"
import { State } from "../types"
import { fetchImportant, updateImportant } from "../actions/important"
import * as apitypes from "../../../common/apitypes"

interface ImportantButtonProperties {
    projectIdentifier: string
    taskIdentifier: string
    importantEnabled: boolean
    important: boolean
    onImportantChanged: (projectIdentifier: string, taskIdentifier: string, important: boolean) => void
    dispatch: Dispatch<State>
}

class UnconnectedImportantButton extends React.Component<ImportantButtonProperties, {}> {
    render() {
        return <Button bsStyle={this.getImportantStyle()} onClick={this.handleImportant.bind(this)}
                disabled={!this.props.importantEnabled} >
            <span className="glyphicon glyphicon-star" aria-hidden="true"></span>
            <span className="visible-md-inline visible-lg-inline"> {this.getLabel()}</span>
        </Button>
    }
    componentDidMount() {
        this.props.dispatch(fetchImportant(this.props.projectIdentifier, this.props.taskIdentifier))
    }
    private getImportantStyle(): string {
        return this.props.important ? "danger" : "default"
    }
    private getLabel(): string {
        return this.props.important ? "Important" : "Set as important"
    }
    private handleImportant(e: React.MouseEvent) {
        this.props.onImportantChanged(this.props.projectIdentifier, this.props.taskIdentifier, !this.props.important)
    }
}

const mapStateToProps = (state: State) => {
    return {
        projectIdentifier: state.projectIdentifier,
        taskIdentifier: state.taskIdentifier,
        importantEnabled: !state.important.isFetching,
        important: state.important.important
    }
}

const mapDispatchToProps = (dispatch: Dispatch<State>) => {
    return {
        onImportantChanged: (projectIdentifier: string, taskIdentifier: string, important: boolean) => {
            dispatch(updateImportant(projectIdentifier, taskIdentifier, important))
        },
        dispatch
    }
}

export const ImportantButton = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(UnconnectedImportantButton)
