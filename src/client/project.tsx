import * as React from "react"
import * as ReactDOM from "react-dom"
import * as Redux from "redux"
import * as ReduxThunk from "redux-thunk"
import { Provider } from "react-redux"
import { State, TasksFilter } from "./project/types"
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
    let filter: TasksFilter = {
        notStartedChecked: true,
        inProgressChecked: true,
        doneChecked: false,
        milestonesOnlyChecked: false
    }

    const filterJson = localStorage.getItem(projectIdentifier)
    if (filterJson) {
        filter = JSON.parse(filterJson)
    }
    filter.milestonesOnlyChecked = false

    const initialState: State = {
        projectIdentifier,
        project: {
            isFetching: false,
            project: null
        },
        tasks: {
            isFetching: false,
            tasks: new Array<ApiTask>(),
            filter,
            today: new Date(),
            filteredTasks: new Array<ApiTask>()
        }
    }
    const store = Redux.createStore(
        mainReducer, initialState,
        Redux.applyMiddleware(ReduxThunk.default)
    )
    ReactDOM.render(<Root store={store} />,
                    document.getElementById("content") as Element)
}
