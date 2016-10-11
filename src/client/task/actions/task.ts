import { Action, Dispatch } from "redux"
import { State } from "../types"
import { Project, Modifier } from "../../../common/types"
import { ApiProjectTaskModifiers, ApiTask } from "../../../common/apitypes"

export const TASK_REQUEST = "TASK_REQUEST"
export const TASK_RECEIVE = "TASK_RECEIVE"
export const MODIFIER_REQUEST_ADD = "MODIFIER_REQUEST_ADD"

export interface TaskAction extends Action {
    type: string,
    identifier: string
    project?: Project
    task?: ApiTask
}

function requestTask(identifier: string) : TaskAction {
    return {
        type: TASK_REQUEST,
        identifier
    }
}

function receiveTask(identifier: string, project: Project, task: ApiTask) : TaskAction {
    return {
        type: TASK_RECEIVE,
        identifier,
        project,
        task
    }
}

export const fetchTask = (identifier: string) => {
    return function(dispatch: Dispatch<State>) {
        dispatch(requestTask(identifier))
        return fetch("/api/task/" + identifier).then((response: Response) => {
            return response.json()
        }).then((result: ApiProjectTaskModifiers) => {
            dispatch(receiveTask(identifier, result.project, result.task))
        })
    }
}

export interface ModifierAddAction extends Action {
    type: string,
    identifier: string
    modifier: Modifier
}

function requestAddModifier(identifier: string, modifier: Modifier) : ModifierAddAction {
    return {
        type: MODIFIER_REQUEST_ADD,
        identifier,
        modifier
    }
}

export const addModifier = (identifier: string, modifier: Modifier) => {
    return function(dispatch: Dispatch<State>) {
        dispatch(requestAddModifier(identifier, modifier))
        const requestInit: RequestInit = {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                identifier: identifier,
                modifier
            })
        }
        return fetch("/api/modifier", requestInit).then((response: Response) => {
            return response.json()
        }).then((result: ApiProjectTaskModifiers) => {
            dispatch(receiveTask(identifier, result.project, result.task))
        })
    }
}