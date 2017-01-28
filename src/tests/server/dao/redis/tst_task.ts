import * as chai from "chai"
import * as redis from "redis"
import {TaskDefinition} from "../../../../common/task"
import {RedisTaskDao} from "../../../../server/dao/redis/task"
import {RedisTestDataProvider} from "./testdataprovider"
import {project1, invalidProject, taskd1, taskd2, taskd3, taskd4, invalidTaskd} from "../../testdata"
import {KeyFactory} from "../../../../server/dao/redis/utils/keyfactory"
import {NotFoundError} from "../../../../common/errors/notfound"
import {CorruptedError} from "../../../../server/dao/error/corrupted"
import {InternalError} from "../../../../server/dao/error/internal"
import {ExistsError} from "../../../../server/dao/error/exists"

describe("Redis DAO Task", () => {
    let client: redis.RedisClient
    let dao: RedisTaskDao
    beforeEach((done) => {
        RedisTestDataProvider.dump().then((testClient: redis.RedisClient) => {
            client = testClient
            dao = new RedisTaskDao(client)
            done()
        })
    })
    afterEach(() => {
        client.quit()
    })
    describe("getProjectTasks", () => {
        it("Should get a list of tasks that belongs to a project from the DB", (done) => {
            dao.getProjectTasks(project1.identifier).then((tasks: Array<TaskDefinition>) => {
                const expected: Array<TaskDefinition> = [taskd1, taskd2, taskd3]
                chai.expect(tasks).to.deep.equal(expected)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid project identifier", (done) => {
            dao.getProjectTasks(invalidProject.identifier).then(() => {
                done(new Error("getProjectTasks should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should only get tasks with body from the DB", (done) => {
            const projectKey = KeyFactory.createTaskKey(project1.identifier, taskd1.identifier)
            RedisTestDataProvider.deleteValue(client, projectKey).then(() => {
                return dao.getProjectTasks(project1.identifier)
            }).then((tasks: Array<TaskDefinition>) => {
                chai.expect(tasks).to.deep.equal([taskd2, taskd3])
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
    describe("getTask", () => {
        it("Should get a task from the DB", (done) => {
            dao.getTask(project1.identifier, taskd1.identifier).then((task: TaskDefinition) => {
                chai.expect(task).to.deep.equal(taskd1)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid project identifier", (done) => {
            dao.getTask(invalidProject.identifier, taskd1.identifier).then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for an invalid task identifier", (done) => {
            dao.getTask(project1.identifier, invalidTaskd.identifier).then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a task with corrupted name", (done) => {
            const taskKey = KeyFactory.createTaskKey(project1.identifier, taskd1.identifier)
            RedisTestDataProvider.deleteMember(client, taskKey, "name").then(() => {
                return dao.getTask(project1.identifier, taskd1.identifier)
            }).then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a task with corrupted description", (done) => {
            const taskKey = KeyFactory.createTaskKey(project1.identifier, taskd1.identifier)
            RedisTestDataProvider.deleteMember(client, taskKey, "description").then(() => {
                return dao.getTask(project1.identifier, taskd1.identifier)
            }).then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a task with corrupted estimatedStartDate", (done) => {
            const startDateKey = KeyFactory.createTaskKey(project1.identifier, taskd1.identifier, "estimatedStartDate")
            RedisTestDataProvider.deleteValue(client, startDateKey).then(() => {
                return dao.getTask(project1.identifier, taskd1.identifier)
            }).then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a task with corrupted estimatedDuration", (done) => {
            const startDateKey = KeyFactory.createTaskKey(project1.identifier, taskd1.identifier, "estimatedDuration")
            RedisTestDataProvider.deleteValue(client, startDateKey).then(() => {
                return dao.getTask(project1.identifier, taskd1.identifier)
            }).then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception for a corrupted task", (done) => {
            const taskKey = KeyFactory.createTaskKey(project1.identifier, taskd1.identifier)
            RedisTestDataProvider.setValue(client, taskKey, "test").then(() => {
                return dao.getTask(project1.identifier, taskd1.identifier)
            }).then(() => {
                done(new Error("getTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
    describe("addTask", () => {
        it("Should add a task in the DB", (done) => {
            dao.addTask(project1.identifier, taskd4).then(() => {
                return dao.getTask(project1.identifier, taskd4.identifier)
            }).then((task: TaskDefinition) => {
                chai.expect(task).to.deep.equal(taskd4)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding a task in the DB for an invalid project", (done) => {
            dao.addTask(invalidProject.identifier, taskd4).then(() => {
                done(new Error("addTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding an existing task in the DB", (done) => {
            dao.addTask(project1.identifier, taskd1).then(() => {
                done(new Error("addTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(ExistsError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when adding a task in a project with corrupted task ids", (done) => {
            const taskIdsKey = KeyFactory.createProjectKey(project1.identifier, "tasks")
            RedisTestDataProvider.setValue(client, taskIdsKey, "test").then(() => {
                return dao.addTask(project1.identifier, taskd4)
            }).then(() => {
                done(new Error("addTask should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
    describe("isTaskImportant", () => {
        it("Should check that a task that is not important will be reported as non-important", (done) => {
            dao.isTaskImportant(project1.identifier, taskd1.identifier).then((important: boolean) => {
                chai.expect(important).to.false
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should check that a task that is important will be reported as important", (done) => {
            const projectImportantTasksKey = KeyFactory.createProjectKey(project1.identifier, "task:important")
            RedisTestDataProvider.addValue(client, projectImportantTasksKey, taskd1.identifier).then(() => {
                return dao.isTaskImportant(project1.identifier, taskd1.identifier)
            }).then((important: boolean) => {
                chai.expect(important).to.true
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when checking if a task is important for an invalid project", (done) => {
            dao.isTaskImportant(invalidProject.identifier, taskd1.identifier).then(() => {
                done(new Error("isTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when checking if a task is important for an invalid task", (done) => {
            dao.isTaskImportant(project1.identifier, invalidTaskd.identifier).then(() => {
                done(new Error("isTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when checking if a task is important for a corrupted task", (done) => {
            const projectImportantTasksKey = KeyFactory.createProjectKey(project1.identifier, "task:important")
            RedisTestDataProvider.setValue(client, projectImportantTasksKey, "test").then(() => {
                return dao.isTaskImportant(project1.identifier, taskd1.identifier)
            }).then(() => {
                done(new Error("isTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
    describe("setTaskImportant", () => {
        it("Should set task as important", (done) => {
            dao.setTaskImportant(project1.identifier, taskd1.identifier, true).then(() => {
                return dao.isTaskImportant(project1.identifier, taskd1.identifier)
            }).then((important: boolean) => {
                chai.expect(important).to.true
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should not affect an important task when setting this task as important", (done) => {
            const projectImportantTasksKey = KeyFactory.createProjectKey(project1.identifier, "task:important")
            RedisTestDataProvider.addValue(client, projectImportantTasksKey, taskd1.identifier).then(() => {
                return dao.setTaskImportant(project1.identifier, taskd1.identifier, true)
            }).then(() => {
                return dao.isTaskImportant(project1.identifier, taskd1.identifier)
            }).then((important: boolean) => {
                chai.expect(important).to.true
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should set task as not important", (done) => {
            const projectImportantTasksKey = KeyFactory.createProjectKey(project1.identifier, "task:important")
            RedisTestDataProvider.addValue(client, projectImportantTasksKey, taskd1.identifier).then(() => {
                return dao.setTaskImportant(project1.identifier, taskd1.identifier, false)
            }).then(() => {
                return dao.isTaskImportant(project1.identifier, taskd1.identifier)
            }).then((important: boolean) => {
                chai.expect(important).to.false
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should not affecting a non-important task when setting this task as not important", (done) => {
            dao.setTaskImportant(project1.identifier, taskd1.identifier, false).then(() => {
                return dao.isTaskImportant(project1.identifier, taskd1.identifier)
            }).then((important: boolean) => {
                chai.expect(important).to.false
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when setting a task as important for an invalid project", (done) => {
            dao.setTaskImportant(invalidProject.identifier, taskd1.identifier, true).then(() => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when setting a task as not important for an invalid project", (done) => {
            dao.setTaskImportant(invalidProject.identifier, taskd1.identifier, false).then(() => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when setting a task as important for an invalid task", (done) => {
            dao.setTaskImportant(project1.identifier, invalidTaskd.identifier, true).then(() => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when setting a task as important for an invalid task", (done) => {
            dao.setTaskImportant(project1.identifier, invalidTaskd.identifier, false).then(() => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when setting a task as important for a corrupted task", (done) => {
            const projectImportantTasksKey = KeyFactory.createProjectKey(project1.identifier, "task:important")
            RedisTestDataProvider.setValue(client, projectImportantTasksKey, "test").then(() => {
                return dao.setTaskImportant(project1.identifier, taskd1.identifier, true)
            }).then(() => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
        it("Should get an exception when setting a task as not important for a corrupted task", (done) => {
            const projectImportantTasksKey = KeyFactory.createProjectKey(project1.identifier, "task:important")
            RedisTestDataProvider.setValue(client, projectImportantTasksKey, "test").then(() => {
                return dao.setTaskImportant(project1.identifier, taskd1.identifier, false)
            }).then(() => {
                done(new Error("setTaskImportant should not be a success"))
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
                done()
            }).catch((error) => {
                done(error)
            })
        })
    })
})
