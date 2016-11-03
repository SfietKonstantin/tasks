import * as React from "react"
import * as ReactDOM from "react-dom"
import * as Redux from "redux"
import * as ReduxThunk from "redux-thunk"
import { Provider } from "react-redux"
import { State, TaskFilters } from "./project/types"
import { mainReducer } from "./project/reducers/main"
import { Main } from "./project/containers/main"
import { ApiTask } from "../common/apitypes"

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
    let filters: TaskFilters = {
        notStartedChecked: true,
        inProgressChecked: true,
        doneChecked: false,
        milestonesOnlyChecked: false,
        text: ""
    }

    const filterJson = localStorage.getItem(projectIdentifier)
    if (filterJson != null) {
        filters = Object.assign(filters, JSON.parse(filterJson))
    }
    filters.milestonesOnlyChecked = false

    const initialState: State = {
        projectIdentifier,
        project: {
            isFetching: false,
            project: null
        },
        tasks: {
            isFetching: false,
            tasks: [],
            filters,
            today: new Date(),
            filteredTasks: []
        }
    }
    const store = Redux.createStore(
        mainReducer, initialState,
        Redux.applyMiddleware(ReduxThunk.default)
    )
    ReactDOM.render(<Root store={store} />, document.getElementById("content") as Element)
}
