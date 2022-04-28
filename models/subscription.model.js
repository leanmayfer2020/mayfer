var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var subscriptionSchema = new Schema({
    'endpoint': {type:String, required:true},
    'p256dh': {type:String, required:true},
    'auth': {type:String, required:true}
});


module.exports = mongoose.model('Subscription', subscriptionSchema);