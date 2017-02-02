import {IProjectDao} from "../../../server/dao/iproject"
import {Project} from "../../../common/project"

export class MockProjectDao implements IProjectDao {
    getAllProjects(): Promise<Array<Project>> {
        throw new Error("MockProjectDao: getAllProjects is not mocked")
    }

    getProject(projectIdentifier: string): Promise<Project> {
        throw new Error("MockProjectDao: getProject is not mocked")
    }

    addProject(project: Project): Promise<void> {
        throw new Error("MockProjectDao: addProject is not mocked")
    }
}

