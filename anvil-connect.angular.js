'use strict';

angular.module('anvil', [])


  .provider('Anvil', function AnvilProvider () {

    /**
     * Private state
     */

    var issuer, params, encodedParams, display, urls = {};


    /**
     * Provider configuration
     */

    this.configure = function (iss, options) {

      issuer = iss;

      params = {
        response_type:  options.response_type || 'id_token token',
        client_id:      options.client_id,
        redirect_uri:   options.redirect_uri,
        scope:          ['openid', 'profile'].concat(options.scope || []).join(' '),
        // other
      };

      encodedParams = toFormUrlEncoded(params),

      urls = {
        authorize:  issuer + '/authorize?' + encodedParams,
        signin:     issuer + '/signin?'    + encodedParams,
        signup:     issuer + '/signup?'    + encodedParams,
        userinfo:   issuer + '/userinfo',
        connect: function (provider) {
          return issuer + '/connect/' + provider + '?' + encodedParams;
        }
      };

      display        = options.display || 'page';

      this.issuer    = issuer;
      this.params    = params;
      this.urls      = urls;
      this.display   = display;

    };


    /**
     * Form Urlencode an object
     */

    function toFormUrlEncoded (obj) {
      var pairs = [];

      Object.keys(obj).forEach(function (key) {
        pairs.push(key + '=' + obj[key]);
      });

      return pairs.join('&');
    }


    /**
     * Parse Form Urlencoded data
     */

    function parseFormUrlEncoded (str) {
      var obj = {};

      str.split('&').forEach(function (property) {
        var pair = property.split('=')
          , key  = pair[0]
          , val  = pair[1]
          ;

        obj[key] = val;
      });

      return obj;
    }


    this.$get = ['$q', '$location', '$window', function ($q, $location, $window) {


      /**
       * Anvil Service
       */

      return {

        /**
         * Signin
         */

        authorize: function (authorization) {
          // handle the auth response
          if (authorization) {
            var deferred = $q.defer()
              , response = parseFormUrlEncoded($location.hash())
              ;

            console.log($location.hash(), response)
            // handle authorization error
            if (response.error) {
              deferred.reject(response);
              console.log('ERROR', response)
              // clear localStorage/cookie?
            }

            // handle successful authorization
            else {
              // TODO:
              // - verify id token
              // - verify access token (athash claim)
              // - request userInfo
              // - store tokens and userinfo encrypted in localstorage
              // - set cookie
              // - expose userinfo as a property of the service
              deferred.resolve(response);
              console.log('RESPONSE', response);
            }

            return deferred.promise;
          }

          // initiate the auth flow
          else {
            // open the signin page in a popup window
            if (display === 'popup') {
              $window.open(this.uri(), 'authorize', 'width=500, height=600');
            }

            // navigate the current window to the provider
            else {
              $window.location = this.uri();
            }
          }
        },


        /**
         * Urls
         */

        urls: urls,


        /**
         * Quick and dirty uri method with nonce
         */

        uri: function (endpoint) {
          return issuer + '/'
               + (endpoint || 'authorize') + '?'
               + encodedParams
               + '&nonce=' + this.nonce()
               ;
        },


        /**
         * Create or verify a nonce
         */

        nonce: function (nonce) {
          if (nonce) {
            return (this.sha256url(localStorage['nonce']) === nonce);
          } else {
            localStorage['nonce'] = Math.random().toString(36).substr(2, 10);
            return this.sha256url(localStorage['nonce']);
          }
        },


        /**
         * Base64url encode a SHA256 hash of the input string
         */

        sha256url: function (str) {
          return sjcl.codec.base64url.fromBits(sjcl.hash.sha256.hash(str));
        },


        /**
         * Parse uri fragment response from Anvil Connect
         */

        response: function () {
          return parseFormUrlEncoded($location.hash());
        }

      }

      /**
       * OAuth Request
       */

      //function OAuth (config) {
      //  var deferred = $q.defer();

      //  if (!config.headers) { config.headers = {} }
      //  config.headers['Authorization'] = 'Bearer '
      //                                  + OAuth.credentials.access_token
      //                                  ;

      //  function success (response) {
      //    deferred.resolve(response.data);
      //  }

      //  function failure (fault) {
      //    deferred.reject(fault);
      //  }

      //  $http(config).then(success, failure);
      //  return deferred.promise;
      //}


      /**
       * Authorize
       */

      //OAuth.authorize = function (authorization) {

      //  // in this case, we're handling the authorization response
      //  if (authorization) {
      //    var deferred    = $q.defer()
      //      , credentials = parseFormUrlEncoded(authorization)
      //      ;

      //    // handle authorization error
      //    if (credentials.error) {
      //      deferred.reject(credentials);
      //      OAuth.clearCredentials();
      //    }

      //    // handle successful authorization
      //    else {
      //      deferred.resolve(credentials);
      //      OAuth.setCredentials(credentials);
      //    }

      //    return deferred.promise;
      //  }

      //  // in this case, we're initiating the flow
      //  else {
      //    OAuth.redirect(urls.authorize);
      //  }

      //};


      /**
       * Redirect
       */

      //OAuth.redirect = function (url) {
      //  $window.location = url;
      //}


      /**
       * Popup
       */


      /**
       * Account info
       */

      //OAuth.accountInfo = function () {
      //  return OAuth({
      //    url: urls.account,
      //    method: 'GET'
      //  });
      //}


      /**
       * Authorized
       */

      //OAuth.authorized = function () {
      //  return Boolean(this.credentials && this.credentials.access_token);
      //};


      /**
       * Check authorization
       */

      //OAuth.checkAuthorization = function () {
      //  var json = localStorage['credentials'];
      //  if (typeof json === 'string') {
      //    OAuth.credentials = JSON.parse(json);
      //  }
      //}


      /**
       * Clear credentials
       */

      //OAuth.clearCredentials = function () {
      //  delete OAuth.credentials;
      //  delete localStorage['credentials'];
      //};


      /**
       * Set credentials
       */

      //OAuth.setCredentials = function (credentials) {
      //  OAuth.credentials = credentials;
      //  localStorage['credentials'] = JSON.stringify(credentials);
      //};


      /**
       * Expose urls
       */

      //OAuth.urls = urls;


      /**
       * Provider
       */

      //OAuth.provider = provider;


      /**
       *
       */

      //OAuth.checkAuthorization();


      /**
       *
       */

      //return OAuth;

    }];


  })

