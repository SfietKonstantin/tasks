import * as chai from "chai"
import { Project, Task, TaskResults, Modifier } from "../../common/types"
import { TaskNode } from "../../server/core/graph/types"
import { GraphPersistence, compute } from "../../server/core/graph/graph"
import { RedisDataProvider } from "../../server/core/data/redisdataprovider"
import * as maputils from "../../common/maputils"
import * as redis from "redis"

describe("Graph persistence", () => {
    let client: redis.RedisClient
    let db: RedisDataProvider
    let graph: GraphPersistence
    before(() => {
        client = redis.createClient()
        client.select(3)

        db = new RedisDataProvider(client)
        graph = new GraphPersistence("project", db)
    })
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
                    startDate: new Date(2016, 9, 18),
                    duration: 15
                },
                {
                    projectIdentifier: "project",
                    taskIdentifier: "3long",
                    startDate: new Date(2016, 9, 18),
                    duration: 30
                },
                {
                    projectIdentifier: "project",
                    taskIdentifier: "4reducing",
                    startDate: new Date(2016, 10, 17),
                    duration: 16
                }
            ]
            return Promise.all(taskResults.map(db.setTaskResults.bind(db)))
        }).then(() => {
            done()
        }).catch((error: Error) => {
            done(error)
        })
    })
    it("Should load the whole graph", (done) => {
        graph.loadGraph("1root").then(() => {
            const node1 = maputils.get(graph.nodes, "1root")
            chai.expect(node1.taskIdentifier).to.equals("1root")
            chai.expect(node1.estimatedStartDate.getTime()).to.equals(new Date(2016, 9, 1).getTime())
            chai.expect(node1.estimatedDuration).to.equals(15)
            chai.expect(node1.startDate).to.null
            chai.expect(node1.duration).to.null

            const node2 = maputils.get(graph.nodes, "2short")
            chai.expect(node2.taskIdentifier).to.equals("2short")
            chai.expect(node2.estimatedStartDate.getTime()).to.equals(new Date(2016, 9, 16).getTime())
            chai.expect(node2.estimatedDuration).to.equals(15)
            chai.expect(node2.startDate).to.null
            chai.expect(node2.duration).to.null

            const node3 = maputils.get(graph.nodes, "3long")
            chai.expect(node3.taskIdentifier).to.equals("3long")
            chai.expect(node3.estimatedStartDate.getTime()).to.equals(new Date(2016, 9, 16).getTime())
            chai.expect(node3.estimatedDuration).to.equals(30)
            chai.expect(node3.startDate).to.null
            chai.expect(node3.duration).to.null

            const node4 = maputils.get(graph.nodes, "4reducing")
            chai.expect(node4.taskIdentifier).to.equals("4reducing")
            chai.expect(node4.estimatedStartDate.getTime()).to.equals(new Date(2016, 10, 15).getTime())
            chai.expect(node4.estimatedDuration).to.equals(15)
            chai.expect(node4.startDate).to.null
            chai.expect(node4.duration).to.null

            chai.expect(node1.children).to.length(2)
            chai.expect(node1.children[0]).to.equals(node2)
            chai.expect(node1.children[1]).to.equals(node3)

            chai.expect(node2.children).to.length(1)
            chai.expect(node2.children[0]).to.equals(node4)

            chai.expect(node3.children).to.length(1)
            chai.expect(node3.children[0]).to.equals(node4)

            chai.expect(node4.children).to.empty


            chai.expect(node1.parents).to.empty

            chai.expect(node2.parents).to.length(1)
            chai.expect(node2.parents[0]).to.equals(node1)

            chai.expect(node3.parents).to.length(1)
            chai.expect(node3.parents[0]).to.equals(node1)

            chai.expect(node4.parents).to.length(2)
            chai.expect(node4.parents[0]).to.equals(node2)
            chai.expect(node4.parents[1]).to.equals(node3)

            done()
        }).catch((error: Error) => {
            done(error)
        })
    })
    it("Should add some testing data", (done) => {
        const modifier1: Modifier = {
            projectIdentifier: "project",
            name: "Modifier 1",
            description: "Description 1",
            duration: 8
        }

        const modifier2_1: Modifier = {
            projectIdentifier: "project",
            name: "Modifier 2, 1",
            description: "Description 2, 1",
            duration: 10
        }

        const modifier2_2: Modifier = {
            projectIdentifier: "project",
            name: "Modifier 2, 2",
            description: "Description 2, 2",
            duration: 12
        }

        const modifier4: Modifier = {
            projectIdentifier: "project",
            name: "Modifier 4",
            description: "Description 4",
            duration: 15
        }

        const modifiers = [modifier1, modifier2_1, modifier2_2, modifier4]
        Promise.all(modifiers.map(db.addModifier.bind(db))).then((ids: [number, number, number, number]) => {
            chai.expect(ids[0]).to.equals(1)
            chai.expect(ids[1]).to.equals(2)
            chai.expect(ids[2]).to.equals(3)
            chai.expect(ids[3]).to.equals(4)
        }).then(() => {
            return db.setModifierForTask("project", 1, "1root")
        }).then(() => {
            return db.setModifierForTask("project", 2, "2short")
        }).then(() => {
            return db.setModifierForTask("project", 3, "2short")
        }).then(() => {
            return db.setModifierForTask("project", 4, "4reducing")
        }).then(() => {
            done()
        }).catch((error: Error) => {
            done(error)
        })
    })
    it("Should load all data (start date and modifiers)", (done) => {
        graph.loadData().then(() => {
            const node1 = maputils.get(graph.nodes, "1root")
            const node2 = maputils.get(graph.nodes, "2short")
            const node3 = maputils.get(graph.nodes, "3long")
            const node4 = maputils.get(graph.nodes, "4reducing")

            chai.expect((node1.startDate as Date).getTime()).to.equals(new Date(2016, 9, 2).getTime())
            chai.expect(node1.modifiers).to.length(1)
            chai.expect(node1.modifiers[0]).to.equals(8)
            chai.expect((node2.startDate as Date).getTime()).to.equals(new Date(2016, 9, 18).getTime())
            chai.expect(node2.modifiers).to.length(2)
            chai.expect(node2.modifiers[0]).to.equals(10)
            chai.expect(node2.modifiers[1]).to.equals(12)
            chai.expect((node3.startDate as Date).getTime()).to.equals(new Date(2016, 9, 18).getTime())
            chai.expect(node3.modifiers).to.empty
            chai.expect((node4.startDate as Date).getTime()).to.equals(new Date(2016, 10, 17).getTime())
            chai.expect(node4.modifiers).to.length(1)
            chai.expect(node4.modifiers[0]).to.equals(15)

            done()
        }).catch((error: Error) => {
            done(error)
        })
    })
    it("Should compute the graph", (done) => {
        compute(graph.root)

        const node1 = maputils.get(graph.nodes, "1root")
        const node2 = maputils.get(graph.nodes, "2short")
        const node3 = maputils.get(graph.nodes, "3long")
        const node4 = maputils.get(graph.nodes, "4reducing")

        chai.expect((node1.startDate as Date).getTime()).to.equals(new Date(2016, 9, 2).getTime())
        chai.expect(node1.duration).to.equals(23)
        chai.expect((node2.startDate as Date).getTime()).to.equals(new Date(2016, 9, 2 + 23).getTime())
        chai.expect(node2.duration).to.equals(37)
        chai.expect((node3.startDate as Date).getTime()).to.equals(new Date(2016, 9, 2 + 23).getTime())
        chai.expect(node3.duration).to.equals(30)
        chai.expect((node4.startDate as Date).getTime()).to.equals(new Date(2016, 9, 2 + 23 + 37).getTime())
        chai.expect(node4.duration).to.equals(30)

        done()
    })
    it("Should save the graph", (done) => {
        graph.save().then(() => {
            done()
        }).catch((error: Error) => {
            done(error)
        })
    })
    it("Should check that data has been save", (done) => {
        let newGraph = new GraphPersistence("project", db)
        newGraph.loadGraph("1root").then(() => {
            return newGraph.loadData()
        }).then(() => {
            const node1 = maputils.get(graph.nodes, "1root")
            const node2 = maputils.get(graph.nodes, "2short")
            const node3 = maputils.get(graph.nodes, "3long")
            const node4 = maputils.get(graph.nodes, "4reducing")

            chai.expect((node1.startDate as Date).getTime()).to.equals(new Date(2016, 9, 2).getTime())
            chai.expect(node1.duration).to.equals(23)
            chai.expect((node2.startDate as Date).getTime()).to.equals(new Date(2016, 9, 2 + 23).getTime())
            chai.expect(node2.duration).to.equals(37)
            chai.expect((node3.startDate as Date).getTime()).to.equals(new Date(2016, 9, 2 + 23).getTime())
            chai.expect(node3.duration).to.equals(30)
            chai.expect((node4.startDate as Date).getTime()).to.equals(new Date(2016, 9, 2 + 23 + 37).getTime())
            chai.expect(node4.duration).to.equals(30)

            done()
        }).catch((error: Error) => {
            done(error)
        })
    })
    xit("Should check that the graph is not saved in case of transaction error", (done) => {

    })
    after(() => {
        client.flushdb()
        client.quit()
    })
})
