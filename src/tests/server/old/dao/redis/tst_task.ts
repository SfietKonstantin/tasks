import * as chai from "chai"
import * as redis from "redis"
import {TaskDefinition} from "../../../../../common/old/task"
import {RedisTaskDao} from "../../../../../server/old/dao/redis/task"
import {RedisDaoBuilder} from "../../../../../server/old/dao/redis/builder"
import {RedisTestDataProvider} from "./testdataprovider"
import {project1, invalidProject, taskd1, taskd2, taskd3, taskd4, invalidTaskd} from "../../../../common/old/testdata"
import {KeyFactory} from "../../../../../server/old/dao/redis/utils/keyfactory"
import {NotFoundError} from "../../../../../common/errors/notfound"
import {CorruptedError} from "../../../../../server/dao/error/corrupted"
import {InternalError} from "../../../../../server/dao/error/internal"
import {ExistsError} from "../../../../../server/error/exists"

describe("Redis DAO Task", () => {
    let client: redis.RedisClient
    let dao: RedisTaskDao
    beforeEach(() => {
        return RedisTestDataProvider.dump().then((testClient: redis.RedisClient) => {
            client = testClient
            const builder = new RedisDaoBuilder(client)
            dao = builder.buildTaskDao()
        })
    })
    afterEach(() => {
        client.quit()
    })
    describe("getTask", () => {
        xit("Should get a task from the DB", () => {
            return dao.getTask(project1.identifier, taskd1.identifier).then((task: TaskDefinition) => {
                chai.expect(task).to.deep.equal(taskd1)
            })
        })
        xit("Should get an exception for an invalid project identifier", () => {
            return dao.getTask(invalidProject.identifier, taskd1.identifier).then(() => {
                throw new Error("getTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should get an exception for an invalid task identifier", () => {
            return dao.getTask(project1.identifier, invalidTaskd.identifier).then(() => {
                throw new Error("getTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should get an exception for a task with corrupted name", () => {
            const taskKey = KeyFactory.createTaskKey(project1.identifier, taskd1.identifier)
            return RedisTestDataProvider.deleteMember(client, taskKey, "name").then(() => {
                return dao.getTask(project1.identifier, taskd1.identifier)
            }).then(() => {
                throw new Error("getTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        xit("Should get an exception for a task with corrupted description", () => {
            const taskKey = KeyFactory.createTaskKey(project1.identifier, taskd1.identifier)
            return RedisTestDataProvider.deleteMember(client, taskKey, "description").then(() => {
                return dao.getTask(project1.identifier, taskd1.identifier)
            }).then(() => {
                throw new Error("getTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        xit("Should get an exception for a task with corrupted estimatedStartDate", () => {
            const startDateKey = KeyFactory.createTaskKey(project1.identifier, taskd1.identifier, "estimatedStartDate")
            return RedisTestDataProvider.deleteValue(client, startDateKey).then(() => {
                return dao.getTask(project1.identifier, taskd1.identifier)
            }).then(() => {
                throw new Error("getTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        xit("Should get an exception for a task with corrupted estimatedDuration", () => {
            const startDateKey = KeyFactory.createTaskKey(project1.identifier, taskd1.identifier, "estimatedDuration")
            return RedisTestDataProvider.deleteValue(client, startDateKey).then(() => {
                return dao.getTask(project1.identifier, taskd1.identifier)
            }).then(() => {
                throw new Error("getTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(CorruptedError)
            })
        })
        xit("Should get an exception for a corrupted task", () => {
            const taskKey = KeyFactory.createTaskKey(project1.identifier, taskd1.identifier)
            return RedisTestDataProvider.setValue(client, taskKey, "test").then(() => {
                return dao.getTask(project1.identifier, taskd1.identifier)
            }).then(() => {
                throw new Error("getTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
    describe("getProjectTasks", () => {
        xit("Should get a list of tasks that belongs to a project from the DB", () => {
            return dao.getProjectTasks(project1.identifier).then((tasks: Array<TaskDefinition>) => {
                const expected = [taskd1, taskd2, taskd3]
                chai.expect(tasks).to.deep.equal(expected)
            })
        })
        xit("Should get an exception for an invalid project identifier", () => {
            return dao.getProjectTasks(invalidProject.identifier).then(() => {
                throw new Error("getProjectTasks should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should only get tasks with body from the DB", () => {
            const projectKey = KeyFactory.createTaskKey(project1.identifier, taskd1.identifier)
            return RedisTestDataProvider.deleteValue(client, projectKey).then(() => {
                return dao.getProjectTasks(project1.identifier)
            }).then((tasks: Array<TaskDefinition>) => {
                chai.expect(tasks).to.deep.equal([taskd2, taskd3])
            })
        })
        xit("Should only get tasks without corrupted body from the DB", () => {
            const projectKey = KeyFactory.createTaskKey(project1.identifier, taskd1.identifier)
            return RedisTestDataProvider.setValue(client, projectKey, "test").then(() => {
                return dao.getProjectTasks(project1.identifier)
            }).then((tasks: Array<TaskDefinition>) => {
                chai.expect(tasks).to.deep.equal([taskd2, taskd3])
            })
        })
    })
    describe("addTask", () => {
        xit("Should add a task in the DB", () => {
            return dao.addTask(project1.identifier, taskd4).then(() => {
                return dao.getTask(project1.identifier, taskd4.identifier)
            }).then((task: TaskDefinition) => {
                chai.expect(task).to.deep.equal(taskd4)
            })
        })
        xit("Should get an exception when adding a task in the DB for an invalid project", () => {
            return dao.addTask(invalidProject.identifier, taskd4).then(() => {
                throw new Error("addTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should get an exception when adding an existing task in the DB", () => {
            return dao.addTask(project1.identifier, taskd1).then(() => {
                throw new Error("addTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(ExistsError)
            })
        })
        xit("Should get an exception when adding a task in a project with corrupted task ids", () => {
            const taskIdsKey = KeyFactory.createProjectKey(project1.identifier, "tasks")
            return RedisTestDataProvider.setValue(client, taskIdsKey, "test").then(() => {
                return dao.addTask(project1.identifier, taskd4)
            }).then(() => {
                throw new Error("addTask should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
    describe("isTaskImportant", () => {
        xit("Should check that a task that is not important will be reported as non-important", () => {
            return dao.isTaskImportant(project1.identifier, taskd1.identifier).then((important: boolean) => {
                chai.expect(important).to.false
            })
        })
        xit("Should check that a task that is important will be reported as important", () => {
            const projectImportantTasksKey = KeyFactory.createProjectKey(project1.identifier, "task:important")
            return RedisTestDataProvider.addValue(client, projectImportantTasksKey, taskd1.identifier).then(() => {
                return dao.isTaskImportant(project1.identifier, taskd1.identifier)
            }).then((important: boolean) => {
                chai.expect(important).to.true
            })
        })
        xit("Should get an exception when checking if a task is important for an invalid project", () => {
            return dao.isTaskImportant(invalidProject.identifier, taskd1.identifier).then(() => {
                throw new Error("isTaskImportant should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should get an exception when checking if a task is important for an invalid task", () => {
            return dao.isTaskImportant(project1.identifier, invalidTaskd.identifier).then(() => {
                throw new Error("isTaskImportant should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should get an exception when checking if a task is important for a corrupted task", () => {
            const projectImportantTasksKey = KeyFactory.createProjectKey(project1.identifier, "task:important")
            return RedisTestDataProvider.setValue(client, projectImportantTasksKey, "test").then(() => {
                return dao.isTaskImportant(project1.identifier, taskd1.identifier)
            }).then(() => {
                throw new Error("isTaskImportant should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
    describe("setTaskImportant", () => {
        xit("Should set task as important", () => {
            return dao.setTaskImportant(project1.identifier, taskd1.identifier, true).then(() => {
                return dao.isTaskImportant(project1.identifier, taskd1.identifier)
            }).then((important: boolean) => {
                chai.expect(important).to.true
            })
        })
        xit("Should not affect an important task when setting this task as important", () => {
            const projectImportantTasksKey = KeyFactory.createProjectKey(project1.identifier, "task:important")
            return RedisTestDataProvider.addValue(client, projectImportantTasksKey, taskd1.identifier).then(() => {
                return dao.setTaskImportant(project1.identifier, taskd1.identifier, true)
            }).then(() => {
                return dao.isTaskImportant(project1.identifier, taskd1.identifier)
            }).then((important: boolean) => {
                chai.expect(important).to.true
            })
        })
        xit("Should set task as not important", () => {
            const projectImportantTasksKey = KeyFactory.createProjectKey(project1.identifier, "task:important")
            return RedisTestDataProvider.addValue(client, projectImportantTasksKey, taskd1.identifier).then(() => {
                return dao.setTaskImportant(project1.identifier, taskd1.identifier, false)
            }).then(() => {
                return dao.isTaskImportant(project1.identifier, taskd1.identifier)
            }).then((important: boolean) => {
                chai.expect(important).to.false
            })
        })
        xit("Should not affecting a non-important task when setting this task as not important", () => {
            return dao.setTaskImportant(project1.identifier, taskd1.identifier, false).then(() => {
                return dao.isTaskImportant(project1.identifier, taskd1.identifier)
            }).then((important: boolean) => {
                chai.expect(important).to.false
            })
        })
        xit("Should get an exception when setting a task as important for an invalid project", () => {
            return dao.setTaskImportant(invalidProject.identifier, taskd1.identifier, true).then(() => {
                throw new Error("setTaskImportant should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should get an exception when setting a task as not important for an invalid project", () => {
            return dao.setTaskImportant(invalidProject.identifier, taskd1.identifier, false).then(() => {
                throw new Error("setTaskImportant should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should get an exception when setting a task as important for an invalid task", () => {
            return dao.setTaskImportant(project1.identifier, invalidTaskd.identifier, true).then(() => {
                throw new Error("setTaskImportant should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should get an exception when setting a task as important for an invalid task", () => {
            return dao.setTaskImportant(project1.identifier, invalidTaskd.identifier, false).then(() => {
                throw new Error("setTaskImportant should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(NotFoundError)
            })
        })
        xit("Should get an exception when setting a task as important for a corrupted task", () => {
            const projectImportantTasksKey = KeyFactory.createProjectKey(project1.identifier, "task:important")
            return RedisTestDataProvider.setValue(client, projectImportantTasksKey, "test").then(() => {
                return dao.setTaskImportant(project1.identifier, taskd1.identifier, true)
            }).then(() => {
                throw new Error("setTaskImportant should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
        xit("Should get an exception when setting a task as not important for a corrupted task", () => {
            const projectImportantTasksKey = KeyFactory.createProjectKey(project1.identifier, "task:important")
            return RedisTestDataProvider.setValue(client, projectImportantTasksKey, "test").then(() => {
                return dao.setTaskImportant(project1.identifier, taskd1.identifier, false)
            }).then(() => {
                throw new Error("setTaskImportant should not be a success")
            }).catch((error) => {
                chai.expect(error).to.instanceOf(InternalError)
            })
        })
    })
})
