var HOST = process.env.npm_package_config_hostname;
var PORT = process.env.npm_package_config_port;
var DEFAULT_REMOTE_HOST = process.env.npm_package_config_default_remote_hostname;
var DEFAULT_API_KEY = process.env.npm_package_config_default_api_key;

console.log(HOST, PORT, DEFAULT_REMOTE_HOST, DEFAULT_API_KEY);

if (typeof DEFAULT_API_KEY === 'undefined') {
    console.log('DEFAULT API KEY was undefined please define with "npm config set roxy:default_api_key 0123456789abcdef0123456789abcdef"');
    process.kill(1);
}
console.log("sometihng");

var http = require("http");
var https = require("https");
var url = require("url");
var qs = require("qs");

var restService = function(request) {
    return new function() {
        this.remoteUrl = url.parse(request.url) || DEFAULT_REMOTE_HOST;
        this.protocol = 'https:';
        this.port = 443;
        if (this.remoteUrl.protocol == 'http:') {
            this.protocol = this.remoteUrl.protocol;
            this.port = 80;
        }
        
        if (typeof this.remoteUrl.port != 'undefined') {
            this.port = this.remoteUrl.port;
        }
        
        this.options = {
            'hostname' : this.remoteUrl.hostname,
            'port' : this.port,
            'encoding' : 'utf8',
            'method' : request.method,
            'path' : '/',
            'headers' : { 
                'Accept' : 'application/json', 
                'Authorization' : 'OAuth '+DEFAULT_API_KEY 
            }
        };
        
        for (var property in request.headers) {
            this.options.headers[property] = request.headers[property];
        }
        
        this.request = function(path, success, error) {
            var options = this.options;
            options.path = this.remoteUrl.path+path;
            
            //console.log(options);
            
            var lhRequest; 
            if (this.protocol === 'http:') {
                lhRequest = http.request(options, success);
            }
            else {
                lhRequest = https.request(options, success);
            }
            
            lhRequest.on('error', error);
            
            return lhRequest;        
        }
    }
}

var server = http.createServer(function(req, res) {
    var roxyResponse = res;
    var params = qs.parse(url.parse(req.url, true).search.substr(1));
    //console.log(params);
    
    var request = params._request;    
    request.method = typeof request.method == 'undefined' ? 'GET' : request.method.toUpperCase();
    var path = url.parse(req.url).pathname.substr(2);
    var callback = params.callback;
    
    delete params._;
    delete params.callback;
    delete params._request;
    
    var remoteRequest = restService(request).request(
        path, 
        function (lhResponse) {
            lhResponse.responseString = '';
            //console.log('STATUS: ' + lhResponse.statusCode);
            lhResponse.setEncoding('utf8');
            lhResponse.on('data', function (chunk) {
                this.responseString += chunk;
            });
            lhResponse.on('end', function () {
                roxyResponse.setHeader('Content-Type', 'text/javascript');
                roxyResponse.write(callback+'('+this.responseString+');');
                roxyResponse.end();
                //console.log(roxyResponse);
                //console.log('END: '+this.responseString);
            });
            lhResponse.on('close', function () {
                roxyResponse.close();
                console.log('CLOSE');
            });
        },
        function (lhError) {
            console.log('problem with request: ' + lhError.message);
            roxyResponse.writeHead(500);
            roxyResponse.end(lhError.message);
        }
    );
    
    var lhParamString = ''
    if (request.method != 'GET') {
        //console.log(request.method);
        lhParamString = qs.stringify(params);
        //console.log(lhParamString);
        remoteRequest.setHeader('Content-Length', lhParamString.length);
    }
    remoteRequest.write(lhParamString);
    remoteRequest.end();
});

server.listen(PORT, HOST);