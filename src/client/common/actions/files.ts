import { Action, Dispatch } from "redux"
import { ErrorAction } from "./errors"

export class InvalidFormatError extends Error implements Error {
    constructor(message: string) {
        super(message)
    }
}

const fileReader = <Result>(reader: FileReader, parser: (content: string) => Result,
                            resolve: (result: Result) => void, reject: (reason: any) => void) => {
    try {
        resolve(parser(reader.result))
    }
    catch (e) {
        reject(e)
    }
}

const doProcessFile = <Result>(file: File, parser: (content: string) => Result): Promise<Result> => {
    return new Promise<Result>((resolve: (result: Result) => void, reject: (reason: any) => void) => {
        const reader = new FileReader()
        reader.onload = fileReader.bind(reader, reader, parser, resolve, reject)
        reader.readAsText(file)
    })
}

export const processFile = <State, Result>(file: File, type: string,
                                           parser: (content: string) => Result,
                                           beginAction: () => Action,
                                           endAction: (result: Result) => Action,
                                           errorAction: (error: Error) => ErrorAction) => {
    return (dispatch: Dispatch<State>) => {
        dispatch(beginAction())
        return Promise.resolve().then(() => {
            if (file.type !== type) {
                throw new InvalidFormatError("Input file must be a of type " + type)
            }
            return doProcessFile(file, parser)
        }).then((result: Result) => {
            endAction(result)
        }).catch((error) => {
            if (error instanceof InvalidFormatError) {
                dispatch(errorAction(error))
            } else {
                throw error
            }
        })
    }
}
