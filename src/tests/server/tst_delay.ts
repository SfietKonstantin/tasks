import * as chai from "chai"
import { Project, Task, TaskResults, Delay } from "../../common/types"
import { TaskNode } from "../../server/core/graph/types"
import { GraphPersistence } from "../../server/core/graph/graph"
import * as delay from "../../server/core/graph/delay"
import { RedisDataProvider } from "../../server/core/data/redisdataprovider"
import * as redis from "redis"

describe("Delay", () => {
    let client: redis.RedisClient
    let db: RedisDataProvider
    before(() => {
        client = redis.createClient()
        client.select(3)

        db = new RedisDataProvider(client)
    })
    describe("Simple delay parsing test", () => {
        it("Should add some testing data", (done) => {
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }

            db.addProject(project).then(() => {
                const task1: Task = {
                    projectIdentifier: "project",
                    identifier: "1root",
                    name: "Root",
                    description: "Root task",
                    estimatedStartDate: new Date(2016, 9, 1),
                    estimatedDuration: 15
                }
                const task2: Task = {
                    projectIdentifier: "project",
                    identifier: "2short",
                    name: "Short task",
                    description: "Short task",
                    estimatedStartDate: new Date(2016, 9, 16),
                    estimatedDuration: 15
                }
                const task3: Task = {
                    projectIdentifier: "project",
                    identifier: "3long",
                    name: "Long task",
                    description: "Long task",
                    estimatedStartDate: new Date(2016, 9, 16),
                    estimatedDuration: 30
                }
                const task4: Task = {
                    projectIdentifier: "project",
                    identifier: "4reducing",
                    name: "Reducing task",
                    description: "Reducing task",
                    estimatedStartDate: new Date(2016, 10, 15),
                    estimatedDuration: 15
                }

                const tasks = [task1, task2, task3, task4]
                return Promise.all(tasks.map((task: Task) => {
                    return db.addTask(task)
                }))
            }).then(() => {
                return Promise.all([
                    db.setTaskRelation("project", "1root", "2short"),
                    db.setTaskRelation("project", "1root", "3long"),
                    db.setTaskRelation("project", "2short", "4reducing"),
                    db.setTaskRelation("project", "3long", "4reducing")
                ])
            }).then(() => {
                let taskResults: Array<TaskResults> = [
                    {
                        projectIdentifier: "project",
                        taskIdentifier: "1root",
                        startDate: new Date(2016, 9, 2),
                        duration: 16
                    },
                    {
                        projectIdentifier: "project",
                        taskIdentifier: "2short",
                        startDate: new Date(2016, 9, 16),
                        duration: 15},
                    {
                        projectIdentifier: "project",
                        taskIdentifier: "3long",
                        startDate: new Date(2016, 9, 18),
                        duration: 30},
                    {
                        projectIdentifier: "project",
                        taskIdentifier: "4reducing",
                        startDate: new Date(2016, 10, 17),
                        duration: 16
                    }
                ]
                return Promise.all(taskResults.map(db.setTaskResults.bind(db)))
            }).then(() => {
                const delay1: Delay = {
                    projectIdentifier: "project",
                    identifier: "delay1",
                    name: "Delay 1",
                    description: "Description 1",
                    date: new Date(2016, 10, 1)
                }
                const delay2: Delay = {
                    projectIdentifier: "project",
                    identifier: "delay2",
                    name: "Delay 2",
                    description: "Description 2",
                    date: new Date(2016, 10, 20)
                }
                const delay4: Delay = {
                    projectIdentifier: "project",
                    identifier: "delay4",
                    name: "Delay 4",
                    description: "Description 4",
                    date: new Date(2016, 11, 2)
                }

                return Promise.all([delay1, delay2, delay4].map((delay: Delay) => {
                    return db.addDelay(delay)
                }))
            }).then(() => {
                return Promise.all([db.setDelayTaskRelation("project", "delay1", "1root"),
                                    db.setDelayTaskRelation("project", "delay2", "2short"),
                                    db.setDelayTaskRelation("project", "delay4", "4reducing")])
            }).then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get delay info", (done) => {
            let graph = new GraphPersistence("project", db)
            graph.loadGraph("1root").then(() => {
                return graph.loadData()
            }).then(() => {
                return delay.getImpactInfo("project", graph.root, db)
            }).then((impacts: Array<delay.ImpactInfo>) => {
                chai.expect(impacts).to.length(2)
                chai.expect(impacts[0].type).to.equals(delay.ImpactInfoType.Error)
                chai.expect(impacts[0].taskIdentifier).to.equals("4reducing")
                chai.expect(impacts[0].delayIdentifier).to.equals("delay4")
                chai.expect(impacts[0].oldMargin).to.equals(2)
                chai.expect(impacts[0].newMargin).to.equals(-1)
                chai.expect(impacts[1].type).to.equals(delay.ImpactInfoType.Warning)
                chai.expect(impacts[1].taskIdentifier).to.equals("1root")
                chai.expect(impacts[1].delayIdentifier).to.equals("delay1")
                chai.expect(impacts[1].oldMargin).to.equals(16)
                chai.expect(impacts[1].newMargin).to.equals(14)
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
