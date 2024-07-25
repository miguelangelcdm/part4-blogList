const BlogsRouter=require('express').Router()
const Blog=require('../models/blog')

BlogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

BlogsRouter.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  const result = await blog.save()
  response.status(201).json(result)
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