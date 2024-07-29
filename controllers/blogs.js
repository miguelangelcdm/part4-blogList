const BlogsRouter=require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')

BlogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user','username name id')
  response.json(blogs)
})

BlogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const body = request.body
  let user = request.user

  if (!user) {
    user = await User.findOne()
  }
  const blog = new Blog({
    title: body.title,
    url: body.url,
    author: body.author,
    user: user.id
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

BlogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  const user = request.user
  console.log('🚀 ~ BlogsRouter.delete ~ user:', user._id.toString())
  console.log('🚀 ~ BlogsRouter.delete ~ blog.user:', blog.user.toString())
  if (!blog) {
    return response.status(404).json({ error: 'blog not found' })
  }

  if (blog.user.toString() === user._id.toString()) {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } else {
    return response.status(403).json({ error: 'user not allowed to perform that action' })
  }
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