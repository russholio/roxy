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

Requirements
------------

* node.js
* qs (querystring npm library)

Installing node.js on OS X:

    brew update
    brew install node


To install the require npm package type:

    npm install qs

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

Node.js script must also be run with:

    node roxy.js

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