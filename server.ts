import * as bodyParser from "body-parser"
import * as express from "express"
import * as path from "path"
import * as logger from "morgan"
import * as http from "http"
import * as routes from "./routes/index"
import { Api } from "./routes/api"
import { BasicDataProvider } from "./data"

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
  private api: Api

  public constructor() {
    this.api = new Api(new BasicDataProvider())
    this.app = express()
    this.app.set('view engine', 'ejs');
    // this.app.set('views', path.join(__dirname, 'views'))

    // uncomment after placing your favicon in /public
    //this.app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
    this.app.use(logger('dev'))
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({extended: false}))
    this.app.use(express.static(path.join(__dirname, 'public')))

    this.app.get('/', routes.index)
    this.app.get('/api/project/list', this.api.getProjectList.bind(this.api))
    this.app.get('/api/project/:id', this.api.getProject.bind(this.api))
    this.app.get('/api/project/:id/task/list', this.api.getProjectTaskList.bind(this.api))
    this.app.get('/api/task/:id', this.api.getTask.bind(this.api))

    this.app.use(this.errorHandler)
    this.registerErrorHandlers()
  }

  public start(port: number) {
    this.app.set('port', port)
    this.server = http.createServer(this.app);
    this.server.listen(port);
    this.server.on('error', this.onServerError.bind(this));
    this.server.on('listening', this.onServerListening.bind(this));
  }

  private errorHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
    let error: HttpError
    error = new HttpError(404, 'Not found')
    next(error)
  }

  private registerErrorHandlers() {
    if (this.app.get('env') === 'development') {
      this.app.use(this.devErrorHandler)
    }
    this.app.use(this.defaultErrorHandler)
  }

  private devErrorHandler(error: HttpError, req: express.Request, res: express.Response, next: express.NextFunction) {
    res.status(error.status || 500)
    res.render('error', {
      message: error.message,
      error: error
    })
  } 

  private defaultErrorHandler(error: HttpError, req: express.Request, res: express.Response, next: express.NextFunction) {
    res.status(error.status || 500)
    res.render('error', {
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