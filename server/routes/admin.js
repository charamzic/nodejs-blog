const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const adminLayout = '../views/layouts/admin';
const jwtSecret = process.env.JWT_SECRET;

const { BLOG_NAME, BLOG_DESCRIPTION } = require('../models/constants');

/**
 *
 * Check login
 */
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

/**
 * GET
 * Admin - login page
 */
router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title: `${BLOG_NAME} | Admin`,
            description: BLOG_DESCRIPTION
        }
        res.render('admin/index', { locals, layout: adminLayout });
    } catch (error) {
        console.error(error)
    }
});

/**
 * POST
 * Admin - check login
 */
router.post('/admin', async (req, res) => {
    try {

        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Bad credentials.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Bad credentials.' });
        }

        const token = jwt.sign({ userId: user._id }, jwtSecret);
        res.cookie('token', token, { httpOnly: true });

        res.redirect('/dashboard');
    } catch (error) {
        console.error(error)
    }
});

/**
 * POST
 * Admin - register
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            const user = await User.create({ username, password: hashedPassword });
            res.status(201).json({ message: 'User created.', user });
        } catch (error) {
            if (error.code === 11000) {
                res.status(401).json({ message: 'User already in use.' });
            }
            res.status(500).json({ message: 'Internal server error.' });
        }

    } catch (error) {
        console.error(error)
    }
});

/**
 * GET /
 * Admin - dashboard
 */
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: `${BLOG_NAME} | Dashboard`,
            description: BLOG_DESCRIPTION
        }
        const data = await Post.find();
        res.render('admin/dashboard', { locals, data, layout: adminLayout });
    } catch (error) {
        console.error(error);
    }
});

/**
 * GET /
 * Admin - create new post
 */
router.get('/add-post', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: `${BLOG_NAME} | Add post`,
            description: BLOG_DESCRIPTION
        }
        const data = await Post.find();
        res.render('admin/add-post', { locals, data, layout: adminLayout });
    } catch (error) {
        console.error(error);
    }
});

/**
 * POST /
 * Admin - create new post
 */
router.post('/add-post', authMiddleware, async (req, res) => {
    try {
        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            });

            await Post.create(newPost);
            res.redirect('/dashboard');
        } catch (error) {
            console.error(error);
        }
    } catch (error) {
        console.error(error);
    }
});

/**
 * GET /
 * Admin - update post
 */
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        const locals = {
            title: `${BLOG_NAME} | Edit post`,
            description: BLOG_DESCRIPTION
        }

        const data = await Post.findOne({ _id: req.params.id });

        res.render(`admin/edit-post`, { data, layout: adminLayout, locals });
    } catch (error) {
        console.error(error);
    }
});

/**
 * PUT /
 * Admin - update post
 */
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        });

        res.redirect(`/edit-post/${req.params.id}`);

    } catch (error) {
        console.error(error);
    }
});

/**
 * DELETE /
 * Admin - delete post
 */
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.deleteOne({_id: req.params.id});
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
    }
});

/**
 * GET /
 * Admin - logout
 */
router.get('/logout', async (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
})

module.exports = router;