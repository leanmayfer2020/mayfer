var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var messageSchema = new Schema({
    'full_name': {type:String, required:false},
    'phone': {type:String, required:false},
    'email': {type:String, required:false},    
    'message': {type:String, required:false}
});


module.exports = mongoose.model('Message', messageSchema);