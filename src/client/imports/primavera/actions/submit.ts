import { Action, Dispatch } from "redux"
import { State, PrimaveraTask, PrimaveraTaskRelation } from "../types"
import { ErrorAction, processError } from "../../../common/actions/error"
import { Project } from "../../../../common/types"

export const SUBMIT_REQUEST = "SUBMIT_REQUEST"
export const SUBMIT_RECEIVE = "SUBMIT_RECEIVE"
export const SUBMIT_RECEIVE_FAILURE = "SUBMIT_RECEIVE_FAILURE"

export interface ProjectAction extends Action {
    type: string,
    identifier: string,
    name: string,
    description: string
}

const requestSubmit = (): Action => {
    return {
        type: SUBMIT_REQUEST
    }
}

const receiveSubmit = (): Action => {
    return {
        type: SUBMIT_RECEIVE
    }
}

const receiveSubmitFailure = (message: string): ErrorAction => {
    return {
        type: SUBMIT_RECEIVE_FAILURE,
        message
    }
}

export const submit = (project: Project, tasks: Array<PrimaveraTask>,
                       relations: Array<PrimaveraTaskRelation>) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestSubmit())
        const requestInit: RequestInit = {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                project,
                tasks,
                relations
            })
        }
        return fetch("/api/import", requestInit).then((response: Response) => {
            return processError(response).then(() => {
                dispatch(receiveSubmit())
            }).catch((error: Error) => {
                dispatch(receiveSubmitFailure(error.message))
            })
        })
    }
}
