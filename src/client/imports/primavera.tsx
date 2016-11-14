import * as React from "react"
import * as ReactDOM from "react-dom"
import * as Redux from "redux"
import * as ReduxThunk from "redux-thunk"
import { Provider } from "react-redux"
import { State, Stage, PrimaveraTask, PrimaveraDelay, PrimaveraTaskRelation, SubmitState } from "./primavera/types"
import { RelationGraphNode, GraphDiff } from "./primavera/graph"
import { mainReducer } from "./primavera/reducers/main"
import { Main } from "./primavera/components/main"
import { Project } from "../../common/types"
import { MilestoneFilterMode } from "../common/tasklistfilter"

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
            identifier: "",
            name: "",
            description: ""
        },
        tasks: {
            length: 0,
            tasks: new Map<string, PrimaveraTask>(),
            warnings: new Map<string, Array<string>>(),
            isImporting: false,
            isInvalidFormat: false
        },
        relations: {
            length: 0,
            relations: new Map<string, RelationGraphNode>(),
            warnings: new Map<string, Array<string>>(),
            isImporting: false,
            isInvalidFormat: false
        },
        delays: {
            filters: {
                milestoneFilterMode: MilestoneFilterMode.NoFilter,
                text: ""
            },
            tasks: [],
            selection: new Set<string>(),
            diffs: [],
            warnings: new Map<string, Array<string>>()
        },
        overview: {
            tasks: [],
            delays: [],
            relations: [],
            warnings: new Map<string, Array<string>>(),
            errors: new Map<string, Array<string>>(),
            submitState: SubmitState.Idle
        }
    }
    const store = Redux.createStore(
        mainReducer, initialState,
        Redux.applyMiddleware(ReduxThunk.default)
    )
    ReactDOM.render(<Root store={store} />, document.getElementById("content") as Element)
}
