// ============================================
// MODULE 3/4 - BLOG MODEL
// ============================================

const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Short description is required'],
            maxlength: 200,
        },
        content: {
            type: String,
            required: [true, 'Content is required'],
        },
        category: {
            type: String,
            required: true,
            enum: ['Technology', 'Lifestyle', 'Travel', 'Food', 'Education'],
        },
        coverImage: {
            type: String,
            default: '',
        },
        tags: {
            type: [String],
            default: [],
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    { timestamps: true }
);

// Text index for search
blogSchema.index({ title: 'text', tags: 'text' });

module.exports = mongoose.model('Blog', blogSchema);