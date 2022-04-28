"use strict";

var path 			= require('path');
var util 			= require('util');
var rootPath        = path.normalize(__dirname + '/..');
var env             = process.env.APP_ENV || 'dev';
var xBrand          = process.env.APP_BRAND.toLowerCase();

if(!env) new Error("NODE_ENV variable should be set");

const timeoutRatio = 1;
let config;

console.log("./"+xBrand+"/"+env+".config.js")

config = require("./"+xBrand+"/"+env+".config.js");

config.env = env;

module.exports = config.config;
