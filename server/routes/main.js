const express = require('express');
const router = express.Router();
const Post = require('../models/Post')

/**
 * GET
 * HOME
 */
router.get('', async (req, res) => {
    try {
        const locals = {
            title: "Nodejs Blog",
            description: "Simple blog created with Nodejs, Express and MongoDb."
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
        console.log(error);
    }
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
            title: `Nodejs blog | ${data.title}`,
            description: "Simple blog created with Nodejs, Express and MongoDb."
        }

        res.render('post', { locals, data, currentRoute: `/post/${slug}` });
    } catch (error) {
        console.log(error);
    }
});

/**
 * POST /
 * Post - searchTerm
 */
router.post('/search', async (req, res) => {
    try {
        const locals = {
            title: `Nodejs blog | Search`,
            description: "Simple blog created with Nodejs, Express and MongoDb."
        }

        let searchTerm = req.body.searchTerm;
        const searchNoSpecialChars = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

        const data = await Post.find({
            $or: [
                { title: { $regex: new RegExp(searchNoSpecialChars, 'i') } },
                { body: { $regex: new RegExp(searchNoSpecialChars, 'i') } }
            ]
        });

        res.render('search', { locals, data });
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;