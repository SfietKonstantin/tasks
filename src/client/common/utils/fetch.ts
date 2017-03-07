export const processFetch = <T>(response: Response): Promise<T> => {
    if (response.ok) {
        return response.json() as Promise<T>
    } else {
        return Promise.reject(new Error(`${response.status}: ${response.statusText}`))
    }
}
