import * as chai from "chai"
import * as sinon from "sinon"
import {
    Project, TaskDefinition, TaskRelation, Modifier, TaskLocation,
    DelayDefinition, DelayRelation
} from "../../common/types"
import { NotFoundError, ExistsError } from "../../common/errors"
import { FakeDataProvider } from "./fakedataprovider"
import { FakeGraph } from "./fakegraph"
import { Graph, ProjectNode, TaskNode, DelayNode } from "../../server/core/graph/graph"
import * as maputils from "../../common/maputils"

describe("Graph", () => {
    describe("ProjectNode", () => {
        it("Should load the node", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            let mock = sinon.mock(dataProvider)
            const tasks: Array<TaskDefinition> = [
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
            const delays: Array<DelayDefinition> = [
                {
                    identifier: "delay1",
                    name: "Delay 1",
                    description: "Description 1",
                    date: new Date(2016, 11, 30)
                },
                {
                    identifier: "delay2",
                    name: "Delay 2",
                    description: "Description 2",
                    date: new Date(2016, 11, 30)
                }
            ]
            mock.expects("getProjectTasks").once().returns(Promise.resolve(tasks))
            mock.expects("getProjectDelays").once().returns(Promise.resolve(delays))
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
                    lag: 0
                },
                {
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "short",
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
                    lag: 0

                }
            ]
            mock.expects("getTaskRelations").once().withExactArgs("project", "short")
                .returns(Promise.resolve(shortRelations))
            mock.expects("getTaskRelations").once().withExactArgs("project", "reducing")
                .returns(Promise.resolve([]))
            const delay1relations: Array<DelayRelation> = [
                {
                    delay: "delay1",
                    task: "reducing",
                    lag: 0
                }
            ]
            const delay2relations: Array<DelayRelation> = [
                {
                    delay: "delay2",
                    task: "reducing",
                    lag: 5
                }
            ]
            mock.expects("getDelayRelations").once().withExactArgs("project", "delay1")
                .returns(Promise.resolve(delay1relations))
            mock.expects("getDelayRelations").once().withExactArgs("project", "delay2")
                .returns(Promise.resolve(delay2relations))

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
                const delay1 = maputils.get(node.delays, "delay1")
                chai.expect(delay1.delayIdentifier).to.equal("delay1")
                chai.expect(delay1.initialMargin).to.equal(14)
                chai.expect(delay1.margin).to.equal(6)
                const delay2 = maputils.get(node.delays, "delay2")
                chai.expect(delay2.delayIdentifier).to.equal("delay2")
                chai.expect(delay2.initialMargin).to.equal(9)
                chai.expect(delay2.margin).to.equal(1)

                mock.verify()
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
            const taskNode = new TaskNode(dataProvider, node, "task1", new Date(2015, 1, 1), 30)
            node.nodes.set("task1", taskNode)
            const task: TaskDefinition = {
                identifier: "task2",
                name: "Task 2",
                description: "Description 2",
                estimatedStartDate: new Date(2015, 1, 1),
                estimatedDuration: 10
            }
            mock.expects("addTask").once().withExactArgs("project", task).returns(Promise.resolve())

            node.addTask(task).then(() => {
                const taskNode = maputils.get(node.nodes, "task2")
                chai.expect(taskNode.taskIdentifier).to.equal("task2")
                chai.expect(taskNode.startDate).to.deep.equal(new Date(2015, 1, 1))
                chai.expect(taskNode.duration).to.equal(10)
                chai.expect(taskNode.modifiers).to.deep.equal([])
                mock.verify()
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
            const taskNode = new TaskNode(dataProvider, node, "task1", new Date(2015, 1, 1), 30)
            node.nodes.set("task1", taskNode)
            const task: TaskDefinition = {
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
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should add a task relation 1", (done) => {
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, graph, "project")
            const taskNode1 = new TaskNode(dataProvider, node, "task1", new Date(2015, 1, 1), 30)
            node.nodes.set("task1", taskNode1)
            const taskNode2 = new TaskNode(dataProvider, node, "task2", new Date(2015, 1, 1), 10)
            node.nodes.set("task2", taskNode2)

            const relation: TaskRelation = {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                lag: 0
            }
            mock.expects("addTaskRelation").once().withExactArgs("project", relation).returns(Promise.resolve())
                .returns(Promise.resolve())

            node.addTaskRelation(relation).then(() => {
                const taskNode = maputils.get(node.nodes, "task2")
                chai.expect(taskNode.taskIdentifier).to.equal("task2")
                chai.expect(taskNode.startDate).to.deep.equal(new Date(2015, 2, 3))
                chai.expect(taskNode.duration).to.equal(10)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should add a task relation 2", (done) => {
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, graph, "project")
            const taskNode1 = new TaskNode(dataProvider, node, "task1", new Date(2015, 1, 1), 30)
            node.nodes.set("task1", taskNode1)
            const taskNode2 = new TaskNode(dataProvider, node, "task2", new Date(2015, 1, 1), 10)
            node.nodes.set("task2", taskNode2)

            const relation: TaskRelation = {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                lag: 5
            }
            mock.expects("addTaskRelation").once().withExactArgs("project", relation).returns(Promise.resolve())

            node.addTaskRelation(relation).then(() => {
                const taskNode = maputils.get(node.nodes, "task2")
                chai.expect(taskNode.taskIdentifier).to.equal("task2")
                chai.expect(taskNode.startDate).to.deep.equal(new Date(2015, 2, 8))
                chai.expect(taskNode.duration).to.equal(10)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should add a task relation 3", (done) => {
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, graph, "project")
            const taskNode1 = new TaskNode(dataProvider, node, "task1", new Date(2015, 1, 1), 30)
            node.nodes.set("task1", taskNode1)
            const taskNode2 = new TaskNode(dataProvider, node, "task2", new Date(2015, 1, 1), 10)
            node.nodes.set("task2", taskNode2)

            const relation: TaskRelation = {
                previous: "task1",
                previousLocation: TaskLocation.Beginning,
                next: "task2",
                lag: 0
            }
            mock.expects("addTaskRelation").once().withExactArgs("project", relation).returns(Promise.resolve())

            node.addTaskRelation(relation).then(() => {
                const taskNode = maputils.get(node.nodes, "task2")
                chai.expect(taskNode.taskIdentifier).to.equal("task2")
                chai.expect(taskNode.startDate).to.deep.equal(new Date(2015, 1, 1))
                chai.expect(taskNode.duration).to.equal(10)
                mock.verify()
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
            const taskNode1 = new TaskNode(dataProvider, node, "task1", new Date(2015, 1, 1), 30)
            node.nodes.set("task1", taskNode1)
            const taskNode2 = new TaskNode(dataProvider, node, "task2", new Date(2015, 1, 1), 10)
            node.nodes.set("task2", taskNode2)

            const relation: TaskRelation = {
                previous: "task3",
                previousLocation: TaskLocation.End,
                next: "task2",
                lag: 0
            }
            node.addTaskRelation(relation).then(() => {
                done(new Error("Input error should be detected"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                mock.verify()
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
            const taskNode1 = new TaskNode(dataProvider, node, "task1", new Date(2015, 1, 1), 30)
            node.nodes.set("task1", taskNode1)
            const taskNode2 = new TaskNode(dataProvider, node, "task2", new Date(2015, 1, 1), 10)
            node.nodes.set("task2", taskNode2)

            const relation: TaskRelation = {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task3",
                lag: 0
            }
            node.addTaskRelation(relation).then(() => {
                done(new Error("Input error should be detected"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should add a delay", (done) => {
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, graph, "project")
            const delayNode = new DelayNode(dataProvider, node, "delay1", new Date(2015, 2, 1))
            node.delays.set("delay1", delayNode)
            const delay: DelayDefinition = {
                identifier: "delay2",
                name: "Delay 2",
                description: "Description 2",
                date: new Date(2015, 1, 1)
            }
            mock.expects("addDelay").once().withExactArgs("project", delay).returns(Promise.resolve())

            node.addDelay(delay).then(() => {
                const delayNode = maputils.get(node.delays, "delay2")
                chai.expect(delayNode.delayIdentifier).to.equal("delay2")
                chai.expect(delayNode.initialMargin).to.equal(0)
                chai.expect(delayNode.margin).to.equal(0)
                mock.verify()
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
            const delayNode = new DelayNode(dataProvider, node, "delay1", new Date(2015, 2, 1))
            node.delays.set("delay1", delayNode)
            const delay: DelayDefinition = {
                identifier: "delay1",
                name: "Delay 1",
                description: "Description 1",
                date: new Date(2015, 1, 1)
            }

            node.addDelay(delay).then(() => {
                done(new Error("Input error should be detected"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(ExistsError)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should add a delay relation 1", (done) => {
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, graph, "project")
            const taskNode = new TaskNode(dataProvider, node, "task", new Date(2015, 2, 1), 31)
            node.nodes.set("task", taskNode)
            const delayNode = new DelayNode(dataProvider, node, "delay", new Date(2015, 3, 11))
            node.delays.set("delay", delayNode)

            const relation: DelayRelation = {
                delay: "delay",
                task: "task",
                lag: 0
            }
            mock.expects("addDelayRelation").once().withExactArgs("project", relation).returns(Promise.resolve())

            node.addDelayRelation(relation).then(() => {
                const delayNode = maputils.get(node.delays, "delay")
                chai.expect(delayNode.delayIdentifier).to.equal("delay")
                chai.expect(delayNode.initialMargin).to.equal(10)
                chai.expect(delayNode.margin).to.equal(10)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should add a delay relation 2", (done) => {
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, graph, "project")
            const taskNode = new TaskNode(dataProvider, node, "task", new Date(2015, 2, 1), 31)
            node.nodes.set("task", taskNode)
            const delayNode = new DelayNode(dataProvider, node, "delay", new Date(2015, 3, 11))
            node.delays.set("delay", delayNode)

            const relation: DelayRelation = {
                delay: "delay",
                task: "task",
                lag: 5
            }
            mock.expects("addDelayRelation").once().withExactArgs("project", relation).returns(Promise.resolve())

            node.addDelayRelation(relation).then(() => {
                const delayNode = maputils.get(node.delays, "delay")
                chai.expect(delayNode.delayIdentifier).to.equal("delay")
                chai.expect(delayNode.initialMargin).to.equal(5)
                chai.expect(delayNode.margin).to.equal(5)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw error when adding relation with invalid delay node", (done) => {
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, graph, "project")
            const taskNode = new TaskNode(dataProvider, node, "task", new Date(2015, 2, 1), 31)
            node.nodes.set("task", taskNode)
            const delayNode = new DelayNode(dataProvider, node, "delay", new Date(2015, 3, 11))
            node.delays.set("delay", delayNode)

            const relation: DelayRelation = {
                delay: "delay2",
                task: "task",
                lag: 0
            }
            node.addDelayRelation(relation).then(() => {
                done(new Error("Input error should be detected"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw error when adding relation with invalid task node", (done) => {
            const dataProvider = new FakeDataProvider()
            const graph = new FakeGraph()
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, graph, "project")
            const taskNode = new TaskNode(dataProvider, node, "task", new Date(2015, 2, 1), 31)
            node.nodes.set("task", taskNode)
            const delayNode = new DelayNode(dataProvider, node, "delay", new Date(2015, 3, 11))
            node.delays.set("delay", delayNode)

            const relation: DelayRelation = {
                delay: "delay",
                task: "task2",
                lag: 0
            }
            node.addDelayRelation(relation).then(() => {
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
