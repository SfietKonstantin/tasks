import * as bodyParser from "body-parser"
import * as express from "express"
import * as path from "path"
import * as logger from "morgan"
import * as http from "http"
import * as winston from "winston"
import {RequestError} from "./requesterror"

export class Main {
    private app: express.Application
    private server: http.Server

    static create() {
        return new Main()
    }

    private constructor() {
        Main.initLog()

        this.app = express()
        this.app.set("view engine", "ejs")
        this.app.set("views", path.join(__dirname, "..", "..", "views"))

        // uncomment after placing your favicon in /public
        // this.app.use(favicon(path.join(__dirname, "public", "favicon.ico")))
        this.app.use(logger("dev"))
        this.app.use(bodyParser.json({limit: "10mb"}))
        this.app.use(bodyParser.urlencoded({extended: false}))
        this.app.use(express.static(path.join(__dirname, "..", "..", "public")))

        this.app.use(Main.errorHandler)
        this.app.use(Main.defaultErrorHandler)
    }

    start(port: number) {
        this.app.set("port", port)
        this.server = http.createServer(this.app)
        this.server.listen(port)
        this.server.on("error", Main.onServerError.bind(this))
        this.server.on("listening", this.onServerListening.bind(this))
    }

    private static initLog() {
        winston.remove(winston.transports.Console)
        winston.add(winston.transports.Console, {
            timestamp: true,
            level: "debug",
            colorize: true
        })
    }

    private static errorHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
        const error = new RequestError(404, "Not found")
        next(error)
    }
    private static defaultErrorHandler(error: RequestError, req: express.Request, res: express.Response,
                                       next: express.NextFunction) {
        res.status(error.status)
        res.render("error", {
            status: error.status,
            error: error.message
        })
    }

    private static onServerError(error: any) {
        throw error
    }

    private onServerListening() {
        winston.info("Server started on " + this.server.address().port)
    }
}
