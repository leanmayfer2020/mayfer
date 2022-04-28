var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var deliverySchema = new Schema({
    'city': {type:String, required:false},
    'cost': {type:String, required:false}
});


module.exports = mongoose.model('Delivery', deliverySchema);