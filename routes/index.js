var express = require('express');
var router = express.Router();
var util = require('util');
var rp = require('request-promise')
var linkify = require('linkifyjs');
var linkifyHtml = require('linkifyjs/html');
var app = express();
var config = require('.././config.json')[app.get('env')];
const NodeCache = require("node-cache");
//Expire Etsy API Queries after a day, check every hour
const etsyCache = new NodeCache({ stdTTL: 86400, checkperiod: 3600 });

var LISTING_FIELDS = "&includes=MainImage&fields=url,price,title,shop_section_id,listing_id,description";
var PUBLIC_API_KEY_FIELD = "api_key=" + config.etsy_public_key;

router.get('/shop', function (req, res, next) {
	etsyCache.get("sections", function (err, cachedSections) {
		if (err || cachedSections == undefined) {
			console.log("missed cache for sections");
			rp({
				'url': "https://openapi.etsy.com/v2/shops/" + config.etsy_shop_name + "/listings/active?" + PUBLIC_API_KEY_FIELD + LISTING_FIELDS,
				'json': true
			}).then(response => {
				listings = response.results;
				return rp({ 'url': "https://openapi.etsy.com/v2/shops/" + config.etsy_shop_name + "/sections?" + PUBLIC_API_KEY_FIELD, 'json': true })
			}).then(response => {
				var retrievedSections = response.results;
				for (i in listings) {
					let item = listings[i];
					for (s in retrievedSections) {
						let section = retrievedSections[s];
						if (section.shop_section_id === item.shop_section_id) {
							if (section.listings === undefined) {
								section.listings = [];
							}
							section.listings.push(item);
						}
					}
				}
				etsyCache.set("sections", retrievedSections);
				let variables = {
					'layout': 'default',
					'title': config.shop_title,
					'sections': retrievedSections
				}
				res.render('index', Object.assign({}, config, variables));
			}).catch(err => {
				console.log(err);
				res.render('index', {
					'layout': 'default',
					'title': config.shopTitle,
					'sections': [],
				});
			});
		}
		else {
			/**
			 * Cache success, return results
			 */
			console.log("hit cache for sections");
			let variables = {
				'layout': 'default',
				'title': config.shop_title,
				'sections': cachedSections
			}
			res.render('index', Object.assign({}, config, variables));
		}
	});
});

router.get("/shop/:listing_id", function (req, res, next) {
	etsyCache.get("listing_" + req.params.listing_id, function (err, cachedListing) {
		if (err || cachedListing == undefined) {
			console.log("missed cache for "+req.params.listing_id);
			rp({
				'url': "https://openapi.etsy.com/v2/listings/" + req.params.listing_id + "?" + PUBLIC_API_KEY_FIELD + LISTING_FIELDS,
				'json': true
			}).then(response => {
				if (response.results !== undefined && response.results.length == 1) {
					let listing = response.results[0];
					listing.description = linkifyHtml(listing.description, {
						defaultProtocol: 'https'
					});
					etsyCache.set("listing_" + req.params.listing_id, listing);
					let variables = {
						'layout': 'default',
						'title': listing.title,
						'listing': listing
					}
					res.render('listing', Object.assign({}, config, variables));
				}
			}).catch(err => {
				console.log(err);
				res.redirect("/shop");
			});
		}
		else {
			console.log("hit cache for "+req.params.listing_id);
			let variables = {
				'layout': 'default',
				'title': cachedListing.title,
				'listing': cachedListing
			};
			res.render('listing', Object.assign({}, config, variables));
		}
	});
});

module.exports = router;