import {IStoryDao} from "../../../server/dao/istory"
import {Story, StoryContent} from "../../../common/story"

export class MockStoryDao implements IStoryDao {
    getAllStories(): Promise<Array<Story>> {
        throw new Error("MockStoryDao: getAllStories is not mocked")
    }

    getFeatureStories(featureIdentifier: string): Promise<Array<Story>> {
        throw new Error("MockStoryDao: getFeatureStories is not mocked")
    }

    getStory(storyIdentifier: string): Promise<Story> {
        throw new Error("MockStoryDao: getStory is not mocked")
    }

    addStory(story: StoryContent): Promise<Story> {
        throw new Error("MockStoryDao: addStory is not mocked")
    }

    removeStory(storyIdentifier: string): Promise<void> {
        throw new Error("MockStoryDao: removeStory is not mocked")
    }
}

