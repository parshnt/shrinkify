const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const serverless = require('serverless-http');
const yup = require('yup');
const express = require('express');
const morgan = require('morgan');
const monk = require('monk');
const helmet = require('helmet');
const { nanoid } = require('nanoid');

require('dotenv').config();

const db = monk(process.env.MONGO_URL);
const urlDB = db.get('urlDB');

urlDB.createIndex({ slug: 1 }, { unique: true });

const app = express();
const router = express.Router();
app.enable('trust proxy');

app.use(helmet());
app.use(morgan('tiny'));
app.use(express.json());

router.get('/:id', async (req, res, next) => {

    const { id: slug } = req.params;

    try {
        const findURL = await urlDB.findOne({ slug });

        if (findURL) {
            return res.redirect(findURL.url);
        }
        return res.redirect("/404")
    }

    catch (error) {
        return res.redirect("/404")
    }
});

const schema = yup.object().shape({
    slug: yup.string().trim().min(1).max(12).matches(/^[\w\-]+$/i),
    url: yup.string().trim().url().required(),
})

// 10 requests per 5 min. then add 500ms delay
const speedLimiter = slowDown({
    windowMs: 5 * 60 * 1000,
    delayAfter: 10,
    delayMs: 500
});

const rateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 20
});

router.use(speedLimiter);
router.use("/api", rateLimiter);

router.post('/api', async (req, res, next) => {

    let { slug, url } = req.body;

    try {

        //validate the URL & slug
        await schema.validate({ slug, url });

        // 404 not allowed
        if (slug === '404') {
            throw new Error('Slug reserved.')
        }

        //generate new SLUG if not given
        if (!slug) {
            slug = nanoid(6);
        }

        //check if slug in use
        else {

            const slugExists = await urlDB.findOne({ slug });

            if (slugExists) {
                throw new Error('Slug already used.');
            }
        }

        const newUrl = { url, slug };

        const created = await urlDB.insert(newUrl);

        res.json(created);
    }

    catch (error) {
        next(error);
    }
});

router.use((req, res, next) => {
    res.redirect("/404")
});

router.use((error, req, res, next) => {

    if (error.status) {
        res.status(error.status);
    }

    else {
        res.status(500);
    }

    res.json({
        message: error.message
    });

});

app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app)