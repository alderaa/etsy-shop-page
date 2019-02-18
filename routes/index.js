var express = require('express');
var router = express.Router();
var app = express();
var config = require('.././config.json')[app.get('env')];
var Listings = require('../models/listings');
var console = require('../console');

console.debug("Current Site Config:");
console.debug(config);

var listings = new Listings(config.etsy_shop_name, config.etsy_public_key);

router.get('/shop', function (req, res, next) {
	listings.getSections()
		.then(sections => {
			let variables = {
				'layout': 'default',
				'title': config.shop_title,
				'sections': sections
			};
			res.render('index', Object.assign({}, config, variables));
		}).catch(err => {
			console.warn(err);
			let variables =  {
				'layout': 'default',
				'title': config.shopTitle,
				'sections': [],
			};
			res.render('index', Object.assign({}, config, variables));
		});
});

router.get("/shop/:listing_id", function (req, res, next) {
	listings.getListing(req.params.listing_id)
		.then(listing => {
			let variables = {
				'layout': 'default',
				'title': listing.title,
				'listing': listing
			};
			res.render('listing', Object.assign({}, config, variables));
		}).catch(err => {
			console.warn(err);
			res.redirect('/shop');
		});
});

module.exports = router;