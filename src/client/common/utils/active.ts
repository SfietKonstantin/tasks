export const makeActiveClassName = (className: string, active: boolean): string => {
    const activeClassName = active ? " active" : ""
    return `${className}${activeClassName}`
}
