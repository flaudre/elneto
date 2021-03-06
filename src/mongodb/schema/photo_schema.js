/**
 * Created by Henry Huang on 2019/8/28.
 */
const mongoose = require('mongoose');

PhotoSchema = new (mongoose.Schema)({
  id: String,
  title: String,
  link: String,
  linkThumb: String,
  width: Number,
  height: Number,
  size: String,
  technik: String,
  comments: String,
  order: {
    type: Number,
    default: new Date().getTime()
  },
});

module.exports = PhotoSchema;
