import { Action, Dispatch } from "redux"
import { State, Stage } from "../types"

export const STAGE_DEFINE = "STAGE_DEFINE"
export const STAGE_DEFINE_MAX = "STAGE_DEFINE_MAX"

export interface StageAction extends Action {
    type: string,
    stage: Stage
}

export const defineStage = (stage: Stage): StageAction => {
    return {
        type: STAGE_DEFINE,
        stage
    }
}

export const defineMaxStage = (stage: Stage): StageAction => {
    return {
        type: STAGE_DEFINE_MAX,
        stage
    }
}
