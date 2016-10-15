import * as chai from "chai"
import * as sinon from "sinon"
import { Project, Task, TaskResults, TaskLocation, Modifier } from "../../common/types"
import { NotFoundError, ExistsError, InputError } from "../../common/errors"
import { ApiTask, ApiInputTask, ApiProjectTaskModifiers, createApiTask, createTask } from "../../common/apitypes"
import { IDataProvider } from "../../server/core/data/idataprovider"
import { Api, RequestError } from "../../server/core/api"
import { ProjectNode, TaskNode } from "../../server/core/graph/graph"
import { FakeDataProvider } from "./fakedataprovider"
import { FakeGraph, FakeProjectNode, FakeTaskNode } from "./fakegraph"
import * as maputils from "../../common/maputils"

describe("API", () => {
    describe("getAllProjects", () => {
        it("Should get projects", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const expected: Array<Project> = [
                {
                    identifier: "project1",
                    name: "Project 1",
                    description: "Description 1"
                },
                {
                    identifier: "project2",
                    name: "Project 2",
                    description: "Description 2"
                }
            ]
            mock.expects("getAllProjects").once().returns(Promise.resolve(expected))

            api.getProjects().then((projects: Array<Project>) => {
                chai.expect(projects).to.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting projects", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getAllProjects").once().returns(Promise.reject(new Error("Some error")))

            api.getProjects().then((projects: Array<Project>) => {
                done(new Error("getProjects should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            })
        })
    })
    describe("getProject", () => {
        it("Should get project", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const expected: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            mock.expects("getProject").once().withArgs("project").returns(Promise.resolve(expected))

            api.getProject("project").then((project: Project) => {
                chai.expect(project).to.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting project 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getProject").once().withArgs("project").returns(Promise.reject(new Error("Some error")))

            api.getProject("project").then((project: Project) => {
                done(new Error("getProject should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            })
        })
        it("Should throw an error when getting project 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getProject").once().withArgs("project")
                .returns(Promise.reject(new NotFoundError("Some error")))

            api.getProject("project").then((project: Project) => {
                done(new Error("getProject should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            })
        })
        it("Should throw an error when getting project 3", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            api.getProject({value: "test"}).then((project: Project) => {
                done(new Error("getProject should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            })
        })
    })
    describe("getProjectTasks", () => {
        it("Should get project tasks", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const tasks: Array<Task> = [
                {
                    projectIdentifier: "project",
                    identifier: "task1",
                    name: "Task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 1, 1),
                    estimatedDuration: 30
                },
                {
                    projectIdentifier: "project",
                    identifier: "task2",
                    name: "Task 2",
                    description: "Description 2",
                    estimatedStartDate: new Date(2016, 1, 15),
                    estimatedDuration: 15
                }
            ]
            mock.expects("getProjectTasks").once().withArgs("project")
                .returns(Promise.resolve(tasks))
            let projectNode = new FakeProjectNode()
            projectNode.nodes.set("task1", new FakeTaskNode(new Date(2016, 1, 5), 35))
            projectNode.nodes.set("task2", new FakeTaskNode(new Date(2016, 1, 15), 16))
            graph.nodes.set("project", projectNode)

            const expected: Array<ApiTask> = [
                {
                    projectIdentifier: "project",
                    identifier: "task1",
                    name: "Task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 1, 1).toISOString(),
                    estimatedDuration: 30,
                    startDate: new Date(2016, 1, 5).toISOString(),
                    duration: 35
                },
                {
                    projectIdentifier: "project",
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
            mock.expects("getProjectTasks").once().withArgs("project")
                .returns(Promise.reject(new Error("Some error")))

            api.getProjectTasks("project").then((tasks: Array<ApiTask>) => {
                done(new Error("getProjectTasks should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            })
        })
        it("Should throw an error when getting project tasks 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("getProjectTasks").once().withArgs("project")
                .returns(Promise.reject(new NotFoundError("Some error")))

            api.getProjectTasks("project").then((tasks: Array<ApiTask>) => {
                done(new Error("getProjectTasks should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            })
        })
        it("Should throw an error when getting project tasks 3", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const tasks: Array<Task> = [
                {
                    projectIdentifier: "project",
                    identifier: "task1",
                    name: "Task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 1, 1),
                    estimatedDuration: 30
                },
                {
                    projectIdentifier: "project",
                    identifier: "task2",
                    name: "Task 2",
                    description: "Description 2",
                    estimatedStartDate: new Date(2016, 1, 15),
                    estimatedDuration: 15
                }
            ]
            mock.expects("getProjectTasks").once().withArgs("project")
                .returns(Promise.resolve(tasks))

            api.getProjectTasks("project").then((tasks: Array<ApiTask>) => {
                done(new Error("getProjectTasks should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            })
        })
        it("Should throw an error when getting project tasks 4", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const tasks: Array<Task> = [
                {
                    projectIdentifier: "project",
                    identifier: "task1",
                    name: "Task 1",
                    description: "Description 1",
                    estimatedStartDate: new Date(2016, 1, 1),
                    estimatedDuration: 30
                },
                {
                    projectIdentifier: "project",
                    identifier: "task2",
                    name: "Task 2",
                    description: "Description 2",
                    estimatedStartDate: new Date(2016, 1, 15),
                    estimatedDuration: 15
                }
            ]
            mock.expects("getProjectTasks").once().withArgs("project")
                .returns(Promise.resolve(tasks))
            let projectNode = new FakeProjectNode()
            graph.nodes.set("project", projectNode)

            api.getProjectTasks("project").then((tasks: Array<ApiTask>) => {
                done(new Error("getProjectTasks should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            })
        })
        it("Should throw an error when getting project tasks 5", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            api.getProjectTasks({value: "test"}).then((tasks: Array<ApiTask>) => {
                done(new Error("getProjectTasks should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            })
        })
    })
    describe("getTask", () => {
        it("Should get task", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            mock.expects("getProject").once().withArgs("project").returns(Promise.resolve(project))
            const task: Task = {
                projectIdentifier: "project",
                identifier: "task",
                name: "Task",
                description: "Description",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 15
            }
            mock.expects("getTask").once().withArgs("project", "task").returns(Promise.resolve(task))
            graph.nodes.set("project", new ProjectNode(dataProvider, "project"))
            const modifiers: Array<Modifier> = [
                {
                    projectIdentifier: "project",
                    name: "Modifier 1",
                    description: "Description 1",
                    duration: 4,
                    location: TaskLocation.Beginning
                },
                {
                    projectIdentifier: "project",
                    name: "Modifier 2",
                    description: "Description 2",
                    duration: 2,
                    location: TaskLocation.End
                }
            ]
            let projectNode = maputils.get(graph.nodes, "project")
            let taskNode = new TaskNode(dataProvider, task.projectIdentifier, task.identifier,
                                        task.estimatedStartDate, task.estimatedDuration,
                                        new Date(2016, 2, 5), 17)
            taskNode.modifiers = modifiers
            projectNode.nodes.set("task", taskNode)
            const expected: ApiProjectTaskModifiers = {
                project,
                task: createApiTask(task, new Date(2016, 2, 5), 17),
                modifiers
            }

            api.getTask("project", "task").then((task: ApiProjectTaskModifiers) => {
                chai.expect(task).to.deep.equal(expected)
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
            mock.expects("getProject").once().withArgs("project").returns(Promise.reject(new Error("Some error")))

            api.getTask("project", "task").then((task: ApiProjectTaskModifiers) => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            })
        })
        it("Should throw an error when getting task 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            mock.expects("getProject").once().withArgs("project").returns(Promise.resolve(project))
            mock.expects("getTask").once().withArgs("project", "task").returns(Promise.reject(new Error("Some error")))

            api.getTask("project", "task").then((task: ApiProjectTaskModifiers) => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            })
        })
        it("Should throw an error when getting task 3", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            mock.expects("getProject").once().withArgs("project").returns(Promise.resolve(project))
            const task: Task = {
                projectIdentifier: "project",
                identifier: "task",
                name: "Task",
                description: "Description",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 15
            }
            mock.expects("getTask").once().withArgs("project", "task").returns(Promise.resolve(task))

            api.getTask("project", "task").then((task: ApiProjectTaskModifiers) => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            })
        })
        it("Should throw an error when getting task 4", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }
            mock.expects("getProject").once().withArgs("project").returns(Promise.resolve(project))
            const task: Task = {
                projectIdentifier: "project",
                identifier: "task",
                name: "Task",
                description: "Description",
                estimatedStartDate: new Date(2016, 2, 1),
                estimatedDuration: 15
            }
            mock.expects("getTask").once().withArgs("project", "task").returns(Promise.resolve(task))
            graph.nodes.set("project", new ProjectNode(dataProvider, "project"))

            api.getTask("project", "task").then((task: ApiProjectTaskModifiers) => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            })
        })
        it("Should throw an error when getting task 5", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            api.getTask({value: "test"}, "task").then((task: ApiProjectTaskModifiers) => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            })
        })
        it("Should throw an error when getting task 6", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            api.getTask("project", {value: "test"}).then((task: ApiProjectTaskModifiers) => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            })
        })
    })
    describe("isTaskImportant", () => {
        it("Should get if task is important 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("isTaskImportant").once().withArgs("project", "task").returns(Promise.resolve(true))

            api.isTaskImportant("project", "task").then((important: boolean) => {
                chai.expect(important).to.be.true
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get if task is important 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("isTaskImportant").once().withArgs("project", "task").returns(Promise.resolve(false))

            api.isTaskImportant("project", "task").then((important: boolean) => {
                chai.expect(important).to.be.false
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when getting if task is important 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("isTaskImportant").once().withArgs("project", "task").returns(Promise.reject(new Error("Some error")))

            api.isTaskImportant("project", "task").then((important: boolean) => {
                done(new Error("isTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            })
        })
        it("Should throw an error when getting if task is important 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("isTaskImportant").once().withArgs("project", "task").returns(Promise.reject(new NotFoundError("Some error")))

            api.isTaskImportant("project", "task").then((important: boolean) => {
                done(new Error("isTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            })
        })
        it("Should throw an error when getting if task is important 3", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            api.isTaskImportant({ test: "test" }, "task").then((important: boolean) => {
                done(new Error("isTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            })
        })
        it("Should throw an error when getting if task is important 4", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            api.isTaskImportant("project", { test: "test" }).then((important: boolean) => {
                done(new Error("isTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            })
        })
    })
    describe("setTaskImportant", () => {
        it("Should set if task is important 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("setTaskImportant").once().withArgs("project", "task", true).returns(Promise.resolve(true))

            api.setTaskImportant("project", "task", true).then((important: boolean) => {
                chai.expect(important).to.be.true
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should set if task is important 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("setTaskImportant").once().withArgs("project", "task", false).returns(Promise.resolve(false))

            api.setTaskImportant("project", "task", false).then((important: boolean) => {
                chai.expect(important).to.be.false
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should throw an error when setting if task is important 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("setTaskImportant").once().withArgs("project", "task").returns(Promise.reject(new Error("Some error")))

            api.setTaskImportant("project", "task", true).then((important: boolean) => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            })
        })
        it("Should throw an error when setting if task is important 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)
            let mock = sinon.mock(dataProvider)
            mock.expects("setTaskImportant").once().withArgs("project", "task").returns(Promise.reject(new NotFoundError("Some error")))

            api.setTaskImportant("project", "task", true).then((important: boolean) => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            })
        })
        it("Should throw an error when setting if task is important 3", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            api.setTaskImportant({ test: "test" }, "task", true).then((important: boolean) => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            })
        })
        it("Should throw an error when setting if task is important 4", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            api.setTaskImportant("project", { test: "test" }, true).then((important: boolean) => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
                done()
            })
        })
    })
    describe("import", () => {
        it("Should import tasks", (done) => {
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
            let projectNode = new FakeProjectNode()
            mock.expects("addProject").once().withArgs(project).returns(Promise.resolve(projectNode))
            let projectNodeMock = sinon.mock(projectNode)
            tasks.map((task: ApiInputTask) => {
                const startDate = new Date(task.estimatedStartDate)
                projectNodeMock.expects("addTask").once().withArgs(createTask(task, "project"))
                               .returns(Promise.resolve(new FakeTaskNode(startDate, task.estimatedDuration)))
            })

            api.import(project, tasks).then(() => {
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
            let projectNode = new FakeProjectNode()
            mock.expects("addProject").once().withArgs(project).returns(Promise.reject(new ExistsError("Some error")))

            api.import(project, tasks).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
                done()
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
            let projectNode = new FakeProjectNode()
            mock.expects("addProject").once().withArgs(project).returns(Promise.resolve(projectNode))
            let projectNodeMock = sinon.mock(projectNode)
            tasks.map((task: ApiInputTask) => {
                projectNodeMock.expects("addTask").once().withArgs(createTask(task, "project"))
                               .returns(Promise.reject(new ExistsError("Some error")))
            })

            api.import(project, tasks).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
                done()
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
            let projectNode = new FakeProjectNode()
            mock.expects("addProject").once().withArgs(project).returns(Promise.resolve(projectNode))
            let projectNodeMock = sinon.mock(projectNode)
            tasks.map((task: ApiInputTask) => {
                projectNodeMock.expects("addTask").once().withArgs(createTask(task, "project"))
                               .returns(Promise.reject(new InputError("Some error")))
            })

            api.import(project, tasks).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
                done()
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
            let projectNode = new FakeProjectNode()
            mock.expects("addProject").once().withArgs(project).returns(Promise.reject(new Error("Some error")))

            api.import(project, tasks).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
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
            let projectNode = new FakeProjectNode()
            mock.expects("addProject").once().withArgs(project).returns(Promise.resolve(projectNode))
            let projectNodeMock = sinon.mock(projectNode)
            tasks.map((task: ApiInputTask) => {
                projectNodeMock.expects("addTask").once().withArgs(createTask(task, "project"))
                               .returns(Promise.reject(new Error("Some error")))
            })

            api.import(project, tasks).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
                done()
            })
        })
        // Test relations at some point
        it("Should throw an error when importing tasks n", (done) => {
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

            api.import({ test: "test" }, tasks).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
                done()
            })
        })
        it("Should throw an error when importing tasks n + 1", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }

            api.import(project, { test: "test" }).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
                done()
            })
        })
        it("Should throw an error when importing tasks n + 2", (done) => {
            let dataProvider = new FakeDataProvider()
            let graph = new FakeGraph()
            let api = new Api(dataProvider, graph)

            const project: Project = {
                identifier: "project",
                name: "Project",
                description: "Description"
            }

            api.import(project, [{ test: "test" }]).then(() => {
                done(new Error("import should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(400)
                done()
            })
        })
    })
})
