import { combineReducers, Action } from "redux"
import { projectReducer } from "./project"
import { tasksReducer } from "./tasks"
import { State } from "../types"

function identifierReducer (state: string = null, action: Action) : string {
    return state
}

export const mainReducer = combineReducers<State>({
    identifier: identifierReducer,
    project: projectReducer,
    tasks: tasksReducer
})