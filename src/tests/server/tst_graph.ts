import * as chai from "chai"
import * as sinon from "sinon"
import { Task, TaskResults, TaskRelation, Modifier } from "../../common/types"
import { FakeDataProvider } from "./fakedataprovider"
import { GraphError } from "../../server/core/graph/types"
import { ProjectNode, TaskNode } from "../../server/core/graph/graph"
import * as maputils from "../../common/maputils"

describe("Graph", () => {
    describe("TaskNode", () => {
        it("Should not compute when not needed", (done) => {
            const dataprovider = new FakeDataProvider()
            const node = new TaskNode(dataprovider, "project", "task", new Date(2015, 2, 1), 20,
                                      new Date(2015, 2, 1), 20)
            node.compute().then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should compute the correct results", (done) => {
            // Mock
            const dataprovider = new FakeDataProvider()
            let mock = sinon.mock(dataprovider)
            const arg: TaskResults = {
                projectIdentifier: "project",
                taskIdentifier: "task",
                startDate: new Date(2015, 2, 5),
                duration: 20
            }
            mock.expects("setTaskResults").once().withArgs(arg).returns(Promise.resolve())

            // Test
            const node = new TaskNode(dataprovider, "project", "task", new Date(2015, 2, 1), 20,
                                      new Date(2015, 2, 5), 25)
            node.compute().then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get error on invalid input", (done) => {
            const dataprovider = new FakeDataProvider()
            const node = new TaskNode(dataprovider, "project", "task", new Date(2015, 2, 1), 20,
                                      new Date(NaN), 20)
            node.compute().then(() => {
                done(new Error("Input error should be detected"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(GraphError)
                done()
            })
        })
        it("Should compute the correct results based on modifiers", (done) => {
            // Mock
            const dataprovider = new FakeDataProvider()
            let mock = sinon.mock(dataprovider)
            const arg: TaskResults = {
                projectIdentifier: "project",
                taskIdentifier: "task",
                startDate: new Date(2015, 2, 1),
                duration: 23
            }
            mock.expects("setTaskResults").once().withArgs(arg).returns(Promise.resolve())

            // Test
            const node = new TaskNode(dataprovider, "project", "task", new Date(2015, 2, 1), 20,
                                      new Date(2015, 2, 1), 20)
            node.modifiers = [
                {
                    projectIdentifier: "project",
                    name: "Modifier 1",
                    description: "Description 1",
                    duration: 5
                },
                {
                    projectIdentifier: "project",
                    name: "Modifier 2",
                    description: "Description 2",
                    duration: -2
                }
            ]

            node.compute().then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should compute children when adding", (done) => {
            // Mock
            const dataprovider = new FakeDataProvider()
            let mock = sinon.mock(dataprovider)
            const arg: TaskResults = {
                projectIdentifier: "project",
                taskIdentifier: "task2",
                startDate: new Date(2015, 2, 21),
                duration: 15
            }
            mock.expects("setTaskResults").once().withArgs(arg).returns(Promise.resolve())

            // Test
            const node1 = new TaskNode(dataprovider, "project", "task1", new Date(2015, 2, 1), 20,
                                       new Date(2015, 2, 1), 20)
            const node2 = new TaskNode(dataprovider, "project", "task2", new Date(2015, 1, 1), 15,
                                       new Date(2015, 1, 1), 0)

            node1.addChild(node2).then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should recompute when adding modifiers", (done) => {
            // Mock
            const dataprovider = new FakeDataProvider()
            let mock = sinon.mock(dataprovider)
            const modifier: Modifier = {
                projectIdentifier: "project",
                name: "Modifier 1",
                description: "Description 1",
                duration: 2
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
            const node1 = new TaskNode(dataprovider, "project", "task1", new Date(2015, 2, 1), 20,
                                       new Date(2015, 2, 1), 20)
            const node2 = new TaskNode(dataprovider, "project", "task2", new Date(2015, 1, 1), 15,
                                       new Date(2015, 1, 1), 0)

            node1.addChild(node2).then(() => {
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
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should correctly compute milestones", (done) => {
            // Mock
            const dataprovider = new FakeDataProvider()
            let mock = sinon.mock(dataprovider)
            const modifier: Modifier = {
                projectIdentifier: "project",
                name: "Modifier 1",
                description: "Description 1",
                duration: 2
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
            const node1 = new TaskNode(dataprovider, "project", "task1", new Date(2015, 2, 1), 0,
                                       new Date(2015, 2, 1), 0)

            node1.addModifier(modifier).then(() => {
                chai.expect(node1.startDate).to.deep.equal(new Date(2015, 2, 3))
                chai.expect(node1.duration).to.equal(0)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should throw error when adding invalid modifier", (done) => {
            // Mock
            const dataprovider = new FakeDataProvider()
            let mock = sinon.mock(dataprovider)
            const modifier: Modifier = {
                projectIdentifier: "project2",
                name: "Modifier 1",
                description: "Description 1",
                duration: 2
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
            const node1 = new TaskNode(dataprovider, "project", "task1", new Date(2015, 2, 1), 20,
                                       new Date(2015, 2, 1), 20)
            const node2 = new TaskNode(dataprovider, "project", "task2", new Date(2015, 1, 1), 15,
                                       new Date(2015, 1, 1), 0)

            node1.addChild(node2).then(() => {
                return node1.addModifier(modifier)
            }).then(() => {
                done(new Error("Error should be thrown when adding invalid modifier"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(GraphError)
                done()
            })
        })
        it("Should detect cyclic dependencies", (done) => {
            // Mock
            const dataprovider = new FakeDataProvider()
            let mock = sinon.mock(dataprovider)
            const arg: TaskResults = {
                projectIdentifier: "project",
                taskIdentifier: "task2",
                startDate: new Date(2015, 2, 21),
                duration: 15
            }
            mock.expects("setTaskResults").once().withArgs(arg).returns(Promise.resolve())

            // Test
            const node1 = new TaskNode(dataprovider, "project", "task1", new Date(2015, 2, 1), 20,
                                       new Date(2015, 2, 1), 20)
            const node2 = new TaskNode(dataprovider, "project", "task2", new Date(2015, 1, 1), 15,
                                       new Date(2015, 1, 1), 0)

            node1.addChild(node2).then(() => {
                return node2.addChild(node1)
            }).then(() => {
                done(new Error("Cyclic dependency should be detected"))
            }).catch((error: Error) => {
                chai.expect(error).to.instanceOf(GraphError)
                done()
            })
        })
    })
    describe("ProjectNode", () => {
        it("Should load the node", (done) => {
            // Mock
            const dataprovider = new FakeDataProvider()
            let mock = sinon.mock(dataprovider)
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
                    startDate: new Date(2016, 10, 26),
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
                    duration: 5
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
                    duration: 10
                },
                {
                    projectIdentifier: "project",
                    name: "Short modifier 2",
                    description: "Short modifier 2 description",
                    duration: 24
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
                    next: "long"
                },
                {
                    projectIdentifier: "project",
                    previous: "root",
                    next: "short"
                }
            ]
            mock.expects("getTaskRelations").once().withArgs("project", "root")
                .returns(Promise.resolve(rootRelations))
            const longRelations: Array<TaskRelation> = [
                {
                    projectIdentifier: "project",
                    previous: "long",
                    next: "reducing"
                }
            ]
            mock.expects("getTaskRelations").once().withArgs("project", "long")
                .returns(Promise.resolve(longRelations))
            const shortRelations: Array<TaskRelation> = [
                {
                    projectIdentifier: "project",
                    previous: "short",
                    next: "reducing"
                }
            ]
            mock.expects("getTaskRelations").once().withArgs("project", "short")
                .returns(Promise.resolve(shortRelations))
            mock.expects("getTaskRelations").once().withArgs("project", "reducing")
                .returns(Promise.resolve([]))


            // Test
            let node = new ProjectNode(dataprovider, "project")
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
                chai.expect(reducing.startDate).to.deep.equal(new Date(2016, 10, 26))
                chai.expect(reducing.duration).to.equal(30)
                chai.expect(reducing.modifiers).to.deep.equal([])
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
