import * as React from "react"
import * as ReactDOM from "react-dom"
import * as Redux from "redux"
import * as ReduxThunk from "redux-thunk"
import { Provider } from "react-redux"
import { State, Stage, PrimaveraTask, PrimaveraDelay, PrimaveraTaskRelation, SubmitState } from "./primavera/types"
import { mainReducer } from "./primavera/reducers/main"
import { Main } from "./primavera/components/main"
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
        stage: {
            current: Stage.Project,
            max: Stage.Project
        },
        project: {
            project: {
                identifier: "",
                name: "",
                description: ""
            },
            error: null
        },
        tasks: {
            length: 0,
            tasks: new Map<string, PrimaveraTask>(),
            delays: new Map<string, PrimaveraDelay>(),
            warnings: new Map<string, Array<string>>(),
            isImporting: false,
            isInvalidFormat: false
        },
        relations: {
            length: 0,
            relations: [],
            warnings: new Map<string, Array<string>>(),
            isImporting: false,
            isInvalidFormat: false
        },
        overview: {
            tasks: [],
            relations: [],
            warnings: new Map<string, Array<string>>(),
            submitState: SubmitState.Idle
        }
    }
    const store = Redux.createStore(
        mainReducer, initialState,
        Redux.applyMiddleware(ReduxThunk.default)
    )
    ReactDOM.render(<Root store={store} />, document.getElementById("content") as Element)
}
