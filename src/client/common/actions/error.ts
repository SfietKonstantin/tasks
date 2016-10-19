import { Action } from "redux"

export interface ErrorAction extends Action {
    message: string
}
