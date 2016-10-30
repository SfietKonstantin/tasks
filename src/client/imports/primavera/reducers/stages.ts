import { Action } from "redux"
import { Stage, Stages } from "../types"
import { StageAction, STAGE_DEFINE, STAGE_DEFINE_MAX } from "../actions/stages"

const initialState: Stages = {
    current: Stage.Project,
    max: Stage.Project
}

export const stageReducer = (state: Stages = initialState, action: Action): Stages => {
    switch (action.type) {
        case STAGE_DEFINE:
            const stageAction = action as StageAction
            const newStage: Stages = {
                current: stageAction.stage,
                max: state.max
            }
            return newStage
        case STAGE_DEFINE_MAX:
            const maxStageAction = action as StageAction
            const newMaxStage: Stages = {
                current: state.current,
                max: Math.max(state.max, maxStageAction.stage)
            }
            return newMaxStage
        default:
            return state
    }
}
