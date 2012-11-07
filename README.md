Roxy
====
Roxy is a simple proxy intended for use with javascript frameworks to enable RESTful inter domain requests.
Why do we need a proxy?
-----------------------
JSONP requests that enable inter-domain AJAX requests do no allow for PUT,POST,DELETE,PATCH methods to be used.
Additionally JSONP does not allow you to set additional headers in the request.

The use of headers and these other HTTP request methods is essential to utilising the RESTful methodology to its full extent.

Why use node.js?
------------
Since this Proxy is intended for use with client side javascript frameworks, we thought it would be useful to keep the proxy
code in the same language to make it easy for the users to contribute/alter where they see fit.

Dependencies
------------

* node.js
* qs (querystring npm library)

Installing/Using Roxy
---------------------

Ensure you have node.js and npm installed (latest versions of node.js come bundled with npm)

Roxy can now be installed using npm simply by using

    npm install roxy

This should be done at the root of your project that will then place roxy in 

    node_modules/roxy

Traverse to this directory and run

    npm config set roxy:hostname <hostname_roxy_listens_on>
    npm config set roxy:port <port_number_roxy_listens_on>
    npm config set roxy:default_remote_hostname <default_remote_host_for_requests>

These config settings are optional, but if NOT set the values will be set to the default values:

* hostname = mrsparkles
* port = 3000
* default_remote_hostname = lighthouse

The default api key is not optional and has NO default value set this value must be set with 

    npm config set roxy:default_api_key 0123456789abcdef0123456789abcdef

Once all of the appropriate values have been set the server can be started with:

    npm start

Configuring to work with NGINX (nginx.conf):

    server {
        listen 80;
        server_name ms;
        root /WEB_ROOT;
        index index.html;
        error_page 404 index.html;

        location /roxy {
            proxy_pass    http://127.0.0.1:3000/;
        }
    }

Run the roxy server.js
1. Go to the node_modules/roxy
2. run npm start

Usage
-----

Send a JSONP AJAX request to roxy where the url is as so

    http://localhost/roxy/remote/path

Where 'localhost' is the server running the node.js file.
And roxy is the location configured in the nginx.conf

remote/path denotes the path you are trying to retrieve/modify from the RESTful API

Along with this also pass any parameters (post data) you wish to send to the remote server.
Also including the special _request parameter this will carry configuration data to Roxy.

    _request = {
        url: 'http://restful.api:8080',
        method: 'POST',
        headers: {
            Authorization: 'OAuth 0123456789abcdef0123456789abcdef'
        }
    }

This special parameter will connect Roxy to the specified server (restful.api)
using the specified protocol (http) on port (8080).

The method (POST) denotes the HTTP action you wish to perform and any headers set will also be forwarded.

jQuery example:

    jQuery.ajax({
        url: http://localhost/roxy/remote/path,
        data: {
            _request = {
                url: 'http://restful.api:8080',
                method: 'POST',
                headers: {
                    Authorization: 'OAuth 0123456789abcdef0123456789abcdef'
                }
            },
            text1: 'This is some data you want to send',
            text2: 'This is some more data wish to send'            
        },
        dataType: 'jsonp',
        success: function(data) {
            alert(data);
        }
    });