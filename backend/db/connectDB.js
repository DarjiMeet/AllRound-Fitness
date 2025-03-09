import mongoose from 'mongoose'

export const connectDB = async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`Monogodb connected ${conn.connection.host}`)
    } catch (error) {
        console.log("Error connection: ",error.message);
        process.exit(1)
    }
}