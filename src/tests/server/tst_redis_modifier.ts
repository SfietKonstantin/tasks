import * as chai from "chai"
import * as redis from "redis"
import * as bluebird from "bluebird"
import { Project, Task, Modifier, TaskLocation } from "../../common/types"
import { NotFoundError, ExistsError } from "../../common/errors"
import { CorruptedError, InternalError } from "../../server/core/data/idataprovider"
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
    describe("getModifier", () => {
        it("Should add some testing data", (done) => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then(() => {
                const modifiers: Array<Modifier> = [
                    {
                        name: "Modifier 1",
                        description: "Description 1",
                        duration: 5,
                        location: TaskLocation.End
                    },
                    {
                        name: "Modifier 2",
                        description: "Description 2",
                        duration: 10,
                        location: TaskLocation.End
                    },
                    {
                        name: "Modifier 3",
                        description: "Description 3",
                        duration: 3,
                        location: TaskLocation.Beginning
                    }
                ]
                return Promise.all(modifiers.map((modifier: Modifier) => {
                    return db.addModifier("project", modifier)
                }))
            }).then((ids: Array<number>) => {
                chai.expect(ids).to.deep.equal([1, 2, 3])
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get modifier 1", (done) => {
            db.getModifier("project", 1).then((modifier: Modifier) => {
                const expected: Modifier = {
                    name: "Modifier 1",
                    description: "Description 1",
                    duration: 5,
                    location: TaskLocation.End
                }
                chai.expect(modifier).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get modifier 2", (done) => {
            db.getModifier("project", 3).then((modifier: Modifier) => {
                const expected: Modifier = {
                    name: "Modifier 3",
                    description: "Description 3",
                    duration: 3,
                    location: TaskLocation.Beginning
                }
                chai.expect(modifier).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid project", (done) => {
            db.getModifier("project2", 1).then(() => {
                done(new Error("getModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid modifier", (done) => {
            db.getModifier("project", 4).then(() => {
                done(new Error("getModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should remove modifier name", (done) => {
            client.hdelAsync("modifier:project:1", "name").then((result: number) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted modifier", (done) => {
            db.getModifier("project", 1).then(() => {
                done(new Error("getModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should remove modifier description", (done) => {
            client.hsetAsync("modifier:project:1", "name", "Modifier 1").then((result) => {
                return client.hdelAsync("modifier:project:1", "description")
            }).then((result: number) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted modifier", (done) => {
            db.getModifier("project", 1).then(() => {
                done(new Error("getModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should remove modifier location", (done) => {
            client.hsetAsync("modifier:project:1", "description", "Description 1").then((result) => {
                return client.hdelAsync("modifier:project:1", "location")
            }).then((result: number) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted modifier", (done) => {
            db.getModifier("project", 1).then(() => {
                done(new Error("getModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should set an invalid modifier location", (done) => {
            client.hsetAsync("modifier:project:1", "location", "").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted modifier", (done) => {
            db.getModifier("project", 1).then(() => {
                done(new Error("getModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should remove modifier duration", (done) => {
            client.hsetAsync("modifier:project:1", "location", "End").then((result) => {
                return client.delAsync("modifier:project:1:duration")
            }).then((result: number) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted modifier", (done) => {
            db.getModifier("project", 1).then(() => {
                done(new Error("getModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should revert modifier properties corruption", (done) => {
            client.setAsync("modifier:project:1:duration", "5").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get modifier", (done) => {
            db.getModifier("project", 1).then((modifier: Modifier) => {
                const expected: Modifier = {
                    name: "Modifier 1",
                    description: "Description 1",
                    duration: 5,
                    location: TaskLocation.End
                }
                chai.expect(modifier).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should corrupt task properties", (done) => {
            client.setAsync("modifier:project:3", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted modifier", (done) => {
            db.getModifier("project", 3).then(() => {
                done(new Error("getModifier should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
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
