const express = require('express')
const { isWebUri } = require('valid-url')
const xss = require('xss')
const logger = require('../logger')
const BookmarksService = require('./bookmarks-service')

const bookmarksRouter = express.Router()
const bodyParser = express.json()

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: xss(bookmark.title),
  url: bookmark.url,
  description: xss(bookmark.description),
  rating: Number(bookmark.rating),
})

bookmarksRouter
  .route('/bookmarks')
  .get((req, res, next) => {
      const bookmarks = BookmarksService.getAllBookmarks();
      return res.json(bookmarks.map(serializeBookmark));
  })
  .post(bodyParser, (req, res, next) => {
    for (const field of ['title', 'url', 'rating']) {
      if (!req.body[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send(`'${field}' is required`)
      }
    }

    const { title, url, description, rating } = req.body

    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
      logger.error(`Invalid rating '${rating}' supplied`)
      return res.status(400).send(`'rating' must be a number between 0 and 5`)
    }

    if (!isWebUri(url)) {
      logger.error(`Invalid url '${url}' supplied`)
      return res.status(400).send(`'url' must be a valid URL`)
    }

    const newBookmark = { title, url, description, rating }

    const insertedBookmark = BookmarksService.insertBookmark(newBookmark)
    if (insertedBookmark) {
        logger.info(`Bookmark with id ${insertedBookmark.id} created.`);
        res.status(201)
            .location(`/bookmarks/${insertedBookmark.id}`)
            .json(serializeBookmark(insertedBookmark))
    }
  })

bookmarksRouter
  .route('/bookmark/:bookmark_id')
  .all((req, res, next) => {
    const { bookmark_id } = req.params
    const bookmark = BookmarksService.getById(bookmark_id)
    if (!bookmark) {
        logger.error(`Bookmark with id ${bookmark_id} not found.`)
        return res.status(404).json({
            error: { message: `Bookmark Not Found` }
        })
    }
    res.bookmark = bookmark
    next();
  })
  .get((req, res) => {
    res.json(serializeBookmark(res.bookmark))
  })
  .delete((req, res, next) => {
    const { bookmark_id } = req.params
    BookmarksService.deleteBookmark(bookmark_id, res)
    logger.info(`Bookmark with id ${bookmark_id} deleted.`)
    res.status(204).end()
  })

module.exports = bookmarksRouter
