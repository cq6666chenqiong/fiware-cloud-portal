const express = require('express');
const router = express.Router();
const OAuth2 = require('../oauth2').OAuth2;
const config = require('../config');
const crypto = require('crypto');
const querystring = require('querystring');
const qs = require("qs");
const request = require('request');
const rp = require("request-promise");
const Capi = require('../../qcloudapi-sdk');
const assign = require('object-assign');

    var adminAccessToken = "";

    var secret = "adeghskdjfhbqigohqdiouka";

    function decrypt(str){
      var decipher = crypto.createDecipher('aes-256-cbc',secret);
      var dec = decipher.update(str,'hex','utf8');
      dec += decipher.final('utf8');
      return dec;
    }


    var oauth_client = new OAuth2(config.oauth.client_id,
                        config.oauth.client_secret,
                        config.oauth.account_server,
                        '/oauth2/authorize',
                        '/oauth2/token',
                        config.oauth.callbackURL);

    var encodeClientCredentials = function(clientId, clientSecret) {
        return new Buffer(querystring.escape(clientId) + ':' + querystring.escape(clientSecret)).toString('base64');
    };

    var headers = {
        'Authorization': 'Basic ' + encodeClientCredentials(config.productAdminOauth.client_id, config.productAdminOauth.client_secret),
        'Content-Type': 'application/x-www-form-urlencoded',
    }

    var form_data = qs.stringify({
        grant_type: 'password',
        username: config.productAdminOauth.username,
        password: config.productAdminOauth.password
    });

    var options = {
        url:  'http://124.251.62.217:8000' + '/oauth2/token',
        body: form_data,
        headers: headers
    };


    new Promise(function(resolve,reject){
        //获取admin token
        request.post(options, function (e, resp, body) {
            if (e) {
                console.log(e);
                reject("lst")
            } else {
                adminAccessToken = JSON.parse(body).access_token;
                console.log("token==="+adminAccessToken);
                resolve(adminAccessToken);
            }
        });
    }).then(function(adminAccessToken){
        var url = 'http://124.251.62.217:8000' + '/user';
        var token = "f7f40d4f72047f549bc48ee15da370345e46ea149cc95ba56d6b50b85218579b";
        var options = {};

        new Promise(function(resolve,reject){
                options.callback = function (e, response) {
                    var user = {};
                    user.userId = JSON.parse(response).id;
                    console.log("user add id");
                    resolve(user);
                }
                oauth_client.get(url, decrypt(token), options.callback);
        }).then(
                function(user){
                    user.adminAccessToken = adminAccessToken;
                    console.log("user0=="+JSON.stringify(user));
                    return user;
                }
        ).then(function(user){
                console.log("user=="+JSON.stringify(user));
                console.log("come in 1");
                var options = {
                   // headers: {'content-type' : 'application/json','Authorization': 'Bearer ' + user.adminAccessToken },
                   // url:     config.delivery.baseUrl + '/v1/hybrid/instance?userId=' + user.userId + '&provider=qcloud&productName=cvm',
                    headers: {'content-type' : 'application/json','Authorization': 'Bearer ' + user.adminAccessToken },
                    url : "http://124.251.62.216:3003/v1/hybrid/instance?userId="+user.userId //+'&provider=qcloud&productName=cvm'
                }
                console.log("come in 2   "+options.url+"     "+options.headers.Authorization);
                request.get(options, function(e, response, body) {
                    console.log(body);

                });
            })

    });


