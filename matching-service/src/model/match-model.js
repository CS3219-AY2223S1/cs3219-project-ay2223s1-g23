import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';
var Schema = mongoose.Schema

let MatchModelSchema = new Schema({
    userId: {
        type: String,
        default: uuidv4,
        required: true,
    },
    difficulty: {
        type: String,
    },
    matchedUser: {
        type: String,
        default: uuidv4
    }
})

export default mongoose.model('MatchModel', MatchModelSchema)
