const BookInstance = require('../models/bookinstance')
const { body, validationResult } = require('express-validator/check')
const { sanitizeBody } = require('express-validator/filter')
const Book = require('../models/book')

const async = require('async')

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res) {
  BookInstance.find()
    .populate('book')
    .exec((err, list_bookinstances) => {
      if (err) {
        return next(err)
      }

      res.render('bookinstance_list', {
        title: 'Book Instance List',
        bookinstance_list: list_bookinstances
      })
    })
}

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res, next) {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec((err, bookinstance) => {
      if (err) {
        return next(err)
      }

      // No result
      if (bookinstance === null) {
        const err = new Error('Book copy not found')
        err.status = 404
        return next(err)
      }

      // Result found
      res.render('bookinstance_detail', {
        title: 'Copy: ' + bookinstance.book.title,
        bookinstance: bookinstance
      })
    })
}

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {
  Book.find({}, 'title').exec((err, books) => {
    if (err) {
      return next(err)
    }

    // Successful, so render
    res.render('bookinstance_form', {
      title: 'Create BookInstance',
      book_list: books
    })
  })
}

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  // Validate fields
  body('book', 'Book must be specified')
    .isLength({ min: 1 })
    .trim(),
  body('imprint', 'Imprint must be specified')
    .isLength({ min: 1 })
    .trim(),
  body('due_back', 'Invalid date')
    .optional({ checkFalsy: true })
    .isISO8601(),

  // Sanitize fields
  sanitizeBody('book').escape(),
  sanitizeBody('imprint').escape(),
  sanitizeBody('status')
    .trim()
    .escape(),
  sanitizeBody('due_back').toDate(),

  // Process request after validation and sanitization
  (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req)

    // Create a BookInstance object with escaped and trimmed data
    let bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back
    })

    if (!errors.isEmpty()) {
      // There are errors.  Render form again with sanitized values and error messages
      Book.find({}, 'title').exec((err, books) => {
        if (err) {
          return next(err)
        }

        // Successful, so render
        res.render('bookinstance_form', {
          title: 'Create BookInstance',
          book_list: books,
          selected_book: bookinstance.book._id,
          errors: errors.array(),
          bookinstance: bookinstance
        })
      })
      return
    } else {
      // Data from form is valid
      bookinstance.save(err => {
        if (err) {
          return next(err)
        }
        // Successful - redirect to new record
        res.redirect(bookinstance.url)
      })
    }
  }
]

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res, next) {
  BookInstance.findById(req.params.id)
    .populate('book')
    .exec((err, bookinstance) => {
      if (err) {
        return next(err)
      }

      res.render('bookinstance_delete', {
        title: 'Delete BookInstance',
        bookinstance: bookinstance
      })
    })
}

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res) {
  BookInstance.findByIdAndRemove(
    req.body.bookinstanceid,
    function deleteBookInstance(err) {
      if (err) {
        return next(err)
      }

      res.redirect('/catalog/bookinstances')
    }
  )
}

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res, next) {
  async.parallel(
    {
      bookinstance: callback => {
        BookInstance.findById(req.params.id)
          .populate('book')
          .exec(callback)
      },
      book: callback => {
        Book.find(callback)
      }
    },
    (err, results) => {
      if (err) {
        return next(err)
      }

      if (results.bookinstance === null) {
        let err = new Error('BookInstance not found')
        err.status = 404
        return next(err)
      }

      res.render('bookinstance_form', {
        title: 'Update BookInstance',
        bookinstance: results.bookinstance,
        book_list: results.book
      })
    }
  )
}

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  // validate fields
  body('book', 'Book must not be empty')
    .isLength({ min: 1 })
    .trim(),
  body('imprint', 'Imprint must not be emtpy')
    .isLength({ min: 1 })
    .trim(),
  body('date', 'Invalid Date')
    .optional({ checkFalsy: true })
    .isISO8601(),
  body('status', 'Status must not be empty')
    .isLength({ min: 1 })
    .trim(),

  // Sanitize fields
  body('book').escape(),
  body('imprint').escape(),
  body('date').escape(),
  body('status').escape(),

  // Process
  (req, res, next) => {
    const errors = validationResult(req)

    let bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
      _id: req.params.id
    })

    if (!errors.isEmpty()) {
      // There are errors.  Render form again with sanitized values and error messages
      Book.find({}, 'title').exec((err, books) => {
        if (err) {
          return next(err)
        }

        // Successful, so render
        res.render('bookinstance_form', {
          title: 'Update BookInstance',
          book_list: books,
          errors: errors.array(),
          bookinstance: bookinstance
        })
      })
      return
    } else {
      BookInstance.findByIdAndUpdate(req.params.id, bookinstance, {}, function(
        err,
        thebookinstance
      ) {
        if (err) {
          return next(err)
        }

        res.redirect(thebookinstance.url)
      })
    }
  }
]
