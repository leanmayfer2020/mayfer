"use strict"

const logger      = require('../utils/logger');
const config      = require('../config/config');
const moment      = require('moment');
const services    = require('../services/service');
const sha         = require("sha1");
const Utils       = require('../utils/utils');
const self        = {};
const Brand       = process.env.APP_BRAND.toLowerCase();
var   multer      = require('multer')({dest: 'public/uploads'})




self.index = (req, res) => { 
	services.getProducts().then(function(products){
		for(var i = 0; i< products.length; i++){
			products[i].revenue = (products[i].price * 33/100);
			products[i].salable_counter = "salable_counter_"+products[i]._id;
		}
		res.render("orders/add_orders", { config: config, products:products, quantity: products.length, device:res.locals.device, brand:Brand}); 
    }).catch(function (errorProducts){
		logger.error("Error on getProducts: ", errorProducts);
		return errorProducts;
	})
	
};

self.saveOrder = (req, res) => { 
	let data = {
		customer : req.body.customer,
		address : req.body.address,
		cellphone : req.body.cellphone,
		email : req.body.email,
		comments : req.body.comments,
		total : req.body.order_total
	}
	let objProducts = [];

	services.getProducts().then(function(products){
		for(var i = 0; i< products.length; i++){
			let salable_counter = "salable_counter_" + products[i]._id;
			let product_name = products[i].description;
			objProducts.push({ "product_name" : product_name , "quantity": req.body[salable_counter] } );
		}
		
		services.saveOrder(data, objProducts).then(function(response){
			console.log(response);
			res.render("orders/add_orders_success", { config: config, device:res.locals.device, brand:Brand}); 
		}).catch(function(errorOrder){
			console.log(errorOrder);
		})
    }).catch(function (errorProducts){
		logger.error("Error on getProducts: ", errorProducts);
		res.render("orders/add_orders_error", { config: config, device:res.locals.device, brand:Brand}); 
	})
};

self.list = (req, res) => {
	let total = 0;
	let revenue = 0;
	services.getOrders().then(function(response){
		for(var i=0; i<response.length; i++){
            total += response[i].total;
            response[i].order_number = i+1;
            response[i].order_data = moment(response[i].created).format('DD-MM-YYYY');
        }
        revenue = (total * 33 / 100);
        console.log(response);
		res.render("orders/list_orders", { config: config, revenue:revenue, total:total, orders:response, device:res.locals.device, brand:Brand}); 
	}).catch(function(errorOrder){
		console.log(errorOrder);
	})
};

// function getProductRevenue(product){
// 	let revenue=0;
// 	switch(product){
// 		case "lavandina" : revenue =  42.50; break;
//         case "limpia_piso_arpege" : revenue =  42.50; break;
//         case "limpia_piso_pino" : revenue =  42.50; break;
//         case "limpia_piso_limon" : revenue =  42.50; break;
//         case "limpia_piso_lavanda" : revenue =  42.50; break;
//         case "detergente" : revenue =  90.00; break;
//         case "citronella" : revenue =  90.00; break;
//         case "jabon_liquido" : revenue =  90.00; break;
//         case "multiuso" : revenue =  25.00; break;
//         case "limpiavidrios" : revenue =  27.00; break;
//         case "pastamanos" : revenue =  70.00; break;

// 	}

// 	console.log("revenue", revenue, "product", product);
// 	return revenue;

// }

// function getRevenue(products){
	
// 	let revenue = 0;
// 	let total_revenue = 0;
// 	console.log(products);
// 	let arrProducts = products.split(",");

// 	for(var i=0; i<arrProducts.length; i++){
// 		let product = arrProducts[i].split(":")[0].replace("{", "");
// 		product = product.replace("}", "");

// 		let quantity = arrProducts[i].split(":")[1].replace("}", "");
// 		quantity = quantity.replace("{", "");

// 		revenue = getProductRevenue(product);

// 		total_revenue += (revenue * quantity);
// 		console.log("product", product, "cost", revenue, "quantity", quantity, "revenue", revenue);
// 	}
	
// }

module.exports = self;