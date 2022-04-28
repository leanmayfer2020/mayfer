"use strict"

const logger      = require('../utils/logger');
const config      = require('../config/config');
const moment      = require('moment');
const services    = require('../services/service');
const sha         = require("sha1");
const Utils       = require('../utils/utils');
const nodemailer   = require('nodemailer');
const hbsUtils    = require('hbs');
const fs          = require('fs');
const self        = {};
const xBrand       = process.env.APP_BRAND.toLowerCase();
var   multer      = require('multer')({dest: 'public/uploads'})


const gmailAccountUserOne   = process.env.APP_GMAIL_USER_ONE || "";
const gmailAccountPassOne   = process.env.APP_GMAIL_PASS_ONE || "";

self.index = (req, res) => { 
	
	if(xBrand == "geza"){
		let arrContacts = ["155-888-8423"];
		let customerEmail;
		let hbsTemplate = 'views/admin/letter-mail.hbs';

		services.getEmailFromCampaign().then(function(potential_customer){
			console.log("potential_customer", potential_customer[0]);

			var transporter = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: gmailAccountUserOne,
					pass: gmailAccountPassOne
				}
			});

			

			if(typeof potential_customer[0] != "undefined"){
				customerEmail = potential_customer[0].email;	
				console.log("customerEmail", customerEmail);

				services.getProducts().then(function(products){
					var template = hbsUtils.compile(fs.readFileSync(hbsTemplate, 'utf8'));
			    	var context = {config: config, products:products, brand:xBrand, customer:potential_customer[0].customer, contacts:arrContacts};
					var htmlEmail    = template(context);
					
					var mailOptions = {
						from: 'GeZa <no-reply@gmail.com>',
						to: customerEmail,
						subject: "Carta de Presentación",
						html: htmlEmail
					};

					transporter.sendMail(mailOptions, function(error, info){
						if (error){
					    	console.log("Error on potential_customer sendMail transporter.sendMail", error);
					        // res.send(500, error.message);
					    } else {
					        // SENT MAIL SUCCESS
					        services.setEmailStatusFromCampaign(potential_customer[0]._id).then(function(potential_customer_updated){
								console.log("potential_customer email sent", potential_customer_updated);
								// res.status(200);
						    }).catch(function (errorProducts){
								logger.error("Error on potential_customer sendMail: ", errorProducts);
								return errorProducts;
							})
					    }
					});
				}).catch(function (errorProducts){
					logger.error("Error on getProducts: ", errorProducts);
					return errorProducts;
				})
			}else{
				console.log("Petencial Customer Not Found");
			}
			

	    }).catch(function (errorgetEmailFromCampaign){
			logger.error("Error on getEmailFromCampaign: ", errorgetEmailFromCampaign);
			return errorgetEmailFromCampaign;
		})
	}
};


module.exports = self;