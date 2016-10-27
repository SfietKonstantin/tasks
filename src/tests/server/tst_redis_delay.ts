import * as chai from "chai"
import * as redis from "redis"
import * as bluebird from "bluebird"
import { Project, Delay } from "../../common/types"
import { NotFoundError, ExistsError } from "../../common/errors"
import { CorruptedError } from "../../server/core/data/idataprovider"
import { RedisDataProvider } from "../../server/core/data/redisdataprovider"

const redisAsync: any = bluebird.promisifyAll(redis)

declare module "redis" {
    export interface RedisClient extends NodeJS.EventEmitter {
        setAsync(...args: any[]): Promise<any>
        delAsync(...args: any[]): Promise<any>
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
    describe("getDelays", () => {
        it("Should add some testing data", (done) => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then(() => {
                const delay1: Delay = {
                    identifier: "delay1",
                    name: "Delay 1",
                    description: "Description 1",
                    date: new Date(2016, 9, 1)
                }
                const delay2: Delay = {
                    identifier: "delay2",
                    name: "Delay 2",
                    description: "Description 2",
                    date: new Date(2016, 9, 15)
                }

                return db.addDelay("project", delay1).then(() => {
                }).then(() => {
                    return db.addDelay("project", delay2)
                }).then(() => {
                    done()
                })
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an empty list", (done) => {
            db.getDelays("project", []).then((delays: Array<Delay>) => {
                chai.expect(delays).to.empty
                done()
            })
        })
        it("Should get delays", (done) => {
            db.getDelays("project", ["delay2", "delay1"]).then((delays: Array<Delay>) => {
                const expected: Array<Delay> = [
                    {
                        identifier: "delay2",
                        name: "Delay 2",
                        description: "Description 2",
                        date: new Date(2016, 9, 15)
                    },
                    {
                        identifier: "delay1",
                        name: "Delay 1",
                        description: "Description 1",
                        date: new Date(2016, 9, 1)
                    }
                ]
                chai.expect(delays).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should remove delay", (done) => {
            client.delAsync("delay:project:delay1").then((result) => {
                done()
            })
        })
        it("Should get valid delays", (done) => {
            db.getDelays("project", ["delay2", "delay1"]).then((delays: Array<Delay>) => {
                const expected: Array<Delay | null> = [
                    {
                        identifier: "delay2",
                        name: "Delay 2",
                        description: "Description 2",
                        date: new Date(2016, 9, 15)
                    },
                    null
                ]
                chai.expect(delays).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should corrupt delay properties", (done) => {
            client.setAsync("delay:project:delay1", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get valid delays", (done) => {
            db.getDelays("project", ["delay2", "delay1"]).then((delays: Array<Delay>) => {
                const expected: Array<Delay | null> = [
                    {
                        identifier: "delay2",
                        name: "Delay 2",
                        description: "Description 2",
                        date: new Date(2016, 9, 15)
                    },
                    null
                ]
                chai.expect(delays).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        after(() => {
            client.flushdb()
        })
    })
    describe("getDelay", () => {
        it("Should add some testing data", (done) => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then(() => {
                const delay1: Delay = {
                    identifier: "delay1",
                    name: "Delay 1",
                    description: "Description 1",
                    date: new Date(2016, 9, 1)
                }
                const delay2: Delay = {
                    identifier: "delay2",
                    name: "Delay 2",
                    description: "Description 2",
                    date: new Date(2016, 9, 15)
                }

                return db.addDelay("project", delay1).then(() => {
                }).then(() => {
                    return db.addDelay("project", delay2)
                }).then(() => {
                    done()
                })
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get delay", (done) => {
            db.getDelay("project", "delay1").then((delay: Delay) => {
                const expected: Delay = {
                    identifier: "delay1",
                    name: "Delay 1",
                    description: "Description 1",
                    date: new Date(2016, 9, 1)
                }
                chai.expect(delay).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on invalid delay", (done) => {
            db.getDelay("project", "delay3").then((delay: Delay) => {
                done(new Error("getDelay should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            })
        })
        it("Should remove delay properties", (done) => {
            client.hdelAsync("delay:project:delay1", "name").then((result: number) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted delay", (done) => {
            db.getDelay("project", "delay1").then((delay: Delay) => {
                done(new Error("getDelay should not be a success"))
                done()
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            })
        })
        it("Should corrupt delay properties", (done) => {
            client.setAsync("delay:project:delay3", "test").then((result) => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception on corrupted delay", (done) => {
            db.getDelay("project", "delay3").then((delay: Delay) => {
                done(new Error("getDelay should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.not.null
                done()
            })
        })
        after(() => {
            client.flushdb()
        })
    })
    describe("addDelay", () => {
        it("Should add some testing data", (done) => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should add delay", (done) => {
            const delay1: Delay = {
                identifier: "delay1",
                name: "Delay 1",
                description: "Description 1",
                date: new Date(2016, 9, 1)
            }

            db.addDelay("project", delay1).then(() => {
               done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding delay on invalid project", (done) => {
            const delay2: Delay = {
                identifier: "delay2",
                name: "Delay 2",
                description: "Description 2",
                date: new Date(2016, 9, 1)
            }

            db.addDelay("project2", delay2).then(() => {
                done(new Error("addDelay should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            })
        })
        it("Should get an exception when adding an existing delay", (done) => {
            const delay1_2: Delay = {
                identifier: "delay1",
                name: "Delay 2",
                description: "Description 2",
                date: new Date(2016, 9, 1)
            }

            db.addDelay("project", delay1_2).then(() => {
                done(new Error("addDelay should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(ExistsError)
                done()
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
