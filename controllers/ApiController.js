"use strict"

const Q           = require('q');
const logger      = require('../utils/logger');
const config      = require('../config/config');
const moment      = require('moment');
const services    = require('../services/service');
const ObjectId   = require('mongoose').Types.ObjectId;
const self        = {};
const xBrand   = process.env.APP_BRAND.toLowerCase();


// const mongoose    = require('mongoose');
// const mercadopago = require('mercadopago');
// const Product     = require('../models/product.model');
// const Email       = require('../models/email.model');
// const Cart        = require('../models/cart.model');
// const NodeCache   = require('node-cache');
// const myCache     = new NodeCache();
// const MeliKey     = "mercadopago";
// const timeCache   = 86400;
// const photoswipe    = require('photoswipe');



self.addEmail = (req, res) => { 
	console.log("addEmailSubscription", req.body.email);
	console.log("validateRecaptcha", req.body.owner);
	

	services.validateRecaptcha(req.body.owner).then(function(validation){
		console.log("validateRecaptcha response", validation);
		if(validation.success == true){
			services.addSubscription(req.body.email).then(function(subscription){
				console.log("addSubscription response", subscription);		
		    	res.send(subscription);
		    }).catch(function (errorAddSubscription){
				logger.error("Error on errorAddSubscription: ", errorAddSubscription);
				res.send(errorAddSubscription);
			})
		}else{
			console.log("Validation response FALSE", validation.success);
			res.send({"error": "No se pudo validar recaptcha."});
		}
	}).catch(function (errorValidation){
		logger.error("Error on validateRecaptcha: ", errorValidation);
		res.send(errorValidation);
	})
};

self.getCart = (req, res) => {
	let cart_id = req.params.cart;
	console.log("cart_id:", cart_id);
	
	return services.getCart(cart_id).then(function(cart){
		console.log("MYCART", cart);
		res.json(cart);
	}).catch(function(error){
		console.log("Error on apiGetCart", error);
		res.json(error);
	})
};


self.getCategories = (req, res) => {
	return services.getCategories().then(function(categories){
		res.json(categories);
	}).catch(function(error){
		console.log("Error on apigetCategories", error);
		res.json(error);
	})
};

self.getProduct = (req, res) => {
	let product = req.params.product;
	return services.getProduct(product).then(function(product){
		res.json(product);
	}).catch(function(error){
		console.log("Error on apiGetProduct", error);
		res.json(error);
	})
};

self.getProducts = (req, res) => {
	let category_id = req.params.category_id;
	return services.getProducts(category_id).then(function(products){
		res.json(products);
	}).catch(function(error){
		console.log("Error on apiGetProducts", error);
		res.json(error);
	})
};

self.searchProduct = (req, res) => {
	services.searchProduct(req.params.q).then(function(products){
		res.json(products); 
	}).catch(function (error){
		console.log("Error on searchProduct: ", error);
		res.json(error); 
	})
}

self.createCart = (req, res) => {
	services.getProduct(req.body.salable_id).then(function(product){
		services.createCart(product).then(function(cart){
			res.json(cart._id);
		}).catch(function(errorCart){
			console.log("Error on createCart", errorCart);
			res.json(errorCart);
		})
	}).catch(function(errorProduct){
		console.log("Error on getUniqueProduct", errorProduct);
		res.json(errorProduct);
	})
};

self.addProductCart = (req, res) => {

	services.getProduct(req.body.salable_id).then(function(product){
		console.log("addProductCart getProduct Success", product);
		services.handlerProduct(product, req.params.cart, req.body.quantity).then(function(cart){
			console.log("addProductCart getProduct handlerProduct Success", product);
			res.json(cart._id);
		}).catch(function(errorCart){
			console.log("addProductCart getProduct handlerProduct Success", errorCart);
			res.json(errorCart);
		})
	}).catch(function(errorProduct){
		console.log("addProductCart getProduct Success", errorProduct);
		res.json(errorProduct);
	})
};



self.updateCart = (req, res) => {};

self.getProductsBySort = (req, res) => {
	console.log("SORTED BY ", req.query.sort_by);
	services.getProductsBySort(req.query.sort_by).then(function(products){
		console.log("getProductsBySort Success", products);
		res.json(products);
	}).catch(function(errorProducts){
		console.log("getProductsBySort Success", errorCart);
		res.json(errorCart);
	})

};


module.exports = self;





