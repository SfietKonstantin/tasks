import { combineReducers, Action } from "redux"
import { stageReducer } from "./stages"
import { projectReducer } from "./project"
import { tasksReducer } from "./tasks"
import { relationsReducer } from "./relations"
import { State } from "../types"

export const mainReducer = combineReducers<State>({
    stage: stageReducer,
    project: projectReducer,
    tasks: tasksReducer,
    relations: relationsReducer
})
