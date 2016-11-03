import * as chai from "chai"
import * as sinon from "sinon"
import { Project, Task, TaskRelation, TaskLocation } from "../../common/types"
import { ExistsError, NotFoundError } from "../../common/errors"
import { ApiInputTask, createTask, createRelation } from "../../common/apitypes"
import { IDataProvider, InternalError } from "../../server/core/data/idataprovider"
import { Api, RequestError } from "../../server/core/api"
import { ProjectNode, TaskNode } from "../../server/core/graph/graph"
import { FakeDataProvider } from "./fakedataprovider"
import { FakeGraph, FakeProjectNode, FakeTaskNode } from "./fakegraph"
import { FakeError } from "./fakeerror"
import * as maputils from "../../common/maputils"
import * as winston from "winston"

winston.clear()

describe("API", () => {
    describe("import", () => {
        it("Should import tasks 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(graph)

            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            const tasks: Array<ApiInputTask> = [
                {
                    identifier: "root",
                    name: "Root task",
                    description: "Project beginning",
                    estimatedStartDate: new Date(2016, 7, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "long",
                    name: "Long task",
                    description: "Some long task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 60
                },
                {
                    identifier: "short",
                    name: "Short task",
                    description: "Some short task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "reducing",
                    name: "Reducing task",
                    description: "Task depending on two tasks",
                    estimatedStartDate: new Date(2016, 10, 16).toISOString(),
                    estimatedDuration: 30
                }
            ]
            let projectNode = new FakeProjectNode(graph, "project")
            mock.expects("addProject").once().withExactArgs(project).returns(Promise.resolve(projectNode))
            let projectNodeMock = sinon.mock(projectNode)
            tasks.map((task: ApiInputTask) => {
                const startDate = new Date(task.estimatedStartDate)
                const taskNode = new FakeTaskNode(projectNode, task.identifier, startDate, task.estimatedDuration)
                projectNodeMock.expects("addTask").once().withExactArgs(createTask(task))
                               .returns(Promise.resolve(taskNode))
            })

            api.import(project, tasks, []).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should import tasks 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(graph)

            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            const tasks: Array<ApiInputTask> = [
                {
                    identifier: "root",
                    name: "Root task",
                    description: "Project beginning",
                    estimatedStartDate: new Date(2016, 7, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "long",
                    name: "Long task",
                    description: "Some long task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 60
                },
                {
                    identifier: "short",
                    name: "Short task",
                    description: "Some short task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "reducing",
                    name: "Reducing task",
                    description: "Task depending on two tasks",
                    estimatedStartDate: new Date(2016, 10, 16).toISOString(),
                    estimatedDuration: 30
                }
            ]
            const relations: Array<TaskRelation> = [
                {
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "long",
                    lag: 0
                },
                {
                    previous: "root",
                    previousLocation: TaskLocation.Beginning,
                    next: "short",
                    lag: 15
                },
                {
                    previous: "long",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 5
                },
                {
                    previous: "short",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 10
                }
            ]
            let projectNode = new FakeProjectNode(graph, "project")
            mock.expects("addProject").once().withExactArgs(project).returns(Promise.resolve(projectNode))
            let projectNodeMock = sinon.mock(projectNode)
            tasks.map((task: ApiInputTask) => {
                const startDate = new Date(task.estimatedStartDate)
                const taskNode = new FakeTaskNode(projectNode, task.identifier, startDate, task.estimatedDuration)
                projectNodeMock.expects("addTask").once().withExactArgs(createTask(task))
                               .returns(Promise.resolve(taskNode))
            })
            relations.map((relation: TaskRelation) => {
                projectNodeMock.expects("addRelation").once().withExactArgs(createRelation(relation))
                               .returns(Promise.resolve())
            })

            api.import(project, tasks, relations).then(() => {
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when importing tasks 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(graph)

            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            const tasks: Array<ApiInputTask> = [
                {
                    identifier: "root",
                    name: "Root task",
                    description: "Project beginning",
                    estimatedStartDate: new Date(2016, 7, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "long",
                    name: "Long task",
                    description: "Some long task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 60
                },
                {
                    identifier: "short",
                    name: "Short task",
                    description: "Some short task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "reducing",
                    name: "Reducing task",
                    description: "Task depending on two tasks",
                    estimatedStartDate: new Date(2016, 10, 16).toISOString(),
                    estimatedDuration: 30
                }
            ]
            const relations: Array<TaskRelation> = [
                {
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "long",
                    lag: 0
                },
                {
                    previous: "root",
                    previousLocation: TaskLocation.Beginning,
                    next: "short",
                    lag: 15
                },
                {
                    previous: "long",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 5
                },
                {
                    previous: "short",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 10
                }
            ]
            let projectNode = new FakeProjectNode(graph, "project")
            mock.expects("addProject").once().withExactArgs(project)
                .returns(Promise.reject(new ExistsError("Some error")))

            api.import(project, tasks, relations).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when importing tasks 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(graph)

            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            const tasks: Array<ApiInputTask> = [
                {
                    identifier: "root",
                    name: "Root task",
                    description: "Project beginning",
                    estimatedStartDate: new Date(2016, 7, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "long",
                    name: "Long task",
                    description: "Some long task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 60
                },
                {
                    identifier: "short",
                    name: "Short task",
                    description: "Some short task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "reducing",
                    name: "Reducing task",
                    description: "Task depending on two tasks",
                    estimatedStartDate: new Date(2016, 10, 16).toISOString(),
                    estimatedDuration: 30
                }
            ]
            const relations: Array<TaskRelation> = [
                {
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "long",
                    lag: 0
                },
                {
                    previous: "root",
                    previousLocation: TaskLocation.Beginning,
                    next: "short",
                    lag: 15
                },
                {
                    previous: "long",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 5
                },
                {
                    previous: "short",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 10
                }
            ]
            let projectNode = new FakeProjectNode(graph, "project")
            mock.expects("addProject").once().withExactArgs(project)
                .returns(Promise.reject(new InternalError("Some error")))

            api.import(project, tasks, relations).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when importing tasks 3", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(graph)

            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            const tasks: Array<ApiInputTask> = [
                {
                    identifier: "root",
                    name: "Root task",
                    description: "Project beginning",
                    estimatedStartDate: new Date(2016, 7, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "long",
                    name: "Long task",
                    description: "Some long task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 60
                },
                {
                    identifier: "short",
                    name: "Short task",
                    description: "Some short task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "reducing",
                    name: "Reducing task",
                    description: "Task depending on two tasks",
                    estimatedStartDate: new Date(2016, 10, 16).toISOString(),
                    estimatedDuration: 30
                }
            ]
            const relations: Array<TaskRelation> = [
                {
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "long",
                    lag: 0
                },
                {
                    previous: "root",
                    previousLocation: TaskLocation.Beginning,
                    next: "short",
                    lag: 15
                },
                {
                    previous: "long",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 5
                },
                {
                    previous: "short",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 10
                }
            ]
            let projectNode = new FakeProjectNode(graph, "project")
            mock.expects("addProject").once().withExactArgs(project)
                .returns(Promise.reject(new FakeError("Some error")))

            api.import(project, tasks, relations).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when importing tasks 4", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(graph)

            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            const tasks: Array<ApiInputTask> = [
                {
                    identifier: "root",
                    name: "Root task",
                    description: "Project beginning",
                    estimatedStartDate: new Date(2016, 7, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "long",
                    name: "Long task",
                    description: "Some long task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 60
                },
                {
                    identifier: "short",
                    name: "Short task",
                    description: "Some short task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "reducing",
                    name: "Reducing task",
                    description: "Task depending on two tasks",
                    estimatedStartDate: new Date(2016, 10, 16).toISOString(),
                    estimatedDuration: 30
                }
            ]
            const relations: Array<TaskRelation> = [
                {
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "long",
                    lag: 0
                },
                {
                    previous: "root",
                    previousLocation: TaskLocation.Beginning,
                    next: "short",
                    lag: 15
                },
                {
                    previous: "long",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 5
                },
                {
                    previous: "short",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 10
                }
            ]
            let projectNode = new FakeProjectNode(graph, "project")
            mock.expects("addProject").once().withExactArgs(project).returns(Promise.resolve(projectNode))
            let projectNodeMock = sinon.mock(projectNode)
            tasks.map((task: ApiInputTask) => {
                projectNodeMock.expects("addTask").once().withExactArgs(createTask(task))
                               .returns(Promise.reject(new ExistsError("Some error")))
            })

            api.import(project, tasks, relations).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when importing tasks 5", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(graph)

            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            const tasks: Array<ApiInputTask> = [
                {
                    identifier: "root",
                    name: "Root task",
                    description: "Project beginning",
                    estimatedStartDate: new Date(2016, 7, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "long",
                    name: "Long task",
                    description: "Some long task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 60
                },
                {
                    identifier: "short",
                    name: "Short task",
                    description: "Some short task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "reducing",
                    name: "Reducing task",
                    description: "Task depending on two tasks",
                    estimatedStartDate: new Date(2016, 10, 16).toISOString(),
                    estimatedDuration: 30
                }
            ]
            const relations: Array<TaskRelation> = [
                {
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "long",
                    lag: 0
                },
                {
                    previous: "root",
                    previousLocation: TaskLocation.Beginning,
                    next: "short",
                    lag: 15
                },
                {
                    previous: "long",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 5
                },
                {
                    previous: "short",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 10
                }
            ]
            let projectNode = new FakeProjectNode(graph, "project")
            mock.expects("addProject").once().withExactArgs(project).returns(Promise.resolve(projectNode))
            let projectNodeMock = sinon.mock(projectNode)
            tasks.map((task: ApiInputTask) => {
                projectNodeMock.expects("addTask").once().withExactArgs(createTask(task))
                               .returns(Promise.reject(new InternalError("Some error")))
            })

            api.import(project, tasks, relations).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when importing tasks 6", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(graph)

            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            const tasks: Array<ApiInputTask> = [
                {
                    identifier: "root",
                    name: "Root task",
                    description: "Project beginning",
                    estimatedStartDate: new Date(2016, 7, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "long",
                    name: "Long task",
                    description: "Some long task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 60
                },
                {
                    identifier: "short",
                    name: "Short task",
                    description: "Some short task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "reducing",
                    name: "Reducing task",
                    description: "Task depending on two tasks",
                    estimatedStartDate: new Date(2016, 10, 16).toISOString(),
                    estimatedDuration: 30
                }
            ]
            const relations: Array<TaskRelation> = [
                {
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "long",
                    lag: 0
                },
                {
                    previous: "root",
                    previousLocation: TaskLocation.Beginning,
                    next: "short",
                    lag: 15
                },
                {
                    previous: "long",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 5
                },
                {
                    previous: "short",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 10
                }
            ]
            let projectNode = new FakeProjectNode(graph, "project")
            mock.expects("addProject").once().withExactArgs(project).returns(Promise.resolve(projectNode))
            let projectNodeMock = sinon.mock(projectNode)
            tasks.map((task: ApiInputTask) => {
                projectNodeMock.expects("addTask").once().withExactArgs(createTask(task))
                               .returns(Promise.reject(new FakeError("Some error")))
            })

            api.import(project, tasks, relations).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when importing tasks 7", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(graph)

            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            const tasks: Array<ApiInputTask> = [
                {
                    identifier: "root",
                    name: "Root task",
                    description: "Project beginning",
                    estimatedStartDate: new Date(2016, 7, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "long",
                    name: "Long task",
                    description: "Some long task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 60
                },
                {
                    identifier: "short",
                    name: "Short task",
                    description: "Some short task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "reducing",
                    name: "Reducing task",
                    description: "Task depending on two tasks",
                    estimatedStartDate: new Date(2016, 10, 16).toISOString(),
                    estimatedDuration: 30
                }
            ]
            const relations: Array<TaskRelation> = [
                {
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "long",
                    lag: 0
                },
                {
                    previous: "root",
                    previousLocation: TaskLocation.Beginning,
                    next: "short",
                    lag: 15
                },
                {
                    previous: "long",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 5
                },
                {
                    previous: "short",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 10
                }
            ]
            let projectNode = new FakeProjectNode(graph, "project")
            mock.expects("addProject").once().withExactArgs(project).returns(Promise.resolve(projectNode))
            let projectNodeMock = sinon.mock(projectNode)
            tasks.map((task: ApiInputTask) => {
                const startDate = new Date(task.estimatedStartDate)
                const taskNode = new FakeTaskNode(projectNode, task.identifier, startDate, task.estimatedDuration)
                projectNodeMock.expects("addTask").once().withExactArgs(createTask(task))
                               .returns(Promise.resolve(taskNode))
            })
            relations.map((relation: TaskRelation) => {
                projectNodeMock.expects("addRelation").once().withExactArgs(createRelation(relation))
                               .returns(Promise.reject(new NotFoundError("Some error")))
            })

            api.import(project, tasks, relations).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when importing tasks 8", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(graph)

            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            const tasks: Array<ApiInputTask> = [
                {
                    identifier: "root",
                    name: "Root task",
                    description: "Project beginning",
                    estimatedStartDate: new Date(2016, 7, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "long",
                    name: "Long task",
                    description: "Some long task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 60
                },
                {
                    identifier: "short",
                    name: "Short task",
                    description: "Some short task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "reducing",
                    name: "Reducing task",
                    description: "Task depending on two tasks",
                    estimatedStartDate: new Date(2016, 10, 16).toISOString(),
                    estimatedDuration: 30
                }
            ]
            const relations: Array<TaskRelation> = [
                {
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "long",
                    lag: 0
                },
                {
                    previous: "root",
                    previousLocation: TaskLocation.Beginning,
                    next: "short",
                    lag: 15
                },
                {
                    previous: "long",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 5
                },
                {
                    previous: "short",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 10
                }
            ]
            let projectNode = new FakeProjectNode(graph, "project")
            mock.expects("addProject").once().withExactArgs(project).returns(Promise.resolve(projectNode))
            let projectNodeMock = sinon.mock(projectNode)
            tasks.map((task: ApiInputTask) => {
                const startDate = new Date(task.estimatedStartDate)
                const taskNode = new FakeTaskNode(projectNode, task.identifier, startDate, task.estimatedDuration)
                projectNodeMock.expects("addTask").once().withExactArgs(createTask(task))
                               .returns(Promise.resolve(taskNode))
            })
            relations.map((relation: TaskRelation) => {
                projectNodeMock.expects("addRelation").once().withExactArgs(createRelation(relation))
                               .returns(Promise.reject(new InternalError("Some error")))
            })

            api.import(project, tasks, relations).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when importing tasks 9", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(graph)

            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            const tasks: Array<ApiInputTask> = [
                {
                    identifier: "root",
                    name: "Root task",
                    description: "Project beginning",
                    estimatedStartDate: new Date(2016, 7, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "long",
                    name: "Long task",
                    description: "Some long task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 60
                },
                {
                    identifier: "short",
                    name: "Short task",
                    description: "Some short task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "reducing",
                    name: "Reducing task",
                    description: "Task depending on two tasks",
                    estimatedStartDate: new Date(2016, 10, 16).toISOString(),
                    estimatedDuration: 30
                }
            ]
            const relations: Array<TaskRelation> = [
                {
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "long",
                    lag: 0
                },
                {
                    previous: "root",
                    previousLocation: TaskLocation.Beginning,
                    next: "short",
                    lag: 15
                },
                {
                    previous: "long",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 5
                },
                {
                    previous: "short",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 10
                }
            ]
            let projectNode = new FakeProjectNode(graph, "project")
            mock.expects("addProject").once().withExactArgs(project).returns(Promise.resolve(projectNode))
            let projectNodeMock = sinon.mock(projectNode)
            tasks.map((task: ApiInputTask) => {
                const startDate = new Date(task.estimatedStartDate)
                const taskNode = new FakeTaskNode(projectNode, task.identifier, startDate, task.estimatedDuration)
                projectNodeMock.expects("addTask").once().withExactArgs(createTask(task))
                               .returns(Promise.resolve(taskNode))
            })
            relations.map((relation: TaskRelation) => {
                projectNodeMock.expects("addRelation").once().withExactArgs(createRelation(relation))
                               .returns(Promise.reject(new FakeError("Some error")))
            })

            api.import(project, tasks, relations).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when importing tasks 10", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            const tasks: Array<ApiInputTask> = [
                {
                    identifier: "root",
                    name: "Root task",
                    description: "Project beginning",
                    estimatedStartDate: new Date(2016, 7, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "long",
                    name: "Long task",
                    description: "Some long task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 60
                },
                {
                    identifier: "short",
                    name: "Short task",
                    description: "Some short task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "reducing",
                    name: "Reducing task",
                    description: "Task depending on two tasks",
                    estimatedStartDate: new Date(2016, 10, 16).toISOString(),
                    estimatedDuration: 30
                }
            ]
            const relations: Array<TaskRelation> = [
                {
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "long",
                    lag: 0
                },
                {
                    previous: "root",
                    previousLocation: TaskLocation.Beginning,
                    next: "short",
                    lag: 15
                },
                {
                    previous: "long",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 5
                },
                {
                    previous: "short",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 10
                }
            ]
            api.import({ test: "test" }, tasks, relations).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when importing tasks 11", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            const relations: Array<TaskRelation> = [
                {
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "long",
                    lag: 0
                },
                {
                    previous: "root",
                    previousLocation: TaskLocation.Beginning,
                    next: "short",
                    lag: 15
                },
                {
                    previous: "long",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 5
                },
                {
                    previous: "short",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 10
                }
            ]
            api.import(project, { test: "test" }, relations).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when importing tasks 12", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            const relations: Array<TaskRelation> = [
                {
                    previous: "root",
                    previousLocation: TaskLocation.End,
                    next: "long",
                    lag: 0
                },
                {
                    previous: "root",
                    previousLocation: TaskLocation.Beginning,
                    next: "short",
                    lag: 15
                },
                {
                    previous: "long",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 5
                },
                {
                    previous: "short",
                    previousLocation: TaskLocation.End,
                    next: "reducing",
                    lag: 10
                }
            ]
            api.import(project, [{ test: "test" }], relations).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when importing tasks 13", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(graph)

            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            const tasks: Array<ApiInputTask> = [
                {
                    identifier: "root",
                    name: "Root task",
                    description: "Project beginning",
                    estimatedStartDate: new Date(2016, 7, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "long",
                    name: "Long task",
                    description: "Some long task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 60
                },
                {
                    identifier: "short",
                    name: "Short task",
                    description: "Some short task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "reducing",
                    name: "Reducing task",
                    description: "Task depending on two tasks",
                    estimatedStartDate: new Date(2016, 10, 16).toISOString(),
                    estimatedDuration: 30
                }
            ]
            api.import(project, tasks, { test: "test" }).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when importing tasks 14", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(graph)

            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            const tasks: Array<ApiInputTask> = [
                {
                    identifier: "root",
                    name: "Root task",
                    description: "Project beginning",
                    estimatedStartDate: new Date(2016, 7, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "long",
                    name: "Long task",
                    description: "Some long task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 60
                },
                {
                    identifier: "short",
                    name: "Short task",
                    description: "Some short task",
                    estimatedStartDate: new Date(2016, 8, 15).toISOString(),
                    estimatedDuration: 31
                },
                {
                    identifier: "reducing",
                    name: "Reducing task",
                    description: "Task depending on two tasks",
                    estimatedStartDate: new Date(2016, 10, 16).toISOString(),
                    estimatedDuration: 30
                }
            ]
            api.import(project, tasks, [{ test: "test" }]).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
