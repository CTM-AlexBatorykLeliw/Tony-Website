var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AssetSchema = new Schema({
	title: { // Given title of the asset
		type: String,
		required: true
	},
	desc: String, // Description of an asset
	link: String, // Link if the asset locates to external site
	section: String, // Section will either be loc, reg, nat, int
	type: String, // Type will either be image, link, PDF, video, audio
	created_at: Date,
	updated_at: Date, 
	path: String // For getting the path of an image
});

AssetSchema.pre('save', function(next){

	var now = new Date();
	this.updated_at = now;

	if(!this.created_at)
		this.created_at = now;

	next();
});

mongoose.model('Assets', AssetSchema);