// ============================================
// MODULE 3/4 - BLOG ROUTES
// ============================================

const express = require('express');
const router = express.Router();
const {
    getBlogs,
    getBlogById,
    getMyBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    toggleLike,
} = require('../controllers/blogcontroller.js');
const { protect } = require('../middlewares/authmiddleware.js');

// IMPORTANT: /my-blogs must be declared BEFORE /:id
// otherwise Express treats "my-blogs" as an :id param
router.get('/my-blogs', protect, getMyBlogs);

router.get('/', getBlogs);
router.post('/', protect, createBlog);
router.get('/:id', getBlogById);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);
router.post('/:id/like', protect, toggleLike);

module.exports = router;