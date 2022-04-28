var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var cartSchema = new Schema({

	"cart_id": {type:Schema.Types.ObjectId},
	"created": {type: Date, default: Date.now},
	"last_update": {type: Date, default: Date.now},
	"products":{type: Array},	
	"delivery_cost": {type:Number},
	"delivery_street_name": {type:String},
	"delivery_street_number": {type:String},
	"delivery_floor": {type:String},
	"delivery_room": {type:String},
	"delivery_zip_code": {type:String},
	"delivery_city": {type:String},
	"delivery_type": {type:String},
	"billing_name": {type:String},
	"billing_lastname": {type:String},
	"billing_email": {type:String},
	"billing_phone": {type:String},
	"billing_gender": {type:String},
	"billing_type_document": {type:String},
	"billing_document_number": {type:String},
	"total_price": {type:Number},
	"status": {type:String},
	"status_reason": {type:String},
	"sale_source": {type:String},
	"search_fields": {type:Array}
});


module.exports = mongoose.model('Cart', cartSchema);