const uuid = require('uuid/v4');

const BookmarksService = {
  bookMarks: [
    {
      id: "1",
      title: "Thinkful",
      url: "https://www.thinkful.com",
      description: "Think outside the classroom",
      rating: "5"
    },
    {
      id: "2",
      title: "Book Title",
      url: "https://www.bookurl.com",
      description: "Book Description",
      rating: "3"
    },
  ],
  getAllBookmarks() {
    return this.bookMarks;
  },
  getById(id) {
    return this.bookMarks.find(bookmark => bookmark.id === id);
  },
  insertBookmark(newBookmark) {
    newBookmark.id = uuid();
    this.bookMarks.push(newBookmark);
    return newBookmark;
  },
  deleteBookmark(id, res) {
    const index = this.bookMarks.findIndex(bookMark => bookMark.id === id);

    // make sure we actually find a user with that id
    if (index === -1) {
      return res
          .status(404)
          .send('Bookmark not found');
    }

    this.bookMarks.splice(index, 1);
  }
}

module.exports = BookmarksService
