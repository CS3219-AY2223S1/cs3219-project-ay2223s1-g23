import mongoose from 'mongoose';
var Schema = mongoose.Schema

let HistoryModelSchema = new Schema({
    quesId: {
        type: String,
        required: true
    },
    userId1: {
        type: String,
        required: true
    },
    userId2: {
        type: String,
        required: true
    },
    answer: {
        type: String,
    }
}, {
    timestamps: true
})

export default mongoose.model('HistoryModel', HistoryModelSchema)
