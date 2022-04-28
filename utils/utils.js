"use strict"

var Q             = require("q"),
    logger        = require('../utils/logger'),
    config      = require('../config/config'),
    NodeCache     = require('node-cache'),
    myCache       = new NodeCache(),
    self          = {};

self.getSeoUrl = function(name) {
    let seo_name = name.toLowerCase();
    seo_name = seo_name.replace(/ /g, '-');
    seo_name = seo_name.replace(/&/g, 'y');
    seo_name = seo_name.replace(/ñ/g, 'n');
    seo_name = seo_name.replace(/lts/g, '-litro');

    seo_name = seo_name.replace(/á/g, 'a');
    seo_name = seo_name.replace(/é/g, 'e');
    seo_name = seo_name.replace(/í/g, 'i');
    seo_name = seo_name.replace(/ó/g, 'o');
    seo_name = seo_name.replace(/ú/g, 'u');

    seo_name = seo_name.replace(/à/g, 'a');
    seo_name = seo_name.replace(/è/g, 'e');
    seo_name = seo_name.replace(/ì/g, 'i');
    seo_name = seo_name.replace(/ò/g, 'o');
    seo_name = seo_name.replace(/ù/g, 'u');

    return seo_name;
};

self.getBrand = () => {
    return process.env.APP_BRAND.toLowerCase();
}

self.getEnv = () => {
    return process.env.APP_ENV.toLowerCase();
}

self.getValidity = () => {
    var f = new Date();
    var day = f.getDate();
    var month = f.getMonth();
    var year = f.getFullYear();
    // month = month.toString();
    // if(month.length == 1){
    //     month = "0" + month;
    // }
    var meses = new Array ("Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre");
    var res = day + " de " + meses[month] + " del " + year;
    console.log(res);
    return res;
}

module.exports = self;