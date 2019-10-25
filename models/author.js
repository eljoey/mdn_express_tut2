const mongoose = require('mongoose')
const moment = require('moment')

const Schema = mongoose.Schema

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, max: 100 },
  family_name: { type: String, required: true, max: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date }
})

// Virtual for author's full name
AuthorSchema.virtual('name').get(function() {
  return this.family_name + ', ' + this.first_name
})

// Virtual for author's lifespan
AuthorSchema.virtual('lifespan').get(function() {
  const birthDate = this.date_of_birth_formatted
  const deathDate = this.date_of_death
    ? ' - ' + this.date_of_death_formatted
    : ''
  return birthDate + deathDate
})

// Virtual for author's URL
AuthorSchema.virtual('url').get(function() {
  return '/catalog/author/' + this._id
})

// Virtual for formatted authors date_of_birth
AuthorSchema.virtual('date_of_birth_formatted').get(function() {
  return this.date_of_birth
    ? moment(this.date_of_birth).format('MMM Do, YYYY')
    : ''
})

// Virtual for formatted authors date_of_birth
AuthorSchema.virtual('date_of_death_formatted').get(function() {
  return this.date_of_death
    ? moment(this.date_of_death).format('MMM Do, YYYY')
    : ''
})

// Export model
module.exports = mongoose.model('Author', AuthorSchema)
