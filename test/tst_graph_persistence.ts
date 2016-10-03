import * as chai from "chai"
import { Project, Task, TaskResults, Impact } from "../core/types"
import { TaskNode } from "../core/graph/types"
import { GraphPersistence, compute } from "../core/graph/graph"
import { RedisDataProvider } from "../core/data/redisdataprovider"
import * as redis from "redis"

describe("Graph persistence", () => {
    let client: redis.RedisClient
    let db: RedisDataProvider
    let graph: GraphPersistence
    before(() => {
        client = redis.createClient()
        client.select(3)

        db = new RedisDataProvider(client)
        graph = new GraphPersistence(db)
    })
    it("Should add some testing data", (done) => {
        const project: Project = {
            id: null,
            name: "Project",
            description: "Description"
        }

        db.addProject(project).then((projectId: number) => {
            const task1: Task = {
                id: null,
                projectId: projectId,
                name: "Root",
                description: "Root task",
                estimatedStartDate: new Date(2016, 9, 1),
                estimatedDuration: 15
            }
            const task2: Task = {
                id: null,
                projectId: projectId,
                name: "Short task",
                description: "Short task",
                estimatedStartDate: new Date(2016, 9, 16),
                estimatedDuration: 15
            }
            const task3: Task = {
                id: null,
                projectId: projectId,
                name: "Long task",
                description: "Long task",
                estimatedStartDate: new Date(2016, 9, 16),
                estimatedDuration: 30
            }
            const task4: Task = {
                id: null,
                projectId: projectId,
                name: "Reducing task",
                description: "Reducing task",
                estimatedStartDate: new Date(2016, 10, 15),
                estimatedDuration: 15
            }

            const tasks = [task1, task2, task3, task4]
            return Promise.all(tasks.map((task: Task) => {
                return db.addTask(1, task)
            }))
        }).then(() => {
            return Promise.all([db.setTaskRelation(1, 2), db.setTaskRelation(1, 3),
                                db.setTaskRelation(2, 4), db.setTaskRelation(3, 4)])
        }).then(() => {
            return db.setProjectRootTask(1, 1)
        }).then(() => {
            let taskResults: Array<TaskResults> = [
                {taskId: 1, startDate: new Date(2016, 9, 2), duration: 16},
                {taskId: 2, startDate: new Date(2016, 9, 18), duration: 15},
                {taskId: 3, startDate: new Date(2016, 9, 18), duration: 30},
                {taskId: 4, startDate: new Date(2016, 10, 17), duration: 16}
            ]

            return db.setTasksResults(taskResults)
        }).then(() => {
            done()
        }).catch((error: Error) => {
            done(error)
        })
    })
    it("Should load the whole graph", (done) => {
        graph.loadGraph(1).then(() => {
            const node1 = graph.nodes.get(1)
            chai.expect(node1.id).to.equals(1)
            chai.expect(node1.estimatedStartDate.getTime()).to.equals(new Date(2016, 9, 1).getTime())
            chai.expect(node1.estimatedDuration).to.equals(15)
            chai.expect(node1.startDate).to.null
            chai.expect(node1.duration).to.null

            const node2 = graph.nodes.get(2)
            chai.expect(node2.id).to.equals(2)
            chai.expect(node2.estimatedStartDate.getTime()).to.equals(new Date(2016, 9, 16).getTime())
            chai.expect(node2.estimatedDuration).to.equals(15)
            chai.expect(node2.startDate).to.null
            chai.expect(node2.duration).to.null

            const node3 = graph.nodes.get(3)
            chai.expect(node3.id).to.equals(3)
            chai.expect(node3.estimatedStartDate.getTime()).to.equals(new Date(2016, 9, 16).getTime())
            chai.expect(node3.estimatedDuration).to.equals(30)
            chai.expect(node3.startDate).to.null
            chai.expect(node3.duration).to.null

            const node4 = graph.nodes.get(4)
            chai.expect(node4.id).to.equals(4)
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
        const impact1: Impact = {
            id: null,
            name: "Impact 1",
            description: "Description 1",
            duration: 8
        }

        const impact2_1: Impact = {
            id: null,
            name: "Impact 2, 1",
            description: "Description 2, 1",
            duration: 10
        }

        const impact2_2: Impact = {
            id: null,
            name: "Impact 2, 2",
            description: "Description 2, 2",
            duration: 12
        }

        const impact4: Impact = {
            id: null,
            name: "Impact 4",
            description: "Description 4",
            duration: 15
        }

        const impacts = [impact1, impact2_1, impact2_2, impact4]
        Promise.all(impacts.map(db.addImpact.bind(db))).then(() => {
            chai.expect(impact1.id).to.equals(1)
            chai.expect(impact2_1.id).to.equals(2)
            chai.expect(impact2_2.id).to.equals(3)
            chai.expect(impact4.id).to.equals(4)
        }).then(() => {
            return db.setImpactForTask(1, 1)
        }).then(() => {
            return db.setImpactForTask(2, 2)
        }).then(() => {
            return db.setImpactForTask(3, 2)
        }).then(() => {
            return db.setImpactForTask(4, 4)
        }).then(() => {
            done()
        }).catch((error: Error) => {
            done(error)
        })
    })
    it("Should load all data (start date and impacts)", (done) => {
        graph.loadData().then(() => {
            const node1 = graph.nodes.get(1)
            const node2 = graph.nodes.get(2)
            const node3 = graph.nodes.get(3)
            const node4 = graph.nodes.get(4)

            chai.expect(node1.startDate.getTime()).to.equals(new Date(2016, 9, 2).getTime())
            chai.expect(node1.impacts).to.length(1)
            chai.expect(node1.impacts[0]).to.equals(8)
            chai.expect(node2.startDate.getTime()).to.equals(new Date(2016, 9, 18).getTime())
            chai.expect(node2.impacts).to.length(2)
            chai.expect(node2.impacts[0]).to.equals(10)
            chai.expect(node2.impacts[1]).to.equals(12)
            chai.expect(node3.startDate.getTime()).to.equals(new Date(2016, 9, 18).getTime())
            chai.expect(node3.impacts).to.length(0)
            chai.expect(node4.startDate.getTime()).to.equals(new Date(2016, 10, 17).getTime())
            chai.expect(node4.impacts).to.length(1)
            chai.expect(node4.impacts[0]).to.equals(15)

            done()
        }).catch((error: Error) => {
            done(error)
        })
    })
    it("Should compute the graph", (done) => {
        compute(graph.root)

        const node1 = graph.nodes.get(1)
        const node2 = graph.nodes.get(2)
        const node3 = graph.nodes.get(3)
        const node4 = graph.nodes.get(4)

        chai.expect(node1.startDate.getTime()).to.equals(new Date(2016, 9, 2).getTime())
        chai.expect(node1.duration).to.equals(23)
        chai.expect(node2.startDate.getTime()).to.equals(new Date(2016, 9, 2 + 23).getTime())
        chai.expect(node2.duration).to.equals(37)
        chai.expect(node3.startDate.getTime()).to.equals(new Date(2016, 9, 2 + 23).getTime())
        chai.expect(node3.duration).to.equals(30)
        chai.expect(node4.startDate.getTime()).to.equals(new Date(2016, 9, 2 + 23 + 37).getTime())
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
        let newGraph = new GraphPersistence(db)
        newGraph.loadGraph(1).then(() => {
            return newGraph.loadData()
        }).then(() => {
            const node1 = graph.nodes.get(1)
            const node2 = graph.nodes.get(2)
            const node3 = graph.nodes.get(3)
            const node4 = graph.nodes.get(4)
            
            chai.expect(node1.startDate.getTime()).to.equals(new Date(2016, 9, 2).getTime())
            chai.expect(node1.duration).to.equals(23)
            chai.expect(node2.startDate.getTime()).to.equals(new Date(2016, 9, 2 + 23).getTime())
            chai.expect(node2.duration).to.equals(37)
            chai.expect(node3.startDate.getTime()).to.equals(new Date(2016, 9, 2 + 23).getTime())
            chai.expect(node3.duration).to.equals(30)
            chai.expect(node4.startDate.getTime()).to.equals(new Date(2016, 9, 2 + 23 + 37).getTime())
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
    })
})
