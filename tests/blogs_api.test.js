const { test, after, beforeEach, describe, before } = require('node:test')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const jwt = require('jsonwebtoken')

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

let token = null


before(async () => {
  await User.deleteMany({})
  console.log('cleared users')
  const userPromises = helper.initialUsers.map(async (user) => {
    let userObject = new User(user)
    await userObject.save()
    // Generate token for the user and store it
    if (user.username === 'root') { // Adjust if necessary to select the appropriate user
      const userForToken = {
        username: userObject.username,
        id: userObject._id,
      }
      token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: '1h' })
    }
  })
  await Promise.all(userPromises)
  console.log('users:done')
})

beforeEach(async () => {
  await Blog.deleteMany({})
  console.log('cleared blogs')

  const users = await User.find({})
  const user = users[0]  // The first user in the list of users

  const blogPromises = helper.initialBlogs.map(async (blog) => {
    if (!blog.user) {
      blog.user = user._id
    }
    let blogObject = new Blog(blog)
    await blogObject.save()
  })
  await Promise.all(blogPromises)
  console.log('blogs:done')
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

test('a valid blog can be added and the number of blogs is correct', async () => {
  const newBlog = {
    title: 'Go To Statement Considereds Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
  }

  await api
    .post('/api/blogs')
    .set('Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJvb3QiLCJpZCI6IjY2YTMxYmJkMThlYTJkMDM5NjljZDc5ZCIsImlhdCI6MTcyMjAxOTUzMn0.3axhhqSmUcQve6GG_rDaj39Nao68a2FR8gTvgqWpDQE')
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
    .set('Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJvb3QiLCJpZCI6IjY2YTMxYmJkMThlYTJkMDM5NjljZDc5ZCIsImlhdCI6MTcyMjAxOTUzMn0.3axhhqSmUcQve6GG_rDaj39Nao68a2FR8gTvgqWpDQE')
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
    .set('Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJvb3QiLCJpZCI6IjY2YTMxYmJkMThlYTJkMDM5NjljZDc5ZCIsImlhdCI6MTcyMjAxOTUzMn0.3axhhqSmUcQve6GG_rDaj39Nao68a2FR8gTvgqWpDQE')
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
    .set('Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJvb3QiLCJpZCI6IjY2YTMxYmJkMThlYTJkMDM5NjljZDc5ZCIsImlhdCI6MTcyMjAxOTUzMn0.3axhhqSmUcQve6GG_rDaj39Nao68a2FR8gTvgqWpDQE')
    .send(newBlog)
    .expect(400)
})

test.only('a blog can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]
  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
})

test('updates the number of likes for a blog', async () => {
  const blogsAtStart = await api.get('/api/blogs')
  const blogToUpdate = blogsAtStart.body[0]

  const updatedLikes = {
    likes: blogToUpdate.likes + 1,
  }

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedLikes)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)
})

test.only('adding a blog fails with status code 401 if a token is not provided', async () => {
  const newBlog = {
    title: 'Unauthorized Blog',
    author: 'John Doe',
    url: 'http://example.com/unauthorized',
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length)
})

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'oldmostold',
      name: 'Miguelangel Garay',
      password: 'sifuncionanolotoques',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})
