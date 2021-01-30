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
    req.result = schema.validate(req.body);
    next();
  },
  savePostAndRedirect()
);

router.post('/edit-desk/:id', async (req, res, next) => {
  const id = req.params.id;
  let updatePost = await DeskPost.findById(id);
  let result = schema.validate(req.body);
  let post = new DeskPost(result.value);
  let slug = slugGen(post.title);
  try {
    updatePost.title = post.title;
    updatePost.username = post.username;
    updatePost.imgURL = post.imgURL;
    updatePost.description = post.description;
    updatePost.slug = slug;
    await updatePost.save();
    res.redirect(`/single-post/${updatePost.slug}`);
  } catch (err) {
    console.log(err);
    res.render('post', { post: req.body });
  }
});

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
  DeskPost.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: '/' });
    })
    .catch((err) => console.log(err));
});

function savePostAndRedirect() {
  return async (req, res) => {
    let result = req.result;
    let { username, title, imgURL, description } = result.value;
    let slug = slugGen(title);
    let post = new DeskPost({
      username,
      title,
      imgURL,
      description,
      slug,
      approved: false,
    });
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

/* router.post('/add-post', (req, res, next) => {
  const result = schema.validate(req.body);
  if (result.error == null) {
    const { username, title, imgURL, description } = result.value;
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
    res.render('post', { desk: req.body, error: error, button: 'Submit' });
  }
}); */
