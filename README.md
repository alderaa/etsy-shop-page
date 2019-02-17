# Etsy Shop Page

ExpressJS app that retrieves Etsy listings using your shops public api key, and displays them in a shop page. Clicking on an item loads its listing details from Etsy along with a call to action to order on Etsy. 

Etsy API results are cached and refreshed daily to limit requests to Etsy and speed up the site.

Styling is done with [MaterializeCSS](https://materializecss.com).

## Installing
Checkout repository and run

```npm install```

Update config.json with shop information and Etsy API key. See [Etsy Developers Site](https://www.etsy.com/developers/documentation/) for instructions on obtaining an api key. 

Default urls are /shop and /shop/:listingid. App supports a different url for Blog and About easy to customize header in views/default.hbs

## Running
Production:
```npm start```

Development/Test
```npm test```

Both production and test fault to port 3000. Add environment variable PORT to package.json to specify port
```
  "scripts": {
    "start": "NODE_ENV=production node ./bin/www",
    "test": "PORT=3001 NODE_ENV=sandbox node ./bin/www"
  },
```