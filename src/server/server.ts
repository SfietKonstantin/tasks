import * as bodyParser from "body-parser"
import * as express from "express"
import * as path from "path"
import * as logger from "morgan"
import * as http from "http"
import * as redis from "redis"
import * as winston from "winston"
import { Graph } from "./core/graph/graph"
import { Api, RequestError } from "./core/api"
import { ApiRoutes } from "./routes/api"
import { Routes } from "./routes/routes"
import { IDataProvider } from "./core/data/idataprovider"
import { RedisDataProvider } from "./core/data/redisdataprovider"

export class Server {
    private app: express.Application
    private server: http.Server
    private dataProvider: IDataProvider
    private graph: Graph
    private api: ApiRoutes
    private routes: Routes

    public constructor() {
        this.initLog()

        this.dataProvider = new RedisDataProvider(redis.createClient())
        this.graph = new Graph(this.dataProvider)

        this.api = new ApiRoutes(this.dataProvider, this.graph, new Api(this.dataProvider, this.graph))
        this.routes = new Routes(this.dataProvider)
        this.app = express()
        this.app.set("view engine", "ejs")
        this.app.set("views", path.join(__dirname, "..", "views"))

        // uncomment after placing your favicon in /public
        // this.app.use(favicon(path.join(__dirname, "public", "favicon.ico")))
        this.app.use(logger("dev"))
        this.app.use(bodyParser.json({limit: "10mb"}))
        this.app.use(bodyParser.urlencoded({extended: false}))
        this.app.use(express.static(path.join(__dirname, "..", "public")))

        this.app.get("/", this.routes.index.bind(this.routes))
        this.app.get("/project/:projectIdentifier", this.routes.getProject.bind(this.routes))
        this.app.get("/project/:projectIdentifier/task/:taskIdentifier", this.routes.getTask.bind(this.routes))
        this.app.get("/import/:source", this.routes.getImport.bind(this.routes))

        // API
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
        this.app.put("/api/modifier", this.api.putModifier.bind(this.api))
        this.app.put("/api/import", this.api.putImport.bind(this.api))

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

    private initLog() {
        winston.remove(winston.transports.Console)
        winston.add(winston.transports.Console, {
            timestamp: true,
            level: "debug",
            colorize: true
        })
    }

    private errorHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
        const error = new RequestError(404, "Not found")
        next(error)
    }

    private registerErrorHandlers() {
        if (this.app.get("env") === "development") {
            this.app.use(this.devErrorHandler)
        }
        this.app.use(this.defaultErrorHandler)
    }

    private devErrorHandler(error: RequestError, req: express.Request, res: express.Response,
                            next: express.NextFunction) {
        res.status(error.status || 500)
        res.render("error", {
            message: error.message,
            error: error
        })
    }

    private defaultErrorHandler(error: RequestError, req: express.Request, res: express.Response,
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
        winston.info("Server started on " + this.server.address().port)
    }
}
