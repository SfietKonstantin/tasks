import { combineReducers, Action } from "redux"
import { taskReducer } from "./task"
import { importantReducer } from "./important"
import { State } from "../types"

const initialState: string = ""

const identifierReducer = (state: string = initialState, action: Action): string => {
    return state
}

export const mainReducer = combineReducers<State>({
    projectIdentifier: identifierReducer,
    taskIdentifier: identifierReducer,
    task: taskReducer,
    important: importantReducer
})
