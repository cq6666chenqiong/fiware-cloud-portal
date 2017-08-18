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
    new Promise(function(resolve,reject){
    //查询高仿ip在数据库中的记录
        resolve(JSON.stringify([{'instanceId':'0001'},{'instanceId':'0002'},{'instanceId':'0003'}]));
    }).then(function (data) {
        var json = JSON.parse(data);
        return Promise.map(json,function(instance){
               return getGFIPinfo(instance);
        }).then(function(collection_data){
              console.log("my resutl = "+JSON.stringify(collection_data));
              return collection_data;
        });
    }).then(function(result_a){
        return new Promise(function(resolve,reject){
             console.log("my result is ===="+JSON.stringify(result_a));
             var capi = new Capi({
                 SecretId: config.qcloud.SecretId,
                 SecretKey: config.qcloud.SecretKey,
                 serviceType: 'account'
             });
             var params = assign({Region:4,
                 Action: 'NS.BGPIP.ServicePack.GetInfo',
                 'bgpId':"0001"});
             capi.request(params, {
                serviceType: 'csec'
             }, function(error, data) {
                console.log(JSON.stringify(data,4,4));
                resolve(JSON.stringify(data,4,4));
             });
        }).then(function(face_result){
            console.log(JSON.stringify(face_result,4,4));
            return result_a;
        });

    }).then(function(but_result){
        console.log("he is "+JSON.stringify(but_result,4,4));
        resp.send(JSON.stringify(but_result,4,4));
    });

});


module.exports = myapp;