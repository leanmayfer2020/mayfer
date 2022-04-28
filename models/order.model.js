var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var orderSchema = new Schema({

	"order_id": {type:Schema.Types.ObjectId},
	"created": {type: Date, default: Date.now},
	"customer": {type:String},
	"address": {type:String},
	"email": {type:String},
	"cellphone": {type:String},
	"comments": {type:String},
	"products":{type: Array},	
	"total": {type:Number}
});


module.exports = mongoose.model('Order', orderSchema);