import * as chai from "chai"
import * as redis from "redis"
import { Project, Task, Impact } from "../core/types"
import { RedisDataProvider } from "../core/data/redisdataprovider"

describe("Redis", () => {
    let client: redis.RedisClient
    let db: RedisDataProvider
    before(() => {
        client = redis.createClient()
        client.select(3)

        db = new RedisDataProvider(client)
    })
    describe("Projects", () => {
        it("Should initially get an empty list of projects", (done) => {
            db.getAllProjects().then((projects: Array<Project>) => {
                chai.expect(projects).to.empty
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should add the initial project", (done) => {
            let project = new Project(null)
            project.name = "Project 1"
            project.description = "Description 1"
            db.addProject(project).then((id: number) => {
                chai.expect(id).to.equals(1)
                chai.expect(project.id).to.equals(1)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should add another project", (done) => {
            let project = new Project(null)
            project.name = "Project 2"
            project.description = "Description 2"
            db.addProject(project).then((id: number) => {
                chai.expect(id).to.equals(2)
                chai.expect(project.id).to.equals(2)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get the added projects", (done) => {
            db.getAllProjects().then((projects: Array<Project>) => {
                chai.expect(projects).to.length(2)
                chai.expect(projects[0].id).to.equals(1)
                chai.expect(projects[0].name).to.equals("Project 1")
                chai.expect(projects[0].description).to.equals("Description 1")
                chai.expect(projects[1].id).to.equals(2)
                chai.expect(projects[1].name).to.equals("Project 2")
                chai.expect(projects[1].description).to.equals("Description 2")
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get projects", (done) => {
            db.getProjects([2, 1]).then((projects: Array<Project>) => {
                chai.expect(projects).to.length(2)
                chai.expect(projects[0].id).to.equals(2)
                chai.expect(projects[0].name).to.equals("Project 2")
                chai.expect(projects[0].description).to.equals("Description 2")
                chai.expect(projects[1].id).to.equals(1)
                chai.expect(projects[1].name).to.equals("Project 1")
                chai.expect(projects[1].description).to.equals("Description 1")
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get a project", (done) => {
            db.getProject(1).then((project: Project) => {
                chai.expect(project.id).to.equals(1)
                chai.expect(project.name).to.equals("Project 1")
                chai.expect(project.description).to.equals("Description 1")
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
    })
    describe("Tasks", () => {
        it("Should initially get an empty list of tasks", (done) => {
            db.getProjectTasks(1).then((tasks: Array<Task>) => {
                chai.expect(tasks).to.empty
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should add a task", (done) => {
            let task = new Task(null, null)
            task.name = "Task 1"
            task.description = "Description 1"
            task.estimatedStartDate = new Date(2015, 9, 1)
            task.estimatedDuration = 15
            db.addTask(1, task).then((id: number) => {
                chai.expect(id).to.equals(1)
                chai.expect(task.id).to.equals(1)
                chai.expect(task.projectId).to.equals(1)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should add another task", (done) => {
            let task = new Task(null, null)
            task.name = "Task 2"
            task.description = "Description 2"
            task.estimatedStartDate = new Date(2015, 9, 15)
            task.estimatedDuration = 30
            db.addTask(1, task).then((id: number) => {
                chai.expect(id).to.equals(2)
                chai.expect(task.id).to.equals(2)
                chai.expect(task.projectId).to.equals(1)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get the added tasks", (done) => {
            db.getProjectTasks(1).then((tasks: Array<Task>) => {
                chai.expect(tasks).to.length(2)
                chai.expect(tasks[0].id).to.equals(1)
                chai.expect(tasks[0].projectId).to.equals(1)
                chai.expect(tasks[0].name).to.equals("Task 1")
                chai.expect(tasks[0].description).to.equals("Description 1")
                chai.expect(tasks[0].estimatedStartDate.getTime()).to.equals(new Date(2015, 9, 1).getTime())
                chai.expect(tasks[0].estimatedDuration).to.equals(15)
                chai.expect(tasks[1].id).to.equals(2)
                chai.expect(tasks[1].projectId).to.equals(1)
                chai.expect(tasks[1].name).to.equals("Task 2")
                chai.expect(tasks[1].description).to.equals("Description 2")
                chai.expect(tasks[1].estimatedStartDate.getTime()).to.equals(new Date(2015, 9, 15).getTime())
                chai.expect(tasks[1].estimatedDuration).to.equals(30)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get tasks", (done) => {
            db.getTasks([2, 1]).then((tasks: Array<Task>) => {
                chai.expect(tasks).to.length(2)
                chai.expect(tasks[0].id).to.equals(2)
                chai.expect(tasks[0].projectId).to.equals(1)
                chai.expect(tasks[0].name).to.equals("Task 2")
                chai.expect(tasks[0].description).to.equals("Description 2")
                chai.expect(tasks[0].estimatedStartDate.getTime()).to.equals(new Date(2015, 9, 15).getTime())
                chai.expect(tasks[0].estimatedDuration).to.equals(30)
                chai.expect(tasks[1].id).to.equals(1)
                chai.expect(tasks[1].projectId).to.equals(1)
                chai.expect(tasks[1].name).to.equals("Task 1")
                chai.expect(tasks[1].description).to.equals("Description 1")
                chai.expect(tasks[1].estimatedStartDate.getTime()).to.equals(new Date(2015, 9, 1).getTime())
                chai.expect(tasks[1].estimatedDuration).to.equals(15)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get a task", (done) => {
            db.getTask(1).then((task: Task) => {
                chai.expect(task.id).to.equals(1)
                chai.expect(task.projectId).to.equals(1)
                chai.expect(task.name).to.equals("Task 1")
                chai.expect(task.description).to.equals("Description 1")
                chai.expect(task.estimatedStartDate.getTime()).to.equals(new Date(2015, 9, 1).getTime())
                chai.expect(task.estimatedDuration).to.equals(15)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
    })
    describe("Task relations", () => {
        it("Should initially get an empty list of parents", (done) => {
            db.getParentTaskIds(2).then((ids: Array<number>) => {
                chai.expect(ids).to.empty
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should initially get an empty list of children", (done) => {
            db.getChildrenTaskIds(1).then((ids: Array<number>) => {
                chai.expect(ids).to.empty
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should set task relation", (done) => {
            db.setTaskRelation(1, 2).then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get parents relation", (done) => {
            db.getParentTaskIds(2).then((ids: Array<number>) => {
                chai.expect(ids).to.length(1)
                chai.expect(ids[0]).to.equals(1)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get children relation", (done) => {
            db.getChildrenTaskIds(1).then((ids: Array<number>) => {
                chai.expect(ids).to.length(1)
                chai.expect(ids[0]).to.equals(2)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should set project root task", (done) => {
            db.setProjectRootTask(1, 1).then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get project root task", (done) => {
            db.getProjectRootTask(1).then((id: number) => {
                chai.expect(id).to.equals(1)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
    })
    describe("Impacts", () => {
        it("Should add an impact", (done) => {
            let impact = new Impact(null)
            impact.name = "Impact 1"
            impact.description = "Description 1"
            impact.duration = 5
            db.addImpact(impact).then((id: number) => {
                chai.expect(id).to.equals(1)
                chai.expect(impact.id).to.equals(1)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should add another impact", (done) => {
            let impact = new Impact(null)
            impact.name = "Impact 2"
            impact.description = "Description 2"
            impact.duration = 10
            db.addImpact(impact).then((id: number) => {
                chai.expect(id).to.equals(2)
                chai.expect(impact.id).to.equals(2)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get impacts", (done) => {
            db.getImpacts([2, 1]).then((impacts: Array<Impact>) => {
                chai.expect(impacts).to.length(2)
                chai.expect(impacts[0].id).to.equals(2)
                chai.expect(impacts[0].name).to.equals("Impact 2")
                chai.expect(impacts[0].description).to.equals("Description 2")
                chai.expect(impacts[0].duration).to.equals(10)
                chai.expect(impacts[1].id).to.equals(1)
                chai.expect(impacts[1].name).to.equals("Impact 1")
                chai.expect(impacts[1].description).to.equals("Description 1")
                chai.expect(impacts[1].duration).to.equals(5)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get an impact", (done) => {
            db.getImpact(1).then((impact: Impact) => {
                chai.expect(impact.id).to.equals(1)
                chai.expect(impact.name).to.equals("Impact 1")
                chai.expect(impact.description).to.equals("Description 1")
                chai.expect(impact.duration).to.equals(5)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
    })
    describe("Impact relations", () => {
        it("Should initially get an empty list of impacts from task", (done) => {
            db.getTaskImpactIds(1).then((ids: Array<number>) => {
                chai.expect(ids).to.empty
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should initially get an empty list of task from impact", (done) => {
            db.getTaskImpactIds(1).then((ids: Array<number>) => {
                chai.expect(ids).to.empty
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should set impact for task", (done) => {
            db.setImpactForTask(2, 1).then(() => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get impacts from task", (done) => {
            db.getTaskImpactIds(1).then((ids: Array<number>) => {
                chai.expect(ids).to.length(1)
                chai.expect(ids[0]).to.equals(2)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should get tasks from impacts", (done) => {
            db.getImpactedTaskIds(2).then((ids: Array<number>) => {
                chai.expect(ids).to.length(1)
                chai.expect(ids[0]).to.equals(1)
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
    })
    after(() => {
        client.flushdb()
    })
})

describe("Redis error management", () => {
    let client: redis.RedisClient
    let db: RedisDataProvider
    before(() => {
        client = redis.createClient()
        client.select(4)

        db = new RedisDataProvider(client)
    })
    describe("Initial checks", () => {
        it("Should add projects", (done) => {
            let project1 = new Project(null)
            project1.name = "Project 1"
            let project2 = new Project(null)
            project2.name = "Project 2"
            db.addProject(project1).then((id: number) => {
                return db.addProject(project2)
            }).then((id: number) => {
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
    })
    describe("Projects", () => {
        it("Should get invalid projects", (done) => {
            db.getProjects([3]).then((projects: Array<Project>) => {
                chai.expect(projects).to.length(1)
                chai.expect(projects[0]).to.null
                done()
            }).catch((error: Error) => {
                done(error)
            })
        })
        it("Should not get an invalid project", (done) => {
            db.getProject(3).then((project: Project) => {
                done(new Error())
            }).catch((error: Error) => {
                chai.expect(error).not.null
                done()
            })
        })
    })
    describe("Tasks", () => {
        it("Should not add a task", (done) => {
            let task = new Task(null, null)
            task.name = "Task 1"
            task.description = "Description 1"
            task.estimatedStartDate = new Date(2015, 9, 1)
            task.estimatedDuration = 15
            db.addTask(3, task).then(() => {
                done(new Error())
            }).catch((error) => {
                chai.expect(error).not.null
                done()
            })
        })
    })
    describe("Task relations", () => {
        it("Should not set root task", (done) => {
            db.setProjectRootTask(1, 1).then(() => {
                done(new Error())
            }).catch((error: Error) => {
                chai.expect(error).not.null
                done()
            })
        })
    })
    after(() => {
        client.flushdb()
    })
})