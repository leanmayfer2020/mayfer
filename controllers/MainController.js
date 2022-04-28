"use strict"

const logger      = require('../utils/logger');
const http        = require('../utils/http_client');
const config      = require('../config/config');
const moment      = require('moment');
const mercadopago = require('mercadopago');
const NodeCache   = require('node-cache');
const myCache     = new NodeCache();
const MeliKey     = "mercadopago";
const timeCache   = 20;
const services    = require('../services/service');
const Utils       = require('../utils/utils');
const self        = {};
const xBrand       = process.env.APP_BRAND.toLowerCase();
const hbsUtils    = require('hbs');
const fs          = require('fs');
// const Q           = require('q');
// const api    = require('../controllers/ApiController');
const mongoose    = require('mongoose');
const Product     = require('../models/product.model');
const Category     = require('../models/category.model');
const Email       = require('../models/email.model');
const Cart        = require('../models/cart.model');
const Message        = require('../models/message.model');
const Delivery       = require('../models/delivery.model');
var nodemailer   = require('nodemailer');

const gmailAccountUserTwo   = process.env.APP_GMAIL_USER_TWO || "";
const gmailAccountPassTwo   = process.env.APP_GMAIL_PASS_TWO || "";


self.sendEmailMessage = (customerEmail, message) => {	
	var transporter = nodemailer.createTransport({
		service: "Gmail",
		auth: {
			user: gmailAccountUserTwo,
			pass: gmailAccountPassTwo
		}
	});

	var mailOptions = {
		from: 'MayferWEB <no-reply@gmail.com>',
		to: 'mayferamoblamientos@gmail.com',
		subject: "Nueva Consulta WEB",
		html: Buffer.from(message)
	};

	return transporter.sendMail(mailOptions, function(error, info){
		if (error){
	    	console.log("ERROR transporter.sendMail", error);
	    	return error;
	    } else {
	        console.log("SUCCESS transporter.sendMail", info);
	        return info;
	    }
	});

};

self.billingForm = (req, res) => { 
	let cart_id = req.cookies['tx'];
	let cart_has_delivery = true;

	services.buildCart(cart_id).then(function(cart){
		services.getDeliveries().then(function(deliveries){
			services.getCategories().then(function(categories){

				for(var i=0; i<cart.products.length; i++){
	                for(var w=0; w<categories.length; w++){
	                	if(categories[w]._id == cart.products[i].category_id){
	                		console.log("CHECK", categories[w].has_delivery)
	                		if(categories[w].has_delivery == "No"){
	                			cart_has_delivery = false;
	                			console.log("Se puso en false")
	                		}
	                	}	
	                }
	            }

				res.render('billing', {config: config, location:"billing", has_delivery:cart_has_delivery, deliveries:deliveries, categories:categories, cart_id:cart_id, device:res.locals.device, brand:xBrand});
			}).catch(function (errorCategories){
				logger.error("Error on getCategories: ", errorCategories);
				return errorCategories;
			})
		}).catch(function (errorgetDeliveries){
			logger.error("Error on getDeliveries: ", errorgetDeliveries);
			return errorgetDeliveries;
		})
	}).catch(function (errorbuildCart){
		logger.error("Error on buildCart: ", errorbuildCart);
		return errorbuildCart;
	})
};

self.billingSave = (req, res) => { 

	console.log("DATA ", req.body);

	let cartData = {
		billing_name : req.body.first_name,
		billing_lastname : req.body.last_name,
		billing_email : req.body.email,
		billing_phone : req.body.phone,
		billing_type_document : req.body.document_type,
		billing_document_number : req.body.document_number,
		delivery_city : req.body.city,
		delivery_street_name : req.body.street_name,
		delivery_street_number : req.body.street_number,
		delivery_floor : req.body.floor,
		delivery_room : req.body.room,
		delivery_zip_code : req.body.zip_code,
		delivery_type : req.body.delivery_type,
		billing_gender : req.body.gender,
		delivery_cost : req.body.delivery_cost || 0
	}

	if(cartData.billing_name != "" && cartData.billing_lastname != "" && cartData.billing_email != "" && cartData.billing_phone != "" && cartData.billing_type_document != "" && cartData.billing_document_number != "" && cartData.delivery_city != "" && cartData.delivery_street_name != "" && cartData.delivery_street_number != ""  && cartData.delivery_zip_code != "" && cartData.billing_gender != ""){
		services.changeCartData(req.body.cart_id, cartData).then(function(cartUpdated){
			console.log("changeCartData findOneAndUpdate Success: ", cartUpdated);
	        res.redirect(302, config.sitePath+"/pago")
		}).catch(function(errorCartUpdated){
			console.log("changeCartData findOneAndUpdate Error: ", errorCartUpdated);
	        res.redirect(302, config.sitePath+"/facturacion")
		});	
	}else{
		console.log("billingSave EmptyFields Error: ", cartData);
		res.redirect(302, config.sitePath+"/facturacion");
	}
};


self.paymentForm = (req, res) => {
	
	let cart_id = req.cookies['tx'];
	console.log("listCart cart_id:", cart_id);
	
	services.buildCart(cart_id).then(function(cart){
		console.log("listCart paymentForm Success: ", cart);
		res.render('payment', {config:config, cart_id:cart._id, cart:cart, device:res.locals.device, brand:xBrand})
	}).catch(function(errorBuildCart){
		console.log("listCart paymentForm Error: ", errorBuildCart);
		res.status(500);
	})
}

// HOME TEMP
self.hometmp = (req, res) => { 
	let homeKey = "home_" + xBrand;
	let timeCache = 7200;

	let myHome = myCache.get(homeKey);
	
	if(typeof myHome == "undefined"){
		var template = hbsUtils.compile(fs.readFileSync('views/index_tmp.hbs', 'utf8'));
		var context = {config: config, device:res.locals.device, brand:xBrand};
		var html    = template(context);
		if(myCache.set(homeKey, html, timeCache)){
			console.log("Set Home Success");
		}else{
			console.log("Set Home Error");
		}	
		res.send(html);
	}else{
		console.log("Get Home Success");
		res.send(myHome);
	}
};

// HOME
self.home = (req, res) => {
	let device = res.locals.device;
	let homeKey = "home_" + xBrand + "_" + device;
	let timeCache = 0;//7200; // Dos Horas
	let myHome = myCache.get(homeKey);
	let bannersUpdated = [];
	let productsByCategory = [];

	if(typeof myHome == "undefined"){
		var template = hbsUtils.compile(fs.readFileSync('views/index.hbs', 'utf8'));
		
		services.getBanners().then(function(banners){
			console.log("banners", banners);
			console.log("res.locals.device", res.locals.device);

			banners.map(banner => {
				bannersUpdated.push(banner.banner)
			})

			console.log("bannersUpdated", bannersUpdated);

			services.getProducts().then(function(all_products){
				services.getCategories().then(function(categories){

					/*++++++++++++++++++++++++++++++++++++++*/
				all_products.forEach( (product, i) => {
					
					console.log("product", product.category_id, "i", i);
					let tempData=0;
					if(typeof productsByCategory[product.category_id] != "undefined"){
						tempData = productsByCategory[product.category_id];
					}
					productsByCategory[product.category_id] = tempData + 1;
				});

				categories.forEach((category, i) => {
					let tempData = {
						_id: category._id, 
						category: category.category,
						category_seo: category.category_seo,
						quantity : (typeof productsByCategory[category._id] == "undefined") ? 0 : productsByCategory[category._id]
					}
					categories[i] = tempData;

				});
				/*++++++++++++++++++++++++++++++++++++++*/
				const featured = [];
				for(var i=0; i<all_products.length; i++){
					
					featured.push(
						{
							'_id': all_products[i]._id,
							'images': all_products[i]._doc.images,
							'seo_link': Utils.getSeoUrl(all_products[i].description),
							'brand': all_products[i].brand,
							'category_id': all_products[i].category_id,
							'category_name': all_products[i].category_name,
							'created': all_products[i].created,
							'description': all_products[i].description,
							'discount': all_products[i].discount,
							'enabled_for_sale': all_products[i].enabled_for_sale,
							'main_image': all_products[i]._doc.images[0].url,
							'measures': all_products[i].measures,
							'model': all_products[i].model,
							'price': all_products[i].price,
							'salable_id': all_products[i].salable_id,
							'summary': all_products[i].summary,
							'web_price': all_products[i].web_price,
						}
					)
				}


				/*++++++++++++++++++++++++++++++++++++++*/


				console.log('=====================================')
				console.log(featured)
				console.log('=====================================')

					var context = {config: config, banners:bannersUpdated, products: all_products, prueba: 'prueba', featured: featured, categories:categories, device:res.locals.device, brand:xBrand };
					var html    = template(context);
					if(myCache.set(homeKey, html, timeCache)){
						console.log("Set Home Success");
					}else{
						console.log("Set Home Error");
					}	
					console.log("banners222", banners);
					res.send(html);
				}).catch(function (errorCategories){
					logger.error("Error on getCategories: ", errorCategories);
					return errorCategories;
				})
			}).catch(function (errorProducts){
				logger.error("Error on getProduct: ", errorProducts);
				return errorProducts;
			})
		}).catch(function (errorgetBanners){
			logger.error("Error on getBanners: ", errorgetBanners);
			return errorgetBanners;
		})

	}else{
		console.log("Get Home Success");
		res.send(myHome);
	}
};

self.contact = (req, res) => { 
	const productContact = req.query.salable_id;
	services.getCategories().then(function(categories){
    	res.render('contact', {config: config, categories:categories, device:res.locals.device, brand:xBrand, productContact: productContact}); 
    }).catch(function (errorCategories){
		logger.error("Error on getCategories: ", errorCategories);
		return errorCategories;
	})
};

self.store = (req, res) => { 
	services.getCategories().then(function(categories){
    	res.render('store', {config: config, categories:categories, device:res.locals.device, brand:xBrand}); 
    }).catch(function (errorCategories){
		logger.error("Error on getCategories: ", errorCategories);
		return errorCategories;
	})
};

self.contactSave = (req, res) => { 
	let message = {
		full_name : req.body.full_name,
		phone : req.body.phone,
		email : req.body.email,
		message : req.body.message,
		productContact : req.body.product
	}

	let emailMessage = '<h2><strong>Nueva consulta de la WEB:</strong></h2><br />Nombre: ' + 
						req.body.full_name + '<br />Telefono: ' + req.body.phone + '<br />Email: ' + 
						req.body.email + '<br />Mensaje: ' + req.body.message + 
						'<br /><strong>El cliente esta interesado <a href="http://www.muebleriamayfer.com.ar/producto/web/'+req.body.productContact+'">en este producto</a></strong>';



	const infoMail = self.sendEmailMessage(req.body.email, emailMessage);
	console.log("INFOMAIL", infoMail);

	services.validateRecaptcha(req.body.recaptcha_validate_owner).then(function(validation){
		console.log("validateRecaptcha response", validation);
		if(validation.success == true){
			services.addMessage(message).then(function(response){
				console.log("******************** message ok", response);
				res.render('contact', {config: config, result:"ok", device:res.locals.device, brand:xBrand});
			}).catch(function (error){
				console.log("******************** Error on contactSave: ", error);
				res.render('contact', {config: config, result:"error", device:res.locals.device, brand:xBrand});
			})	
		}else{
			console.log("Validation response FALSE", validation.success);
			res.render('contact', {config: config, result:"error", device:res.locals.device, brand:xBrand});
		}
	}).catch(function (errorValidation){
		logger.error("Error on validateRecaptcha: ", errorValidation);
		res.render('contact', {config: config, result:"error", device:res.locals.device, brand:xBrand});
	})
	
};

self.productsList = (req, res) => { 

	console.log("req.params.category_id", req.params.category_id);
	console.log("req.params.category_name", typeof req.params.category_name);
	console.log("req.query.sort_by", req.query.sort_by);
	let category_name;
	let sort_by = req.query.sort_by;
	let productsByCategory = [];

	services.getProducts().then(function(all_products){
		services.getProducts(req.params.category_id, sort_by).then(function(products){

			services.getCategories().then(function(categories){
				if(typeof req.params.category_name == "undefined"){
					category_name = "Todas nuestras ofertas";
				}else{
					if(products.length>0){
						category_name="Ofertas para " + products[0].category_name;
					}else{
						category_name = "Todas nuestras ofertas";	
					}
				}

				/*++++++++++++++++++++++++++++++++++++++*/
				all_products.forEach( (product, i) => {
					
					console.log("product", product.category_id, "i", i);
					let tempData=0;
					if(typeof productsByCategory[product.category_id] != "undefined"){
						tempData = productsByCategory[product.category_id];
					}
					productsByCategory[product.category_id] = tempData + 1;
				});

				categories.forEach((category, i) => {
					let tempData = {
						_id: category._id, 
						category: category.category,
						category_seo: category.category_seo,
						quantity : (typeof productsByCategory[category._id] == "undefined") ? 0 : productsByCategory[category._id]
					}
					categories[i] = tempData;

				});
				/*++++++++++++++++++++++++++++++++++++++*/

				res.render('categories', {config: config, location:"listado", counter:products.length, products: products, category_name: category_name, categories:categories, device:res.locals.device, brand:xBrand }); 

			}).catch(function (errorCategories){
				logger.error("Error on getCategories: ", errorCategories);
				return errorCategories;
			})
					
		}).catch(function (errorProducts){
			logger.error("Error on getProduct: ", errorProducts);
			return errorProducts;
		})
	}).catch(function (errorAllProducts){
		logger.error("Error on getProduct ALL: ", errorAllProducts);
		return errorAllProducts;
	})
};

// PRODUCT
self.getUniqueProduct = (req, res) => { 
	services.getProduct(req.params.product_id).then(function(product){
		services.getProducts().then(function(products){
			services.getCategories().then(function(categories){
				let category_name;
				(typeof product !== "undefined") ? category_name = product.category_name.toLowerCase() : category_name = "Not Found";
				let productPriceInstallments = (product.web_price / 12).toFixed(2);
				console.log('productPriceInstallments', productPriceInstallments);
				res.render('product', {config: config, productPriceInstallments: productPriceInstallments, location:"ficha", categories:categories, category_name:category_name, product: product, products: products, device:res.locals.device, brand:xBrand }); 
			}).catch(function (error){
				logger.error("Error on getcategories: ", error);
				return error;
			})
		}).catch(function (error){
			logger.error("Error on getProducts: ", error);
			return error;
		})
	}).catch(function (error){
		logger.error("Error on getProduct: ", error);
		return error;
	})
};

// SEARCH
self.search = (req, res) => { 
	
	let search;
	let productsByCategory = [];
	if(typeof req.params.q != "undefined"){
		search = req.query.q;
	}

	if(typeof req.query.q != "undefined"){
		search = req.query.q;
	}

	services.getProducts().then(function(all_products){
		services.searchProduct(search).then(function(products){
			services.getCategories().then(function(categories){

				/*++++++++++++++++++++++++++++++++++++++*/
					all_products.forEach( (product, i) => {
						
						console.log("product", product.category_id, "i", i);
						let tempData=0;
						if(typeof productsByCategory[product.category_id] != "undefined"){
							tempData = productsByCategory[product.category_id];
						}
						productsByCategory[product.category_id] = tempData + 1;
					});

					categories.forEach((category, i) => {
						let tempData = {
							_id: category._id, 
							category: category.category,
							category_seo: category.category_seo,
							quantity : (typeof productsByCategory[category._id] == "undefined") ? 0 : productsByCategory[category._id]
						}
						categories[i] = tempData;

					});
					/*++++++++++++++++++++++++++++++++++++++*/

				res.render('categories', {config: config, location:"search", products: products, counter:products.length, categories:categories, device:res.locals.device, brand:xBrand }); 
			}).catch(function (errorCategories){
				logger.error("Error on getCategories: ", errorCategories);
				return errorCategories;
			})
		}).catch(function (errorProducts){
			logger.error("Error on getProduct: ", errorProducts);
			return errorProducts;
		})
	}).catch(function (errorProductsAll){
		logger.error("Error on getALLProduct: ", errorProductsAll);
		return errorProductsAll;
	})
};

self.getSearch = (req, res) => {
	req.params.q = req.body.q;
	self.search(req, res);
}

// CREATE CART
self.addCartProduct = (req, res) => {

	let cart_id = req.cookies['tx'] || null;
	let productsLength;
	services.getProduct(req.body.salable_id).then(function(product){
		services.getCategories().then(function(categories){
			services.handlerProduct(product, cart_id).then(function(cart){
				console.log("handlerProduct Success ", cart);
				services.buildCart(cart._id).then(function(cart){
					console.log("Created Cart ", cart._id, cart);
					res.cookie("tx", cart._id);
					productsLength = cart.products.length;
	        		res.render('cart', {config:config, cart:cart, categories:categories, location:"carrito", products:cart.products, productsLength:productsLength, device:res.locals.device, brand:xBrand});
	        	}).catch(function(errorBuildCart){
					logger.info("Error on errorBuildCart", errorBuildCart);
				})	
			}).catch(function(errorCart){
				logger.info("Error on createCart", errorCart);
			})
		}).catch(function(errorGetCategories){
			logger.info("Error on errorGetCategories", errorGetCategories);
		})
	}).catch(function(errorProduct){
		logger.info("Error on getUniqueProduct", errorProduct);
	})
};

// ADD PRODUCT TO CART
self.addCartProductToCart = (req, res) => {
	let cart_id = req.body.cart_id;
	let productsLength;
	services.getProduct(req.body.salable_id).then(function(product){
		services.getCategories().then(function(categories){
			return services.addProduct(product[0], cart_id).then(function(cart){
				console.log("Modified Cart ", cart._id);
				res.cookie("tx", cart._id);
				productsLength = cart.products.length;
	        	res.render('cart', {config:config, cart:cart._id, categories:categories, product:product, productsLength:productsLength, device:res.locals.device, brand:xBrand});
			}).catch(function(errorCart){
				logger.info("Error on addProduct", errorCart);
			})
		}).catch(function(errorCategories){
			logger.info("Error on errorCategories", errorCategories);
		})
	}).catch(function(errorProduct){
		logger.info("Error on getUniqueProduct", errorProduct);
	})
};

// CHANGE QUANTITY PRODUCT ON CART
self.changeQuantityProductCart = (req, res) => {
	let cart_id = req.body.cart_id;
	let productsLength;
	services.getProduct(req.body.salable_id).then(function(product){
		services.getCategories().then(function(categories){
			return services.changeQuantity(product[0], req.body.quantity, cart_id).then(function(cart){
				console.log("Modified Cart ", cart._id);
				res.cookie("tx", cart._id);
				productsLength = cart.products.length;
	        	res.render('cart', {config:config, categories:categories, cart:cart._id, product:product, productsLength:productsLength, device:res.locals.device, brand:xBrand});
			}).catch(function(errorCart){
				logger.info("Error on addProduct", errorCart);
			})
		}).catch(function(errorCategories){
			logger.info("Error on errorCategories", errorCategories);
		})
	}).catch(function(errorProduct){
		logger.info("Error on getUniqueProduct", errorProduct);
	})
};

// PRODUCT LIST
self.listCart = (req, res) => {
	
	let cart_id = req.cookies['tx'] || null;
	let productsLength;
	console.log("cart_id ", cart_id);
	if(cart_id == null){
		console.log("create");
		services.createCart().then(function(cart){
			services.getCategories().then(function(categories){
				console.log("build", cart);
				services.buildCart(cart._id).then(function(cart){
					console.log("build ok");
					console.log("listCart createCart cart_id:", cart._id);
					console.log("listCart createCart Success: ", cart);
					productsLength = cart.products.length;
					res.render('cart', {config:config, categories:categories, location:"carrito", cart_id:cart._id, cart:cart, products:cart.products, productsLength:productsLength, device:res.locals.device, brand:xBrand})
				}).catch(function(errorBuildCart){
					console.log("listCart createCart buildCart Errro: ", errorBuildCart);
					res.status(500);
				})
			}).catch(function(errorGetCategories){
				console.log("errorGetCategories Errro: ", errorGetCategories);
				res.status(500);
			})
		}).catch(function(errorCreateCart){
			console.log("listCart createCart Errro: ", errorCreateCart);
			res.status(500);
		})
	}else{
		console.log("listCart cart_id:", cart_id);
		services.buildCart(cart_id).then(function(cart){
			services.getCategories().then(function(categories){
				console.log("listCart buildCart Success: ", cart);
				productsLength = cart.products.length;
				res.render('cart', {config:config, categories:categories, cart_id:cart._id, cart:cart, products:cart.products, productsLength:productsLength, device:res.locals.device, brand:xBrand})
			}).catch(function(errorBuildCart){
				console.log("listCart errorBuildCart Errro: ", errorBuildCart);
				res.status(500);
			})
		}).catch(function(errorgetCategories){
			console.log("getCategories Errro: ", errorgetCategories);
			res.status(500);
		})
	}
};

// GENERIC ERROR
self.genericError = (req, res) => { 
	logger.error("Generic Error ", req.error);
    res.render('error', {error: req.error + " " + req.message, device:res.locals.device, brand:xBrand}); 
};

//MONGO SETUP LOCALHOST DATA
self.mongoSetup = (req, res) => {
	var producto;
	var category;
	var response;

	mongoose.connection.db.dropCollection('deliveries', function(err, result) {
		if(err){
			console.log("Error on remove deliveries ", err);
		}else{
			console.log("Collection deliveries removed success!");
		}
	});

	mongoose.connection.db.dropCollection('categories', function(err, result) {
		if(err){
			console.log("Error on remove categories ", err);
		}else{
			console.log("Collection categories removed success!");
		}
	});

	mongoose.connection.db.dropCollection('products', function(err, result) {
		if(err){
			console.log("Error on remove products ", err);
		}else{
			console.log("Collection products removed success!");
		}
	});

	mongoose.connection.db.dropCollection('emails', function(err, result) {
		if(err){
			console.log("Error on remove emails ", err);
		}else{
			console.log("Collection emails removed success!");
		}
	});

	let categories = ["Mesas Ratonas", "Racks", "Escritorios", "Decoración", "Bibliotecas"];
	let deliveries = ["Gral Rodriguez", "Caseros", "San Martin", "Moreno", "Villa Urquiza"];

	let data = {
		description : "",
		large_description : "",
		model : "",
		main_image : "",
		salable_id : "",
		price : "",
		web_price : ""
	}

	for(var i=0; i<5; i++){

	    category = new Category({"category": categories[i]});
	    
	    category.save(function (err, results) {
	        if (err){
	        	response += err;
	        }else{
	        	response += results;

	        	switch(results.category){
	        		case "Bibliotecas":
	        			data.description = "Biblioteca Rústica";
	        			data.large_description = "Biblioteca Rústica compuesta por madera y metal galvanizado.";
	        			data.model = "Mayfer";
	        			data.main_image = "4.jpg";
	        			data.salable_id = "678310";
	        			data.price = 349;
	        			data.web_price = 399;
	        		break;
	        		
	        		case "Racks":
	        			data.description = "Rack de TV";
	        			data.large_description = "Rack de TV compuesto por madera y metal galvanizado.";
	        			data.model = "Mayfer";
	        			data.main_image = "1.jpg";
	        			data.salable_id = "678311";
	        			data.price = 349;
	        			data.web_price = 399;
	        		break;

	        		case "Mesas Ratonas":
	        			data.description = "Mesa ratona";
	        			data.large_description = "Mesa ratona compuesta por madera y metal galvanizado.";
	        			data.model = "Mayfer";
	        			data.main_image = "2.jpg";
	        			data.salable_id = "678312";
	        			data.price = 439;
	        			data.web_price = 489;
	        		break;

	        		case "Escritorios":
	        			data.description = "Escritorio moderno";
	        			data.large_description = "Escritorio moderno armado en madera de pino con terminaciones en metal galvanizado.";
	        			data.model = "Mayfer";
	        			data.main_image = "3.jpg";
	        			data.salable_id = "678313";
	        			data.price = 249;
	        			data.web_price = 299;
	        		break;

	        		case "Decoracion":
	        			data.description = "Set cuadros decorativos";
	        			data.large_description = "Set de 9 cuadros decorativos para que puedas decorar tu living de una forma moderna y elegante.";
	        			data.model = "Mayfer";
	        			data.main_image = "5.jpg";
	        			data.salable_id = "678314";
	        			data.price = 349;
	        			data.web_price = 399;
	        		break;

	        	}

	        	for(var i=0; i<5; i++){
		        	producto = new Product({
		        		"category_name": results.category, 
		        		"description": data.description, 
		        		"summary": data.large_description, 
		        		"model": data.model,
		        		"main_image": data.main_image,
		        		"salable_id": data.salable_id + i,
		        		"discount": "", 
		        		"enabled_for_sale": true,
		        		"price": data.price,
		        		"web_price": data.web_price,
		        		"brand": "Geza",
		        		"category_id": results._id,
		        		"images": [
		        			{"url": data.main_image,"max_width": "1000"}, 
		        			{"url": data.main_image,"max_width": "1000"}, 
		        			{"url": data.main_image,"max_width": "1000"}
		        		],
		        		"product_tags": []
		        	});
				    
				    producto.save(function (err, results) {
				        if (err){
				        	response += err;
				        }else{
				        	response += results;
				        }
					});

				}
	        }
		});
	}


	for(var i=0; i<10; i++){
	    var Mail = new Email({'email':'prueba@gmail.com'});
	    Mail.save(function (err, results) {
	        if (err){
	        	response += err;
	        }else{
	        	response += results;
	        }
		});
	}

	for(var i=0; i<5; i++){
	    var MyDelivery = new Delivery({'city':deliveries[i], 'cost': 500});
	    MyDelivery.save(function (err, results) {
	        if (err){
	        	response += err;
	        }else{
	        	response += results;
	        }
		});
	}

	res.send("Mock data for Mongo success!");
};


function getItemsCart(cart){
	let items = [];

	for(var i=0; i<cart.products.length; i++){

		let item = {
			id: cart.products[i].salable_id,
			title: config.mercadopago.titleShopping,
			quantity: parseInt(cart.products[i].quantity),
			currency_id: config.mercadopago.currency,
			unit_price: parseInt(cart.products[i].price)
		};

		items.push(item);
	}

	let item = {
		id: "shipping",
		title: config.mercadopago.titleShopping,
		quantity: 1,
		currency_id: config.mercadopago.currency,
		unit_price: parseInt(cart.delivery_cost)
	};

	items.push(item);
	return items;
}

function getMeasuresItemsCart(cart){

	let width = 0;
	let height = 0;
	let depth = 0;
	let weight = 0;

	for(var i=0; i<cart.products.length; i++){
		let arrMeasures = cart.products[i].measures.split("x");
		width = width + arrMeasures[0];
		height = height + arrMeasures[1];
		depth = depth + arrMeasures[2];
		weight = weight + arrMeasures[3];
	}

	return width + "x" + height + "x" + depth + "," + weight;
}

// HANDLER MERCADOPAGO PAYMENT
self.paymentCart = (req, res) => {

	let cart_id = req.cookies['tx'] || null;

	console.log("PaymentCart cart_id", cart_id);
	res.cookie("tx", "");
	if(cart_id == null){
		res.redirect(302, config.sitePath+"/carrito");
	}

	console.log("Preparing payment cart ", cart_id);
	services.getCategories().then(function(categories){
		services.buildCart(cart_id).then(function(cart){
			console.log("Mercadopago buildCart ", cart_id);
			let url;
			let name = cart.billing_name;
			let surname = cart.billing_lastname;
			let email = cart.email;
			let phone = cart.phone;
			let gender = cart.gender;
			let document_type = cart.billing_type_document;
			let document_number = cart.billing_document_number;
			let street_name = cart.delivery_street_name;
			let street_number = cart.delivery_street_number;
			let floor = cart.delivery_floor;
			let room = cart.delivery_room;
			let city = cart.delivery_city;
			let zip_code = cart.delivery_zip_code;
			console.log("Mercadopago Configure ", cart_id);
			mercadopago.configure({
				access_token : config.mercadopago.access_token
			});
			console.log("Preparing Mercadopago Preferences ", cart_id);
			var preference = {
					items: getItemsCart(cart),
					payer : {
						name: name,
						surname: surname,
						email: email,
						date_created: moment(),
						phone: {
							area_code: "",
							number: parseInt(phone)
						},
						identification: {
							type: document_type,
							number: document_number
						},
						address: {
							street_name: street_name,
							street_number: parseInt(street_number),
							zip_code: zip_code.toString()
						}
					},
					back_urls: {
						success: config.mercadopago.callbacks.success,
		    			pending: config.mercadopago.callbacks.pending,
		    			failure: config.mercadopago.callbacks.failure
		    		},
		    		auto_return: "approved",
		    		external_reference: cart_id
			};

			if(cart.delivery_type == "domiciliary"){
				preference.shipments = {
					local_pickup : true,
					mode: "me2",
					dimensions: getMeasuresItemsCart(cart),
					receiver_address:{
						zip_code:zip_code,
						street_number: parseInt(street_number),
						street_name: street_name,
						floor: floor,
						apartment: room
					}
				}
			}

			console.log("Mercadopago Object CART", JSON.stringify(cart));
			console.log("Mercadopago Object preference", JSON.stringify(preference));
			mercadopago.preferences.create(preference).then(function (preference) {
				console.log("Mercadopago preference success", cart_id, preference);
				console.log("Mercadopago Object Response preference", JSON.stringify(preference));
				if(config.env == "prod"){
					url = preference.response.init_point;
				}else{
					url = preference.response.sandbox_init_point
				}
				
				res.render('mercadopago',{config: config, categories:categories, url: url, location:"pago", brand:xBrand});
			}).catch(function (errorMercadoPago) {
				console.log("Error on set Preferences for MercadoPago", cart_id, errorMercadoPago);
				res.render('error',{config: config, brand:xBrand});
			});

		}).catch(function(errorBuildCart){
			console.log("paymentCart buildCart Error: ", cart_id, errorBuildCart)
			res.status(500);
		})
	}).catch(function(errorgetCategories){
		console.log("getCategories Error: ", cart_id, errorgetCategories)
		res.status(500);
	})
};

self.paymentVerifySuccess = (req, res) => {
	res.cookie("tx", "");
	let response = {
		collection_id : req.query.collection_id,
		collection_status : req.query.collection_status,
		preference_id : req.query.preference_id,
		external_reference : req.query.external_reference,
		payment_type : req.query.payment_type,
		merchant_order_id : req.query.merchant_order_id
	}
	
	services.getCategories().then(function(categories){
		services.buildCart(response.external_reference).then(function(cart){
			console.log("paymentVerify getCart success ", cart._id);
			res.render('payment_process', {config: config, categories:categories, data: response, cart:cart, device:res.locals.device, brand:xBrand}); 	
		}).catch(function(errorGetCartPaymentVerify){
			console.log("paymentVerify getCart Error: ", errorGetCartPaymentVerify);
			res.status(500);
		})
	}).catch(function(errorgetCategories){
		console.log("errorgetCategories Error: ", errorgetCategories);
		res.status(500);
	})
};

self.paymentVerifyFailure = (req, res) => {
	res.cookie("tx", "");
	let response = {
		collection_id : req.query.collection_id,
		collection_status : req.query.collection_status,
		preference_id : req.query.preference_id,
		external_reference : req.query.external_reference,
		payment_type : req.query.payment_type,
		merchant_order_id : req.query.merchant_order_id
	}
	let cart_id = req.query.external_reference;
	services.getCategories().then(function(categories){
		services.buildCart(response.external_reference).then(function(cart){
			console.log("paymentVerify getCart success ", cart._id);
			res.render('payment_failure', {config: config, categories:categories, data: response, cart_id:cart_id, cart:cart, device:res.locals.device, brand:xBrand}); 	
		}).catch(function(errorGetCartPaymentVerify){
			console.log("paymentVerify getCart Error: ", errorGetCartPaymentVerify);
			res.status(500);
		})
	}).catch(function(errorgetCategories){
		console.log("getCategories Error: ", errorgetCategories);
		res.status(500);
	})
};


self.paymentVerifyPending = (req, res) => {
	res.cookie("tx", "");
	let response = {
		collection_id : req.query.collection_id,
		collection_status : req.query.collection_status,
		preference_id : req.query.preference_id,
		external_reference : req.query.external_reference,
		payment_type : req.query.payment_type,
		merchant_order_id : req.query.merchant_order_id
	}
	
	services.getCategories().then(function(categories){
		services.buildCart(response.external_reference).then(function(cart){
			console.log("paymentVerify getCart success ", cart._id);
			res.render('payment_pending', {config: config, categories:categories, data: response, cart:cart, device:res.locals.device, brand:xBrand}); 	
		}).catch(function(errorGetCartPaymentVerify){
			console.log("paymentVerify getCart Error: ", errorGetCartPaymentVerify);
			res.status(500);
		})
	}).catch(function(errorGetcategories){
		console.log("errorGetcategories Error: ", errorGetcategories);
		res.status(500);
	})
};

self.duplicateCart = (req, res) => {

	console.log("cart_id duplicate", req.params.cart_id);
	let cart_id = req.params.cart_id;

	services.getCart(cart_id).then(function(cart){
		console.log("Cart for duplicate => ", cart._id);
		services.duplicateCart(cart).then(function(new_cart){
			console.log("Cart duplicated => ", new_cart._id);
			res.cookie("tx", new_cart._id);
			res.redirect(302, config.cartPath);
		}).catch(function(errorDuplicateCart){
			console.log("duplicateCart duplicateCart Error: ", errorDuplicateCart);
			res.status(500);
		})
	}).catch(function(errorGetCart){
		console.log("duplicateCart getCart Error: ", errorGetCart);
		res.status(500);
	})
} 

// HANDLER RESPONSE MERCADOPAGO
self.handlerPayment = (req, res) => {
	let status = req.params.status_operation;

	res.render(status, {config: config, data: JSON.stringify(req.body), device:res.locals.device, brand:xBrand}); 
};


self.removeCartProduct = (req, res) => {

	return services.removeProduct(req.query.product_id, req.query.cart_id).then(function(cart){
		console.log("remove ", cart);
		res.redirect(302, config.cartPath);
	}).catch(function(errorRemoveCartProduct){
		console.log("removeProduct Error: ", errorRemoveCartProduct);
		res.status(500);
	})
}

// LANDING MERCADOPAGO FINANCIAL DATA
self.mercadoPagoData = (req, res) => {
    let mercadoPagoData = "";
    let limit = req.body.limit || null;
    let mercadoPagoDataArray = [];
    let no_img = config.sourcePath + "/brands/" + xBrand + "/images/mercadopago/no_disponible.svg";

    services.getCategories().then(function(categories){
		return services.getMercadoPagoData().then(function(mercadoPagoData){

	        for (var i =0; i<mercadoPagoData.length; i++) {
	            mercadoPagoData[i].date_expired = parseDate(mercadoPagoData[i].date_expired);
	            mercadoPagoData[i].picture = config.sourcePath + "/brands/" + xBrand + "/images/mercadopago/"+mercadoPagoData[i].id+".svg?v=x675tuyfhjv3e";
	        }
	        
	        if(myCache.set(MeliKey, mercadoPagoData, timeCache)){
	            if(limit != null){
	            	mercadoPagoData = mercadoPagoData.slice(0, limit);
	            	return mercadoPagoData;
	            }
	            res.render('mercadopago-cuotas', {data: mercadoPagoData, categories:categories, config: config, no_img: no_img, device:res.locals.device, brand:xBrand});
	        }else{
	            if(limit != null){
	            	mercadoPagoData = mercadoPagoData.slice(0, limit);
	            	return mercadoPagoData;
	            }
	            res.render('mercadopago-cuotas', {data: mercadoPagoData, config: config, no_img: no_img, device:res.locals.device, brand:xBrand});
	        }
	    }).catch(function(error){
	        mercadoPagoData = myCache.get(MeliKey);
	        mercadoPagoData = "";
	        if(mercadoPagoData != "" && mercadoPagoData != "undefined"){
	            if(limit == null){
	            	mercadoPagoData = mercadoPagoData.slice(0, limit);
	            	return mercadoPagoData;
	            }
	        	res.render('mercadopago-cuotas', {data: mercadoPagoData, config: config, no_img: no_img, device:res.locals.device, brand:xBrand});
	        }else{
	            res.status(200).render('mercadopago-error', {config: config, no_img: no_img, device:res.locals.device, brand:xBrand});
	        }
	    })
	}).catch(function (errorCategories){
		logger.error("Error on getCategories: ", errorCategories);
		return errorCategories;
	})
};

// LANDING MERCADOPAGO FINANCIAL DATA - DETAILS
self.mercadoPagoDataDetails = (req, res) => {
    var paymentId = req.params.paymentId;
    return services.getMercadoPagoDetails(paymentId).then(function(mercadoPagoData){
        let response = {
            info : mercadoPagoData,
            cloudfrontUrl: config.sourcePath,
            picture : config.sourcePath + "/brands/" + xBrand + "/images/mercadopago/"+paymentId+".svg?v=x675tuyfhjv3e"
        }
        res.send(response);
    }).catch(function(error){
    })
};

// FUNCTION DATE FOR MERCADOPAGO FINANCIAL DATA
function parseDate(myDate){
    var tempDate = myDate.split("T");
    tempDate = tempDate[0].split("-");
    return tempDate[2] + "-" + tempDate[1] + "-" + tempDate[0];
}


self.landingAtencionAlCliente = (req, res) => {
	services.getCategories().then(function(categories){
    	res.render('atencion_al_cliente', {config: config, categories:categories, brand:xBrand}); 
    }).catch(function (errorCategories){
		logger.error("Error on getCategories: ", errorCategories);
		return errorCategories;
	})
	
};
self.landingEnvios = (req, res) => {
	services.getCategories().then(function(categories){
    	res.render('envios', {config: config, categories:categories, brand:xBrand}); 
    }).catch(function (errorCategories){
		logger.error("Error on getCategories: ", errorCategories);
		return errorCategories;
	})
	
};


self.landingNosotros =  (req, res) => {
	services.getCategories().then(function(categories){
    	res.render('description_brand', {config: config, categories:categories, brand:xBrand}); 
    }).catch(function (errorCategories){
		logger.error("Error on getCategories: ", errorCategories);
		return errorCategories;
	})
	
};


module.exports = self;


















