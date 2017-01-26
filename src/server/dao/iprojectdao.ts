import {Project} from "../../common/project"

export interface IProjectDao {
    getAllProjects(): Promise<Array<Project>>
    getProject(projectIdentifier: string): Promise<Project>
    addProject(project: Project): Promise<void>
}
