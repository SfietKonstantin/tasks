export class KeyFactory {
    static createGlobalProjectKey(property: string) {
        return `project:${property}`
    }

    static createProjectKey(projectIdentifier: string, property?: string) {
        if (property) {
            return `project:${projectIdentifier}:${property}`
        } else {
            return `project:${projectIdentifier}`
        }
    }
    static createTaskKey(projectIdentifier: string, taskIdentifier: string, property?: string) {
        if (property) {
            return `task:${projectIdentifier}:${taskIdentifier}:${property}`
        } else {
            return `task:${projectIdentifier}:${taskIdentifier}`
        }
    }
    static createTaskRelationKey(projectIdentifier: string, previousTaskIdentifier: string,
                                 nextTaskIdentifier: string) {
        return `task:${projectIdentifier}:${previousTaskIdentifier}:relation:${nextTaskIdentifier}`
    }
}
