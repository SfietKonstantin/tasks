import * as chai from "chai"
import * as redis from "redis"
import * as bluebird from "bluebird"
import { Project, Task, Impact } from "../core/types"
import { TaskNotFoundError } from "../core/data/idataprovider"
import { RedisDataProvider } from "../core/data/redisdataprovider"

const redisAsync: any = bluebird.promisifyAll(redis)

declare module 'redis' {
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
    describe("getImpacts", () => {
        it("Should add some testing data", (done) => {
            const project: Project = {
                id: null,
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then((projectId: number) => {
                chai.expect(projectId).to.equals(1)
                
                let task: Task = {
                    id: null,
                    projectId: projectId,
                    name: "Task",
                    description: "Description",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 30
                }
                
                return db.addTask(projectId, task).then((taskId: number) => {
                    chai.expect(taskId).to.equals(1)

                    const impact1: Impact = {
                        id: null,
                        name: "Impact 1",
                        description: "Description 1",
                        duration: 40
                    }

                    const impact2: Impact = {
                        id: null,
                        name: "Impact 2",
                        description: "Description 2",
                        duration: 10
                    }

                    return db.addImpact(impact1).then(() => {
                        return db.addImpact(impact2)
                    })
                }).then(() => {
                    done()
                })
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an empty list", (done) => {
            db.getImpacts([]).then((impacts: Array<Impact>) => {
                chai.expect(impacts).to.length(0)
                done()
            })
        })
        it("Should get impacts", (done) => {
            db.getImpacts([2, 1]).then((impacts: Array<Impact>) => {
                chai.expect(impacts).to.length(2)
                chai.expect(impacts[0].id).to.equals(2)
                chai.expect(impacts[0].name).to.equals("Impact 2")
                chai.expect(impacts[0].description).to.equals("Description 2")
                chai.expect(impacts[0].duration).to.equals(10)
                chai.expect(impacts[1].id).to.equals(1)
                chai.expect(impacts[1].name).to.equals("Impact 1")
                chai.expect(impacts[1].description).to.equals("Description 1")
                chai.expect(impacts[1].duration).to.equals(40)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should corrupt impact", (done) => {
            client.delAsync("impact:1").then((result) => {
                done()
            })
        })
        it("Should get valid impacts", (done) => {
            db.getImpacts([2, 1]).then((impacts: Array<Impact>) => {
                chai.expect(impacts).to.length(2)
                chai.expect(impacts[0].id).to.equals(2)
                chai.expect(impacts[0].name).to.equals("Impact 2")
                chai.expect(impacts[0].description).to.equals("Description 2")
                chai.expect(impacts[0].duration).to.equals(10)
                chai.expect(impacts[1]).to.null
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("impact:1", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get valid impacts", (done) => {
            db.getImpacts([2, 1]).then((impacts: Array<Impact>) => {
                chai.expect(impacts).to.length(2)
                chai.expect(impacts[0].id).to.equals(2)
                chai.expect(impacts[0].name).to.equals("Impact 2")
                chai.expect(impacts[0].description).to.equals("Description 2")
                chai.expect(impacts[0].duration).to.equals(10)
                chai.expect(impacts[1]).to.null
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        after(() => {
            client.flushdb()
        })
    })
})