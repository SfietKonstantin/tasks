import { combineReducers, Action } from "redux"
import { taskReducer } from "./task"
import { importantReducer } from "./important"
import { State } from "../types"

function identifierReducer (state: string = null, action: Action) : string {
    return state
}

export const mainReducer = combineReducers<State>({
    identifier: identifierReducer,
    task: taskReducer,
    important: importantReducer
})