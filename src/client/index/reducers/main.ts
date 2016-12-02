import { combineReducers } from "redux"
import { projectReducer } from "./project"
import { State } from "../types"

export const mainReducer = combineReducers<State>({
    project: projectReducer
})
