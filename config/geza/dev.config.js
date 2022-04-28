"use strict";

let self      = {};
var base_url  = process.env.APP_BASE_URL || 'http://localhost:5000';

console.log("SUCCESS CONFIGURATION!");
self.config = {
	// mongo_uri_connect : 'mongodb://localhost:27017/ecommerce',
	mongo_uri_connect : 'mongodb+srv://user_lean:lalalapapito@cluster0.7plcz.mongodb.net/geza?retryWrites=true&w=majority',
	metas: {
		title : "Geza.com.ar - Innovación en Limpieza",
		color : "##7cb449",
		url_site: base_url+"/",
		og_image: base_url+"/statics/brands/geza/images/logos/logo_350.jpg"
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
		categoria_a: "Pisos",
		categoria_b: "Piletas",
		categoria_c: "Cocinas",
		categoria_d: "Jardín & Insectos",
		categoria_e: "Ropa",
		categoria_f: "Hogar"
	},
	top_leyend : {
		description : "Pedidos al 115-888-8423"
	},
	contact_data : {
		title : "CONTACTANOS",
		leyend: "Envianos un mensaje y te responderemos a la brevedad.",
		location : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3287.1292277496163!2d-58.51509078444549!3d-34.52495378047987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb0d9e80d6507%3A0x2acec73f9dc93c36!2sGdor.+Ugarte+3636%2C+B1605EJO+Vicente+L%C3%B3pez%2C+Autonome+stad+Buenos+Aires!5e0!3m2!1ses!2sar!4v1551985568912"
	},
	links : {
		home : "/home",
		products : "/productos",
		contact : "/contacto",
		payments : "/medios-de-pago",
		shipping : "/envios",
		customers : "/atencion-al-cliente",
		description_brand : "/nosotros"
	},
	social : {
		facebook : "https://facebook.com",
		pinterest : "https://pinterest.com",
		instagram : "https://instagram.com"
	},
	mercadopago: {
		percentage : 15,
		client_id : 2880,
		client_secret : "lKveSB1TZNXsAO7mHX5fstQV3P1I7pXe",
		public_key : "TEST-bbad8d37-fe1c-42b6-a32a-86a56d8b81e1",
		access_token : "APP_USR-2880-050116-cf5947dd320bfaa4396556fe4de9d1ff-99922095",
		titleShopping : "Tu compra en Geza",
		currency : "ARS",
		callbacks :{
			success : base_url+"/pago/success",
			pending : base_url+"/pago/pending",
			failure : base_url+"/pago/failure"
		},
		disabled_payment_methods : [{"id": "ticket"}, {"id": "atm"}, {"id": "digital_currency"}, {"id": "debit_card"}]
	},
	qr_afip:{
		link: "http://qr.afip.gob.ar/?qr=_olbBUYTiN6fhBUQrEdnQg,,",
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
		analitycsCode : "UA-136117825-1"
	},
	newrelic: "f87a44502e9db0358183d4314bdecedb39ddef3e",
	cloudinary: {
	  cloud_name: 'hn66vemno',
	  api_key: '155966938247694',
	  api_secret: '5dxoRf2FB-uRc9ccXJaGksU5prQ',
	  imagen_no_disponible : "https://res.cloudinary.com/hn66vemno/image/upload/v1564410683/imagen_no_disponible_ivztdj.png"
	}
};

module.exports = self;