"use strict"
const    Q    = require('q');
const logger      = require('../utils/logger');
const config      = require('../config/config');
const moment      = require('moment');
const services    = require('../services/service');
const sha         = require("sha1");
const Utils       = require('../utils/utils');
const self        = {};
const xBrand       = process.env.APP_BRAND.toLowerCase();
const cloudinary  = require('cloudinary').v2;
var   multer      = require('multer')({dest: 'public/uploads'})
const nodemailer   = require('nodemailer');
const hbsUtils    = require('hbs');
const path = require("path");
const fs = require("fs");
// const Q           = require('q');
// const mongoose    = require('mongoose');
// const Product     = require('../models/product.model');
// const Category     = require('../models/category.model');
// const Email       = require('../models/email.model');
// const Cart        = require('../models/cart.model');
// const Message        = require('../models/message.model');
// const NodeCache   = require('node-cache');
// const ObjectId   = require('mongoose').Types.ObjectId;
// const api    = require('../controllers/ApiController');

const gmailAccountUserTwo   = process.env.APP_GMAIL_USER_TWO || "";
const gmailAccountPassTwo   = process.env.APP_GMAIL_PASS_TWO || "";


self.getPanel = (req, res) => { 
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	let admin = 0;
	if (req.cookies["app_admin"]) {
	  admin = 1;
	}
	res.render("admin/panel", { config: config, admin: admin, device:res.locals.device, brand:xBrand}); 
};

self.addProducts = (req, res) => { 
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}

	services.getCategories().then(function(categories){
		res.render('admin/product_add', {config: config, salableMagic : generateSalableId(), categories:categories, device:res.locals.device, brand:xBrand}); 
	}).catch(function (errorCategories){
		logger.error("Error on getCategories: ", errorCategories);
		return errorCategories;
	})				
};


self.getBanners = (req, res) => { 
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}	
	services.getBanners().then(function(banners){
		res.render('admin/banners', {config: config, banners:banners, device:res.locals.device, brand:xBrand}); 
	}).catch(function (errorbanners){
		logger.error("Error on getbanners: ", errorbanners);
		return errorbanners;
	})				
};

self.addBanner = (req, res) => { 
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	res.render('admin/banner_add', {config: config, device:res.locals.device, brand:xBrand}); 
};

self.saveBanner = (req, res) => { 
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	console.log("BANNER", req.body.banner);
	services.addBanner(req.body.banner, req.body.mobile).then(function(banner){
		console.log("savebanner Success: ", banner);
		res.redirect(302, config.adminPath+"/banners");
	}).catch(function(errorSavebanner){
		console.log("Error on errorSavebanner: ", errorSavebanner);
		return errorSavebanner;
	})
};

self.removeBanner = (req, res) => { 
    if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	services.removeBanner(req.params.banner_id).then(function(data){
		console.log("removeBanner Success: ", data);
		res.redirect(302, config.adminPath+"/banners");
	}).catch(function(errorremoveBanner){
		console.log("Error on removeBanner: ", errorremoveBanner);
		return errorremoveBanner;
	})
};

self.addCategory = (req, res) => { 
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	res.render('admin/category_add', {config: config, device:res.locals.device, brand:xBrand}); 
};

self.saveCategory = (req, res) => { 
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	services.saveCategory(req.body.category_name, req.body.has_delivery).then(function(category){
		console.log("saveCategory Success: ", category);
		res.redirect(302, config.adminPath+"/categorias");
	}).catch(function(errorSaveCategory){
		console.log("Error on saveCategory: ", errorSaveCategory);
		return errorSaveCategory;
	})
};

self.removeProduct = (req, res) => { 
    if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	services.removeProduct(req.params.product_id).then(function(data){
		console.log("errorremoveProduct Success: ", data);
		res.redirect(302, config.adminPath+"/productos");
	}).catch(function(errorremoveProduct){
		console.log("Error on errorremoveProduct: ", errorremoveProduct);
		return errorremoveProduct;
	})
};

self.removeCategory = (req, res) => { 
    if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	services.removeCategory(req.params.category_id).then(function(data){
		console.log("removeCategory Success: ", data);
		res.redirect(302, config.adminPath+"/categorias");
	}).catch(function(errorremoveCategory){
		console.log("Error on removeCategory: ", errorremoveCategory);
		return errorremoveCategory;
	})
};


self.uploadFiles = (attachment) => {
	let deferred = Q.defer();
	let imagen_no_disponible = config.cloudinary.imagen_no_disponible;
	
	cloudinary.config({
	  cloud_name: config.cloudinary.cloud_name,
	  api_key: config.cloudinary.api_key,
	  api_secret: config.cloudinary.api_secret
	});
	
	console.log("#1", attachment);
	console.log("#2", attachment.size);

	if(attachment.size > 0){
		cloudinary.uploader.upload(attachment.path, function(error, image) { 
			if(error){ 
				console.error("cloudinary.uploader", error); 
				deferred.reject(error);
			}else{
				console.error("cloudinary.uploader SUCCESS"); 
				deferred.resolve(image.url);
			}
		});
	}else{
		deferred.resolve(imagen_no_disponible);
	}
	return deferred.promise;
}

self.saveProduct = (req, res) => {
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}

	let images_collections = [];

	Promise.all([
	    self.uploadFiles(req.files.attachment1),
	    self.uploadFiles(req.files.attachment2),
	    self.uploadFiles(req.files.attachment3)
	]).then((images_collections) => {
	    console.log("IMAGENES SUBIDAS!!!", images_collections);

		let data = {
			attachment1 : { url: images_collections[0] },
			attachment2 : { url: images_collections[1] },
			attachment3 : { url: images_collections[2] },
			category_id	: req.body.category_id,
			description : req.body.description,
			summary : req.body.summary,
			model : req.body.model,
			salable_id : req.body.salable_id,
			discount : req.body.discount,
			enabled_for_sale: req.body.enabled_for_sale,
			price: req.body.price,
			web_price: req.body.web_price,
			brand: req.body.brand
		}

		console.log("NEW PRODUCT", data);

		services.saveProduct(data).then(function(data){
			console.log("saveProduct Success: ", data);
			res.redirect(302, config.adminPath+"/productos");
		}).catch(function(errorsaveProduct){
			console.log("Error on saveProduct: ", errorsaveProduct);
			return errorsaveProduct;
		})
	});
};

self.getPurchases = (req, res) => { 	
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	services.getPurchasesWithStatus("MERCADOPAGO").then(function(purchases){
		for(var i=0; i<purchases.length; i++){
			let date_temp = moment(purchases[i].created).format("DD-MM-YYYY HH:mm:ss");
			purchases[i].my_date = date_temp;
		}
		res.render('admin/purchases', {config: config, purchases:purchases, device:res.locals.device, brand:xBrand}); 
	}).catch(function (errorGetPurchases){
		logger.error("Error on getPurchases: ", errorGetPurchases);
		return errorGetPurchases;
	})				
};

self.getPurchaseDetail = (req, res) => { 
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}	
	services.buildCart(req.params.cart_id).then(function(cart){
		let date_temp = moment(cart.created).format("DD-MM-YYYY HH:mm:ss");
		cart.my_date = date_temp;
		res.render('admin/purchases_detail', {config: config, cart:cart, device:res.locals.device, brand:xBrand}); 
	}).catch(function (errorGetPurchaseDetail){
		logger.error("Error on getPurchaseDetail: ", errorGetPurchaseDetail);
		return errorGetPurchaseDetail;
	})				
};

self.editCategory =  (req, res) => { 	
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	services.getCategories(req.params.category_id).then(function(category){
		res.render('admin/category_edit', {config: config, category:category, device:res.locals.device, brand:xBrand}); 
	}).catch(function (errorCategories){
		logger.error("Error on getCategories: ", errorCategories);
		return errorCategories;
	})
};

self.editCategorySave = (req, res) => { 
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
    services.editCategory(req.body.category_id, req.body.category_name, req.body.has_delivery).then(function(category){
        res.redirect(302, config.adminPath+"/categorias");
    }).catch(function (errorCategories){
        logger.error("Error on Edit getCategories: ", errorCategories);
        return res.status(500).send(errorCategories);
    })
};

self.editProduct =  (req, res) => { 
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	services.getCategories().then(function(categories){	
		services.getProductById(req.params.product_id).then(function(product){
			res.render('admin/product_edit', {config: config, categories:categories, product:product, device:res.locals.device, brand:xBrand}); 
		}).catch(function (errorProduct){
			logger.error("Error on editProduct: ", errorProduct);
			return errorProduct;
		})
	}).catch(function (errorCategories){
		logger.error("Error on getCategories: ", errorCategories);
		return errorCategories;
	})
};

self.editProductSave = (req, res) => { 

	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}

	let images_collections = [];
	let imagesHandler = req.body.imagesHandler;
	console.log("imagesHandler", imagesHandler);
	Promise.all([
	    self.uploadFiles(req.files.attachment1),
	    self.uploadFiles(req.files.attachment2),
	    self.uploadFiles(req.files.attachment3)
	]).then((images_collections) => {
	    console.log("IMAGENES SUBIDAS!!!", images_collections);

		let data = {
			_id: req.body._id,
			category_id	: req.body.category_id,
			description : req.body.description,
			summary : req.body.summary,
			model : req.body.model,
			salable_id : req.body.salable_id,
			discount : req.body.discount,
			enabled_for_sale: req.body.enabled_for_sale,
			measures: req.body.measures,
			price: req.body.price,
			web_price: req.body.web_price,
			brand: req.body.brand,
			attachment1 : { url: req.body.attachment1_old},
			attachment2 : { url: req.body.attachment2_old},
			attachment3 : { url: req.body.attachment3_old},
		}
		console.log("editProductSave", data);
		
		if(imagesHandler == 'replace_confirmed') { 
			data.attachment1 = { url: images_collections[0] };
			data.attachment2 = { url: images_collections[1] };
			data.attachment3 = { url: images_collections[2] };
		}
		
		console.log("editProductSave with new set images", data);
		
		services.editProductSave(data).then(function(data){
			console.log("editProductSave Success: ", data);
			res.redirect(302, config.adminPath+"/productos");
		}).catch(function(erroreditProductSave){
			console.log("Error on editProductSave: ", erroreditProductSave);
			return erroreditProductSave;
		})
	});
}

self.getCategories = (req, res) => { 
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}	
	services.getCategories().then(function(categories){
		res.render('admin/categories', {config: config, categories:categories, device:res.locals.device, brand:xBrand}); 
	}).catch(function (errorCategories){
		logger.error("Error on getCategories: ", errorCategories);
		return errorCategories;
	})				
};

self.getProducts = (req, res) => { 
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	let category_id = req.params.category_id || null;

	services.getProducts(category_id, null).then(function(products){
		services.getCategories().then(function(categories){
			res.render('admin/products', {config: config, products: products, categories:categories, device:res.locals.device, brand:xBrand}); 
		}).catch(function (errorCategories){
			logger.error("Error on getCategories: ", errorCategories);
			return errorCategories;
		})				
	}).catch(function (errorProducts){
		logger.error("Error on getProduct: ", errorProducts);
		return errorProducts;
	})
};

self.setUser = (req, res) => {
  
  console.log("User", req.body.user);
  console.log("Pass", req.body.pass);
  if (validateUser(req, res)) {
    res.redirect(302, config.adminPath+"/panel");
  } else {
    res.cookie(
      "app-error",
      "El usuario o contraseña ingresados es incorrecto."
    );
    res.redirect(302, config.adminPath+"/login");
  }
};

self.login = (req, res) => {
  logger.info("Render Login");
  let errorLogin = req.cookies["app-error"];
  res.render("admin/login", { config:config, error: errorLogin, device:res.locals.device, brand:xBrand});
};

self.logout = (req, res) => {
  res.cookie("app_admin", "");
  res.clearCookie("app_admin");
  res.redirect(302, config.adminPath+"/login");
};

self.getDocumentation = (req, res) => {
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	res.render("admin/documentation", {config: config, device:res.locals.device, brand:xBrand});
};


self.addDelivery = (req, res) => { 
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	res.render('admin/delivery_add', {config: config, device:res.locals.device, brand:xBrand}); 
};

self.saveDelivery = (req, res) => { 
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	services.saveDelivery(req.body.delivery_city, req.body.delivery_cost).then(function(delivery){
		console.log("saveDelivery Success: ", delivery);
		res.redirect(302, config.adminPath+"/envios");
	}).catch(function(errorSaveDelivery){
		console.log("Error on saveDelivery: ", errorSaveDelivery);
		return errorSaveDelivery;
	})
};
self.removeDelivery = (req, res) => { 
    if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	services.removeDelivery(req.params.delivery_id).then(function(data){
		console.log("removeDelivery Success: ", data);
		res.redirect(302, config.adminPath+"/envios");
	}).catch(function(errorremoveDelivery){
		console.log("Error on removeDelivery: ", errorremoveDelivery);
		return errorremoveDelivery;
	})
};

self.editDelivery =  (req, res) => { 	
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	services.getDeliveries(req.params.delivery_id).then(function(delivery){
		res.render('admin/delivery_edit', {config: config, delivery:delivery, device:res.locals.device, brand:xBrand}); 
	}).catch(function (erroreditDelivery){
		logger.error("Error on getDeliveries: ", erroreditDelivery);
		return erroreditDelivery;
	})
};

self.editDeliverySave = (req, res) => { 
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
    services.editDelivery(req.body.delivery_id, req.body.delivery_city, req.body.delivery_cost).then(function(category){
        res.redirect(302, config.adminPath+"/envios");
    }).catch(function (errorDeliveries){
        logger.error("Error on Edit editDelivery: ", errorDeliveries);
        return res.status(500).send(errorDeliveries);
    })
};

self.getDeliveries = (req, res) => { 	
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	services.getDeliveries().then(function(deliveries){
		res.render('admin/deliveries', {config: config, deliveries:deliveries, device:res.locals.device, brand:xBrand}); 
	}).catch(function (errordeliveries){
		logger.error("Error on getDeliveries: ", errordeliveries);
		return errordeliveries;
	})				
};


self.presentationLetter = (req, res) => {	
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	let contacts = req.body.contacts;
	let arrContacts = [];
	let products;
	let hbsTemplate = 'views/admin/letter.hbs';
	let vigencia = Utils.getValidity();
	if(typeof contacts == "string"){ arrContacts[0] = contacts; }else{ arrContacts = contacts; }
	
	let customer = req.body.customer;
	let customerEmail = req.body.customer_email;

	if(customerEmail != ""){
		hbsTemplate = 'views/admin/letter-mail.hbs';
	}
	var transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			user: gmailAccountUserTwo,
			pass: gmailAccountPassTwo
		}
	});

	services.getProducts().then(function(products){
    	var template = hbsUtils.compile(fs.readFileSync(hbsTemplate, 'utf8'));
    	var context = {config: config, vigencia:vigencia, products:products, brand:xBrand, customer:customer, contacts:arrContacts};
		var htmlEmail    = template(context);
		
		var mailOptions = {
			from: 'GeZa <no-reply@gmail.com>',
			to: customerEmail,
			subject: "Carta de Presentación",
			html: htmlEmail
		};
		if(customerEmail != "" && typeof customerEmail != undefined && typeof customerEmail != "undefined"){
			transporter.sendMail(mailOptions, function(error, info){
				if (error){
			    	console.log("transporter.sendMail", error);
			        res.send(500, error.message);
			    } else {
			        // RENDER LETTER MAIL SUCCESS
			        res.render('admin/letter-mail-post', {config: config, vigencia:vigencia, brand:xBrand, customer: customerEmail, msj: "success"}); 
			    }
			});
		}else{
			// RENDER LETTER FOR PRINT
			res.send(htmlEmail);
		}


    }).catch(function (errorProducts){
		logger.error("Error on getProducts: ", errorProducts);
		return errorProducts;
	})

};


self.presentationLetterSubmit = (req, res) => {
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	let products;
	let vigencia = Utils.getValidity();
	services.getProducts().then(function(products){
    	res.render('admin/letter-post', {config: config, vigencia:vigencia, products:products, brand:xBrand}); 
    }).catch(function (errorProducts){
		logger.error("Error on getProducts: ", errorProducts);
		return errorProducts;
	})
}

self.presentationLetterEmailSubmit = (req, res) => {
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	
    res.render('admin/letter-mail-post', {config: config, brand:xBrand});
}


self.getMessages = (req, res) => { 	
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	services.getMessages().then(function(messages){
		res.render('admin/messages', {config: config, messages:messages, device:res.locals.device, brand:xBrand}); 
	}).catch(function (errorGetMessages){
		logger.error("Error on getMessages: ", errorGetMessages);
		return errorGetMessages;
	})				
};

self.getListPrice = (req, res) => { 	
	if(!checkLogin(req, res)){
		console.log("LOGIN FALLO");
		return res.redirect('/admin/login');
	}
	let vigencia = Utils.getValidity();
	services.getProducts().then(function(products){
    	res.render('admin/list_price', {config: config, vigencia: vigencia, products:products, brand:xBrand}); 
    }).catch(function (errorgetListPrice){
		logger.error("Error on getListPrice: ", errorgetListPrice);
		return errorgetListPrice;
	})			
};

function validateUser(req, res) {
  if (req.body.user == config.admin.user && req.body.pass == config.admin.pass) {
    let setCookie = sha(
      config.admin.user + config.admin.hash + config.admin.pass
    );
    res.clearCookie("app-error");
    res.cookie("app_admin", setCookie);
    return true;
  } else {
    return false;
  }
}

function checkLogin(req, res) {
  let originalUser = sha(
    config.admin.user + config.admin.hash + config.admin.pass
  );
  if (originalUser == req.cookies["app_admin"]) {
    logger.info("Login Success");
    return true;
  } else {
  	logger.error("Login Error");
  	return false;
  }
}

function generateSalableId(){
	var a = new Date();
	return a.getFullYear() +""+ a.getMonth() +""+ a.getDate() +""+ a.getHours() +""+ a.getMinutes() +""+ a.getSeconds();
}

function getImageId(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

module.exports = self;
