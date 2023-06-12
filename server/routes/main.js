const express = require('express');
const router = express.Router();

router.get('', (req, res) => {
    const locals = {
        title: "Nodejs Blog",
        description: "Simple blog created with Nodejs, Express and MongoDb."
    }

    res.render('index', locals);
});

module.exports = router;