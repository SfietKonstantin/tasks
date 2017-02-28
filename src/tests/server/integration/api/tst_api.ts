import * as supertest from "supertest"
import {Main} from "../../../../server/main"
import {RedisTestDataProvider} from "../../dao/redis/testdataprovider"
import {
    project1, project2, taskd1, taskd2, taskd3, modifier1, modifier2, modifier3,
    taskRelation2, delayd1, delayRelation2, modifier4
} from "../../../common/testdata"
import {TaskBuilder} from "../../../../common/api/task"
import {addDays, diffDates} from "../../../../common/utils/date"
import {DelayBuilder} from "../../../../common/api/delay"
import {ApiTaskData} from "../../../../server/api/taskdata"

describe("Integration API", () => {
    let main: Main
    beforeEach(() => {
        return RedisTestDataProvider.dumpOnly().then(() => {
            main = new Main(3)
            return main.start(8080)
        })
    })
    afterEach(() => {
        main.stop()
    })
    it("Should get a list of projects", (done) => {
        const projects = [project1, project2]
        supertest("http://localhost:8080")
            .get("/api/project/list")
            .expect("Content-Type", /json/)
            .expect(JSON.stringify(projects))
            .expect(200, done)
    })
    it("Should get a project", (done) => {
        supertest("http://localhost:8080")
            .get(`/api/project/${project1.identifier}`)
            .expect("Content-Type", /json/)
            .expect(JSON.stringify(project1))
            .expect(200, done)
    })
    it("Should tasks for a project", (done) => {
        const task1StartDate = addDays(taskd1.estimatedStartDate, modifier2.duration)
        const task1Duration = taskd1.estimatedDuration + modifier1.duration + modifier3.duration
        const task2StartDate = addDays(task1StartDate, task1Duration)
        const task3StartDate = addDays(task1StartDate, task1Duration + taskRelation2.lag)
        const tasks = [
            TaskBuilder.toApiTask(taskd1, task1StartDate, task1Duration),
            TaskBuilder.toApiTask(taskd2, task2StartDate, taskd2.estimatedDuration),
            TaskBuilder.toApiTask(taskd3, task3StartDate, taskd3.estimatedDuration)
        ]
        supertest("http://localhost:8080")
            .get(`/api/project/${project1.identifier}/task/list`)
            .expect("Content-Type", /json/)
            .expect(JSON.stringify(tasks))
            .expect(200, done)
    })
    it("Should get a task", (done) => {
        const task1StartDate = addDays(taskd1.estimatedStartDate, modifier2.duration)
        const task1Duration = taskd1.estimatedDuration + modifier1.duration + modifier3.duration
        const task2EstimatedEndDate = addDays(taskd2.estimatedStartDate, taskd2.estimatedDuration)
        const task2EndDate = addDays(task1StartDate, task1Duration + taskd2.estimatedDuration)
        const initialMargin = diffDates(task2EstimatedEndDate, delayd1.date) - delayRelation2.lag
        const margin = diffDates(task2EndDate, delayd1.date) - delayRelation2.lag
        const expected: ApiTaskData = {
            project: project1,
            task: TaskBuilder.toApiTask(taskd1, task1StartDate, task1Duration),
            modifiers: [modifier1, modifier2, modifier3],
            delays: [
                DelayBuilder.toApiDelay(delayd1, initialMargin, margin)
            ]
        }
        supertest("http://localhost:8080")
            .get(`/api/project/${project1.identifier}/task/${taskd1.identifier}`)
            .expect("Content-Type", /json/)
            .expect(JSON.stringify(expected))
            .expect(200, done)
    })
    it("Should get if a task is important (false)", (done) => {
        supertest("http://localhost:8080")
            .get(`/api/project/${project1.identifier}/task/${taskd1.identifier}/important`)
            .expect("Content-Type", /json/)
            .expect(JSON.stringify(false))
            .expect(200, done)
    })
    it("Should get if a task is important (true)", (done) => {
        supertest("http://localhost:8080")
            .get(`/api/project/${project1.identifier}/task/${taskd2.identifier}/important`)
            .expect("Content-Type", /json/)
            .expect(JSON.stringify(true))
            .expect(200, done)
    })
    it("Should set if a task is important (true)", (done) => {
        supertest("http://localhost:8080")
            .put(`/api/project/${project1.identifier}/task/${taskd1.identifier}/important`)
            .expect("Content-Type", /json/)
            .expect(JSON.stringify(true))
            .expect(200, done)
    })
    it("Should set if a task is important (false)", (done) => {
        supertest("http://localhost:8080")
            .delete(`/api/project/${project1.identifier}/task/${taskd2.identifier}/important`)
            .expect("Content-Type", /json/)
            .expect(JSON.stringify(false))
            .expect(200, done)
    })
    it("Should add a modifier", (done) => {
        const task1StartDate = addDays(taskd1.estimatedStartDate, modifier2.duration + modifier4.duration)
        const task1Duration = taskd1.estimatedDuration + modifier1.duration + modifier3.duration
        const task2EstimatedEndDate = addDays(taskd2.estimatedStartDate, taskd2.estimatedDuration)
        const task2EndDate = addDays(task1StartDate, task1Duration + taskd2.estimatedDuration)
        const initialMargin = diffDates(task2EstimatedEndDate, delayd1.date) - delayRelation2.lag
        const margin = diffDates(task2EndDate, delayd1.date) - delayRelation2.lag
        const expected: ApiTaskData = {
            project: project1,
            task: TaskBuilder.toApiTask(taskd1, task1StartDate, task1Duration),
            modifiers: [modifier1, modifier2, modifier3, modifier4],
            delays: [
                DelayBuilder.toApiDelay(delayd1, initialMargin, margin)
            ]
        }
        supertest("http://localhost:8080")
            .put("/api/modifier")
            .send({
                projectIdentifier: project1.identifier,
                taskIdentifier: taskd1.identifier,
                modifier: modifier4
            })
            .expect("Content-Type", /json/)
            .expect(JSON.stringify(expected))
            .expect(200, done)
    })
})
