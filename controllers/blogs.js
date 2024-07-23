const BlogsRouter=require('express').Router()
const Blog=require('../models/blog')

BlogsRouter.get('/', async (request, response) => {
  try {
    const blogs = await Blog.find({})
    response.json(blogs)
  } catch (error) {
    response.status(500).json({ error: 'Internal Server Error' })
  }
})

BlogsRouter.post('/', async (request, response) => {
  try {
    const blog = new Blog(request.body)
    const result = await blog.save()
    response.status(201).json(result)
  } catch (error) {
    response.status(400).json({ error: 'Bad Request' })
  }
})

BlogsRouter.get('/:id', async (request, response, next) => {
  try {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
      response.json(blog)
    } else {
      response.status(404).end()
    }
  } catch(exception) {
    next(exception)
  }
})

BlogsRouter.delete('/:id', async (request, response, next) => {
  try {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch(exception) {
    next(exception)
  }
})

module.exports=BlogsRouter