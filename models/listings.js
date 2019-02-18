var requestPromise = require('request-promise');
var linkifyHtml = require('linkifyjs/html');
var Cache = require('./cache');
var console = require('../console')

var LISTING_FIELDS = "&includes=MainImage&fields=url,price,title,shop_section_id,listing_id,description";

function Listings(shopName, shopKey) {
    this.shopName = shopName;
    this.shopKey = shopKey;
    if (this.shopName === undefined || this.shopKey === undefined) {
        throw "Undefined shop name or key";
    }
}

Listings.prototype.getSections = function () {
    var shopKey = this.shopKey;
    var shopName = this.shopName;
    var currentListings = this;
    return new Promise(function (resolve, reject) {
        var sections = Cache.get("sections");
        if (sections === undefined || sections == []) {
            console.debug("missed cache for sections");
            requestPromise({
                'url': "https://openapi.etsy.com/v2/shops/" + shopName + "/sections?api_key=" + shopKey,
                'json': true
            }).then(response => {
                var retrievedSections = response.results;
                currentListings.getListings()
                    .then(listings => {
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
                        Cache.set("sections", retrievedSections);
                        resolve(retrievedSections);
                    });
            }).catch(err => {
                reject(err);
            });
        }
        else {
            console.debug("hit cache for sections");
            resolve(sections);
        }
    });
}

Listings.prototype.getListings = function () {
    var shopName = this.shopName;
    var shopKey = this.shopKey;
    return new Promise(function (resolve, reject) {
        listingsMap = Cache.get("listings");
        if (listingsMap === undefined) {
            console.debug("Missed cache for listings");
            requestPromise({
                'url': "https://openapi.etsy.com/v2/shops/" + shopName + "/listings/active?api_key=" + shopKey + LISTING_FIELDS,
                'json': true
            }).then(response => {
                var listings = response.results;
                listingsMap = {};
                for (listing in listings) {
                    listingsMap[listings[listing].listing_id] = listings[listing];
                }
                Cache.set('listings', listingsMap);
                resolve(listingsMap);
            }).catch(err => {
                reject(err);
            });
        }
        else {
            console.debug("Hit cache for listings")
            resolve(listingsMap);
        }
    });
}

Listings.prototype.getListing = function (listingId) {
    var shopKey = this.shopKey;
    var currentListings = this;
    return new Promise(function (resolve, reject) {
        currentListings.getListings().then(listings => {
            if (listings === undefined || listings[listingId] === undefined) {
                reject("Item "+listingId+" not in shop");
            }
            else {
                listings[listingId].description = linkifyHtml(listings[listingId].description, {
                    defaultProtocol: 'https'
                });
                resolve(listings[listingId]);
            }
        }).catch(err => {
            reject(err);
        });
    });
};

module.exports = Listings;