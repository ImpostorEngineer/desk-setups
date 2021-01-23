const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    imgURL: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    slug: {
      type: String,
    },
  },
  { timestamps: true }
);

const DeskPost = mongoose.model('DeskSetup', postSchema);

module.exports = DeskPost;
