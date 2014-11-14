/**
 * Created by JohnRaj on 11/13/2014.
 */


'use strict';
var request = require("request");
var CSV = require('csv-string');
var invoke = require("../downstream/invoke.js");

exports.put = function (req, res) {
    res.setHeader('content-type', 'application/octet-stream');
    invoke.api({
        "name": "file upload",
        "url": "https://74.39.175.131:25443/eXpress/api/organization/v1/locations/import",
        "method": "PUT",
        "requireAuth": true,
        "expectedStatus": "202",
        "header": {},
        "query": {},
        "body": {},
        "cbFatalError": function (error, cb) {
            cb()
        },
        "cbNonFatalError": function (response, body, cb) {
            cb()
        },
        "cbSuccess": function(response, body, cb){cb()},
        "req": req,
        "res": res
    });

};

