export class KeyFactory {
    static createProjectKey(projectIdentifier: string) {
        return `project:${projectIdentifier}`
    }
}
