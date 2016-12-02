import * as React from "react"
import * as ReactDOM from "react-dom"
import * as Redux from "redux"
import * as ReduxThunk from "redux-thunk"
import { Provider } from "react-redux"
import { State } from "./index/types"
import { mainReducer } from "./index/reducers/main"
import { Main } from "./index/connectedcomponents"

interface RootProperties {
    store: Redux.Store<{}>
}

class Root extends React.Component<RootProperties, {}> {
    render() {
        return <Provider store={this.props.store}>
            <Main />
        </Provider>
    }
}

export const render = () => {
    const initialState: State = {
        project: {
            isFetching: false,
            projects: []
        }
    }
    const store = Redux.createStore(
        mainReducer, initialState,
        Redux.applyMiddleware(ReduxThunk.default)
    )
    ReactDOM.render(<Root store={store} />, document.getElementById("content") as Element)
}
