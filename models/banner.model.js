var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var bannerSchema = new Schema({
    'banner': {type:String, required:true},
    'mobile': {type:String, required:true}
});


module.exports = mongoose.model('Banner', bannerSchema);