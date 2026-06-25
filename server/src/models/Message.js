import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, trim: true, maxlength: 2000, default: '' },
    image: { type: String, default: null },  // path to uploaded chat image
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
)

messageSchema.statics.makeConversationId = function (userIdA, userIdB) {
  return [String(userIdA), String(userIdB)].sort().join('_')
}

export default mongoose.model('Message', messageSchema)
