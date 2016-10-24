import * as bodyParser from "body-parser"
import * as express from "express"
import * as path from "path"
import * as logger from "morgan"
import * as http from "http"
import * as redis from "redis"
import { Graph } from "./core/graph/graph"
import { Api } from "./routes/api"
import { Routes } from "./routes/routes"
import { IDataProvider } from "./core/data/idataprovider"
import { RedisDataProvider } from "./core/data/redisdataprovider"

class HttpError extends Error {
    constructor(status: number, message: string) {
        super(message)
        this.status = status
    }
    status: number
}

export class Server {
    private app: express.Application
    private server: http.Server
    private dataProvider: IDataProvider
    private graph: Graph
    private api: Api
    private routes: Routes

    public constructor() {
        this.dataProvider = new RedisDataProvider(redis.createClient())
        this.graph = new Graph(this.dataProvider)

        this.api = new Api(this.dataProvider, this.graph)
        this.routes = new Routes(this.dataProvider)
        this.app = express()
        this.app.set("view engine", "ejs")
        this.app.set("views", path.join(__dirname, "..", "views"))

        // uncomment after placing your favicon in /public
        // this.app.use(favicon(path.join(__dirname, "public", "favicon.ico")))
        this.app.use(logger("dev"))
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({extended: false}))
        this.app.use(express.static(path.join(__dirname, "..", "public")))

        this.app.get("/", this.routes.index.bind(this.routes))
        this.app.get("/project/:projectIdentifier", this.routes.getProject.bind(this.routes))
        this.app.get("/project/:projectIdentifier/task/:taskIdentifier", this.routes.getTask.bind(this.routes))
        this.app.get("/import/:source", this.routes.getImport.bind(this.routes))

        // API
        this.app.put("/api/project", this.api.putProject.bind(this.api))
        this.app.get("/api/project/list", this.api.getProjects.bind(this.api))
        this.app.get("/api/project/:projectIdentifier", this.api.getProject.bind(this.api))
        this.app.get("/api/project/:projectIdentifier/tasks", this.api.getProjectTasks.bind(this.api))
        this.app.get("/api/project/:projectIdentifier/task/:taskIdentifier", this.api.getTask.bind(this.api))
        this.app.get("/api/project/:projectIdentifier/task/:taskIdentifier/important",
                     this.api.isTaskImportant.bind(this.api))
        this.app.put("/api/project/:projectIdentifier/task/:taskIdentifier/important",
                     this.api.putTaskImportant.bind(this.api))
        this.app.delete("/api/project/:projectIdentifier/task/:taskIdentifier/important",
                     this.api.deleteTaskImportant.bind(this.api))
        this.app.put("/api/task", this.api.putTask.bind(this.api))
        this.app.put("/api/modifier", this.api.putModifier.bind(this.api))

        // Demo
        this.app.get("/demo/data", this.api.getDemoData.bind(this.api))

        this.app.use(this.errorHandler)
        this.registerErrorHandlers()
    }

    public start(port: number) {
        this.graph.load().then(() => {
            this.app.set("port", port)
            this.server = http.createServer(this.app)
            this.server.listen(port)
            this.server.on("error", this.onServerError.bind(this))
            this.server.on("listening", this.onServerListening.bind(this))
        })
    }

    private errorHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
        const error: HttpError = new HttpError(404, "Not found")
        next(error)
    }

    private registerErrorHandlers() {
        if (this.app.get("env") === "development") {
            this.app.use(this.devErrorHandler)
        }
        this.app.use(this.defaultErrorHandler)
    }

    private devErrorHandler(error: HttpError, req: express.Request, res: express.Response,
                            next: express.NextFunction) {
        res.status(error.status || 500)
        res.render("error", {
            message: error.message,
            error: error
        })
    }

    private defaultErrorHandler(error: HttpError, req: express.Request, res: express.Response,
                                next: express.NextFunction) {
        res.status(error.status || 500)
        res.render("error", {
            message: error.message,
            error: {}
        })
    }

    private onServerError(error: any) {
        throw error
    }

    private onServerListening() {
        console.log("Listening on " + this.server.address().port)
    }
}
