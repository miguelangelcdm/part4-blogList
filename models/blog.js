require('dotenv').config()
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required:true,
  },
  author: String,
  url: String,
  likes: Number
})

blogSchema.set('toJSON',{
  transform:(document,returnObject) => {
    returnObject.id = returnObject._id.toString()
    delete returnObject._id
    delete returnObject.__v
  }
})

module.exports=mongoose.model('blog',blogSchema)