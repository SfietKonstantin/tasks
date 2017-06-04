export class BooleanBuilder {
    static toString(value: boolean): string {
        return value ? "true" : "false"
    }

    static fromString(value: string): boolean | null {
        if (value === "true") {
            return true
        } else if (value === "false") {
            return false
        } else {
            return null
        }
    }
}
