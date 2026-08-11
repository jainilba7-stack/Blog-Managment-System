

const Blog = require('../models/blogmodel.js');

const getBlogs = async (req, res, next) => {
    try {
        const { category, search } = req.query;
        const query = {};

        if (category && category !== 'all') {
            query.category = category;
        }
        if (search) {
            query.$text = { $search: search };
        }

        const blogs = await Blog.find(query)
            .populate('author', 'name email')
            .sort({ createdAt: -1 });

        res.json({ count: blogs.length, blogs });
    } catch (err) {
        next(err);
    }
};

// @desc    Get single blog by ID (also increments view count)
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'name email bio');
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        blog.views += 1;
        await blog.save();

        res.json({ blog });
    } catch (err) {
        next(err);
    }
};

// @desc    Get logged-in user's own blogs
// @route   GET /api/blogs/my-blogs
// @access  Private
const getMyBlogs = async (req, res, next) => {
    try {
        const blogs = await Blog.find({ author: req.user._id }).sort({ createdAt: -1 });
        res.json({ count: blogs.length, blogs });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a new blog
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res, next) => {
    try {
        const { title, description, content, category, coverImage, tags } = req.body;

        if (!title || !description || !content || !category) {
            return res.status(400).json({ message: 'Title, description, content, and category are required' });
        }

        const blog = await Blog.create({
            title,
            description,
            content,
            category,
            coverImage,
            tags,
            author: req.user._id,
        });

        res.status(201).json({ blog });
    } catch (err) {
        next(err);
    }
};

// @desc    Update a blog (only by its author)
// @route   PUT /api/blogs/:id
// @access  Private
const updateBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to edit this blog' });
        }

        const { title, description, content, category, coverImage, tags } = req.body;
        if (title) blog.title = title;
        if (description) blog.description = description;
        if (content) blog.content = content;
        if (category) blog.category = category;
        if (coverImage !== undefined) blog.coverImage = coverImage;
        if (tags) blog.tags = tags;

        await blog.save();
        res.json({ blog });
    } catch (err) {
        next(err);
    }
};

// @desc    Delete a blog (only by its author)
// @route   DELETE /api/blogs/:id
// @access  Private
const deleteBlog = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this blog' });
        }

        await blog.deleteOne();
        res.json({ message: 'Blog deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// @desc    Like / unlike a blog
// @route   POST /api/blogs/:id/like
// @access  Private
const toggleLike = async (req, res, next) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const userId = req.user._id.toString();
        const alreadyLiked = blog.likes.some(id => id.toString() === userId);

        if (alreadyLiked) {
            blog.likes = blog.likes.filter(id => id.toString() !== userId);
        } else {
            blog.likes.push(req.user._id);
        }

        await blog.save();
        res.json({ liked: !alreadyLiked, likesCount: blog.likes.length });
    } catch (err) {
        next(err);
    }
};

module.exports = { getBlogs, getBlogById, getMyBlogs, createBlog, updateBlog, deleteBlog, toggleLike };