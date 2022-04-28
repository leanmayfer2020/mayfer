"use strict";

const    Q    = require('q'),
httpClient    = require('../utils/http_client'),
logger        = require('../utils/logger'),
config        = require('../config/config'),
mongoose      = require('mongoose'),
Product       = require('../models/product.model'),
Category      = require('../models/category.model'),
Message       = require('../models/message.model'),
Delivery       = require('../models/delivery.model'),
Campana       = require('../models/campanas.model'),
Cart          = require('../models/cart.model'),
Order          = require('../models/order.model'),
Email         = require('../models/email.model'),
Banner         = require('../models/banner.model'),
ObjectId      = require('mongoose').Types.ObjectId,
Utils         = require('../utils/utils'),
NodeCache     = require('node-cache'),
myCache       = new NodeCache(),
self          = {};
const xBrand   = process.env.APP_BRAND.toLowerCase();
const recaptchaPrivate   = process.env.APP_RECAPTCHA;


self.addBanner = (banner, mobile) => {
    let deferred = Q.defer();
    var MyBanner = new Banner({'banner':banner, 'mobile':mobile});
    MyBanner.save(function (err, results) {
        if (err){
            console.log("Error on add Banner: ", err);
            deferred.reject(err);
        }else{
            console.log("Add Banner success: ", results);
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

self.removeBanner = (banner_id) => { 
    let deferred = Q.defer();
    let query = { '_id': new ObjectId(banner_id) }; 

    Banner.remove(query,function (err, results) {
        if (err){
            console.log("Error on remove Banner: ", err);
            deferred.reject(err);
        }else{
            console.log("remove Banner success: ", results);
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

self.getBanners = (banner_id) => {
    let deferred = Q.defer();
    let response;


    let query = {};
    if(banner_id!=null){ 
        query = { '_id': new ObjectId(banner_id) }; 
    }
    
    Banner.find(query, function (err, banner) {
        if (err){
            deferred.reject(err);
        }else{
            if(banner_id!=null){ 
                response = banner[0]; 
            }else{ 
               response = banner; 
            }
            deferred.resolve(response);
        }
    });

    return deferred.promise;
};

self.addSubscription = (email) => {
    let deferred = Q.defer();
    var Mail = new Email({'email':email});
    Mail.save(function (err, results) {
        if (err){
            console.log("Error on add email: ", err);
            deferred.reject(err);
        }else{
            console.log("Add email success: ", results);
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

self.validateRecaptcha = (owner) => {
    let options = {};
    options.headers = {'Content-Type':'application/json'};
    options.timeout = 1000;

    var private_key = recaptchaPrivate;
    var url = "https://www.google.com/recaptcha/api/siteverify?secret="+private_key+"&response="+owner;
    var result = httpClient.post(url , options);
    return result;
};

self.addMessage = (data) => {
    let deferred = Q.defer();
    var MessageData = new Message({
        'full_name':data.full_name,
        'phone':data.phone,
        'email':data.email,
        'message':data.message
    });

    MessageData.save(function (err, results) {
        if (err){
            console.log("Error on add message: ", err);
            deferred.reject(err);
        }else{
            console.log("Add message success: ", results);
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

self.getProduct = (salable_id) => {

    let deferred = Q.defer();

    
    Product.find({'salable_id': salable_id}, function (err, product) {
        if (err){
            console.log("services getProduct error", err);
            deferred.reject(err);
        }else{
            console.log("services getProduct success ", product[0]);
            deferred.resolve(product[0]);
        }
    })

    return deferred.promise;
};

self.getProductById = (product_id) => {

    let deferred = Q.defer();

    
    Product.find({'_id': new ObjectId(product_id)}, function (err, product) {
        if (err){
            console.log("services getProduct error", err);
            deferred.reject(err);
        }else{
            console.log("services getProduct success ", product[0]);
            deferred.resolve(product[0]);
        }
    })

    return deferred.promise;
};

self.getCartProducts = (array_salable_id) => {
    let deferred = Q.defer();
            
    let productsProjection = { 
        __v: false,
        _id: false,
        summary: false,
        product_tags: false,
        enabled_for_sale: false
    };

    Product.find({'salable_id': { $in : array_salable_id}}, productsProjection, function (err, products) {
        if (err){
            deferred.reject(err);
        }else{
            for(var i=0; i<products.length; i++){
                delete products[i].product_tags;
                delete products[i].summary;
                delete products[i].images;
            }
            deferred.resolve(products);
        }
    })
    return deferred.promise;
};

self.buildCart = (cart_id) => {
    let deferred = Q.defer();
    let temp_products = [];
    let new_products = [];
    self.getCart(cart_id).then(function(cart){
        if(typeof cart.products != "undefined" && cart.products.length >= 1){
            for(var i=0; i<cart.products.length; i++){
                temp_products.push(cart.products[i].salable_id);
            }
        }
        
        self.getCartProducts(temp_products).then(function(products){
            console.log("buildCart getCartProducts Success: ", products);
            if(typeof cart.products[0] != "undefined"){
                for(var i=0; i<products.length; i++){

                    if(typeof cart.products[i] != "undefined"){

                        let new_product = {
                            "category_name":products[i].category_name,
                            "description":products[i].description,
                            "model":products[i].model,
                            "quantity":cart.products[i].quantity,
                            "main_image":products[i].images[0].url,
                            "salable_id":products[i].salable_id,
                            "discount":products[i].discount,
                            "price":products[i].price,
                            "web_price":products[i].web_price,
                            "brand":products[i].brand,
                            "category_id":products[i].category_id,
                            "measures":products[i].measures

                        }
                        new_products.push(new_product);
                    }
                }
            }

            cart.products = new_products;
            deferred.resolve(cart);
        }).catch(function(errorProducts){
            console.log("buildCart getCartProducts Error: ", errorProducts);
            deferred.reject(errorProducts);
        })
    }).catch(function(errorCart){
        console.log("Error on getCart", errorCart);
        deferred.reject(errorCart);
    })
    return deferred.promise;
};

self.getDeliveries = (delivery_id=null) => {
    let deliveries;
     
    let deferred = Q.defer();
    let response;

    let query = {};
    if(delivery_id!=null){ 
        query = { '_id': new ObjectId(delivery_id) }; 
    }
    
        Delivery.find(query, function (err, delivery) {
            if (err){
                deferred.reject(err);
            }else{
                if(delivery_id!=null){ response = delivery[0]; }else{ response = delivery; }
                deferred.resolve(response);
            }
        })
    
    return deferred.promise;
};

self.saveDelivery = (city, cost) => { 
    let deferred = Q.defer();
    var delivery = new Delivery({'city':city, 'cost': cost});
    delivery.save(function (err, results) {
        if (err){
            console.log("Error on add delivery: ", err);
            deferred.reject(err);
        }else{
            console.log("Add delivery success: ", results);
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

self.removeDelivery = (delivery_id) => { 
    let deferred = Q.defer();
    let query = { '_id': new ObjectId(delivery_id) }; 

    Delivery.remove(query,function (err, results) {
        if (err){
            console.log("Error on remove delivery: ", err);
            deferred.reject(err);
        }else{
            console.log("remove delivery success: ", results);
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

self.getCategories = (category_id=null) => {
    
    let deferred = Q.defer();
    let response;


    let query = {};
    if(category_id!=null){ 
        query = { '_id': new ObjectId(category_id) }; 
    }
    
    Category.find(query, function (err, category) {
        if (err){
            deferred.reject(err);
        }else{
            for(var i=0; i<category.length; i++){
                category[i].category_seo = Utils.getSeoUrl(category[i].category);
            }
            if(category_id!=null){ 
                response = category[0]; 
            }else{ 
               response = category; 
            }
            deferred.resolve(response);
        }
    });

    return deferred.promise;
};

self.getPurchases = (cart_id=null) => {
    
    let query = {};
    
    if(cart_id!=null){ 
        query = { '_id': new ObjectId(cart_id) }; 
    }
    

    let deferred = Q.defer();
    Cart.find(query, function (err, cart) {
        if (err){
            deferred.reject(err);
        }else{
            if(cart_id!=null){ 
                deferred.resolve(cart[0]);
            }else{
                deferred.resolve(cart);
            }
        }
    })
    return deferred.promise;
};

self.getMessages = () => {
    
    let query = {};

    let deferred = Q.defer();
    Message.find(query, function (err, messages) {
        if (err){
            deferred.reject(err);
        }else{
            deferred.resolve(messages);
        }
    })
    return deferred.promise;
};

self.getPurchasesWithStatus = (status=null) => {
    
    let query = {};
    
    if(status!=null){ 
        query = { 'status': status }; 
    }
    

    let deferred = Q.defer();
    Cart.find(query, function (err, cart) {
        if (err){
            deferred.reject(err);
        }else{
            deferred.resolve(cart);
        }
    })
    return deferred.promise;
};

self.searchProduct = (q) => {
    let deferred = Q.defer();
    Product.find({'description': new RegExp(q, 'i')}, function (err, product) {
        if (err){
            console.log("searchProduct error ", err);
            deferred.reject(err);
        }else{
            console.log("searchProduct success ", product);

            for(var i=0; i<product.length; i++){
                product[i].seo_link = Utils.getSeoUrl(product[i].description);
            }
            deferred.resolve(product);
        }
    })
    return deferred.promise;
};

self.getProducts = (categoryId=null, sort_by=null) => {

    console.log("SORT", sort_by);
    console.log("categoryId", categoryId);
    let response;

    let deferred = Q.defer();
    let query = {};
    let sort = {};


    if(sort_by!=null){ 
        sort = { 'sort': sort_by }; 
    }
    
    if(categoryId!=null){ 
        query = { 'category_id': categoryId }; 
    }
    
    let productsProjection = { 
        __v: false
    };

	Product.find(query, productsProjection, sort, function (err, results) {
        if (err){
        	console.log("Error on get products: ", err);
        	deferred.reject(err);
        }else{
            console.log("getProducts success: ", results.length);

            for(var i=0; i<results.length; i++){
                results[i].seo_link = Utils.getSeoUrl(results[i].description);
            }
            
            deferred.resolve(results);
        }
	});

    return deferred.promise;
};

self.createCart = (product=null) => {
    let deferred = Q.defer();
    let cart;
    
    if(product==null){
        cart = new Cart({
                "total_price": 0,
                "status" : "OPEN"
            });
    }else{
        cart = new Cart({
                "products": {
                    "salable_id": product.salable_id,
                    "quantity": 1, 
                    "price": product.web_price, 
                    "measures": product.measures
                },
                "total_price": product.web_price,
                "status" : "OPEN"
            });
    }
    cart.save(function (err, results) {
        if (err){
            console.log("Error on create a new cart: ", err);
            deferred.reject(err);
        }else{
            console.log("Created a new cart: ", results._id);
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

self.calculateTotal = (cart_id) => {
    let deferred = Q.defer();
    console.log("calculateTotal:", cart_id);
    Cart.find({'_id': cart_id}, function (errorCart, cart) {
        if (errorCart){
            console.log("calculateTotal getCart Error: ", errorCart);
            deferred.reject(errorCart);
        }else{
            cart = cart[0];
            let total = 0;

            for(var i=0; i<cart.products.length; i++){
                total += cart.products[i].price * cart.products[i].quantity;
            }
            
            Cart.findByIdAndUpdate(new ObjectId(cart_id), {$set: {"total_price": total}}, {new:true}, function (err, results) {
                if (err){
                    console.log("calculateTotal Error: ", err);
                    deferred.reject(err);
                }else{
                    console.log("calculateTotal Success: ", results);
                    deferred.resolve(results);
                }
            });
        }
    });
    return deferred.promise;
};

self.editCategory =  (category_id, category_name, has_delivery) => {     

    let deferred = Q.defer();
    
    Category.findByIdAndUpdate(new ObjectId(category_id), {$set: {"category": category_name, "has_delivery": has_delivery}}, {new:true}, function (err, results) {
        if (err){
            console.log("Edit category_name Error: ", err);
            deferred.reject(err);
        }else{
            console.log("Edit category_name Success: ", results);
            deferred.resolve(results);
        }
    });

    return deferred.promise;
};

self.editProduct =  (product) => {     
    let deferred = Q.defer();
    let options = {upsert: true, new: true, setDefaultsOnInsert: true};
    let updateData = {
        "category_name": product.category_name,
        "description": product.description,
        "summary": product.summary,
        "model": product.model,
        "salable_id": product.salable_id,
        "discount": product.discount,
        "main_image": product.main_image,
        "images": product.images,
        "enabled_for_sale": product.enabled_for_sale,
        "price": product.price,
        "web_price": product.web_price,
        "brand": product.brand,
        "category_id": product.category_id,
        "measures": product.measures
    }

    console.log("updateData", updateData);

    Product.findOneAndUpdate({"_id" : new ObjectId(product._id)}, {$set: updateData}, options, function (errorUpdate, results) {
        if (errorUpdate){
            console.log("Error on update product: ", errorUpdate);
            deferred.reject(errorUpdate);
        }else{
            console.log("update product success", results);
            deferred.resolve(results);
        }
    });

    return deferred.promise;
};

self.addProduct = (product, cart_id=null) => {
    let deferred = Q.defer();
    let updateData = {
            "salable_id": product.salable_id,
            "quantity": 1, 
            "price": product.web_price, 
            "measures": product.measures
        };

    Cart.findByIdAndUpdate(new ObjectId(cart_id), {$push: {products: updateData}}, {new:true}, function (err, results) {
        if (err){
            console.log("Error on findByIdAndUpdate addProduct: ", err);
            deferred.reject(err);
        }else{
            self.calculateTotal(cart_id).then(function(total){
                deferred.resolve(results);
            }).catch(function(errorTotals){
                console.log("Error on calculateTotal: ", errorTotals);
                deferred.reject(errorTotals);
            })
        }
    });
    return deferred.promise;
};

self.handlerProduct = (product, cart_id=null, quantity=null) => {
    
    let deferred = Q.defer();
    let update = false;
    if(quantity == null){ quantity = 1; }
    if(cart_id != null){
        //si tiene carrito hago add o upd
        self.getCart(cart_id).then(function(cart){

            for(var i=0; i<cart.products.length; i++){
                if(product.salable_id == cart.products[i].salable_id){
                    update = true;
                    quantity = quantity;
                }
            }

            if(update){            
                // UPDATE
                self.changeQuantity(product, quantity, cart_id).then(function(cart){
                    console.log("changeQuantity Success ", cart);
                    deferred.resolve(cart);    
                }).catch(function(errorOnchangeQuantity){
                    console.log("changeQuantity Error", errorOnchangeQuantity);
                    deferred.reject(errorOnchangeQuantity);
                })
            }else{
                // ADD
                self.addProduct(product, cart_id).then(function(cart){
                    console.log("addProduct Success ", cart);
                    deferred.resolve(cart);
                }).catch(function(errorOnaddProduct){
                    console.log("errorOnaddProduct", errorOnaddProduct);
                    deferred.reject(errorOnaddProduct);
                })
            }
        }).catch(function(handlerProductgetCart){
            console.log("handlerProductgetCart", handlerProductgetCart);
            deferred.reject(handlerProductgetCart);
        })
    }else{
        // si no tiene carrito creo el carro
        self.createCart(product).then(function(cart){
            console.log("handlerProduct createCart Success ", cart);
            deferred.resolve(cart);
        }).catch(function(errorOnHandlerProductCreateCart){
            console.log("handlerProduct createCart Error", errorOnHandlerProductCreateCart);
            deferred.reject(errorOnHandlerProductCreateCart);
        })            
    }
    return deferred.promise;
};

self.changeQuantity = (product, quantity, cart_id) => {
    let deferred = Q.defer();

    let updateData = {"products.$.quantity" : quantity}; //, "products.$.price" : (product.price * quantity)};

    let query = {"_id" : new ObjectId(cart_id), "products.salable_id" : product.salable_id};

    Cart.findOneAndUpdate(query, {$set: updateData}, {multi:true}, function (err, results) {
        if (err){
            console.log("changeQuantity findOneAndUpdate Error: ", err);
            deferred.reject(err);
        }else{
            console.log("changeQuantity findOneAndUpdate Success: ", results);
            self.calculateTotal(cart_id).then(function(total){
                console.log("calculateTotal Success: ", total);
                deferred.resolve(results);
            }).catch(function(errorTotals){
                console.log("Error on calculateTotal: ", errorTotals);
                deferred.reject(errorTotals);
            })
        }
    });
    return deferred.promise;
};

self.removeProduct = (product_id, cart_id) => {
    let deferred = Q.defer();
    let position = 0;
    self.getCart(cart_id).then(function(cart){

        for(var i=0; i<cart.products.length; i++){
            if(cart.products[i].salable_id == product_id){
                position = i;
            }
        }
        console.log('position', position);

        console.log('cart status1', cart.products);
        cart.products.splice(position, 1);
        console.log('cart status2', cart.products);

        let updateData = {"products" : cart.products};
        let query = {"_id" : new ObjectId(cart_id)};
        Cart.findOneAndUpdate(query, {$set: updateData}, {multi:true}, function (err, results) {
            if (err){
                console.log("removeProduct findOneAndUpdate Error: ", err);
                deferred.reject(err);
            }else{
                console.log("removeProduct findOneAndUpdate Success: ", results);
                self.calculateTotal(cart_id).then(function(total){
                    console.log("calculateTotal Success: ", total);
                    deferred.resolve(results);
                }).catch(function(errorTotals){
                    console.log("Error on calculateTotal: ", errorTotals);
                    deferred.reject(errorTotals);
                })
            }
        });
    }).catch(function(errorCart){
        console.log("Error on removeProduct getCart: ", errorCart);
        deferred.reject(errorCart);
    })
    console.log("FIN REMOVE");
    return deferred.promise;
};

self.getCart = (cart_id) => {
    let deferred = Q.defer();
    console.log("getCart request:", cart_id);
    if(cart_id == null || typeof cart_id == "undefined" || cart_id == undefined){
        console.log("getCart request => go to createCart");
        self.createCart().then(function(cart){
            console.log("getCart request success :", cart);
            deferred.resolve(cart);
        }).catch(function(errorCreateCart){
            console.log("getCart request error :", errorCreateCart);
            deferred.reject(errorCreateCart);
        });
    }else{
        Cart.find({'_id': new ObjectId(cart_id)}, function (errorCart, cart) {
            if (errorCart){
                console.log("getCart error: ", errorCart);
                deferred.reject(errorCart);
            }else{
                console.log("getCart success: ", cart[0]._id);
                deferred.resolve(cart[0]);
            }
        });
    }
    return deferred.promise;
};

self.updateCart = (params) => {
    let deferred = Q.defer();

    self.getCart(params.cart_id).then(function(mongoCart){
        
        let updateData = {
            "created": mongoCart.created, 
            "salable_id": mongoCart.salable_id,
            "quantity": mongoCart.quantity, 
            "price": mongoCart.price, 
            "last_update": params.last_update, 
            "subtotal_price": mongoCart.subtotal_price, 
            "total_price": mongoCart.total_price,
            "first_name": params.name,
            "last_name": params.surname,
            "email": params.email,
            "phone": params.phone,
            "gender": params.gender,
            "document_type": params.document_type,
            "document_number": params.document_number,
            "street_name": params.street_name,
            "street_number": params.street_number,
            "floor": params.floor,
            "room": params.room,
            "city": params.city,
            "zip_code": params.zip_code,
            "shipping_price": 43,
            "payment_status": "Ingresada"
        };

        Cart.findByIdAndUpdate(new ObjectId(params.cart_id), {$set: updateData}, {new:true}, function (errorUpdate, results) {
            if (errorUpdate){
                console.log("Error on update full cart: ", errorUpdate);
                deferred.reject(errorUpdate);
            }else{
                console.log("RESULT", results);
                deferred.resolve(results);
            }
        });
    }).catch(function (errorGetCart){
        console.log("Error on errorGetCart: ", errorGetCart);
        deferred.reject(errorGetCart);
    })
    
    return deferred.promise;
};

self.preferencesPayment = (cart) => {

	let preferences = {
        "items": [
            {
                "title": config.mercadopago.title,
                "quantity": cart.quantity,
                "currency_id": "ARS",
                "unit_price": cart.price
            }
        ],
        "payer": {
            "name": cart.first_name,
            "surname": cart.last_name,
            "email": cart.email,
            "phone": {
                "area_code": "",
                "number": cart.phone
            },
            "identification": {
                "type": cart.document_type,
                "number": cart.document_number
            },
            "address": {
                "street_name": cart.street_name,
                "street_number": cart.street_number,
                "zip_code": cart.zip_code
            }
        },
        "payment_methods": {
            "excluded_payment_types": [
                {
                    "id": "ticket"
                },
                {
                    "id": "atm"
                },
                {
                    "id": "digital_currency"
                },
                {
                    "id": "debit_card"
                }
            ]
        },
        "shipments": {
            "receiver_address": {
                "zip_code": cart.zip_code,
                "street_number": cart.street_number,
                "street_name": cart.street_name,
                "floor": "",
                "apartment": ""
            }
        },
        "back_urls": {
            "success": config.mercadopago.callbacks.success,
            "pending": config.mercadopago.callbacks.pending,
            "failure": config.mercadopago.callbacks.failure
        },
        "auto_return": "all",
        "external_reference": cart._id
    }
};

self.getMercadoPagoData = () => {
    
    var key = "444a9ef5-8a6b-429f-abdf-587639155d88";
    var url = "https://api.mercadopago.com/v1/payment_methods/deals?public_key="+key;

    console.log('Calling mercadopago: ' + url);
    
    return httpClient.get(url);
};

self.getMercadoPagoDetails = (paymentId) => {
    
    var url = "https://www.mercadopago.com.ar/cuotas/"+paymentId+"?ajax=true";
    
    console.log('Calling mercadopago: ' + url);
    
    return httpClient.get(url);
};

self.changeCartData = (cart_id, cartData) => {
    let deferred = Q.defer();
    let query = {"_id" : new ObjectId(cart_id)};

    let updateData = {
        "delivery_type": cartData.delivery_type,
        "delivery_cost": cartData.delivery_cost,
        "delivery_street_name": cartData.delivery_street_name,
        "delivery_street_number": cartData.delivery_street_number,
        "delivery_floor": cartData.delivery_floor,
        "delivery_room": cartData.delivery_room,
        "delivery_zip_code": cartData.delivery_zip_code,
        "delivery_city": cartData.delivery_city,
        "billing_name": cartData.billing_name,
        "billing_lastname": cartData.billing_lastname,
        "billing_email": cartData.billing_email,
        "billing_phone": cartData.billing_phone,
        "billing_gender": cartData.billing_gender,
        "billing_type_document": cartData.billing_type_document,
        "billing_document_number": cartData.billing_document_number,
        "status":"MERCADOPAGO"
    };

    Cart.findOneAndUpdate(query, {$set: updateData}, {multi:true}, function (err, results) {
        if (err){
            console.log("changeCartData findOneAndUpdate Error: ", err);
            deferred.reject(err);
        }else{
            console.log("changeCartData findOneAndUpdate Success: ", results);
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

self.changePaymentData = (cart_id, statusPayment) => {
    let deferred = Q.defer();

    let query = {"_id" : new ObjectId(cart_id)};

    let updateData = {
        "status":statusPayment
    };

    Cart.findOneAndUpdate(query, {$set: updateData}, {multi:true}, function (err, results) {
        if (err){
            console.log("changeCartData findOneAndUpdate Error: ", err);
            deferred.reject(err);
        }else{
            console.log("changeCartData findOneAndUpdate Success: ", results);
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

self.duplicateCart = (oldCart) => {
    let deferred = Q.defer();
    let cartObject;
    let temp_products;
    let array_products = [];
    let cartForDuplicate = oldCart;

    for(var i=0; i<oldCart.products.length; i++){
        temp_products = {
            "salable_id": oldCart.products[i].salable_id,
            "quantity": 1, 
            "price": oldCart.products[i].price, 
        }
        array_products.push(temp_products);
    }

    cartForDuplicate = new Cart({
                "products": array_products,
                "total_price": oldCart.price,
                "status" : "OPEN",
                "billing_document_number": oldCart.billing_document_number,
                "billing_email": oldCart.billing_email,
                "billing_gender": oldCart.billing_gender,
                "billing_lastname": oldCart.billing_lastname,
                "billing_name": oldCart.billing_name,
                "billing_phone": oldCart.billing_phone,
                "billing_type_document": oldCart.billing_type_document,
                "delivery_city": oldCart.delivery_city,
                "delivery_cost": oldCart.delivery_cost,
                "delivery_floor": oldCart.delivery_floor,
                "delivery_room": oldCart.delivery_room,
                "delivery_street_name": oldCart.delivery_street_name,
                "delivery_street_number": oldCart.delivery_street_number,
                "delivery_zip_code": oldCart.delivery_zip_code
            });


    console.log("cartForDuplicatecartForDuplicate ", cartForDuplicate);
    cartObject = new Cart({cartForDuplicate});

    cartObject.save(function (err, results) {
        if (err){
            console.log("Error on create a new cart: ", err);
            deferred.reject(err);
        }else{
            console.log("Created a new cart: ", results._id);
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

self.getProductsBySort = (sort_by) => {
    let deferred = Q.defer();
    let query = {};
    let productsProjection = { 
        __v: false,
        _id: false,
        images: false,
        summary: false,
        product_tags: false,
        enabled_for_sale: false
    };

    console.log("SORTED BY ", sort_by);
    Product.find(query, productsProjection, {sort:sort_by}, function (err, results) {
        if (err){
            console.log("Error on get products: ", err);
            deferred.reject(err);
        }else{
            console.log("getProducts success: ", results.length());
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

self.saveCategory = (category_name, has_delivery) => { 
    let deferred = Q.defer();
    var category = new Category({'category':category_name, "has_delivery":has_delivery});
    category.save(function (err, results) {
        if (err){
            console.log("Error on add category: ", err);
            deferred.reject(err);
        }else{
            console.log("Add category success: ", results);
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

self.removeProduct = (product_id) => { 
    let deferred = Q.defer();
    let query = { '_id': new ObjectId(product_id) }; 

    Product.deleteOne(query,function (err, results) {
        if (err){
            console.log("Error on remove product: ", err);
            deferred.reject(err);
        }else{
            console.log("remove product success: ", results);
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

self.removeCategory = (category_id) => { 
    let deferred = Q.defer();
    let query = { '_id': new ObjectId(category_id) }; 

    Category.remove(query,function (err, results) {
        if (err){
            console.log("Error on remove category: ", err);
            deferred.reject(err);
        }else{
            console.log("remove category success: ", results);
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

self.editDelivery =  (delivery_id, delivery_city, delivery_cost) => {     

    let deferred = Q.defer();
    
    Delivery.findByIdAndUpdate(new ObjectId(delivery_id), {$set: {"city": delivery_city}, "cost": delivery_cost}, {new:true}, function (err, results) {
        if (err){
            console.log("Edit delivery Error: ", err);
            deferred.reject(err);
        }else{
            console.log("Edit delivery Success: ", results);
            deferred.resolve(results);
        }
    });

    return deferred.promise;
};

self.saveProduct = (data) => {

    return self.handlerAdminProduct(data).then(function(data){
        console.log("handlerAdminProduct Success: ", data);
        return data;
    }).catch(function(error){
        console.log("handlerAdminProduct Error: ", error);
        return error;
    })
};

self.editProductSave = (data) => { 

    return self.handlerAdminProduct(data).then(function(data){
        console.log("handlerAdminProduct Success: ", data);
        return data;
    }).catch(function(error){
        console.log("handlerAdminProduct Error: ", error);
        return error;
    })
};

self.handlerAdminProduct = (data) => {
    var d = new Date();
    let deferred = Q.defer();
    var temp_name = ("0" + d.getDate()).slice(-2) + "" + ("0"+(d.getMonth()+1)).slice(-2) + "" + d.getFullYear() + "" + d.getHours() + "" + d.getMinutes() + "" + d.getSeconds();
    let producto;

    self.getCategories(data.category_id).then(function(category){

        producto = new Product({
            "_id": data._id,
            "category_name": category.category, 
            "description": data.description, 
            "summary": data.summary, 
            "model": data.model,
            "salable_id": data.salable_id,
            "discount": data.discount, 
            "enabled_for_sale": data.enabled_for_sale,
            "price": data.price,
            "web_price": data.web_price,
            "brand": data.brand,
            "category_id": data.category_id,
            "images": [data.attachment1, data.attachment2, data.attachment3],
            "main_image": data.attachment1,
            "measures": data.measures
        });

        self.editProduct(producto).then(function(product){
            deferred.resolve(product);
        }).catch(function (errorProduct){
            logger.error("Error on Edit editProductSave: ", errorProduct);
            deferred.reject(errorProduct);
        })

    }).catch(function(error){
        deferred.reject(error);
    })

    return deferred.promise;
}

self.saveOrder = (data, products) => { 
    let deferred = Q.defer();
    var order = new Order({
        'customer':data.customer, 
        'address': data.address,
        'cellphone' : data.cellphone,
        'email' : data.email,
        'comments': data.comments,
        'products': products,
        'total': data.total,
    });
    order.save(function (err, results) {
        if (err){
            console.log("Error on save order: ", err);
            deferred.reject(err);
        }else{
            console.log("Save order success: ", results);
            deferred.resolve(results);
        }
    });
    return deferred.promise;
};

self.getOrders = () => {

    let deferred = Q.defer();
    let query = {};
    let sort = {};
    let productsProjection = { 
        __v: false
    };

        Order.find(query, productsProjection, sort, function (err, results) {
            if (err){
                console.log("Error on get orders: ", err);
                deferred.reject(err);
            }else{
                console.log("getorders success: ", results.length);
                deferred.resolve(results);
            }
        });

    return deferred.promise;
};

self.getEmailFromCampaign = () => {

    let deferred = Q.defer();

    Campana.find({'status': 'PENDING'}, null, {limit: 1}, function (err, potential_customer) {
        if (err){
            console.log("services getEmailFromCampaign error", err);
            deferred.reject(err);
        }else{
            console.log("services getEmailFromCampaign success ", potential_customer);
            deferred.resolve(potential_customer);
        }
    })

    return deferred.promise;
};

self.setEmailStatusFromCampaign = (potential_id) => {

    let deferred = Q.defer();
    console.log("ID", potential_id);
    Campana.findByIdAndUpdate(new ObjectId(potential_id), {$set: {"status": "SENT"}}, {new:true}, function (err, results) {
        if (err){
            console.log("services setEmailStatusFromCampaign Error: ", err);
            deferred.reject(err);
        }else{
            console.log("services setEmailStatusFromCampaign Success: ", results);
            deferred.resolve(results);
        }
    });

    return deferred.promise;
};

module.exports = self;