const BlogsRouter=require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

BlogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

BlogsRouter.post('/', async (request, response) => {
  const body = request.body
  const user = await User.findById(body.userId)
  const blog = new Blog({
    title: body.title,
    url: body.url,
    author: body.author,
    user: user ? user.id: null
  })
  const savedBlog = await blog.save()
  if (user) {
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
  }
  response.status(201).json(savedBlog)
})

BlogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

BlogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

BlogsRouter.put('/:id', async (request, response) => {
  const { likes } = request.body

  const updatedBlog = {
    likes,
  }
  const result = await Blog.findByIdAndUpdate(request.params.id, updatedBlog, { new: true, runValidators: true })
  if (result) {
    response.json(result)
  } else {
    response.status(404).end()
  }
})

module.exports = BlogsRouter