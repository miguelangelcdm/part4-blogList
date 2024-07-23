const { test, after, beforeEach } = require('node:test')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

// const initialBlogs = [
//   {
//     _id: '5a422a851b54a676234d17f7',
//     title: 'React patterns',
//     author: 'Michael Chan',
//     url: 'https://reactpatterns.com/',
//     likes: 7,
//     __v: 0
//   },
//   {
//     _id: '5a422aa71b54a676234d17f8',
//     title: 'Go To Statement Considered Harmful',
//     author: 'Edsger W. Dijkstra',
//     url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
//     likes: 5,
//     __v: 0
//   },
// ]

beforeEach(async () => {
  await Blog.deleteMany({})
  console.log('cleared')
  //   const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
  //   const promiseArray = blogObjects.map(blog => blog.save())
  //   await Promise.all(promiseArray)
  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
  console.log('done')
})

test('blogs are returned as json and there are correct number of blogs', async () => {
  const response = await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('unique identifier property of the blog posts is named "id"', async () => {
  const response = await api.get('/api/blogs')

  const blogs = response.body
  blogs.forEach(blog => {
    assert(blog.id, 'Blog should have an id property')
    assert(!blog._id, 'Blog should not have an _id property')
  })
})

test('a valid blog can be added and the correct number of blogs is correct', async () => {
  const newBlog = {
    _id: '5a422aa71b54a676231217f8',
    title: 'Go To Statement Considereds Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
    __v: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const contents = response.body.map(r => r.title)
  assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
  assert(contents.includes('Go To Statement Considereds Harmful'))
})

test('if likes property is missing from the request, it will default to 0', async () => {
  const newBlog = {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
  }
  const response = await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)

  assert.strictEqual(response.body.likes,0)
})

test('fails with status code 400 if title is missing', async () => {
  const newBlog = {
    // title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('fails with status code 400 if url is missing', async () => {
  const newBlog = {
    title: 'Type wars',
    author: 'Robert C. Martin',
    // url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

after(async () => {
  await mongoose.connection.close()
})
