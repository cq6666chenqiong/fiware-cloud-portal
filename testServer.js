const express = require('express');
const myapp = express.Router();
const OAuth2 = require('../oauth2').OAuth2;
const config = require('../config');
const crypto = require('crypto');
const querystring = require('querystring');
const qs = require("qs");
const request = require('request');
const rp = require("request-promise");
const Capi = require('../../qcloudapi-sdk');
const assign = require('object-assign');

//var Promise = require('promise');
var Promise = require('bluebird');

function getGFIPinfo(instance){
    var result = new Promise(function(resolve,reject){
         var capi = new Capi({
             SecretId: config.qcloud.SecretId,
             SecretKey: config.qcloud.SecretKey,
             serviceType: 'account'
         });

         var params = assign({Region:4,
             Action: 'NS.BGPIP.ServicePack.GetInfo',
             'bgpId':instance.instanceId});
         capi.request(params, {
            serviceType: 'csec'
         }, function(error, data) {
            console.log(JSON.stringify(data,4,4));
            resolve(JSON.stringify(data,4,4));
         });
    });
    return result;
}

myapp.get("/test/list",function(req, resp){
    console.log("come in my root!");
    resp.send("come in my root!");
});


module.exports = myapp;