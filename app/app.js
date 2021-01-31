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

router.get('/', async (req, res, next) => {
  let result = await DeskPost.find().sort({ createdAt: -1 });
  try {
    res.render('index', { post: result });
  } catch (error) {
    console.log(error);
  }
});

router.get('/add-post', (req, res, next) => {
  res.render('post', { post: new DeskPost() });
});

router.get('/edit-post/:id', async (req, res, next) => {
  const id = req.params.id;
  const result = await DeskPost.findById(id);
  res.render('edit', { post: result });
});

router.post(
  '/add-post',
  async (req, res, next) => {
    req.post = new DeskPost();
    next();
  },
  savePostAndRedirect()
);

router.post(
  '/edit-desk/:id',
  async (req, res, next) => {
    const id = req.params.id;
    req.post = await DeskPost.findById(id);
    next();
  },
  savePostAndRedirect()
);

function slugGen(title) {
  const d = new Date();
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z\s]/, '')
      .replace(/\s/g, '-') +
    '-' +
    d.getFullYear() +
    '-' +
    parseInt(d.getMonth() + 1) +
    '-' +
    d.getDate() +
    '-' +
    d.getHours() +
    '-' +
    d.getMinutes();
  return slug;
}

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
  DeskPost.findById(id)
    .then((result) => {
      result.approved = false;
      result.save();
      res.json({ redirect: '/' });
    })
    .catch((err) => console.log(err));
});

function savePostAndRedirect() {
  return async (req, res) => {
    let post = req.post;
    let result = schema.validate(req.body);
    let { username, title, imgURL, description } = result.value;
    let slug = slugGen(title);
    post.username = username;
    post.title = title;
    post.imgURL = imgURL;
    post.description = description;
    post.slug = slug;
    post.approved = false;
    try {
      res.redirect(`/single-post/${post.slug}`);
      post = await post.save();
    } catch (err) {
      console.log(err);
      res.render('post', { post: req.body });
    }
  };
}

module.exports = router;
