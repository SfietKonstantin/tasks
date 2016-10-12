import * as React from "react"
import * as ReactDOM from "react-dom"
import * as Redux from "redux"
import * as ReduxThunk from "redux-thunk"
import { Provider } from "react-redux"
import { State } from "./task/types"
import { mainReducer } from "./task/reducers/main"
import { Main } from "./task/containers/main"
import { ApiTask } from "../common/apitypes"

interface RootProperties {
    store: Redux.Store<State>
    identifier: string
}

class Root extends React.Component<RootProperties, {}> {
    render() {
        return <Provider store={this.props.store}>
            <Main />
        </Provider>
    }
}

export const render = (identifier: string) => {
    const initialState: State = {
        identifier,
        task: {
            isFetching: false,
            project: null,
            task: null
        },
        important: {
            isFetching: false,
            important: false
        }
    }
    const store = Redux.createStore(
        mainReducer, initialState,
        Redux.applyMiddleware(ReduxThunk.default)
    )
    ReactDOM.render(<Root store={store} identifier={identifier} />, document.getElementById("content") as Element)
}
