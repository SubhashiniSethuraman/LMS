import { MongoClient } from 'mongodb'

const client = new MongoClient (process.env.MONGODB_URI)

let db;

const connectDB = async () => {
    try{
        await client.connect()
        console.log("Database Connected")

        //Select Database name
        db = client.db("lms")
    }
    catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
}

export {connectDB, db}