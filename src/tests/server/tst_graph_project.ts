import * as chai from "chai"
import * as sinon from "sinon"
import { Project, Task, TaskResults, TaskRelation, Modifier, TaskLocation } from "../../common/types"
import { NotFoundError, ExistsError } from "../../common/errors"
import { FakeDataProvider } from "./fakedataprovider"
import { FakeGraph } from "./fakegraph"
import { Graph, ProjectNode, TaskNode } from "../../server/core/graph/graph"
import * as maputils from "../../common/maputils"

describe("Graph", () => {
    describe("ProjectNode", () => {
        it("Should load the node", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            let mock = sinon.mock(dataProvider)
            const tasks: Array<Task> = [
                {
                    identifier: "root",
                    name: "Root task",
                    description: "Project beginning",
                    estimatedStartDate: new Date(2016, 7, 15),
                    estimatedDuration: 31
                },
                {
                    identifier: "long",
                    name: "Long task",
                    description: "Some long task",
                    estimatedStartDate: new Date(2016, 8, 15),
                    estimatedDuration: 60
                },
                {
                    identifier: "short",
                    name: "Short task",
                    description: "Some short task",
                    estimatedStartDate: new Date(2016, 8, 15),
                    estimatedDuration: 31
                },
                {
                    identifier: "reducing",
                    name: "Reducing task",
                    description: "Task depending on two tasks",
                    estimatedStartDate: new Date(2016, 10, 16),
                    estimatedDuration: 30
                }
            ]
            const results: Array<[string, TaskResults]> = [
                [
                    "root",
                    {
                        startDate: new Date(2016, 7, 15),
                        duration: 36
                    },
                ],
                [
                    "long",
                    {
                        startDate: new Date(2016, 8, 20),
                        duration: 60
                    }
                ],
                [
                    "short",
                    {
                        startDate: new Date(2016, 8, 20),
                        duration: 65
                    }
                ],
                [
                    "reducing",
                    {
                        startDate: new Date(2016, 10, 24),
                        duration: 30
                    }
                ]
            ]
            mock.expects("getProjectTasks").once().returns(Promise.resolve(tasks))
            results.forEach((result: [string, TaskResults]) => {
                mock.expects("getTaskResults").once().withExactArgs("project", result[0])
                    .returns(Promise.resolve(result[1]))
            })
            const rootModifiers: Array<Modifier> = [
                {
                    name: "Root modifier",
                    description: "Root modifier description",
                    duration: 5,
                    location: TaskLocation.End
                }
            ]
            mock.expects("getTaskModifiers").once().withExactArgs("project", "root")
                .returns(Promise.resolve(rootModifiers))
            mock.expects("getTaskModifiers").once().withExactArgs("project", "long")
                .returns(Promise.resolve([]))
            const shortModifiers: Array<Modifier> = [
                {
                    name: "Short modifier 1",
                    description: "Short modifier 1 description",
                    duration: 10,
                    location: TaskLocation.End
                },
                {
                    name: "Short modifier 2",
                    description: "Short modifier 2 description",
                    duration: 24,
                    location: TaskLocation.End
                }
            ]
            mock.expects("getTaskModifiers").once().withExactArgs("project", "short")
                .returns(Promise.resolve(shortModifiers))
            mock.expects("getTaskModifiers").once().withExactArgs("project", "reducing")
                .returns(Promise.resolve([]))
            const rootRelations: Array<TaskRelation> = [
                {
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "long",
                    nextLocation: TaskLocation.Beginning,
                    lag: 0
                },
                {
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "short",
                    nextLocation: TaskLocation.Beginning,
                    lag: 0
                }
            ]
            mock.expects("getTaskRelations").once().withExactArgs("project", "root")
                .returns(Promise.resolve(rootRelations))
            const longRelations: Array<TaskRelation> = [
                {
                    previous: "long",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    nextLocation: TaskLocation.Beginning,
                    lag: 0
                }
            ]
            mock.expects("getTaskRelations").once().withExactArgs("project", "long")
                .returns(Promise.resolve(longRelations))
            const shortRelations: Array<TaskRelation> = [
                {
                    previous: "short",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    nextLocation: TaskLocation.Beginning,
                    lag: 0

                }
            ]
            mock.expects("getTaskRelations").once().withExactArgs("project", "short")
                .returns(Promise.resolve(shortRelations))
            mock.expects("getTaskRelations").once().withExactArgs("project", "reducing")
                .returns(Promise.resolve([]))


            // Test
            let node = new ProjectNode(dataProvider, graph, "project")
            node.load().then(() => {
                const root = maputils.get(node.nodes, "root")
                chai.expect(root.taskIdentifier).to.equal("root")
                chai.expect(root.startDate).to.deep.equal(new Date(2016, 7, 15))
                chai.expect(root.duration).to.equal(36)
                chai.expect(root.modifiers).to.deep.equal(rootModifiers)
                const short = maputils.get(node.nodes, "short")
                chai.expect(short.taskIdentifier).to.equal("short")
                chai.expect(short.startDate).to.deep.equal(new Date(2016, 8, 20))
                chai.expect(short.duration).to.equal(65)
                chai.expect(short.modifiers).to.deep.equal(shortModifiers)
                const long = maputils.get(node.nodes, "long")
                chai.expect(long.taskIdentifier).to.equal("long")
                chai.expect(long.startDate).to.deep.equal(new Date(2016, 8, 20))
                chai.expect(long.duration).to.equal(60)
                chai.expect(long.modifiers).to.deep.equal([])
                const reducing = maputils.get(node.nodes, "reducing")
                chai.expect(reducing.taskIdentifier).to.equal("reducing")
                chai.expect(reducing.startDate).to.deep.equal(new Date(2016, 10, 24))
                chai.expect(reducing.duration).to.equal(30)
                chai.expect(reducing.modifiers).to.deep.equal([])
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should add a task", (done) => {
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, graph, "project")
            const taskNode = new TaskNode(dataProvider, node, "task1", new Date(2015, 1, 1), 30,
                                          new Date(2015, 1, 5), 35)
            node.nodes.set("task1", taskNode)
            const task: Task = {
                identifier: "task2",
                name: "Task 2",
                description: "Description 2",
                estimatedStartDate: new Date(2015, 1, 1),
                estimatedDuration: 10
            }
            const taskResults: TaskResults = {
                startDate: new Date(2015, 1, 1),
                duration: 10
            }
            mock.expects("addTask").once().withExactArgs("project", task).returns(Promise.resolve())
            mock.expects("setTaskResults").once().withExactArgs("project", "task2", taskResults).returns(Promise.resolve())

            node.addTask(task).then(() => {
                const taskNode = maputils.get(node.nodes, "task2")
                chai.expect(taskNode.taskIdentifier).to.equal("task2")
                chai.expect(taskNode.startDate).to.deep.equal(new Date(2015, 1, 1))
                chai.expect(taskNode.duration).to.equal(10)
                chai.expect(taskNode.modifiers).to.deep.equal([])
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should add a task", (done) => {
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, graph, "project")
            const taskNode = new TaskNode(dataProvider, node, "task1", new Date(2015, 1, 1), 30,
                                          new Date(2015, 1, 5), 35)
            node.nodes.set("task1", taskNode)
            const task: Task = {
                identifier: "task2",
                name: "Task 2",
                description: "Description 2",
                estimatedStartDate: new Date(2015, 1, 1),
                estimatedDuration: 10
            }
            const taskResults: TaskResults = {
                startDate: new Date(2015, 1, 1),
                duration: 10
            }
            mock.expects("addTask").once().withExactArgs("project", task).returns(Promise.resolve())
            mock.expects("setTaskResults").once().withExactArgs("project", "task2", taskResults).returns(Promise.resolve())

            node.addTask(task).then(() => {
                const taskNode = maputils.get(node.nodes, "task2")
                chai.expect(taskNode.taskIdentifier).to.equal("task2")
                chai.expect(taskNode.startDate).to.deep.equal(new Date(2015, 1, 1))
                chai.expect(taskNode.duration).to.equal(10)
                chai.expect(taskNode.modifiers).to.deep.equal([])
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw error when adding existing node", (done) => {
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, graph, "project")
            const taskNode = new TaskNode(dataProvider, node, "task1", new Date(2015, 1, 1), 30,
                                          new Date(2015, 1, 5), 35)
            node.nodes.set("task1", taskNode)
            const task: Task = {
                identifier: "task1",
                name: "Task 1",
                description: "Description 1",
                estimatedStartDate: new Date(2015, 1, 1),
                estimatedDuration: 10
            }

            node.addTask(task).then(() => {
                done(new Error("Input error should be detected"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(ExistsError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should add a relation", (done) => {
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, graph, "project")
            const taskNode1 = new TaskNode(dataProvider, node, "task1", new Date(2015, 1, 1), 30,
                                           new Date(2015, 1, 1), 30)
            node.nodes.set("task1", taskNode1)
            const taskNode2 = new TaskNode(dataProvider, node, "task2", new Date(2015, 1, 1), 10,
                                           new Date(2015, 1, 1), 10)
            node.nodes.set("task2", taskNode2)

            const relation: TaskRelation = {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                nextLocation: TaskLocation.Beginning,
                lag: 0
            }
            const taskResults: TaskResults = {
                startDate: new Date(2015, 2, 3),
                duration: 10
            }
            mock.expects("addTaskRelation").once().withExactArgs("project", relation).returns(Promise.resolve())
            mock.expects("setTaskResults").once().withExactArgs("project", "task2", taskResults).returns(Promise.resolve())

            node.addRelation(relation).then(() => {
                const taskNode = maputils.get(node.nodes, "task2")
                chai.expect(taskNode.taskIdentifier).to.equal("task2")
                chai.expect(taskNode.startDate).to.deep.equal(new Date(2015, 2, 3))
                chai.expect(taskNode.duration).to.equal(10)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw error when adding relation with invalid previous node", (done) => {
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, graph, "project")
            const taskNode1 = new TaskNode(dataProvider, node, "task1", new Date(2015, 1, 1), 30,
                                           new Date(2015, 1, 1), 30)
            node.nodes.set("task1", taskNode1)
            const taskNode2 = new TaskNode(dataProvider, node, "task2", new Date(2015, 1, 1), 10,
                                           new Date(2015, 1, 1), 10)
            node.nodes.set("task2", taskNode2)

            const relation: TaskRelation = {
                previous: "task3",
                previousLocation: TaskLocation.End,
                next: "task2",
                nextLocation: TaskLocation.Beginning,
                lag: 0
            }
            node.addRelation(relation).then(() => {
                done(new Error("Input error should be detected"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw error when adding relation with invalid next node", (done) => {
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, graph, "project")
            const taskNode1 = new TaskNode(dataProvider, node, "task1", new Date(2015, 1, 1), 30,
                                           new Date(2015, 1, 1), 30)
            node.nodes.set("task1", taskNode1)
            const taskNode2 = new TaskNode(dataProvider, node, "task2", new Date(2015, 1, 1), 10,
                                           new Date(2015, 1, 1), 10)
            node.nodes.set("task2", taskNode2)

            const relation: TaskRelation = {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task3",
                nextLocation: TaskLocation.Beginning,
                lag: 0
            }
            node.addRelation(relation).then(() => {
                done(new Error("Input error should be detected"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
