import * as React from "react"
import { Button } from "react-bootstrap"
import { Dispatch } from "redux"
import * as ReactRedux from "react-redux"
import { State } from "../types"
import { fetchImportant, updateImportant } from "../actions/important"
import * as apitypes from "../../../common/apitypes"

interface ImportantButtonProperties {
    identifier: string
    importantEnabled: boolean
    important: boolean
    onImportantChanged: (identifier: string, important: boolean) => void
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
        this.props.dispatch(fetchImportant(this.props.identifier))
    }
    private getImportantStyle() : string {
        return this.props.important ? "danger" : "default"
    }
    private getLabel() : string {
        return this.props.important ? "Important" : "Set as important"
    }
    private handleImportant(e: React.MouseEvent) {
        e.preventDefault()
        this.props.onImportantChanged(this.props.identifier, !this.props.important)
    }
}

function mapStateToProps(state: State) {
    return {
        identifier: state.identifier,
        importantEnabled: !state.important.isFetching,
        important: state.important.important
    }
}

function mapDispatchToProps(dispatch: Dispatch<State>) {
    return {
        onImportantChanged: (identifier: string, important: boolean) => {
            dispatch(updateImportant(identifier, important))
        },
        dispatch
    }
}

export const ImportantButton = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(UnconnectedImportantButton)