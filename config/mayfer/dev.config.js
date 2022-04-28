"use strict";

let self      = {};
var base_url  = process.env.APP_BASE_URL || 'http://localhost:5000';

self.config = {
	// mongo_uri_connect : 'mongodb://localhost:27017/mayfer',
	mongo_uri_connect : 'mongodb+srv://user_leandro:lalalapapito@clusterdata.mz8da.mongodb.net/heroku_jhg1mkfp?retryWrites=true&w=majority',
	metas: {
		title : "Muebleria Mayfer",
		color : "#303233",
		url_site: base_url+"/",
		og_image: base_url+"/statics/brands/mayfer/images/logomayfer.png"
	},
	sitePathCom : base_url,
	sitePathComAr : base_url,
	sitePath : base_url,
	adminPath : base_url+"/admin",
	sourcePath : base_url+"/statics",
	cartPath : base_url+"/carrito",
	billingPath : base_url+"/facturacion",
	paymentPath : base_url+"/pago",
	thanksPath : base_url+"/gracias",
	financialPath : base_url+"/mercadopago",
	link_pago : base_url+"/pago",
	api_path : base_url+"/api/",	
	env : "dev",
	admin: {
		user : "admin",
		pass : "password01@",
		hash : "rdfghrtfghiujnhbgvf",
	},
	banner_home:{
		categoria_a: "Livings",
		categoria_b: "Comedor",
		categoria_c: "Organizadores",
		categoria_d: "Habitaciones",
		categoria_e: "Sillones",
		categoria_f: "Hogar"
	},
	top_leyend : {
		description: "Av. San Martin 2250, Caseros. CP: C1678BF - Buenos Aires. Tel: (011) 4716-0399 | 2197-1514"
	},
	contact_data : {
		title : "SHOWROOM CASEROS I",
		leyend: "Av. San Martin 2250, Caseros. CP: C1678BF - Buenos Aires. Tel: (011) 4716-0399 | 2197-1514 Horarios de atención: Lunes a Sabados de 09:00 a 20:00 hs. (Feriados consultar)",
		location : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0501455551357!2d-58.563911684329355!3d-34.60289346496241!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb8244179de21%3A0x767a0caaa9ff3f73!2sMayfer+Amoblamientos+%26+Deco!5e0!3m2!1ses!2sar!4v1558176968032!5m2!1ses!2sar",
		newStore : {
			title : "SHOWROOM CASEROS II",
			leyend: "Tres de febrero 2802, Caseros. CP: C1678BF - Buenos Aires. Tel: (011) 7711-7003 | 2197-1514 Horarios de atención: Lunes a Sabados de 09:00 a 13:00 hs. y de 15:30 a 19:30 hs. (Feriados consultar)",
			location : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.8505013357653!2d-58.56620108477014!3d-34.60794168045849!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xadfb56e3df3cb9f5!2sMayfer%20Amoblamientos%20%26%20Deco%20II!5e0!3m2!1sen!2sar!4v1604409266406!5m2!1sen!2sar"
		}
	},
	links : {
		home : "/home",
		products : "/productos",
		contact : "/contacto",
		store : "/sucursales",
		payments : "/medios-de-pago",
		shipping : "/envios",
		customers : "/atencion-al-cliente",
		description_brand : "/nosotros"
	},
	social : {
		facebook : "https://es-la.facebook.com/mayfermuebles/",
		pinterest : "",
		instagram : "https://www.instagram.com/mayferamoblamientos/"
	},
	mercadopago: {
		percentage : 30,
		client_id : 5415001581584290,
		client_secret : "Hi5MUBot4RucXcA1CuTlwIQJG1rUW17i",
		public_key : "TEST-bd542f44-f0b1-4f73-9cd2-ef37e8f85a42",
		access_token : "TEST-5415001581584290-051013-266a91e841c439c74e75245cc5456fba-69284914",
		titleShopping : "Tu compra en Mayfer",
		currency : "ARS",
		callbacks :{
			success : base_url+"/pago/success",
			pending : base_url+"/pago/pending",
			failure : base_url+"/pago/failure"
		},
		disabled_payment_methods : [{"id": "ticket"}, {"id": "atm"}, {"id": "digital_currency"}, {"id": "debit_card"}]
	},
	qr_afip:{
		link: "http://qr.afip.gob.ar/?qr=1Kk2wCwMg9FesDxF1xwxGg,,",
		target: "_F960AFIPInfo",
		image: "http://www.afip.gob.ar/images/f960/DATAWEB.jpg"
	},
	push_notifications: {
		publicVapidKey : "BFF43CpTYGvq5UkCKlSEHWGVxRP0BozrJRKaHui0mK8IGcIxS8E9b6DZ_hiMgvIwpMh_OA-e_USF7o4cyPnjU3A",
		privateVapidKey : "wLsu9lhhWe9NqsZ2txG4WzGCmzbLXLkLzO_w-iJI7Xs"
	},
	recaptcha:{
		public: "6Ldo-JAUAAAAAP5PZy5rM7zObngGgW_OpAe4mXax"
	},
	analitycs:{
		analitycsCode : "UA-9906158-14"
	},
	newrelic: "f6a67f25e5394e3a2f6516335fac0fd1afa68344",
	cloudinary: {
	  cloud_name: 'htjuqerw2',
	  api_key: '429387437128966',
	  api_secret: 'xEpG9FTaNrtCmTiFqLryxezGUQ4',
	  imagen_no_disponible : "https://res.cloudinary.com/htjuqerw2/image/upload/v1564411379/imagen_no_disponible_k2rin7.png"
	}
};

module.exports = self;