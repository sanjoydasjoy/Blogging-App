const mongoose = require('mongoose')
const {Schema,model} = mongoose


const PostSchema = new Schema({
    title: { type: String, required: true, trim: true, minlength: 6, maxlength: 180 },
    summary: { type: String, required: true, trim: true, minlength: 12, maxlength: 280 },
    content: { type: String, required: true },
    topic: {
        type: String,
        trim: true,
        lowercase: true,
        default: 'general',
        index: true,
    },
    tags: {
        type: [String],
        default: [],
    },
    bookmarks: {
        type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        default: [],
    },
    reactions: {
        like: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
        love: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
        insightful: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
    },
    cover: String,
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true,
});

PostSchema.index({ createdAt: -1 });
PostSchema.index({ title: 'text', summary: 'text' });
PostSchema.index({ topic: 1, createdAt: -1 });



const PostModel = model('Post',PostSchema)


module.exports = PostModel