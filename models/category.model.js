var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var categorySchema = new Schema({
    'category': {type:String, required:true},
    'has_delivery': {type:String, required:true}
});


module.exports = mongoose.model('Category', categorySchema);