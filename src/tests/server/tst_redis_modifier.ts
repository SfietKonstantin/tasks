import * as chai from "chai"
import * as redis from "redis"
import * as bluebird from "bluebird"
import { Project, Task, Modifier, TaskLocation } from "../../common/types"
import { RedisDataProvider } from "../../server/core/data/redisdataprovider"

const redisAsync: any = bluebird.promisifyAll(redis)

declare module "redis" {
    export interface RedisClient extends NodeJS.EventEmitter {
        setAsync(...args: any[]): Promise<any>
        delAsync(...args: any[]): Promise<any>
        hmsetAsync(...args: any[]): Promise<any>
        hdelAsync(...args: any[]): Promise<any>
    }
}

describe("Redis", () => {
    let client: redis.RedisClient
    let db: RedisDataProvider
    before(() => {
        client = redis.createClient()
        client.select(3)

        db = new RedisDataProvider(client)
    })
    describe("getModifiers", () => {
        it("Should add some testing data", (done) => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then(() => {
                const task: Task = {
                    projectIdentifier: "project",
                    identifier: "task",
                    name: "Task",
                    description: "Description",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 30
                }

                return db.addTask(task).then(() => {
                    const modifier1: Modifier = {
                        projectIdentifier: "project",
                        name: "Modifier 1",
                        description: "Description 1",
                        duration: 40,
                        location: TaskLocation.End
                    }
                    const modifier2: Modifier = {
                        projectIdentifier: "project",
                        name: "Modifier 2",
                        description: "Description 2",
                        duration: 10,
                        location: TaskLocation.Beginning
                    }
                    return db.addModifier(modifier1).then(() => {
                        return db.addModifier(modifier2)
                    })
                }).then(() => {
                    done()
                })
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an empty list", (done) => {
            db.getModifiers("project", []).then((modifiers: Array<Modifier>) => {
                chai.expect(modifiers).to.empty
                done()
            })
        })
        it("Should get modifiers", (done) => {
            db.getModifiers("project", [2, 1]).then((modifiers: Array<Modifier>) => {
                const expected: Array<Modifier> = [
                    {
                        projectIdentifier: "project",
                        name: "Modifier 2",
                        description: "Description 2",
                        duration: 10,
                        location: TaskLocation.Beginning
                    },
                    {
                        projectIdentifier: "project",
                        name: "Modifier 1",
                        description: "Description 1",
                        duration: 40,
                        location: TaskLocation.End
                    }
                ]
                chai.expect(modifiers).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should corrupt modifier", (done) => {
            client.delAsync("modifier:project:1").then((result) => {
                done()
            })
        })
        it("Should get valid modifiers", (done) => {
            db.getModifiers("project", [2, 1]).then((modifiers: Array<Modifier>) => {
                const expected: Array<Modifier | null> = [
                    {
                        projectIdentifier: "project",
                        name: "Modifier 2",
                        description: "Description 2",
                        duration: 10,
                        location: TaskLocation.Beginning
                    },
                    null
                ]
                chai.expect(modifiers).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("modifier:project:1", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get valid modifiers", (done) => {
            db.getModifiers("project", [2, 1]).then((modifiers: Array<Modifier>) => {
                const expected: Array<Modifier | null> = [
                    {
                        projectIdentifier: "project",
                        name: "Modifier 2",
                        description: "Description 2",
                        duration: 10,
                        location: TaskLocation.Beginning
                    },
                    null
                ]
                chai.expect(modifiers).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        after(() => {
            client.flushdb()
        })
    })
    after(() => {
        client.quit()
    })
})
