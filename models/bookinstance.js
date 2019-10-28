var mongoose = require('mongoose')
const moment = require('moment')

var Schema = mongoose.Schema

var BookInstanceSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: 'Book', required: true }, //reference to the associated book
  imprint: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ['Available', 'Maintenance', 'Loaned', 'Reserved'],
    default: 'Maintenance'
  },
  due_back: { type: Date, default: Date.now }
})

// Virtual for bookinstance's URL
BookInstanceSchema.virtual('url').get(function() {
  return '/catalog/bookinstance/' + this._id
})

// Virtual to format due_back_date
BookInstanceSchema.virtual('due_back_formatted').get(function() {
  return moment(this.due_back).format('MMM Do, YYYY')
})

// Virtual to formate due_back_date for form entry
BookInstanceSchema.virtual('due_back_form').get(function() {
  console.log(moment(this.due_back).format('YYYY-MM-DD'))
  return moment(this.due_back).format('YYYY-MM-DD')
})
//Export model
module.exports = mongoose.model('BookInstance', BookInstanceSchema)
