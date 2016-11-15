import * as React from "react"
import * as ReactDOM from "react-dom"
import * as Redux from "redux"
import * as ReduxThunk from "redux-thunk"
import { Provider } from "react-redux"
import { State } from "./primavera/types"
import { mainReducer } from "./primavera/reducers/main"
import { Main } from "./primavera/components/main"
import { stage, project, tasks, relations, delays, overview } from "./primavera/states"

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
        stage,
        project,
        tasks,
        relations,
        delays,
        overview
    }
    const store = Redux.createStore(
        mainReducer, initialState,
        Redux.applyMiddleware(ReduxThunk.default)
    )
    ReactDOM.render(<Root store={store} />, document.getElementById("content") as Element)
}
