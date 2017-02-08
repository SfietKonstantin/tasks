import * as bodyParser from "body-parser"
import * as express from "express"
import * as path from "path"
import * as logger from "morgan"
import * as http from "http"
import * as winston from "winston"
import {RequestError} from "./error/requesterror"
import {DaoBuilderFactory} from "./dao/factory"
import {GraphFactory} from "./graph/factory"
import {IDaoBuilder} from "./dao/ibuilder"
import {ApiRouterFactory} from "./routes/api/factory"
import {IGraph} from "./graph/igraph"

export class Main {
    private app: express.Application
    private daoBuilder: IDaoBuilder
    private graph: IGraph
    private server: http.Server
    private apiRouterFactory: ApiRouterFactory
    constructor(dbIndex: number = 0) {
        Main.initLog()

        this.daoBuilder = DaoBuilderFactory.create(dbIndex)
        this.graph = GraphFactory.create(this.daoBuilder)
        this.apiRouterFactory = new ApiRouterFactory(this.daoBuilder, this.graph)

        this.app = express()
        this.app.set("view engine", "ejs")
        this.app.set("views", path.join(__dirname, "..", "..", "views"))

        // uncomment after placing your favicon in /public
        // this.app.use(favicon(path.join(__dirname, "public", "favicon.ico")))
        this.app.use(logger("dev"))
        this.app.use(bodyParser.json({limit: "10mb"}))
        this.app.use(bodyParser.urlencoded({extended: false}))
        this.app.use(express.static(path.join(__dirname, "..", "..", "public")))

        this.app.use("/api", this.apiRouterFactory.create())

        this.app.use(Main.errorHandler)
        this.app.use(Main.defaultErrorHandler)

        this.server = http.createServer(this.app)
    }

    start(port: number): Promise<void> {
        return this.graph.load().then(() => {
            this.server.listen(port)
            this.server.on("listening", () => {
                winston.info(`Server started on ${port}`)
            })
        })
    }

    stop() {
        this.server.close()
        this.daoBuilder.stop()
    }

    private static errorHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
        const error = new RequestError(404, "Not found")
        next(error)
    }

    private static defaultErrorHandler(error: RequestError, req: express.Request, res: express.Response,
                                       next: express.NextFunction) {
        winston.debug(error.stack as string)
        res.status(error.status).json({error: error.message})
    }

    private static initLog() {
        winston.remove(winston.transports.Console)
        winston.add(winston.transports.Console, {
            timestamp: true,
            level: "debug",
            colorize: true
        })
    }
}
