import * as chai from "chai"
import * as sinon from "sinon"
import { Project, TaskDefinition, TaskLocation, Modifier, DelayDefinition } from "../../common/types"
import { NotFoundError } from "../../common/errors"
import { ApiTask, ApiTaskResults, createApiTask, createApiDelay } from "../../common/apitypes"
import { IDataProvider, CorruptedError, InternalError } from "../../server/core/data/idataprovider"
import { Api, RequestError } from "../../server/core/api"
import { ProjectNode, TaskNode, DelayNode } from "../../server/core/graph/graph"
import { FakeDataProvider } from "./fakedataprovider"
import { FakeGraph, FakeProjectNode, FakeTaskNode } from "./fakegraph"
import { FakeError } from "./fakeerror"
import * as maputils from "../../common/maputils"
import * as winston from "winston"

winston.clear()

describe("API", () => {
    describe("getProjectTasks", () => {
        it("Should get project tasks", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const tasks: Array<TaskDefinition> = [
                {
                    identifier: "task1",
                    name: "Task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 1, 1),
                    estimatedDuration: 30
                },
                {
                    identifier: "task2",
                    name: "Task 2",
                    description: "Description 2",
                    estimatedStartDate: new Date(2016, 1, 15),
                    estimatedDuration: 15
                }
            ]
            mock.expects("getProjectTasks").once().withExactArgs("project")
                .returns(Promise.resolve(tasks))
            let projectNode = new FakeProjectNode(graph, "project")
            projectNode.nodes.set("task1", new FakeTaskNode(projectNode, "task1", new Date(2016, 1, 5), 35))
            projectNode.nodes.set("task2", new FakeTaskNode(projectNode, "task2", new Date(2016, 1, 15), 16))
            graph.nodes.set("project", projectNode)

            const expected: Array<ApiTask> = [
                {
                    identifier: "task1",
                    name: "Task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 1, 1).toISOString(),
                    estimatedDuration: 30,
                    startDate: new Date(2016, 1, 5).toISOString(),
                    duration: 35
                },
                {
                    identifier: "task2",
                    name: "Task 2",
                    description: "Description 2",
                    estimatedStartDate: new Date(2016, 1, 15).toISOString(),
                    estimatedDuration: 15,
                    startDate: new Date(2016, 1, 15).toISOString(),
                    duration: 16
                }
            ]

            api.getProjectTasks("project").then((tasks: Array<ApiTask>) => {
                chai.expect(tasks).to.deep.equal(expected)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting project tasks 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getProjectTasks").once().withExactArgs("project")
                .returns(Promise.reject(new CorruptedError("Some error")))

            api.getProjectTasks("project").then(() => {
                done(new Error("getProjectTasks should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting project tasks 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getProjectTasks").once().withExactArgs("project")
                .returns(Promise.reject(new InternalError("Some error")))

            api.getProjectTasks("project").then(() => {
                done(new Error("getProjectTasks should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting project tasks 3", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getProjectTasks").once().withExactArgs("project")
                .returns(Promise.reject(new NotFoundError("Some error")))

            api.getProjectTasks("project").then(() => {
                done(new Error("getProjectTasks should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting project tasks 4", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const tasks: Array<TaskDefinition> = [
                {
                    identifier: "task1",
                    name: "Task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 1, 1),
                    estimatedDuration: 30
                },
                {
                    identifier: "task2",
                    name: "Task 2",
                    description: "Description 2",
                    estimatedStartDate: new Date(2016, 1, 15),
                    estimatedDuration: 15
                }
            ]
            mock.expects("getProjectTasks").once().withExactArgs("project")
                .returns(Promise.resolve(tasks))

            api.getProjectTasks("project").then(() => {
                done(new Error("getProjectTasks should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting project tasks 5", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const tasks: Array<TaskDefinition> = [
                {
                    identifier: "task1",
                    name: "Task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 1, 1),
                    estimatedDuration: 30
                },
                {
                    identifier: "task2",
                    name: "Task 2",
                    description: "Description 2",
                    estimatedStartDate: new Date(2016, 1, 15),
                    estimatedDuration: 15
                }
            ]
            mock.expects("getProjectTasks").once().withExactArgs("project")
                .returns(Promise.resolve(tasks))
            let projectNode = new FakeProjectNode(graph, "project")
            graph.nodes.set("project", projectNode)

            api.getProjectTasks("project").then(() => {
                done(new Error("getProjectTasks should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting project tasks 6", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            api.getProjectTasks({value: "test"}).then(() => {
                done(new Error("getProjectTasks should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting project tasks 7", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getProjectTasks").once().withExactArgs("project")
                .returns(Promise.reject(new FakeError("Some error")))

            api.getProjectTasks("project").then(() => {
                done(new Error("getProjectTasks should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
    describe("getTask", () => {
        it("Should get task 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            mock.expects("getProject").once().withExactArgs("project").returns(Promise.resolve(project))
            const task: TaskDefinition = {
                identifier: "task",
                name: "Task",
                description: "Description",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 15
            }
            mock.expects("getTask").once().withExactArgs("project", "task").returns(Promise.resolve(task))
            const delay: DelayDefinition = {
                identifier: "delay",
                name: "Delay",
                description: "Description",
                date: new Date(2016, 2, 20)
            }
            mock.expects("getDelay").once().withExactArgs("project", "delay").returns(Promise.resolve(delay))
            graph.nodes.set("project", new ProjectNode(dataProvider, graph, "project"))
            const modifiers: Array<Modifier> = [
                {
                    name: "Modifier 1",
                    description: "Description 1",
                    duration: 4,
                    location: TaskLocation.Beginning
                },
                {
                    name: "Modifier 2",
                    description: "Description 2",
                    duration: 2,
                    location: TaskLocation.End
                }
            ]
            let projectNode = maputils.get(graph.nodes, "project")
            let taskNode = new TaskNode(dataProvider, projectNode, task.identifier,
                                        task.estimatedStartDate, task.estimatedDuration)
            const delayNode = new DelayNode(dataProvider, projectNode, "delay", new Date(2016, 2, 20))
            taskNode.modifiers = modifiers
            projectNode.nodes.set("task", taskNode)
            projectNode.delays.set("delay", delayNode)

            taskNode.addDelay(delayNode, {
                delay: "delay",
                task: "task",
                lag: 0
            })

            const expected: ApiTaskResults = {
                project,
                task: createApiTask(task, new Date(2016, 2, 1), 15),
                modifiers,
                delays: [createApiDelay(delay, 4, 4)]
            }

            api.getTask("project", "task").then((task: ApiTaskResults) => {
                chai.expect(task).to.deep.equal(expected)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get task 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            mock.expects("getProject").once().withExactArgs("project").returns(Promise.resolve(project))
            const task1: TaskDefinition = {
                identifier: "task1",
                name: "Task 1",
                description: "Description 1",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 15
            }
            const task2: TaskDefinition = {
                identifier: "task2",
                name: "Task 2",
                description: "Description 2",
                estimatedStartDate: new Date(2016, 2, 16),
                estimatedDuration: 0
            }
            mock.expects("getTask").once().withExactArgs("project", "task1").returns(Promise.resolve(task1))
            const delay: DelayDefinition = {
                identifier: "delay",
                name: "Delay",
                description: "Description",
                date: new Date(2016, 2, 20)
            }
            mock.expects("getDelay").once().withExactArgs("project", "delay").returns(Promise.resolve(delay))
            graph.nodes.set("project", new ProjectNode(dataProvider, graph, "project"))
            let projectNode = maputils.get(graph.nodes, "project")
            let task1Node = new TaskNode(dataProvider, projectNode, task1.identifier,
                                         task1.estimatedStartDate, task1.estimatedDuration)
            let task2Node = new TaskNode(dataProvider, projectNode, task2.identifier,
                                         task2.estimatedStartDate, task2.estimatedDuration)
            const delayNode = new DelayNode(dataProvider, projectNode, "delay", new Date(2016, 2, 20))
            projectNode.nodes.set("task1", task1Node)
            projectNode.nodes.set("task2", task2Node)
            projectNode.delays.set("delay", delayNode)

            task1Node.addChild(task2Node, {
                previous: "task1",
                previousLocation: TaskLocation.End,
                next: "task2",
                lag: 0
            })
            task2Node.addDelay(delayNode, {
                delay: "delay",
                task: "task2",
                lag: 0
            })

            const expected: ApiTaskResults = {
                project,
                task: createApiTask(task1, new Date(2016, 2, 1), 15),
                modifiers: [],
                delays: [createApiDelay(delay, 4, 4)]
            }

            api.getTask("project", "task1").then((task: ApiTaskResults) => {
                chai.expect(task).to.deep.equal(expected)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting task 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getTask").once().withExactArgs("project", "task")
                .returns(Promise.reject(new CorruptedError("Some error")))

            api.getTask("project", "task").then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting task 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getTask").once().withExactArgs("project", "task")
                .returns(Promise.reject(new InternalError("Some error")))

            api.getTask("project", "task").then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting task 3", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getProject").once().withExactArgs("project")
                .returns(Promise.reject(new CorruptedError("Some error")))
            const task: TaskDefinition = {
                identifier: "task",
                name: "Task",
                description: "Description",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 15
            }
            mock.expects("getTask").once().withExactArgs("project", "task").returns(Promise.resolve(task))

            api.getTask("project", "task").then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting task 4", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getProject").once().withExactArgs("project")
                .returns(Promise.reject(new InternalError("Some error")))
            const task: TaskDefinition = {
                identifier: "task",
                name: "Task",
                description: "Description",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 15
            }
            mock.expects("getTask").once().withExactArgs("project", "task").returns(Promise.resolve(task))

            api.getTask("project", "task").then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting task 5", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            mock.expects("getProject").once().withExactArgs("project").returns(Promise.resolve(project))
            const task: TaskDefinition = {
                identifier: "task",
                name: "Task",
                description: "Description",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 15
            }
            mock.expects("getTask").once().withExactArgs("project", "task").returns(Promise.resolve(task))

            api.getTask("project", "task").then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting task 6", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            mock.expects("getProject").once().withExactArgs("project").returns(Promise.resolve(project))
            const task: TaskDefinition = {
                identifier: "task",
                name: "Task",
                description: "Description",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 15
            }
            mock.expects("getTask").once().withExactArgs("project", "task").returns(Promise.resolve(task))
            graph.nodes.set("project", new ProjectNode(dataProvider, graph, "project"))

            api.getTask("project", "task").then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting task 7", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            api.getTask({value: "test"}, "task").then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting task 8", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            api.getTask("project", {value: "test"}).then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting task 9", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getTask").once().withExactArgs("project", "task")
                .returns(Promise.reject(new FakeError("Some error")))

            api.getTask("project", "task").then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
                mock.verify()
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
