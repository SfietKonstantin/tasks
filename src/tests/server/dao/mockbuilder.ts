import * as sinon from "sinon"
import {IDaoBuilder} from "../../../server/dao/ibuilder"
import {MockProjectDao} from "./mockproject"
import {MockTaskDao} from "./mocktask"
import {MockDelayDao} from "./mockdelay"
import {MockTaskRelationDao} from "./mocktaskrelation"
import {MockDelayRelationDao} from "./mockdelayrelation"
import {MockModifierDao} from "./mockmodifier"

export class MockDaoBuilder implements IDaoBuilder {
    private projectDao: MockProjectDao
    private taskDao: MockTaskDao
    private delayDao: MockDelayDao
    private taskRelationDao: MockTaskRelationDao
    private delayRelationDao: MockDelayRelationDao
    private modifierDao: MockModifierDao
    public mockProjectDao: sinon.SinonMock
    public mockTaskDao: sinon.SinonMock
    public mockDelayDao: sinon.SinonMock
    public mockTaskRelationDao: sinon.SinonMock
    public mockDelayRelationDao: sinon.SinonMock
    public mockModifierDao: sinon.SinonMock

    constructor() {
        this.projectDao = new MockProjectDao()
        this.mockProjectDao = sinon.mock(this.projectDao)
        this.taskDao = new MockTaskDao()
        this.mockTaskDao = sinon.mock(this.taskDao)
        this.delayDao = new MockDelayDao()
        this.mockDelayDao = sinon.mock(this.delayDao)
        this.taskRelationDao = new MockTaskRelationDao()
        this.mockTaskRelationDao = sinon.mock(this.taskRelationDao)
        this.delayRelationDao = new MockDelayRelationDao()
        this.mockDelayRelationDao = sinon.mock(this.delayRelationDao)
        this.modifierDao = new MockModifierDao()
        this.mockModifierDao = sinon.mock(this.modifierDao)
    }

    buildProjectDao(): MockProjectDao {
        return this.projectDao
    }

    buildTaskDao(): MockTaskDao {
        return this.taskDao
    }

    buildDelayDao(): MockDelayDao {
        return this.delayDao
    }

    buildTaskRelationDao(): MockTaskRelationDao {
        return this.taskRelationDao
    }

    buildDelayRelationDao(): MockDelayRelationDao {
        return this.delayRelationDao
    }

    buildModifierDao(): MockModifierDao {
        return this.modifierDao
    }

    verify() {
        this.mockProjectDao.verify()
        this.mockTaskDao.verify()
        this.mockDelayDao.verify()
        this.mockTaskRelationDao.verify()
        this.mockDelayRelationDao.verify()
        this.mockModifierDao.verify()
    }
}
