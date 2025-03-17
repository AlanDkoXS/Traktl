import mongoose from 'mongoose'
import { envs } from '../../config'

interface Options {
    mongoUrl?: string
    dbName?: string
}

export class MongoDatabase {
    static async connect(options?: Options) {
        try {
            const mongoUrl = options?.mongoUrl || envs.MONGODB_URI
            const dbName = options?.dbName || envs.DATABASE_NAME

            await mongoose.connect(mongoUrl, {
                dbName,
            })

            console.log('MongoDB connection: ✓')
            return true
        } catch (error) {
            console.error('MongoDB connection: ✗:', error)
            throw error
        }
    }

    static async disconnect() {
        await mongoose.disconnect()
        console.log('MongoDB disconnected')
    }
}
