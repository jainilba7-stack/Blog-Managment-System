// ============================================
// MODULE 2 - BACKEND SERVER ENTRY POINT
// Node.js + Express.js
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db.js');
const { notFound, errorHandler } = require('./middlewares/errormiddleware.js');

const authRoutes = require('./routes/authroute.js');
const blogRoutes = require('./routes/blogroute.js');

// Connect to MongoDB
connectDB();

const app = express();

// ---- Middleware ----
app.use(express.json({ limit: "10mb" }));
app.use(
    cors({
        origin: process.env.CLIENT_URL || '*',
        credentials: true,
    })
);

// ---- Health check ----
app.get('/', (req, res) => {
    res.json({ message: 'BlogSphere API is running ✅' });
});

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// ---- Error handling (must be last) ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

