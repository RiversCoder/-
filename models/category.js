/**
 * Created by MAC on 17/4/5.
 */

var mongoose = require('mongoose');
var nameSchema = require('../schemas/category');

module.exports = mongoose.model('Category',nameSchema);
