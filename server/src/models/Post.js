import mongoose from 'mongoose'

const TOPICS = [
  'general', 'politics', 'entertainment', 'technology', 'sports',
  'science', 'health', 'business', 'travel', 'food', 'art', 'education'
]

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true },
    image: { type: String, default: null },
    topic: { type: String, enum: TOPICS, default: 'general' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
  },
  { timestamps: true }
)

postSchema.index({ topic: 1, createdAt: -1 })

export { TOPICS }
export default mongoose.model('Post', postSchema)
