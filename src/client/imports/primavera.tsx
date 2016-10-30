import * as React from "react"
import * as ReactDOM from "react-dom"
import * as Redux from "redux"
import * as ReduxThunk from "redux-thunk"
import { Provider } from "react-redux"
import { State, PrimaveraTask, PrimaveraDelay, PrimaveraTaskRelation } from "./primavera/types"
import { mainReducer } from "./primavera/reducers/main"
import { Main } from "./primavera/containers/main"
import { Project } from "../../common/types"

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

export const render = () => {
    const initialState: State = {
        project: {
            project: {
                identifier: "",
                name: "",
                description: ""
            },
            error: null
        },
        tasks: {
            tasks: new Map<string, PrimaveraTask>(),
            delays: new Map<string, PrimaveraDelay>(),
            warnings: [],
            isImporting: false,
            invalidFormat: false
        }, relations: {
            relations: [],
            isImporting: false,
            invalidFormat: false
        }
    }
    const store = Redux.createStore(
        mainReducer, initialState,
        Redux.applyMiddleware(ReduxThunk.default)
    )
    ReactDOM.render(<Root store={store} />, document.getElementById("content") as Element)
}
