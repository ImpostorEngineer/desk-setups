const express = require('express');
const router = express.Router();
require('dotenv').config();
const mongoose = require('mongoose');
const DeskPost = require('./posts');
const Joi = require('joi');
const { response } = require('express');

const schema = Joi.object({
  username: Joi.string().alphanum().required(),
  title: Joi.string().max(20).required(),
  imgURL: Joi.string().uri().required(),
  description: Joi.string().max(200),
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
    const post = new DeskPost(result.value);
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

router.delete('/single-post/:id', (req, res, next) => {
  const id = req.params.id;
  DeskPost.findByIdAndDelete(id)
    .then((result) => {
      res.json({ redirect: '/' });
    })
    .catch((err) => console.log(err));
});

router.get('/single-post/:id', (req, res, next) => {
  const id = req.params.id;
  DeskPost.findById(id)
    .then((result) => {
      res.render('view', { desk: result });
    })
    .catch((err) => console.log(err));
});

module.exports = router;