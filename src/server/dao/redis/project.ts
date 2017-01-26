import * as redis from "redis"
import * as redisasync from "./async"
import * as bluebird from "bluebird"
import {IProjectDao} from "../iproject"
import {Project} from "../../../common/project"
import {KeyFactory} from "./utils/keyfactory"
import {CorruptedError} from "../error/corrupted"
import {NotFoundError} from "../../../common/errors/notfound"
import {wrapUnknownErrors} from "./utils/error"
import {ExistsError} from "../error/exists"
bluebird.promisifyAll(redis)

class RedisProject {
    name: string
    description: string

    constructor(project: Project) {
        this.name = project.name
        this.description = project.description
    }

    static save(project: Project, client: redisasync.RedisAsyncClient): Promise<void> {
        const redisProject = new RedisProject(project)
        const projectIdentifier = project.identifier
        const projectKey = KeyFactory.createProjectKey(projectIdentifier)
        return client.hmsetAsync(projectKey, redisProject).then(() => {
            const projectIdsKey = KeyFactory.createGlobalProjectKey("ids")
            return client.saddAsync(projectIdsKey, projectIdentifier)
        })
    }

    static load(projectIdentifier: string, client: redisasync.RedisAsyncClient): Promise<Project> {
        const projectKey = KeyFactory.createProjectKey(projectIdentifier)
        return client.hgetallAsync(projectKey).then((result: any) => {
            if (!result.hasOwnProperty("name")) {
                throw new CorruptedError(`Project ${projectIdentifier} do not have property "name"`)
            }
            if (!result.hasOwnProperty("description")) {
                throw new CorruptedError(`Project ${projectIdentifier} do not have property "description"`)
            }
            return {
                identifier: projectIdentifier,
                name: result["name"] as string,
                description: result["description"] as string
            }
        })
    }
}

export class RedisProjectDao implements IProjectDao {
    private client: redisasync.RedisAsyncClient

    constructor(client: redis.RedisClient) {
        this.client = client as redisasync.RedisAsyncClient
    }

    getAllProjects(): Promise<Array<Project>> {
        const projectIdsKey = KeyFactory.createGlobalProjectKey("ids")
        return this.client.smembersAsync(projectIdsKey).then((identifiers: Array<String>) => {
            const sortedIdentifiers = identifiers.sort()
            return Promise.all(sortedIdentifiers.map((identifier: string) => {
                return this.getProject(identifier).catch(() => {
                    return null
                })
            }))
        }).then((projects: Array<Project | null>) => {
            return projects.filter((project: Project | null) => {
                return !!project
            })
        }).catch(() => {
            return []
        })
    }

    hasProject(projectIdentifier: string): Promise<void> {
        const projectKey = KeyFactory.createProjectKey(projectIdentifier)
        return this.client.existsAsync(projectKey).then((result: number) => {
            if (result !== 1) {
                throw new NotFoundError(`Project ${projectIdentifier} not found`)
            }
        })
    }

    getProject(projectIdentifier: string): Promise<Project> {
        return this.hasProject(projectIdentifier).then(() => {
            return RedisProject.load(projectIdentifier, this.client)
        }).catch((error) => {
            wrapUnknownErrors(error)
        })
    }

    addProject(project: Project): Promise<void> {
        return this.notHasProject(project.identifier).then(() => {
            return RedisProject.save(project, this.client)
        }).catch((error) => {
            wrapUnknownErrors(error)
        })
    }

    private notHasProject(projectIdentifier: string): Promise<void> {
        const projectKey = KeyFactory.createProjectKey(projectIdentifier)
        return this.client.existsAsync(projectKey).then((result: number) => {
            if (result === 1) {
                throw new ExistsError(`Project ${projectIdentifier} already exists`)
            }
        })
    }
}
