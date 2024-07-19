const _ = require('lodash')
const dummy = () => {
  return 1
}
const totalLikes = blogs => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}
const mostLikes = blogs => {
  const favorite= blogs.reduce((prev,current) => (prev.likes>current.likes) ? prev : current)
  return{
    title:favorite.title,
    author:favorite.author,
    likes:favorite.likes
  }
}

const mostBlogs = blogs => {
  const authorBlogCount = _.countBy(blogs, 'author')
  const topAuthor = _.maxBy(Object.keys(authorBlogCount), author => authorBlogCount[author])
  return {
    author: topAuthor,
    blogs: authorBlogCount[topAuthor]
  }
}

const favAuthor = (blogs) => {
  const authorLikes = _.groupBy(blogs, 'author')

  // Calculate total likes per author
  const authorLikeTotals = _.mapValues(authorLikes, (posts) =>
    _.sumBy(posts, 'likes')
  )

  // Find the author with the maximum total likes
  const topAuthor = _.maxBy(Object.keys(authorLikeTotals), (author) => authorLikeTotals[author])
  return {
    author: topAuthor,
    likes: authorLikeTotals[topAuthor]
  }
}


module.exports={
  dummy,
  totalLikes,
  mostLikes,
  mostBlogs,
  favAuthor
}
