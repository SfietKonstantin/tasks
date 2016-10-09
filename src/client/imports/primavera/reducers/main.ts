import { combineReducers, Action } from "redux"
import { projectReducer } from "./project"
import { tasksReducer } from "./tasks"
import { State } from "../types"

export const mainReducer = combineReducers<State>({
    project: projectReducer,
    tasks: tasksReducer
})