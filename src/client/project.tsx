import * as React from "react"
import * as ReactDOM from "react-dom"
import * as Redux from "redux"
import * as ReduxThunk from "redux-thunk"
import { Provider } from "react-redux"
import { State } from "./project/types"
import { mainReducer } from "./project/reducers/main"
import { Main } from "./project/containers/main"
import { project, tasks } from "./project/states"
import { assign } from "./common/assign"

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

export const render = (projectIdentifier: string) => {
    let initialState: State = {
        projectIdentifier,
        project,
        tasks
    }
    try {
        const filterJson = localStorage.getItem(projectIdentifier)
        if (filterJson != null) {
            const filter = JSON.parse(filterJson)
            initialState.tasks.filters.notStartedChecked = filter.notStartedChecked
            initialState.tasks.filters.inProgressChecked = filter.inProgressChecked
            initialState.tasks.filters.doneChecked = filter.doneChecked
        }
    }
    catch (error) {}
    initialState.tasks.today = new Date()

    const store = Redux.createStore(
        mainReducer, initialState,
        Redux.applyMiddleware(ReduxThunk.default)
    )
    ReactDOM.render(<Root store={store} />, document.getElementById("content") as Element)
}
