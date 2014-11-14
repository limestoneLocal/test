//var config = require('../../config/environment/index');
var request = require("request");
//var db = require("../session/db.js");
//var config = require('../../config/environment');
//var util = require("../util/util.js");
//var logger = require('../logger');
var CSV = require('csv-string');


function downstream(args, token) {

    // if this api needs a token, pass it
    if(token) {
        args.header["authorization"] = token;
    }

    //add in app_key
    args.header["app_key"] = "cb13cb34-1d70-424c-b235-003998b38ec4";

    // add in if-match, it may not be needed for this api
    args.header["if-match"] = args.req.headers["if-match"];
    args.header["Content-Type"] = 'application/octet-stream';

    var isJson;

    // if application/octet-stream, do not parse body
    if(args.header["Content-Type"] === 'application/octet-stream') {
        args.req.body = args.req.rawBody;
        isJson = false;

        //var arr = CSV.parse(args.req.body);

        //var count = parseInt(arr.length);
        //console.log(count);
        //args.req.pipe(fs.createWriteStream('out.txt'));
        args.req.pipe( request({
            method: args.method,
            uri: args.url,
            qs: args.query,
            headers: args.header,
            body: args.req.body,
            json: isJson,
            rejectUnauthorized: false
        }, function(error, response, body) {

            if (error) {
                // received a fatal error from request module, this is
                // truly an exception. Send back 500 status

                logger.error(args.name + ": Fatal Error - %s", error);

                args.cbFatalError(error, function(){
                    args.res.status(500);
                    args.res.end();
                });

            } else {

                if (response.statusCode == args.expectedStatus) {
                    logger.info(args.name + ": Success");

                    // some apis return an etag
                    if(response.headers['etag']) {
                        args.res.setHeader('etag', response.headers['etag']);
                    }

                    args.cbSuccess(response, body, write);
                } else {
                    if (body && body.messages && body.messages.length > 0 && body.messages[0].messageType === "ERROR") {
                        logger.warn(args.name +  ": Failure - %s", body.messages[0].message);
                    }
                    else {
                        logger.warn(args.name + ": Failure - unknown"+body);
                    }

                    args.cbNonFatalError(response, body, write);
                }

                function write() {
                    console.log(args.name + ": Failure - unknown"+body);
                    args.res.status(response.statusCode);
                    args.res.send(body);
                    args.res.end();

                }

            }
        }));

    } else {
        // merge additional body vars
        for (var body in args.body) { args.req.body[body] = args.body[body]}
        isJson = true;
    }

    // merge additional query vars
   /* var queries = util.objQueryString(args.req)
    for (var query in queries) { args.query[query] = queries[query]}
*/
    request({
        method: args.method,
        uri: args.url,
        qs: {},
        headers: args.header,
        body: args.req.body,
        json: isJson,
        rejectUnauthorized: false
    }, function(error, response, body) {

        if (error) {
            // received a fatal error from request module, this is
            // truly an exception. Send back 500 status

            console.log(args.name + ": Fatal Error - %s", error);

            args.cbFatalError(error, function(){
                args.res.status(500);
                args.res.end();
            });

        } else {

            if (response.statusCode == args.expectedStatus) {
                console.log(args.name + ": Success");

                // some apis return an etag
                if(response.headers['etag']) {
                    args.res.setHeader('etag', response.headers['etag']);
                }

                args.cbSuccess(response, body, write);
            } else {
                if (body && body.messages && body.messages.length > 0 && body.messages[0].messageType === "ERROR") {
                    console.log(args.name +  ": Failure - %s", body.messages[0].message);
                }
                else {
                   console.log(args.name + ": Failure - unknown "+JSON.stringify(body));
                }

                args.cbNonFatalError(response, body, write);
            }

            function write() {
                console.log(response.statusCode+" " +JSON.stringify(body))
                args.res.status(response.statusCode);
                args.res.send(body);
                args.res.end();
            }

        }
    });
}


exports.api  = function api( args ) {

    downstream(args, "Login urn:uuid:5e80ddeb-5f9a-4317-9321-85ef74b34e36")

};