export const assign = <S, T extends S>(input: T, modifications: S): T => {
    return Object.assign(input, modifications)
}

export const copyAssign = <S, T extends S>(input: T, modifications: S): T => {
    return Object.assign({}, input, modifications)
}
