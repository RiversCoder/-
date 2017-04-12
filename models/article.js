/**
 * Created by MAC on 17/4/6.
 */

var mongoose = require('mongoose');
var nameSchema = require('../schemas/article');

module.exports = mongoose.model('Article',nameSchema);