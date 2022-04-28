"use strict"

const logger      = require('../utils/logger');
const http        = require('../utils/http_client');
const config      = require('../config/config');
const moment      = require('moment');
const mercadopago = require('mercadopago');
const NodeCache   = require('node-cache');
const myCache     = new NodeCache();
const MeliKey     = "mercadopago";
const timeCache   = 86400;
const services    = require('../services/service');
const Utils       = require('../utils/utils');
const webpush     = require("web-push");
const self        = {};
const Brand       = process.env.APP_BRAND.toLowerCase();


self.subscribe = (req, res) => { 
	// Get pushSubscription Object
	const subscription = req.body;

	// Send 201 - resource created
	res.status(201).json({});

	// Create payload
	const payload = JSON.stringify({title:"Push Test"});

	// Pass object into sendNotificacion
	webpush.sendNotification(subscription, payload).catch(err => console.error(err));
};

self.save = (req, res) => { 
	// Get pushSubscription Object
	var Subscription = new SubscriptionModel({'endpoint': req.body.endpoint, 'p256dh': req.body.p256dh, 'auth': req.body.auth})

	Subscription.save(function (err, results) {
        if (err){
            console.log("Error on add Subscription: ", err);
            return err;
        }else{
            console.log("Add Subscription success: ", results);
            return results;
        }
    });
};


self.send = (req, res) => { 
	console.log("Try to send push");
	SubscriptionModel.find({}, function (err, Subscription) {
		if (err){
			console.log("Get Subscription error", err);
			res.send(err);
		}else{
			console.log("Get Subscription Success ", Subscription);
			Subscription = Subscription[0];
			var pushSubscription = {"endpoint":Subscription.endpoint,
			"keys":{"p256dh":Subscription.p256dh, "auth":Subscription.auth}};

			var payload = {
				title: "Aprovecha las promos!",
				body: "Descuentos de hasta un 40%",
				icon: "https://dj4i04i24axgu.cloudfront.net/common/smart-banner-logos/garbarino/garbalogo.png",
				image: "https://dj4i04i24axgu.cloudfront.net/common/smart-banner-logos/garbarino/garbalogo.png",
				badge: "https://dj4i04i24axgu.cloudfront.net/common/smart-banner-logos/garbarino/garbalogo.png"
			 }

			var options = {
			gcmAPIKey: 'AIzaSyCHqoYU_FdOAlV3DStSqvAyF6TNo10F4Gg',
			TTL: 60
			};

			console.log("DATA", pushSubscription);
			webpush.sendNotification(pushSubscription,JSON.stringify(payload),options)
			.then(function(response){
				console.log("Success!", response);
			})
			.catch(err => console.error(err));
		}
	})
};