import * as express from "express"
import {Application, Request, Response} from "express"
import * as supertest from "supertest"
import {asRoute, asParameterHandler} from "../../../../server/routes/api/utils"
import {RequestError} from "../../../../server/error/requesterror"

describe("Integration API utils", () => {
    interface TestRequest extends Request {
        data: string
    }
    const data = {
        test: "something"
    }
    const error = {
        error: "Stuff not found"
    }

    let app: Application
    beforeEach(() => {
        app = express()
    })
    describe("asParameterHandler", () => {
        it("Should delegate the call", (done) => {
            app.param(":test", asParameterHandler((req: TestRequest) => {
                req.data = req.params.test
            }))
            app.use("/test/:test", (req: TestRequest, res: Response) => {
                res.json({test: req.data})
            })

            supertest(app).get("/test/something")
                .expect("Content-Type", /json/)
                .expect(200)
                .expect(JSON.stringify(data), done)
        })
        it("Should get an error as JSON", (done) => {
            app.param(":test", asParameterHandler(() => {
                throw new RequestError(404, "Stuff not found")
            }))
            app.use("/test/:test", (req: TestRequest, res: Response) => {
                res.json({test: req.data})
            })

            supertest(app).get("/test/something")
                .expect("Content-Type", /json/)
                .expect(404)
                .expect(JSON.stringify(error), done)
        })
        it("Should get an unknown error as a HTTP 500", (done) => {
            app.param(":test", asParameterHandler(() => {
                throw new Error("Error")
            }))
            app.use("/test/:test", (req: TestRequest, res: Response) => {
                res.json({test: req.data})
            })

            supertest(app).get("/test/something")
                .expect(500, done)
        })
    })
    describe("asRoute", () => {
        it("Should return the promise as JSON", (done) => {
            app.use("/test", asRoute(() => {
                return Promise.resolve(data)
            }))

            supertest(app).get("/test")
                .expect("Content-Type", /json/)
                .expect(200)
                .expect(JSON.stringify(data), done)
        })
        it("Should get an error as JSON", (done) => {
            app.use("/test", asRoute(() => {
                return Promise.reject(new RequestError(404, error.error))
            }))

            supertest(app).get("/test")
                .expect("Content-Type", /json/)
                .expect(404)
                .expect(JSON.stringify(error), done)
        })
        it("Should get an unknown error as a HTTP 500", (done) => {
            app.use("/test", asRoute(() => {
                return Promise.reject(new Error("Error"))
            }))

            supertest(app).get("/test")
                .expect(500, done)
        })
    })
})
