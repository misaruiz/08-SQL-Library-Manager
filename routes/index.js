var express = require('express');
var router = express.Router();

// Import models
const Book = require('../models').Book;

// Import Sequelize Operators
const { Op } = require("sequelize");

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
  res.redirect('/books/page-1');
}));

router.get('/books', asyncHandler(async (req, res, next) => {
  res.redirect('/books/page-1');
}));

// GET full list of books
router.get('/books/page-:page', asyncHandler(async (req, res, next) => {

  // pagination
  let pageSize = 10;
  const paginate = ({ page }) => {
    page = page || req.params.page - 1;
    const offset = page * pageSize;
    const limit = pageSize;

    return {
      offset,
      limit,
    };
  };

  const books = await Book.findAll({ 
    ...paginate({ page:0 }),
    order: [
      [ "author", "ASC" ],
      [ "year", "ASC" ]
    ],
  });

  const totalBooks = await Book.count();
  const pages = Math.ceil((totalBooks / pageSize));
  
  if(req.params.page < pages + 1) {
    res.render('index', { title: 'Book Database', books, page: req.params.page, pages });
  } else {
    const error = new Error('Page not found');
    error.status = 404;
    throw error;
  }

}));

// POST Search Results
router.post('/books/results', asyncHandler(async (req, res, next) => {
  const books = await Book.findAll({ 
    where: {
      [Op.or]: [
        { title: { [Op.substring]: req.body.search, } },
        { author: { [Op.substring]: req.body.search, } },
        { genre: { [Op.substring]: req.body.search, } },
        { year: { [Op.substring]: req.body.search, } }
      ]
    },
    order: [
      [ "author", "ASC" ],
      [ "year", "ASC" ]
    ]
  });

  if (books.length > 0) {
    res.render('index', { title: 'Search Results', books });
  } else {
    res.render('no-results', { title: 'No catalog results found for', books, search: req.body.search });
  }
 
}));

// Shows the create new book form
router.get('/books/new', asyncHandler(async (req, res, next) => {
  res.render('new-book', { book: {}, title: 'New Book' });
}));

// Posts a new book to the database
router.post('/books/new', asyncHandler(async (req, res, next) => {
  let book;
  try {
    book = await Book.create(req.body);
    res.redirect('/');
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      // console.log(error.errors[0].path);
      res.render('new-book', { book, errors: error.errors, title: "New Book" });
    } else {
      throw error;
    }
  }
}));

// Shows book detail form
router.get('/books/:id', asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    res.render('update-book', { title: 'Update Book', book });
  } else {
    const error = new Error('Page not found');
    error.status = 404;
    throw error;
  }
  
}));

// Updates book info in the database
router.post('/books/:id', asyncHandler(async (req, res, next) => {
  let book;
  try {
    book = await Book.findByPk(req.params.id);
    if (book) {
      await book.update(req.body);
      res.redirect('/');
    } else {
      // res.sendStatus(404);
      const error = new Error('Page not found');
      error.status = 404;
      throw error;
    }
  } catch (error) {
    if(error.name === "SequelizeValidationError") {
      book = await Book.build(req.body);
      book.id = req.params.id;
      res.render('update-book', { book, errors: error.errors, title: "Update Book" })
    } else {
      throw error;
    }
  }
}));

// Deletes a book
router.post('/books/:id/delete', asyncHandler(async (req, res, next) => {
  const book = await Book.findByPk(req.params.id);
  if(book) {
    await book.destroy();
    res.redirect('/');
  } else {
    // res.sendStatus(404);
    const error = new Error('Page not found');
    error.status = 404;
    throw error;
  }
}));

module.exports = router;
