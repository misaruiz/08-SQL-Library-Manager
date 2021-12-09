var express = require('express');
var router = express.Router();

// Import models
const Book = require('../models').Book;

// Handler function yo wrap each route
function asyncHandler(cb){
  return async(req, res, next) => {
    try {
      await cb(req, res, next)
    } catch(error) {
      next(error);
    }
  }
}

/* GET home page. */
router.get('/', asyncHandler(async (req, res, next) => {

  res.redirect('/books');
  // res.render('index', { title: 'Express' });
}));

// Shows the full list of books
router.get('/books', asyncHandler(async (req, res, next) => {
  const books = await Book.findAll();

  res.render('index', { title: 'Books', books });
  // console.log(booksJSON);
}));

// Shows the create new book form
router.get('/books/new', asyncHandler(async (req, res, next) => {
  res.render('new-book', { title: 'New Book' });
}));

// Posts a new book to the database
router.get('/books/new', asyncHandler(async (req, res, next) => {

}));

// Shows book detail form
router.get('/books/:id', asyncHandler(async (req, res, next) => {

}));

// Updates book info in the database
router.post('/books/:id', asyncHandler(async (req, res, next) => {

}));

// Deletes a book
router.post('/books/:id/delete', asyncHandler(async (req, res, next) => {

}));

module.exports = router;
