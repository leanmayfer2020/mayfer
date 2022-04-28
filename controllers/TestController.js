"use strict"

const logger      = require('../utils/logger');
const http        = require('../utils/http_client');
const config      = require('../config/config');
const services    = require('../services/service');
const Utils       = require('../utils/utils');
const self        = {};
const xBrand       = process.env.APP_BRAND.toLowerCase();



self.test = (req, res) => {
	
	let word = "acdapmpomp";
	let arrWord = word.split("");
	let previousLetter = "";
	let backLetter = "";
	let data = "";
	let arrScore = [];
	let finalScore = 0;

	console.log("1 - Palabra a analizar =>", word);

	arrWord.forEach( (letter, i) => {
		backLetter = word[i+1];
		if(i){
			previousLetter = word[i-1];
			if(previousLetter == backLetter){
				if(data.length){
					data += previousLetter + letter + backLetter;
				}else{
					data = previousLetter + letter + backLetter;
				}
			}else{
				console.log("data", data);
				if(data.length){
					arrScore.push(data.length);
					data = "";
				}
			}
		}else{
			previousLetter = letter;
		}
	})

	console.log("2 - Palindromos encontrados en cadena =>", arrScore);

	arrScore.forEach( (e, i) => {
		if(i){
			finalScore = finalScore * arrScore[i];
		}else{
			finalScore = arrScore[i];
		}
	})

	console.log("3 - Score Final de Palindromos encontrados en cadena =>", finalScore);

	res.send("ok");
};

self.test3 = (req, res) => {

	var a = [1234, 4321];
	var m = [2345, 3214];
	var a1 = a[0].toString().split("");
	var m1 = m[0].toString().split("");

	var a2 = a[1].toString().split("");
	var m2 = m[1].toString().split("");

	var temp = [];

	if(a[0]>m[0]){
		//es mayor, tengo que Decrementar
		for(var i=0; i<a1.length; i++){
			console.log(a1[i], "-", m1[i]);
			temp.push((parseInt(a2[i])-1).toString());
		}
		if(JSON.stringify(m1)==JSON.stringify(temp)){
			console.log("Se hicieron ", i, "movimientos", "A1", JSON.stringify(a1), "TEMP", JSON.stringify(temp), "M1", JSON.stringify(m1));
		}else{
			console.log("2 Tenemos problemas", "A1", JSON.stringify(a1), "TEMP", JSON.stringify(temp), "M1", JSON.stringify(m1));
		}
	}else if(a[0]<m[0]){
		//es menor, tengo que Incrementar
		for(var i=0; i<a1.length; i++){
			console.log(a1[i], "-", m1[i]);
			temp.push((parseInt(a1[i])+1).toString());
		}
		if(JSON.stringify(m1)==JSON.stringify(temp)){
			console.log("Se hicieron ", i, "movimientos", "A1", JSON.stringify(a1), "TEMP", JSON.stringify(temp), "M1", JSON.stringify(m1));
		}else{
			console.log("2 Tenemos problemas", "A1", JSON.stringify(a1), "TEMP", JSON.stringify(temp), "M1", JSON.stringify(m1));
		}
	}else{
		// son iguales
		if(JSON.stringify(a1)==JSON.stringify(m1)){
			console.log("NO Se hicieron movimientos, los arrays son iguales!");
		}
	}


	// segunda parte

	if(a[1]>m[1]){
		//es mayor, tengo que Decrementar
		for(var i=0; i<a2.length; i++){
			console.log(a2[i], "-", m2[i]);
			temp.push((parseInt(a2[i])-1).toString());
		}
		if(JSON.stringify(m2)==JSON.stringify(temp)){
			console.log("Se hicieron ", i, "movimientos", "a2", JSON.stringify(a2), "TEMP", JSON.stringify(temp), "m2", JSON.stringify(m2));
		}else{
			console.log("2 Tenemos problemas", "a2", JSON.stringify(a2), "TEMP", JSON.stringify(temp), "m2", JSON.stringify(m2));
		}
	}else if(a[1]<m[1]){
		//es menor, tengo que Incrementar
		for(var i=0; i<a2.length; i++){
			console.log(a2[i], "-", m2[i]);
			temp.push((parseInt(a2[i])+1).toString());
		}
		if(JSON.stringify(m2)==JSON.stringify(temp)){
			console.log("Se hicieron ", i, "movimientos", "a2", JSON.stringify(a2), "TEMP", JSON.stringify(temp), "m2", JSON.stringify(m2));
		}else{
			console.log("2 Tenemos problemas", "a2", JSON.stringify(a2), "TEMP", JSON.stringify(temp), "m2", JSON.stringify(m2));
		}
	}else{
		// son iguales
		if(JSON.stringify(a2)==JSON.stringify(m2)){
			console.log("NO Se hicieron movimientos, los arrays son iguales!");
		}
	}
};

self.test123ultimo = (req, res) => {

	var a = [2, 1, 1];
	var m = [2, 4, 5];

	var finalMovements = 0;

	for(var q = 0; q<a.length; q++){

		var a1 = a[q].toString().split("").map(Number);
		var m1 = m[q].toString().split("").map(Number);
		var i=0;
		var temp = a1;
		var finded = false;
		var resTemp;		
		var movements=0;
		
		if(a[q] != m[q]){
			while(i<a1.length && finded == false){

				if(a[q]>m[q]){
					temp[i] = a1[i]-1;
				}else{
					temp[i] = a1[i]+1;
				}
				i++;
				movements++;
				resTemp = parseInt(temp.join().replace(/,/g,""));
				
				if(a[q]>m[q]){
					if(resTemp<m[q]){
						finded = true;
					}
				}else{
					if(resTemp>m[q]){
						finded = true;
					}
				}
			}
			
			if(resTemp!=m[q]){
				for(var i=0; i<a1.length; i++){
					if(temp[i] != m1[i]){
						movements += calcular(temp[i], m1[i]);
					}
				}
			}

			resTemp = parseInt(temp.join().replace(/,/g,""));
			finalMovements += movements;
		}
	}
	console.log("finalMovements", finalMovements);
	return finalMovements;
}

function calcular(num, objetivo){
	var max = 9;
	var min = 0;
	var distancia1 = ((max - objetivo) + num);
	var diff = (objetivo - num);
	var movements = 0;
	
	if(objetivo>num){
		if(diff > 5){
			movements = restar(objetivo, num);
		}else{
			movements = sumar(objetivo, num);
		}

	}else{
		if(distancia1 > 5){
			movements = restar(objetivo, num);
		}else{
			movements = sumar(objetivo, num);
		}
	}
	return movements;
}

function sumar(objetivo, num){
	var movements = 0;
	while(objetivo != num){
		num++;
		if(num > 9){ num = 0; }
		movements++;
	}
	return movements;
}

function restar(objetivo, num){
	var movements = 0;
	while(objetivo != num){
		num--;
		if(num < 0){ num = 9; }
		movements++;
	}
	return movements;
}


self.sendTraffic = (req, res) => {
	var arrUrl = [];
	arrUrl.push({"url":"http://www.geza.com.ar/home?ref=logo"});
	arrUrl.push({"url":"http://www.geza.com.ar/home"});
	arrUrl.push({"url":"http://www.geza.com.ar/home?ref=footer"});
	arrUrl.push({"url":"http://www.geza.com.ar/productos"});
	arrUrl.push({"url":"http://www.geza.com.ar/contacto"});
	arrUrl.push({"url":"http://www.geza.com.ar/medios-de-pago"});
	arrUrl.push({"url":"http://www.geza.com.ar/envios"});
	arrUrl.push({"url":"http://www.geza.com.ar/atencion-al-cliente"});
	arrUrl.push({"url":"http://www.geza.com.ar/home?ref=logo"});
	arrUrl.push({"url":"http://www.geza.com.ar/home"});
	arrUrl.push({"url":"http://www.geza.com.ar/home?ref=footer"});
	arrUrl.push({"url":"http://www.geza.com.ar/productos"});
	arrUrl.push({"url":"http://www.geza.com.ar/contacto"});
	arrUrl.push({"url":"http://www.geza.com.ar/medios-de-pago"});
	arrUrl.push({"url":"http://www.geza.com.ar/envios"});
	arrUrl.push({"url":"http://www.geza.com.ar/atencion-al-cliente"});
	arrUrl.push({"url":"http://www.muebleriamayfer.com.ar/producto/sofa-gloria/2019518145750"});
	arrUrl.push({"url":"http://www.muebleriamayfer.com.ar/producto/mesa-ratona-de-vidrio/998855"});
	arrUrl.push({"url":"http://www.muebleriamayfer.com.ar/producto/mesa-ratona-rustica/998833"});
	arrUrl.push({"url":"http://www.muebleriamayfer.com.ar/home?ref=logo"});
	arrUrl.push({"url":"http://www.muebleriamayfer.com.ar/home"});
	arrUrl.push({"url":"http://www.muebleriamayfer.com.ar/home?ref=footer"});
	arrUrl.push({"url":"http://www.muebleriamayfer.com.ar/productos"});
	arrUrl.push({"url":"http://www.muebleriamayfer.com.ar/contacto"});
	arrUrl.push({"url":"http://www.muebleriamayfer.com.ar/medios-de-pago"});
	arrUrl.push({"url":"http://www.muebleriamayfer.com.ar/envios"});
	arrUrl.push({"url":"http://www.muebleriamayfer.com.ar/atencion-al-cliente"});
	arrUrl.push({"url":"http://www.muebleriamayfer.com.ar/productos/mesas-ratonas/5ccc71babf50a40017f59ee7"});
	arrUrl.push({"url":"http://www.muebleriamayfer.com.ar/productos/decoracion/5ccc71babf50a40017f59eea"});
	arrUrl.push({"url":"http://www.muebleriamayfer.com.ar/productos/sofa-y-rinconeros/5cd40289f8e2c8001741a127"});
	arrUrl.push({"url":"http://www.muebleriamayfer.com.ar/productos/comedor/5d08efed67229f00173e46c9"});
	arrUrl.push({"url":"http://www.muebleriamayfer.com.ar/productos/poltronas/5d09096367229f00173e46dc"});
	arrUrl.push({"url":"http://www.muebleriamayfer.com.ar/productos/orgaizadores/5d09097667229f00173e46dd"});
	arrUrl.push({"url":"http://www.geza.com.ar/home?ref=logo"});
	arrUrl.push({"url":"http://www.geza.com.ar/home"});
	arrUrl.push({"url":"http://www.geza.com.ar/home?ref=footer"});
	arrUrl.push({"url":"http://www.geza.com.ar/productos"});
	arrUrl.push({"url":"http://www.geza.com.ar/contacto"});
	arrUrl.push({"url":"http://www.geza.com.ar/medios-de-pago"});
	arrUrl.push({"url":"http://www.geza.com.ar/envios"});
	arrUrl.push({"url":"http://www.geza.com.ar/atencion-al-cliente"});
	arrUrl.push({"url":"http://www.geza.com.ar/home?ref=logo"});
	arrUrl.push({"url":"http://www.geza.com.ar/home"});
	arrUrl.push({"url":"http://www.geza.com.ar/home?ref=footer"});
	arrUrl.push({"url":"http://www.geza.com.ar/productos"});
	arrUrl.push({"url":"http://www.geza.com.ar/contacto"});
	arrUrl.push({"url":"http://www.geza.com.ar/medios-de-pago"});
	arrUrl.push({"url":"http://www.geza.com.ar/envios"});
	arrUrl.push({"url":"http://www.geza.com.ar/atencion-al-cliente"});

	arrUrl.forEach( e => {
		console.log(e.url);
		
		http.get(e.url).then(function(data){
			console.log(e.url);	
		}).catch(function(error){
			console.log("Error", error);	
		})
    	
	})
	console.log("Finished!");
}

module.exports = self;