import * as chai from "chai"
import * as sinon from "sinon"
import { Project, Task, TaskResults, TaskRelation, Modifier, TaskLocation } from "../../common/types"
import { InputError, NotFoundError, ExistsError } from "../../common/errors"
import { FakeDataProvider } from "./fakedataprovider"
import { GraphError } from "../../server/core/graph/types"
import { Graph, ProjectNode, TaskNode } from "../../server/core/graph/graph"
import * as maputils from "../../common/maputils"

describe("Graph", () => {
    describe("TaskNode", () => {
        it("Should not compute when not needed", (done) => {
            const dataProvider = new FakeDataProvider()
            const node = new TaskNode(dataProvider, "project", "task", new Date(2015, 2, 1), 20,
                                      new Date(2015, 2, 1), 20)
            node.compute().then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should compute the correct results", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)
            const arg: TaskResults = {
                projectIdentifier: "project",
                taskIdentifier: "task",
                startDate: new Date(2015, 2, 1),
                duration: 20
            }
            mock.expects("setTaskResults").once().withArgs(arg).returns(Promise.resolve())

            // Test
            const node = new TaskNode(dataProvider, "project", "task", new Date(2015, 2, 1), 20,
                                      new Date(2015, 2, 5), 25)
            node.compute().then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get error on invalid input", (done) => {
            const dataProvider = new FakeDataProvider()
            const node = new TaskNode(dataProvider, "project", "task", new Date(NaN), 20,
                                      new Date(2015, 2, 1), 20)
            node.compute().then(() => {
                done(new Error("Input error should be detected"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(GraphError)
                done()
            })
        })
        it("Should compute the correct results based on modifiers 1", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)
            const arg: TaskResults = {
                projectIdentifier: "project",
                taskIdentifier: "task",
                startDate: new Date(2015, 2, 1),
                duration: 23
            }
            mock.expects("setTaskResults").once().withArgs(arg).returns(Promise.resolve())

            // Test
            const node = new TaskNode(dataProvider, "project", "task", new Date(2015, 2, 1), 20,
                                      new Date(2015, 2, 1), 20)
            node.modifiers = [
                {
                    projectIdentifier: "project",
                    name: "Modifier 1",
                    description: "Description 1",
                    duration: 5,
                    location: TaskLocation.End
                },
                {
                    projectIdentifier: "project",
                    name: "Modifier 2",
                    description: "Description 2",
                    duration: -2,
                    location: TaskLocation.End
                }
            ]

            node.compute().then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should compute the correct results based on modifiers 2", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)
            const arg: TaskResults = {
                projectIdentifier: "project",
                taskIdentifier: "task",
                startDate: new Date(2015, 2, 4),
                duration: 20
            }
            mock.expects("setTaskResults").once().withArgs(arg).returns(Promise.resolve())

            // Test
            const node = new TaskNode(dataProvider, "project", "task", new Date(2015, 2, 1), 20,
                                      new Date(2015, 2, 1), 20)
            node.modifiers = [
                {
                    projectIdentifier: "project",
                    name: "Modifier 1",
                    description: "Description 1",
                    duration: 5,
                    location: TaskLocation.Beginning
                },
                {
                    projectIdentifier: "project",
                    name: "Modifier 2",
                    description: "Description 2",
                    duration: -2,
                    location: TaskLocation.Beginning
                }
            ]

            node.compute().then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should compute children when adding", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)
            const arg: TaskResults = {
                projectIdentifier: "project",
                taskIdentifier: "task2",
                startDate: new Date(2015, 2, 21),
                duration: 15
            }
            mock.expects("setTaskResults").once().withArgs(arg).returns(Promise.resolve())

            // Test
            const node1 = new TaskNode(dataProvider, "project", "task1", new Date(2015, 2, 1), 20,
                                       new Date(2015, 2, 1), 20)
            const node2 = new TaskNode(dataProvider, "project", "task2", new Date(2015, 1, 1), 15,
                                       new Date(2015, 1, 1), 0)

            node1.addChild(node2, {
                projectIdentifier: "project",
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                nextLocation: TaskLocation.Beginning,
                lag: 0
            }).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should recompute when adding modifiers", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)
            const modifier: Modifier = {
                projectIdentifier: "project",
                name: "Modifier 1",
                description: "Description 1",
                duration: 2,
                location: TaskLocation.End
            }
            const results: Array<TaskResults> = [
                {
                    projectIdentifier: "project",
                    taskIdentifier: "task2",
                    startDate: new Date(2015, 2, 21),
                    duration: 15
                },
                {
                    projectIdentifier: "project",
                    taskIdentifier: "task1",
                    startDate: new Date(2015, 2, 1),
                    duration: 22
                },
                {
                    projectIdentifier: "project",
                    taskIdentifier: "task2",
                    startDate: new Date(2015, 2, 23),
                    duration: 15
                }
            ]
            mock.expects("addModifier").once().withArgs(modifier).returns(Promise.resolve(1))
            mock.expects("setModifierForTask").once().withArgs("project", 1, "task1")
                .returns(Promise.resolve())
            const expectations = results.map((result: TaskResults) => {
                return mock.expects("setTaskResults").once().withArgs(result).returns(Promise.resolve())
            })

            // Test
            const node1 = new TaskNode(dataProvider, "project", "task1", new Date(2015, 2, 1), 20,
                                       new Date(2015, 2, 1), 20)
            const node2 = new TaskNode(dataProvider, "project", "task2", new Date(2015, 1, 1), 15,
                                       new Date(2015, 1, 1), 0)

            node1.addChild(node2, {
                projectIdentifier: "project",
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                nextLocation: TaskLocation.Beginning,
                lag: 0
            }).then(() => {
                chai.expect(expectations[0].called).to.true
                chai.expect(expectations[1].called).to.false
                chai.expect(expectations[2].called).to.false
                return node1.addModifier(modifier)
            }).then(() => {
                chai.expect(node1.startDate).to.deep.equal(new Date(2015, 2, 1))
                chai.expect(node1.duration).to.equal(22)
                chai.expect(node2.startDate).to.deep.equal(new Date(2015, 2, 23))
                chai.expect(node2.duration).to.equal(15)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should correctly compute milestones", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)
            const modifier: Modifier = {
                projectIdentifier: "project",
                name: "Modifier 1",
                description: "Description 1",
                duration: 2,
                location: TaskLocation.End
            }
            const results: TaskResults = {
                projectIdentifier: "project",
                taskIdentifier: "task1",
                startDate: new Date(2015, 2, 3),
                duration: 0
            }
            mock.expects("addModifier").once().withArgs(modifier).returns(Promise.resolve(1))
            mock.expects("setModifierForTask").once().withArgs("project", 1, "task1")
                .returns(Promise.resolve())
            mock.expects("setTaskResults").once().withArgs(results).returns(Promise.resolve())

            // Test
            const node1 = new TaskNode(dataProvider, "project", "task1", new Date(2015, 2, 1), 0,
                                       new Date(2015, 2, 1), 0)

            node1.addModifier(modifier).then(() => {
                chai.expect(node1.startDate).to.deep.equal(new Date(2015, 2, 3))
                chai.expect(node1.duration).to.equal(0)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw error when adding invalid modifier", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)
            const modifier: Modifier = {
                projectIdentifier: "project2",
                name: "Modifier 1",
                description: "Description 1",
                duration: 2,
                location: TaskLocation.End
            }
            const results: Array<TaskResults> = [
                {
                    projectIdentifier: "project",
                    taskIdentifier: "task2",
                    startDate: new Date(2015, 2, 21),
                    duration: 15
                }
            ]
            const expectations = results.map((result: TaskResults) => {
                return mock.expects("setTaskResults").once().withArgs(result).returns(Promise.resolve())
            })

            // Test
            const node1 = new TaskNode(dataProvider, "project", "task1", new Date(2015, 2, 1), 20,
                                       new Date(2015, 2, 1), 20)
            const node2 = new TaskNode(dataProvider, "project", "task2", new Date(2015, 1, 1), 15,
                                       new Date(2015, 1, 1), 0)

            node1.addChild(node2, {
                projectIdentifier: "project",
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                nextLocation: TaskLocation.Beginning,
                lag: 0
            }).then(() => {
                return node1.addModifier(modifier)
            }).then(() => {
                done(new Error("Error should be thrown when adding invalid modifier"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InputError)
                done()
            })
        })
        it("Should detect cyclic dependencies", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)
            const arg: TaskResults = {
                projectIdentifier: "project",
                taskIdentifier: "task2",
                startDate: new Date(2015, 2, 21),
                duration: 15
            }
            mock.expects("setTaskResults").once().withArgs(arg).returns(Promise.resolve())

            // Test
            const node1 = new TaskNode(dataProvider, "project", "task1", new Date(2015, 2, 1), 20,
                                       new Date(2015, 2, 1), 20)
            const node2 = new TaskNode(dataProvider, "project", "task2", new Date(2015, 1, 1), 15,
                                       new Date(2015, 1, 1), 0)

            node1.addChild(node2, {
                projectIdentifier: "project",
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                nextLocation: TaskLocation.Beginning,
                lag: 0
            }).then(() => {
                return node2.addChild(node1, {
                projectIdentifier: "project",
                previous: "task2",
                previousLocation: TaskLocation.End,
                next: "task1",
                nextLocation: TaskLocation.Beginning,
                lag: 0
            })
            }).then(() => {
                done(new Error("Cyclic dependency should be detected"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(GraphError)
                done()
            })
        })
    })
    describe("ProjectNode", () => {
        it("Should load the node", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)
            const tasks: Array<Task> = [
                {
                    projectIdentifier: "project",
                    identifier: "root",
                    name: "Root task",
                    description: "Project beginning",
                    estimatedStartDate: new Date(2016, 7, 15),
                    estimatedDuration: 31
                },
                {
                    projectIdentifier: "project",
                    identifier: "long",
                    name: "Long task",
                    description: "Some long task",
                    estimatedStartDate: new Date(2016, 8, 15),
                    estimatedDuration: 60
                },
                {
                    projectIdentifier: "project",
                    identifier: "short",
                    name: "Short task",
                    description: "Some short task",
                    estimatedStartDate: new Date(2016, 8, 15),
                    estimatedDuration: 31
                },
                {
                    projectIdentifier: "project",
                    identifier: "reducing",
                    name: "Reducing task",
                    description: "Task depending on two tasks",
                    estimatedStartDate: new Date(2016, 10, 16),
                    estimatedDuration: 30
                }
            ]
            const results: Array<TaskResults> = [
                {
                    projectIdentifier: "project",
                    taskIdentifier: "root",
                    startDate: new Date(2016, 7, 15),
                    duration: 36
                },
                {
                    projectIdentifier: "project",
                    taskIdentifier: "long",
                    startDate: new Date(2016, 8, 20),
                    duration: 60
                },
                {
                    projectIdentifier: "project",
                    taskIdentifier: "short",
                    startDate: new Date(2016, 8, 20),
                    duration: 65
                },
                {
                    projectIdentifier: "project",
                    taskIdentifier: "reducing",
                    startDate: new Date(2016, 10, 24),
                    duration: 30
                }
            ]
            mock.expects("getProjectTasks").once().returns(Promise.resolve(tasks))
            results.forEach((result: TaskResults) => {
                mock.expects("getTaskResults").once().withArgs(result.projectIdentifier, result.taskIdentifier)
                    .returns(Promise.resolve(result))
            })
            const rootModifiers: Array<Modifier> = [
                {
                    projectIdentifier: "project",
                    name: "Root modifier",
                    description: "Root modifier description",
                    duration: 5,
                    location: TaskLocation.End
                }
            ]
            mock.expects("getTaskModifiers").once().withArgs("project", "root")
                .returns(Promise.resolve(rootModifiers))
            mock.expects("getTaskModifiers").once().withArgs("project", "long")
                .returns(Promise.resolve([]))
            const shortModifiers: Array<Modifier> = [
                {
                    projectIdentifier: "project",
                    name: "Short modifier 1",
                    description: "Short modifier 1 description",
                    duration: 10,
                    location: TaskLocation.End
                },
                {
                    projectIdentifier: "project",
                    name: "Short modifier 2",
                    description: "Short modifier 2 description",
                    duration: 24,
                    location: TaskLocation.End
                }
            ]
            mock.expects("getTaskModifiers").once().withArgs("project", "short")
                .returns(Promise.resolve(shortModifiers))
            mock.expects("getTaskModifiers").once().withArgs("project", "reducing")
                .returns(Promise.resolve([]))
            const rootRelations: Array<TaskRelation> = [
                {
                    projectIdentifier: "project",
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "long",
                    nextLocation: TaskLocation.Beginning,
                    lag: 0
                },
                {
                    projectIdentifier: "project",
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "short",
                    nextLocation: TaskLocation.Beginning,
                    lag: 0
                }
            ]
            mock.expects("getTaskRelations").once().withArgs("project", "root")
                .returns(Promise.resolve(rootRelations))
            const longRelations: Array<TaskRelation> = [
                {
                    projectIdentifier: "project",
                    previous: "long",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    nextLocation: TaskLocation.Beginning,
                    lag: 0
                }
            ]
            mock.expects("getTaskRelations").once().withArgs("project", "long")
                .returns(Promise.resolve(longRelations))
            const shortRelations: Array<TaskRelation> = [
                {
                    projectIdentifier: "project",
                    previous: "short",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    nextLocation: TaskLocation.Beginning,
                    lag: 0

                }
            ]
            mock.expects("getTaskRelations").once().withArgs("project", "short")
                .returns(Promise.resolve(shortRelations))
            mock.expects("getTaskRelations").once().withArgs("project", "reducing")
                .returns(Promise.resolve([]))


            // Test
            let node = new ProjectNode(dataProvider, "project")
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
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, "project")
            const taskNode = new TaskNode(dataProvider, "project", "task1", new Date(2015, 1, 1), 30,
                                          new Date(2015, 1, 5), 35)
            node.nodes.set("task1", taskNode)
            const task: Task = {
                projectIdentifier: "project",
                identifier: "task2",
                name: "Task 2",
                description: "Description 2",
                estimatedStartDate: new Date(2015, 1, 1),
                estimatedDuration: 10
            }
            const taskResults: TaskResults = {
                projectIdentifier: "project",
                taskIdentifier: "task2",
                startDate: new Date(2015, 1, 1),
                duration: 10
            }
            mock.expects("addTask").once().withArgs(task).returns(Promise.resolve())
            mock.expects("setTaskResults").once().withArgs(taskResults).returns(Promise.resolve())

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
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, "project")
            const taskNode = new TaskNode(dataProvider, "project", "task1", new Date(2015, 1, 1), 30,
                                          new Date(2015, 1, 5), 35)
            node.nodes.set("task1", taskNode)
            const task: Task = {
                projectIdentifier: "project",
                identifier: "task2",
                name: "Task 2",
                description: "Description 2",
                estimatedStartDate: new Date(2015, 1, 1),
                estimatedDuration: 10
            }
            const taskResults: TaskResults = {
                projectIdentifier: "project",
                taskIdentifier: "task2",
                startDate: new Date(2015, 1, 1),
                duration: 10
            }
            mock.expects("addTask").once().withArgs(task).returns(Promise.resolve())
            mock.expects("setTaskResults").once().withArgs(taskResults).returns(Promise.resolve())

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
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, "project")
            const taskNode = new TaskNode(dataProvider, "project", "task1", new Date(2015, 1, 1), 30,
                                          new Date(2015, 1, 5), 35)
            node.nodes.set("task1", taskNode)
            const task: Task = {
                projectIdentifier: "project",
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
            })
        })
        it("Should throw error when adding invalid node", (done) => {
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, "project")
            const taskNode = new TaskNode(dataProvider, "project", "task1", new Date(2015, 1, 1), 30,
                                          new Date(2015, 1, 5), 35)
            node.nodes.set("task1", taskNode)
            const task: Task = {
                projectIdentifier: "project2",
                identifier: "task2",
                name: "Task 2",
                description: "Description 2",
                estimatedStartDate: new Date(2015, 1, 1),
                estimatedDuration: 10
            }

            node.addTask(task).then(() => {
                done(new Error("Input error should be detected"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InputError)
                done()
            })
        })
        it("Should add a relation", (done) => {
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, "project")
            const taskNode1 = new TaskNode(dataProvider, "project", "task1", new Date(2015, 1, 1), 30,
                                           new Date(2015, 1, 1), 30)
            node.nodes.set("task1", taskNode1)
            const taskNode2 = new TaskNode(dataProvider, "project", "task2", new Date(2015, 1, 1), 10,
                                           new Date(2015, 1, 1), 10)
            node.nodes.set("task2", taskNode2)

            const relation: TaskRelation = {
                projectIdentifier: "project",
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                nextLocation: TaskLocation.Beginning,
                lag: 0
            }
            const taskResults: TaskResults = {
                projectIdentifier: "project",
                taskIdentifier: "task2",
                startDate: new Date(2015, 2, 3),
                duration: 10
            }
            mock.expects("addTaskRelation").once().withArgs(relation).returns(Promise.resolve())
            mock.expects("setTaskResults").once().withArgs(taskResults).returns(Promise.resolve())

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
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, "project")
            const taskNode1 = new TaskNode(dataProvider, "project", "task1", new Date(2015, 1, 1), 30,
                                           new Date(2015, 1, 1), 30)
            node.nodes.set("task1", taskNode1)
            const taskNode2 = new TaskNode(dataProvider, "project", "task2", new Date(2015, 1, 1), 10,
                                           new Date(2015, 1, 1), 10)
            node.nodes.set("task2", taskNode2)

            const relation: TaskRelation = {
                projectIdentifier: "project",
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
            })
        })
        it("Should throw error when adding relation with invalid next node", (done) => {
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, "project")
            const taskNode1 = new TaskNode(dataProvider, "project", "task1", new Date(2015, 1, 1), 30,
                                           new Date(2015, 1, 1), 30)
            node.nodes.set("task1", taskNode1)
            const taskNode2 = new TaskNode(dataProvider, "project", "task2", new Date(2015, 1, 1), 10,
                                           new Date(2015, 1, 1), 10)
            node.nodes.set("task2", taskNode2)

            const relation: TaskRelation = {
                projectIdentifier: "project",
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
            })
        })
        it("Should throw error when adding invalid relation", (done) => {
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)

            let node = new ProjectNode(dataProvider, "project")
            const taskNode1 = new TaskNode(dataProvider, "project", "task1", new Date(2015, 1, 1), 30,
                                           new Date(2015, 1, 1), 30)
            node.nodes.set("task1", taskNode1)
            const taskNode2 = new TaskNode(dataProvider, "project", "task2", new Date(2015, 1, 1), 10,
                                           new Date(2015, 1, 1), 10)
            node.nodes.set("task2", taskNode2)

            const relation: TaskRelation = {
                projectIdentifier: "project2",
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                nextLocation: TaskLocation.Beginning,
                lag: 0
            }
            node.addRelation(relation).then(() => {
                done(new Error("Input error should be detected"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InputError)
                done()
            })
        })
    })
    describe("Graph", () => {
        it("Should load the graph", (done) => {
            // Mock
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)
            const projects: Array<Project> = [
                {
                    identifier: "project",
                    name: "Project",
                    description: "Description"
                },
                {
                    identifier: "other",
                    name: "Other project",
                    description: "Other description"
                }
            ]
            const tasks: Array<Task> = [
                {
                    projectIdentifier: "project",
                    identifier: "root",
                    name: "Root task",
                    description: "Project beginning",
                    estimatedStartDate: new Date(2016, 7, 15),
                    estimatedDuration: 31
                },
                {
                    projectIdentifier: "project",
                    identifier: "long",
                    name: "Long task",
                    description: "Some long task",
                    estimatedStartDate: new Date(2016, 8, 15),
                    estimatedDuration: 60
                },
                {
                    projectIdentifier: "project",
                    identifier: "short",
                    name: "Short task",
                    description: "Some short task",
                    estimatedStartDate: new Date(2016, 8, 15),
                    estimatedDuration: 31
                },
                {
                    projectIdentifier: "project",
                    identifier: "reducing",
                    name: "Reducing task",
                    description: "Task depending on two tasks",
                    estimatedStartDate: new Date(2016, 10, 16),
                    estimatedDuration: 30
                }
            ]
            const otherTasks = [
                {
                    projectIdentifier: "other",
                    identifier: "other1",
                    name: "Other task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 2, 1),
                    estimatedDuration: 31
                },
                {
                    projectIdentifier: "other",
                    identifier: "other2",
                    name: "Other task 2",
                    description: "Description 2",
                    estimatedStartDate: new Date(2016, 2, 1),
                    estimatedDuration: 10
                }
            ]
            const results: Array<TaskResults> = [
                {
                    projectIdentifier: "project",
                    taskIdentifier: "root",
                    startDate: new Date(2016, 7, 15),
                    duration: 36
                },
                {
                    projectIdentifier: "project",
                    taskIdentifier: "long",
                    startDate: new Date(2016, 8, 20),
                    duration: 60
                },
                {
                    projectIdentifier: "project",
                    taskIdentifier: "short",
                    startDate: new Date(2016, 8, 20),
                    duration: 65
                },
                {
                    projectIdentifier: "project",
                    taskIdentifier: "reducing",
                    startDate: new Date(2016, 10, 24),
                    duration: 30
                },
                {
                    projectIdentifier: "other",
                    taskIdentifier: "other1",
                    startDate: new Date(2016, 2, 1),
                    duration: 31
                },
                {
                    projectIdentifier: "other",
                    taskIdentifier: "other2",
                    startDate: new Date(2016, 2, 1),
                    duration: 15
                }
            ]
            mock.expects("getAllProjects").once().returns(Promise.resolve(projects))
            mock.expects("getProjectTasks").once().withArgs("project").returns(Promise.resolve(tasks))
            mock.expects("getProjectTasks").once().withArgs("other").returns(Promise.resolve(otherTasks))
            results.forEach((result: TaskResults) => {
                mock.expects("getTaskResults").once().withArgs(result.projectIdentifier, result.taskIdentifier)
                    .returns(Promise.resolve(result))
            })
            const rootModifiers: Array<Modifier> = [
                {
                    projectIdentifier: "project",
                    name: "Root modifier",
                    description: "Root modifier description",
                    duration: 5,
                    location: TaskLocation.End
                }
            ]
            mock.expects("getTaskModifiers").once().withArgs("project", "root")
                .returns(Promise.resolve(rootModifiers))
            mock.expects("getTaskModifiers").once().withArgs("project", "long")
                .returns(Promise.resolve([]))
            const shortModifiers: Array<Modifier> = [
                {
                    projectIdentifier: "project",
                    name: "Short modifier 1",
                    description: "Short modifier 1 description",
                    duration: 10,
                    location: TaskLocation.End
                },
                {
                    projectIdentifier: "project",
                    name: "Short modifier 2",
                    description: "Short modifier 2 description",
                    duration: 24,
                    location: TaskLocation.End
                }
            ]
            mock.expects("getTaskModifiers").once().withArgs("project", "short")
                .returns(Promise.resolve(shortModifiers))
            mock.expects("getTaskModifiers").once().withArgs("project", "reducing")
                .returns(Promise.resolve([]))
            mock.expects("getTaskModifiers").once().withArgs("other", "other1")
                .returns(Promise.resolve([]))
            mock.expects("getTaskModifiers").once().withArgs("other", "other2")
                .returns(Promise.resolve([]))

            const rootRelations: Array<TaskRelation> = [
                {
                    projectIdentifier: "project",
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "long",
                    nextLocation: TaskLocation.Beginning,
                    lag: 0
                },
                {
                    projectIdentifier: "project",
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "short",
                    nextLocation: TaskLocation.Beginning,
                    lag: 0
                }
            ]
            mock.expects("getTaskRelations").once().withArgs("project", "root")
                .returns(Promise.resolve(rootRelations))
            const longRelations: Array<TaskRelation> = [
                {
                    projectIdentifier: "project",
                    previous: "long",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    nextLocation: TaskLocation.Beginning,
                    lag: 0
                }
            ]
            mock.expects("getTaskRelations").once().withArgs("project", "long")
                .returns(Promise.resolve(longRelations))
            const shortRelations: Array<TaskRelation> = [
                {
                    projectIdentifier: "project",
                    previous: "short",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    nextLocation: TaskLocation.Beginning,
                    lag: 0

                }
            ]
            mock.expects("getTaskRelations").once().withArgs("project", "short")
                .returns(Promise.resolve(shortRelations))
            mock.expects("getTaskRelations").once().withArgs("project", "reducing")
                .returns(Promise.resolve([]))
            mock.expects("getTaskRelations").once().withArgs("other", "other1")
                .returns(Promise.resolve([]))
            mock.expects("getTaskRelations").once().withArgs("other", "other2")
                .returns(Promise.resolve([]))


            // Test
            let node = new Graph(dataProvider)
            node.load().then(() => {
                const project = maputils.get(node.nodes, "project")
                const root = maputils.get(project.nodes, "root")
                chai.expect(root.taskIdentifier).to.equal("root")
                chai.expect(root.startDate).to.deep.equal(new Date(2016, 7, 15))
                chai.expect(root.duration).to.equal(36)
                chai.expect(root.modifiers).to.deep.equal(rootModifiers)
                const short = maputils.get(project.nodes, "short")
                chai.expect(short.taskIdentifier).to.equal("short")
                chai.expect(short.startDate).to.deep.equal(new Date(2016, 8, 20))
                chai.expect(short.duration).to.equal(65)
                chai.expect(short.modifiers).to.deep.equal(shortModifiers)
                const long = maputils.get(project.nodes, "long")
                chai.expect(long.taskIdentifier).to.equal("long")
                chai.expect(long.startDate).to.deep.equal(new Date(2016, 8, 20))
                chai.expect(long.duration).to.equal(60)
                chai.expect(long.modifiers).to.deep.equal([])
                const reducing = maputils.get(project.nodes, "reducing")
                chai.expect(reducing.taskIdentifier).to.equal("reducing")
                chai.expect(reducing.startDate).to.deep.equal(new Date(2016, 10, 24))
                chai.expect(reducing.duration).to.equal(30)
                chai.expect(reducing.modifiers).to.deep.equal([])
                const other = maputils.get(node.nodes, "other")
                const other1 = maputils.get(other.nodes, "other1")
                chai.expect(other1.taskIdentifier).to.equal("other1")
                chai.expect(other1.startDate).to.deep.equal(new Date(2016, 2, 1))
                chai.expect(other1.duration).to.equal(31)
                chai.expect(other1.modifiers).to.deep.equal([])
                const other2 = maputils.get(other.nodes, "other2")
                chai.expect(other2.taskIdentifier).to.equal("other2")
                chai.expect(other2.startDate).to.deep.equal(new Date(2016, 2, 1))
                chai.expect(other2.duration).to.equal(15)
                chai.expect(other2.modifiers).to.deep.equal([])
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should add a project", (done) => {
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)

            let node = new Graph(dataProvider)
            const projectNode = new ProjectNode(dataProvider, "project")
            node.nodes.set("project1", projectNode)

            const project: Project = {
                identifier: "project2",
                name: "Project 2",
                description: "Description 2"
            }
            mock.expects("addProject").once().withArgs(project).returns(Promise.resolve())

            node.addProject(project).then(() => {
                const projectNode = maputils.get(node.nodes, "project2")
                chai.expect(projectNode.projectIdentifier).to.equal("project2")
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw error when adding existing project", (done) => {
            const dataProvider = new FakeDataProvider()
            let mock = sinon.mock(dataProvider)

            let node = new Graph(dataProvider)
            const projectNode = new ProjectNode(dataProvider, "project")
            node.nodes.set("project1", projectNode)

            const project: Project = {
                identifier: "project1",
                name: "Project 1",
                description: "Description 1"
            }

            node.addProject(project).then(() => {
                done(new Error("Input error should be detected"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(ExistsError)
                done()
            })
        })
    })
})
