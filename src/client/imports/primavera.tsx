import * as React from "react"
import * as ReactDOM from "react-dom"
import * as Redux from "redux"
import * as ReduxThunk from "redux-thunk"
import { Provider } from 'react-redux'
import { State } from "./primavera/types"
import { mainReducer } from './primavera/reducers/main'
import { Main } from "./primavera/containers/main"
import { Project } from "../../common/types"
import { ApiImportTask } from "../../common/apitypes"

interface RootProperties {
    store: Redux.Store<State>
}

class Root extends React.Component<RootProperties, {}> {
    render() {
        return <Provider store={this.props.store}>
            <Main />
        </Provider>
    }
}

export function render() {
    const initialState: State = {
        project: {
            identifier: "",
            name: "",
            description: ""
        },
        tasks: {
            tasks: new Map<string, ApiImportTask>(),
            warnings: new Array<string>(),
            isImporting: false,
            invalidFormat: false
        }
    }
    const store = Redux.createStore(
        mainReducer, initialState, 
        Redux.applyMiddleware(ReduxThunk.default)
    )
    ReactDOM.render(<Root store={store} />, document.getElementById("content"))
}