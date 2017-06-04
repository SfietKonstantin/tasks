import {Story, StoryContent} from "../../common/story"

export interface IStoryDao {
    getAllStories(): Promise<Array<Story>>
    getFeatureStories(featureIdentifier: string): Promise<Array<Story>>
    getStory(storyIdentifier: string): Promise<Story>
    addStory(story: StoryContent): Promise<Story>
    removeStory(storyIdentifier: string): Promise<void>
}
