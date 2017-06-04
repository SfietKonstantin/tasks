import * as sinon from "sinon"
import {IDaoBuilder} from "../../../server/dao/ibuilder"
import {MockFeatureDao} from "./mockfeature"
import {MockStoryDao} from "./mockstory"

export class MockDaoBuilder implements IDaoBuilder {
    private featureDao: MockFeatureDao
    private storyDao: MockStoryDao
    public mockFeatureDao: sinon.SinonMock
    public mockStoryDao: sinon.SinonMock

    constructor() {
        this.featureDao = new MockFeatureDao()
        this.storyDao = new MockStoryDao()
        this.mockFeatureDao = sinon.mock(this.featureDao)
        this.mockStoryDao = sinon.mock(this.storyDao)
    }

    stop() {
    }

    buildFeatureDao(): MockFeatureDao {
        return this.featureDao
    }

    buildStoryDao(): MockStoryDao {
        return this.storyDao
    }

    verify() {
        this.mockFeatureDao.verify()
        this.mockStoryDao.verify()
    }
}
