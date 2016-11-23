import { Action, Dispatch } from "redux"
import { State } from "../types"
import { Project, Modifier } from "../../../common/types"
import { ApiTaskResults, ApiTask } from "../../../common/apitypes"

export const TASK_REQUEST = "TASK_REQUEST"
export const TASK_RECEIVE = "TASK_RECEIVE"
export const MODIFIER_REQUEST_ADD = "MODIFIER_REQUEST_ADD"

export interface TaskAction extends Action {
    type: string,
    projectIdentifier: string
    taskIdentifier: string
    project?: Project
    task?: ApiTask
}

const requestTask = (projectIdentifier: string, taskIdentifier: string): TaskAction => {
    return {
        type: TASK_REQUEST,
        projectIdentifier,
        taskIdentifier
    }
}

const receiveTask = (projectIdentifier: string, taskIdentifier: string,
                     project: Project, task: ApiTask): TaskAction => {
    return {
        type: TASK_RECEIVE,
        projectIdentifier,
        taskIdentifier,
        project,
        task
    }
}

export const fetchTask = (projectIdentifier: string, taskIdentifier: string) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestTask(projectIdentifier, taskIdentifier))
        return fetch("/api/project/" + projectIdentifier +  "/task/" + taskIdentifier).then((response: Response) => {
            return response.json()
        }).then((result: ApiTaskResults) => {
            dispatch(receiveTask(projectIdentifier, taskIdentifier, result.project, result.task))
        })
    }
}

export interface ModifierAddAction extends Action {
    type: string,
    projectIdentifier: string
    taskIdentifier: string
    modifier: Modifier
}

const requestAddModifier = (projectIdentifier: string, taskIdentifier: string,
                            modifier: Modifier): ModifierAddAction => {
    return {
        type: MODIFIER_REQUEST_ADD,
        projectIdentifier,
        taskIdentifier,
        modifier
    }
}

export const addModifier = (projectIdentifier: string, taskIdentifier: string, modifier: Modifier) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestAddModifier(projectIdentifier, taskIdentifier, modifier))
        const requestInit: RequestInit = {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                projectIdentifier,
                taskIdentifier,
                modifier
            })
        }
        return fetch("/api/modifier", requestInit).then((response: Response) => {
            return response.json()
        }).then((result: ApiTaskResults) => {
            dispatch(receiveTask(projectIdentifier, taskIdentifier, result.project, result.task))
        })
    }
}
