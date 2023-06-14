const express = require('express');
const router = express.Router();
const Post = require('../models/Post')
const { BLOG_NAME, BLOG_DESCRIPTION } = require('../models/constants');

/**
 * GET
 * HOME
 */
router.get('', async (req, res) => {
    try {
        const locals = {
            title: BLOG_NAME,
            description: BLOG_DESCRIPTION
        }

        let perPage = 6;
        let page = req.query.page || 1;

        const data = await Post.aggregate([{ $sort: { createdAt: -1 } }])
            .skip(perPage * page - perPage)
            .limit(perPage)
            .exec();

        const count = await Post.count();
        const nextPage = parseInt(page) + 1;
        const hasNextPage = nextPage <= Math.ceil(count / perPage);

        res.render('index', {
            locals,
            data,
            current: page,
            nextPage: hasNextPage ? nextPage : null,
            currentRoute: '/'
        });
    } catch (error) {
        console.error(error);
    }
});

/**
 * GET
 * About
 */
router.get('/about', async (req, res) => {
    const locals = {
        title: `${BLOG_NAME} | About`,
        description: BLOG_DESCRIPTION,
    }

    const startDate = new Date('2023-06-14');
    const trainingStartDate = new Date('2021-12-16');
    const currentDate = new Date();
    const timeDiff = Math.abs(currentDate - startDate);
    const trainingTimeDiff = Math.abs(currentDate - trainingStartDate);
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    const trainingDaysDiff = Math.ceil(trainingTimeDiff / (1000 * 60 * 60 * 24));

    res.render('about', { locals, daysDiff, trainingDaysDiff, currentRoute: '/about' })
});

/**
 * GET /
 * Post :id
 */
router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;
        const data = await Post.findById({ _id: slug });

        const locals = {
            title: `${BLOG_NAME} | ${data.title}`,
            description: BLOG_DESCRIPTION
        }

        res.render('post', { locals, data, currentRoute: `/post/${slug}` });
    } catch (error) {
        console.error(error);
    }
});

/**
 * POST /
 * Post - searchTerm
 */
router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: `${BLOG_NAME} | Search`,
            description: BLOG_DESCRIPTION
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChars = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChars, 'i') } },
                { body: { $regex: new RegExp(searchNoSpecialChars, 'i') } }
            ]
        });

        res.render('search', { locals, data, currentRoute: '' });
    } catch (error) {
        console.error(error);
    }
});

module.exports = router;