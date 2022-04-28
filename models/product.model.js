var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var productSchema = new Schema({
    'category_name': {type:String, required:true},
    'description': {type:String, required:true},
    'summary': {type:String, required:false},
    'model': {type:String, required:false},
    'main_image': {type:String, required:false},
    'salable_id': {type:String, required:false},
    'discount': {type:String, required:false},
    'enabled_for_sale': {type:Boolean, required:false},
    'price': {type: Number, required: true},
    'web_price': {type: Number, required: true},
    'brand': {type:String, required:true},
    'category_id': {type: String, required: true},
    'images': {type: Array, required: true},
    'measures': {type: String, required: true},
    "created": {type: Date, default: Date.now}
});


module.exports = mongoose.model('Product', productSchema);