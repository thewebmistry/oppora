import mongoose, { Document, Schema, Types } from 'mongoose';

// TypeScript Interface for Post
export interface IPost extends Document {
  author: Types.ObjectId;
  content: string;
  mediaUrl?: string;
  tags: string[];
  likes: Types.ObjectId[];
  commentsCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Post Schema Definition
const PostSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      maxlength: [5000, 'Content cannot exceed 5000 characters'],
    },
    mediaUrl: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 10;
        },
        message: 'Cannot have more than 10 tags',
      },
    },
    likes: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster queries
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ isActive: 1 });

// Virtual for like count (optional, can be computed)
PostSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

// Create and export the model
export const Post = mongoose.model<IPost>('Post', PostSchema);
export default Post;