import { Action, Dispatch } from "redux"
import { State } from "../types"
import { Project, Task, Modifier } from "../../../common/types"
import { ApiTaskResults, createTaskFromApiTask } from "../../../common/apitypes"

export const TASK_REQUEST = "TASK_REQUEST"
export const TASK_RECEIVE = "TASK_RECEIVE"
export const MODIFIER_REQUEST_ADD = "MODIFIER_REQUEST_ADD"

export interface TaskAction extends Action {
    type: string,
    projectIdentifier: string
    taskIdentifier: string
    project?: Project
    task?: Task
}

export const requestTask = (): Action => {
    return {
        type: TASK_REQUEST
    }
}

export const receiveTask = (projectIdentifier: string, taskIdentifier: string,
                            project: Project, task: Task): TaskAction => {
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
        dispatch(requestTask())
        return fetch("/api/project/" + projectIdentifier +  "/task/" + taskIdentifier).then((response: Response) => {
            return response.json()
        }).then((result: ApiTaskResults) => {
            dispatch(receiveTask(projectIdentifier, taskIdentifier, result.project,
                                 createTaskFromApiTask(result.task)))
        })
    }
}

export interface ModifierAddAction extends Action {
    type: string,
    projectIdentifier: string
    taskIdentifier: string
    modifier: Modifier
}

export const requestAddModifier = (): Action => {
    return {
        type: MODIFIER_REQUEST_ADD
    }
}

export const addModifier = (projectIdentifier: string, taskIdentifier: string, modifier: Modifier) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(requestAddModifier())
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
            dispatch(receiveTask(projectIdentifier, taskIdentifier, result.project,
                                 createTaskFromApiTask(result.task)))
        })
    }
}
