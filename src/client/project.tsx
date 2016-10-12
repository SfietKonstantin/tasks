import * as React from "react"
import * as ReactDOM from "react-dom"
import * as Redux from "redux"
import * as ReduxThunk from "redux-thunk"
import { Provider } from "react-redux"
import { State } from "./project/types"
import { mainReducer } from "./project/reducers/main"
import { Main } from "./project/containers/main"
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
        project: {
            isFetching: false,
            project: null
        },
        tasks: {
            isFetching: false,
            tasks: new Array<ApiTask>(),
            filters: [true, true, false],
            today: new Date(),
            filteredTasks: new Array<ApiTask>()
        }
    }
    const store = Redux.createStore(
        mainReducer, initialState,
        Redux.applyMiddleware(ReduxThunk.default)
    )
    ReactDOM.render(<Root store={store} identifier={identifier} />, document.getElementById("content") as Element)
}
