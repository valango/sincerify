'use strict'

if (process.env.NODE_ENV === 'production') {
  //  Do-nothing API.
  module.exports = (src) => src
} else {
  module.exports = require('./sincerify')
}
