import * as chai from "chai"
import {TaskApiProvider} from "../../../../server/old/api/task"
import {ApiTask, TaskBuilder} from "../../../../common/old/api/task"
import {project1, taskd1, taskd2, delayd1, modifier1, modifier2} from "../../../common/old/testdata"
import {MockGraph} from "../graph/mockgraph"
import {MockDaoBuilder} from "../dao/mockbuilder"
import {RequestError} from "../../../../server/error/request"
import {InternalError} from "../../../../server/dao/error/internal"
import {FakeError} from "../../api/fakeerror"
import {NotFoundError} from "../../../../common/errors/notfound"
import {MockProjectNode} from "../graph/mockprojectnode"
import {MockTaskNode} from "../graph/mocktasknode"
import {MockDelayNode} from "../graph/mockdelaynode"
import {DelayBuilder} from "../../../../common/old/api/delay"
import {ApiTaskData} from "../../../../server/old/api/taskdata"

describe("API task", () => {
    let daoBuilder: MockDaoBuilder
    let graph: MockGraph
    let apiProvider: TaskApiProvider
    beforeEach(() => {
        daoBuilder = new MockDaoBuilder()
        graph = new MockGraph()
        apiProvider = new TaskApiProvider(daoBuilder, graph)
    })
    afterEach(() => {
        daoBuilder.verify()
    })
    describe("getProjectTasks", () => {
        xit("Should get project tasks", () => {
            const tasks = [taskd1, taskd2]
            daoBuilder.mockTaskDao.expects("getProjectTasks").once()
                .withExactArgs(project1.identifier)
                .returns(Promise.resolve(tasks))
            let projectNode = new MockProjectNode(graph, project1.identifier)
            const taskNode1 = new MockTaskNode(projectNode, taskd1.identifier, new Date(2016, 1, 5), 35)
            const taskNode2 = new MockTaskNode(projectNode, taskd2.identifier, new Date(2016, 1, 15), 16)
            projectNode.tasks.set(taskd1.identifier, taskNode1)
            projectNode.tasks.set(taskd2.identifier, taskNode2)
            graph.projects.set(project1.identifier, projectNode)

            const expected: Array<ApiTask> = [
                TaskBuilder.toApiTask(taskd1, taskNode1.startDate, taskNode1.duration),
                TaskBuilder.toApiTask(taskd2, taskNode2.startDate, taskNode2.duration)
            ]

            return apiProvider.getProjectTasks(project1.identifier).then((tasks: Array<ApiTask>) => {
                chai.expect(tasks).to.deep.equal(expected)
            })
        })
        xit("Should get an exception on internal error", () => {
            daoBuilder.mockTaskDao.expects("getProjectTasks").once()
                .withExactArgs(project1.identifier)
                .returns(Promise.reject(new InternalError("Some error")))

            return apiProvider.getProjectTasks(project1.identifier).then(() => {
                throw new Error("getProjectTasks should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
            })
        })
        xit("Should get an exception on not found error", () => {
            daoBuilder.mockTaskDao.expects("getProjectTasks").once()
                .withExactArgs(project1.identifier)
                .returns(Promise.reject(new NotFoundError("Some error")))

            return apiProvider.getProjectTasks(project1.identifier).then(() => {
                throw new Error("getProjectTasks should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
            })
        })
        xit("Should get an exception on other error", () => {
            daoBuilder.mockTaskDao.expects("getProjectTasks").once()
                .withExactArgs(project1.identifier)
                .returns(Promise.reject(new FakeError("Some error")))

            return apiProvider.getProjectTasks(project1.identifier).then(() => {
                throw new Error("getProjectTasks should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
            })
        })
    })
    describe("getTask", () => {
        xit("Should get a task", () => {
            daoBuilder.mockProjectDao.expects("getProject").once()
                .withExactArgs(project1.identifier)
                .returns(Promise.resolve(project1))
            daoBuilder.mockTaskDao.expects("getTask").once()
                .withExactArgs(project1.identifier, taskd1.identifier)
                .returns(Promise.resolve(taskd1))
            daoBuilder.mockDelayDao.expects("getDelay").once()
                .withExactArgs(project1.identifier, delayd1.identifier)
                .returns(Promise.resolve(delayd1))

            const projectNode = new MockProjectNode(graph, project1.identifier)
            graph.projects.set(project1.identifier, projectNode)
            const modifiers = [modifier1, modifier2]
            const taskNode = new MockTaskNode(projectNode, taskd1.identifier,
                taskd1.estimatedStartDate, taskd1.estimatedDuration)
            taskNode.modifiers = modifiers
            const delayNode = new MockDelayNode(projectNode, delayd1.identifier)
            delayNode.initialMargin = 123
            delayNode.margin = 456
            projectNode.tasks.set(taskd1.identifier, taskNode)
            projectNode.delays.set(delayd1.identifier, delayNode)
            taskNode.delays.push(delayNode)

            const expected: ApiTaskData = {
                project: project1,
                task: TaskBuilder.toApiTask(taskd1, taskd1.estimatedStartDate, taskd1.estimatedDuration),
                modifiers,
                delays: [DelayBuilder.toApiDelay(delayd1, 123, 456)]
            }

            return apiProvider.getTask(project1.identifier, taskd1.identifier).then((task: ApiTaskData) => {
                chai.expect(task).to.deep.equal(expected)
            })
        })
        xit("Should get a task with children identifiers", () => {
            daoBuilder.mockProjectDao.expects("getProject").once()
                .withExactArgs(project1.identifier)
                .returns(Promise.resolve(project1))
            daoBuilder.mockTaskDao.expects("getTask").once()
                .withExactArgs(project1.identifier, taskd1.identifier)
                .returns(Promise.resolve(taskd1))
            daoBuilder.mockDelayDao.expects("getDelay").once()
                .withExactArgs(project1.identifier, delayd1.identifier)
                .returns(Promise.resolve(delayd1))

            const projectNode = new MockProjectNode(graph, project1.identifier)
            graph.projects.set(project1.identifier, projectNode)
            const taskNode = new MockTaskNode(projectNode, taskd1.identifier,
                taskd1.estimatedStartDate, taskd1.estimatedDuration)
            const childTaskNode = new MockTaskNode(projectNode, taskd2.identifier,
                taskd2.estimatedStartDate, taskd2.estimatedDuration)
            const delayNode = new MockDelayNode(projectNode, delayd1.identifier)
            delayNode.initialMargin = 123
            delayNode.margin = 456
            projectNode.tasks.set(taskd1.identifier, taskNode)
            projectNode.tasks.set(taskd2.identifier, childTaskNode)
            projectNode.delays.set(delayd1.identifier, delayNode)
            taskNode.children.push(childTaskNode)
            childTaskNode.delays.push(delayNode)

            const expected: ApiTaskData = {
                project: project1,
                task: TaskBuilder.toApiTask(taskd1, taskd1.estimatedStartDate, taskd1.estimatedDuration),
                modifiers: [],
                delays: [DelayBuilder.toApiDelay(delayd1, 123, 456)]
            }

            return apiProvider.getTask(project1.identifier, taskd1.identifier).then((task: ApiTaskData) => {
                chai.expect(task).to.deep.equal(expected)
            })
        })
        xit("Should get an exception on internal error (for task)", () => {
            daoBuilder.mockTaskDao.expects("getTask").once()
                .withExactArgs(project1.identifier, taskd1.identifier)
                .returns(Promise.reject(new InternalError("Some error")))

            return apiProvider.getTask(project1.identifier, taskd1.identifier).then(() => {
                throw new Error("getTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
            })
        })
        xit("Should get an exception on not found error (for task)", () => {
            daoBuilder.mockTaskDao.expects("getTask").once()
                .withExactArgs(project1.identifier, taskd1.identifier)
                .returns(Promise.reject(new NotFoundError("Some error")))

            return apiProvider.getTask(project1.identifier, taskd1.identifier).then(() => {
                throw new Error("getTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
            })
        })
        xit("Should get an exception on other error (for task)", () => {
            daoBuilder.mockTaskDao.expects("getTask").once()
                .withExactArgs(project1.identifier, taskd1.identifier)
                .returns(Promise.reject(new FakeError("Some error")))

            return apiProvider.getTask(project1.identifier, taskd1.identifier).then(() => {
                throw new Error("getTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(FakeError)
            })
        })
        xit("Should get an exception on internal error (for project)", () => {
            daoBuilder.mockProjectDao.expects("getProject").once()
                .withExactArgs(project1.identifier)
                .returns(Promise.reject(new InternalError("Some error")))
            daoBuilder.mockTaskDao.expects("getTask").once()
                .withExactArgs(project1.identifier, taskd1.identifier)
                .returns(Promise.resolve(taskd1))

            return apiProvider.getTask(project1.identifier, taskd1.identifier).then(() => {
                throw new Error("getTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(500)
            })
        })
        xit("Should get an exception for task without project", () => {
            daoBuilder.mockProjectDao.expects("getProject").once()
                .withExactArgs(project1.identifier)
                .returns(Promise.resolve(project1))
            daoBuilder.mockTaskDao.expects("getTask").once()
                .withExactArgs(project1.identifier, taskd1.identifier)
                .returns(Promise.resolve(taskd1))

            return apiProvider.getTask(project1.identifier, taskd1.identifier).then(() => {
                throw new Error("getTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(RequestError)
                chai.expect((error as RequestError).status).to.equal(404)
            })
        })
    })
})