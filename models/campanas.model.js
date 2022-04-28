var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var campanaSchema = new Schema({

	"_id": {type:Schema.Types.ObjectId},
	"customer": {type:String},
	"email": {type:String},
	"status": {type:String},
	"updated": {type: Date, default: Date.now}
});


module.exports = mongoose.model('Campana', campanaSchema);