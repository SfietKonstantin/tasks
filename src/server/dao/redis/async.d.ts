import * as redis from "redis"

export interface RedisAsyncClient extends redis.RedisClient {
    setAsync(...args: any[]): Promise<any>
    getAsync(...args: any[]): Promise<any>
    mgetAsync(...args: any[]): Promise<any>
    msetAsync(...args: any[]): Promise<any>
    incrAsync(...args: any[]): Promise<any>
    sismemberAsync(...args: any[]): Promise<any>
    saddAsync(...args: any[]): Promise<any>
    sremAsync(...args: any[]): Promise<any>
    smembersAsync(...args: any[]): Promise<any>
    hmsetAsync(...args: any[]): Promise<any>
    hgetallAsync(...args: any[]): Promise<any>
    existsAsync(...args: any[]): Promise<number>
    watchAsync(...args: any[]): Promise<any>
}

