import * as supertest from "supertest"
import {Main} from "../../../server/main"
import {RedisTestDataProvider} from "../dao/redis/testdataprovider"

describe("Integration Error management", () => {
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
    it("Should return a JSON as error", (done) => {
        supertest("http://localhost:8080").get("/invalid")
            .expect("Content-Type", /json/)
            .expect(404, done)
    })
})
