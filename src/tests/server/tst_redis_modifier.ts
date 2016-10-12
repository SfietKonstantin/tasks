import * as chai from "chai"
import * as redis from "redis"
import * as bluebird from "bluebird"
import { Project, Task, Modifier } from "../../common/types"
import { TaskNotFoundError } from "../../server/core/data/idataprovider"
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
                    identifier: "task",
                    projectIdentifier: "project",
                    name: "Task",
                    description: "Description",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 30
                }

                return db.addTask(task).then(() => {
                    const modifier1: Modifier = {
                        name: "Modifier 1",
                        description: "Description 1",
                        duration: 40
                    }

                    const modifier2: Modifier = {
                        name: "Modifier 2",
                        description: "Description 2",
                        duration: 10
                    }

                    return db.addModifier(modifier1).then(() => {
                        return db.addModifier(modifier2)
                    })
                }).then(() => {
                    done()
                })
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an empty list", (done) => {
            db.getModifiers([]).then((modifiers: Array<Modifier>) => {
                chai.expect(modifiers).to.length(0)
                done()
            })
        })
        it("Should get modifiers", (done) => {
            db.getModifiers([2, 1]).then((modifiers: Array<Modifier>) => {
                chai.expect(modifiers).to.length(2)
                chai.expect(modifiers[0].name).to.equals("Modifier 2")
                chai.expect(modifiers[0].description).to.equals("Description 2")
                chai.expect(modifiers[0].duration).to.equals(10)
                chai.expect(modifiers[1].name).to.equals("Modifier 1")
                chai.expect(modifiers[1].description).to.equals("Description 1")
                chai.expect(modifiers[1].duration).to.equals(40)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should corrupt modifier", (done) => {
            client.delAsync("modifier:1").then((result) => {
                done()
            })
        })
        it("Should get valid modifiers", (done) => {
            db.getModifiers([2, 1]).then((modifiers: Array<Modifier>) => {
                chai.expect(modifiers).to.length(2)
                chai.expect(modifiers[0].name).to.equals("Modifier 2")
                chai.expect(modifiers[0].description).to.equals("Description 2")
                chai.expect(modifiers[0].duration).to.equals(10)
                chai.expect(modifiers[1]).to.null
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("modifier:1", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get valid modifiers", (done) => {
            db.getModifiers([2, 1]).then((modifiers: Array<Modifier>) => {
                chai.expect(modifiers).to.length(2)
                chai.expect(modifiers[0].name).to.equals("Modifier 2")
                chai.expect(modifiers[0].description).to.equals("Description 2")
                chai.expect(modifiers[0].duration).to.equals(10)
                chai.expect(modifiers[1]).to.null
                done()
            }).catch((error: Error) => {
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
