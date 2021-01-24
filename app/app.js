const express = require('express');
const router = express.Router();
require('dotenv').config();
const mongoose = require('mongoose');
const DeskPost = require('./posts');
const Joi = require('joi');
const { response } = require('express');

const schema = Joi.object({
  username: Joi.string().alphanum().required(),
  title: Joi.string().trim().max(30).required(),
  imgURL: Joi.string().uri().required(),
  description: Joi.string().trim().max(300),
});

router.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => console.log('Connected to db'))
  .catch((err) => console.log(err));

router.get('/', (req, res, next) => {
  DeskPost.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render('index', { desks: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

router.get('/add-post', (req, res, next) => {
  res.render('post');
});

router.post('/add-post', (req, res, next) => {
  const result = schema.validate(req.body);
  if (result.error == null) {
    const { username, title, imgURL, description } = result.value;
    let slug = title
      .toLowerCase()
      .replace(/[^a-z\s]/, '')
      .replace(' ', '-');
    if (DeskPost.findOne({ slug: slug })) {
      slug = slug + '-' + Math.floor(Math.random() * 100);
    }
    const post = new DeskPost({
      username,
      title,
      imgURL,
      description,
      slug,
      approved: false,
    });
    post
      .save()
      .then((result) => {
        res.redirect('/');
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    const error = result.error.details[0].message;
    res.render('post', { desk: req.body, error: error });
  }
});

// router.get('/all-posts', (req, res, next) => {
//   DeskPost.find()
//     .then((result) => res.send(result))
//     .catch((err) => console.log(err));
// });

router.get('/single-post/', (req, res, next) => {
  res.render('view');
});
router.get('/single-post/:slug', (req, res, next) => {
  const slug = req.params.slug;
  DeskPost.findOne({ slug: slug })
    .then((result) => {
      res.render('view', { desk: result });
    })
    .catch((err) => console.log(err));
});
router.delete('/single-post/:id', (req, res, next) => {
  const id = req.params.id;
  DeskPost.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: '/' });
    })
    .catch((err) => console.log(err));
});

module.exports = router;
