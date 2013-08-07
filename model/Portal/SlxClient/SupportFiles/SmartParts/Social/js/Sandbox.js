
/*
* Application core.
* All application modules are added to the sandbox and use it to interact with other modules.
*/

define(['dojo/_base/declare', 'dojo/_base/Deferred', 'Sage/UI/Dialogs'],
function (declare, Deferred, SageDialogs) {
    var sandboxbase = declare(null, {
        // the sandbox is how modules will get to interact with the rest of the app
        constructor: function (core, module) {
            this._core = core;
            this._module = module;
        },
        subscribe: function (topic, handler) {
            // summary:
            //  Used to subscribe to a topic.  Example: sb.subscribe('Event', function() { })
            Array.prototype.unshift.call(arguments, this._module);
            this._core.subscribe.apply(this._core, arguments);
        },
        publish: function (topic) {
            // summary:
            //  Publish an event to all subscribers.
            //  Example: sb.publish('Event', firstparam, secondparam);
            Array.prototype.unshift.call(arguments, this._module);  // insert module as first parameter so the publish can find it
            this._core.publish.apply(this._core, arguments);
        },
        stopEvent: function () {
            // summary:
            //  Return a value which can be used as a return value by the event handler to signify that further events in the chain should not be 
            //  executed.
        },
        getParameter: function (param) {
            return this._core.getParameter(param);
        },
        addSubModule: function (module) {
            // really just a wrapper to add a module to the core at this point
            this._core.addModule(module);
            return module;
        },
        error: function (err) {
            if (typeof console != "undefined")
                console.error(err);
            SageDialogs.showWarning(err.toString(), null, "warning");
            this.publish('Error', err);
        },
        warn: function (msg) {
            if (typeof console != "undefined")
                console.warn(msg);
            this.publish('Warning', msg);
        }
    });

    var Event = declare(null, {
        // summary:
        //  Event object, passed as last parameter to event subscribers.
        //  Can be used to prevent further propagation by setting "cancel" to true
        cancel: false
    });

    var Sandbox = {
        Core: declare(null, {
            _evtHandlers: null,

            constructor: function () {
                this._evtHandlers = [];
                this._parameters = {};
            },

            subscribe: function (module, topic, handler, priority) {
                // summary: 
                //  Add an event handler to a topic
                // parameters:
                //  module: scope to which to invoke the handler in
                //  handler: function
                //  topic: what to subscribe
                //  priority: number from 0 to 10 indicating priority - 0 is highest (defaults to 0)
                if (!this._evtHandlers[topic])
                    this._evtHandlers[topic] = [];
                var handler = { scope: module, handler: handler, priority: priority || 0 };
                var target = this._evtHandlers[topic];
                for (var i = 0; i < target.length; i++) {
                    if (target[i].priority > handler.priority) {
                        target.splice(i, 0, handler);
                        return;
                    }
                }
                target.push(handler);
            },

            publish: function (module, topic) {
                // summary:
                //  Invoke all the event handlers for the topic.
                //  Additional parameters to the method will be passed to the handler.
                //  Additionally an "Event" parameter will be passed as last parameter, which can be used
                //  to prevent further propagation.
                if (typeof console != "undefined")
                    console.log('Sandbox event: ' + topic);
                if (this._evtHandlers[topic]) {
                    var args = Array.prototype.slice.call(arguments, 2);
                    var hh = this._evtHandlers[topic];
                    var evt = new Event();
                    args.push(evt);
                    for (var i = 0; i < hh.length && !evt.cancel; i++) {
                        if (module !== hh[i].scope)
                            hh[i].handler.apply(hh[i].scope || window, args);
                    }
                }
            },

            // register a module, dur
            addModule: function (module) {
                var sb = new sandboxbase(this, module);
                module.initModule(sb);
                return this;
            },

            // mmm start all the modules
            startAll: function () {
            },

            getParameter: function (name) {
                return this._parameters[name];
            },

            setParameter: function (name, value) {
                this._parameters[name] = value;
            },

            // add a module (an object instance) and make it available on the sandbox
            addExtension: function (name, module) {
                module.initModule(new sandboxbase(this));
                sandboxbase.prototype[name] = module;
            }
        })
    };

    // AJAX Extension
    (function () {
        var ajaxpCount = 0;

        Sandbox.Ajax = dojo.declare(null, {
            initModule: function (sb) {
                this._sandbox = sb;
            },

            xhrGet: function (url, data) {
                var args = [];
                for (var k in data) {
                    args.push(encodeURIComponent(k) + "=" + encodeURIComponent(data[k]));
                }
                return this._ajax(url + "?" + args.join("&"), dojo.xhrGet);
            },

            xhrPost: function (url, data) {
                return this._ajax(url, dojo.xhrPost, data);
            },

            _ajax: function (url, method, data) {
                // summary:
                //  Perform ajax call.  The data is always presumed to be JSON.  Method can be "GET" or "POST".
                //  Return deferred object.
                var sb = this._sandbox;
                sb.publish("Ajax/Start");
                return method({
                    url: url,
                    content: data,
                    handleAs: 'json'
                }).then(function (data) {
                    sb.publish("Ajax/End");
                    return data;
                }, function (err) {
                    sb.warn(err.message || "Ajax request failed: unknown error");
                    sb.publish("Ajax/End");
                    // make sure we return a new deferred so the caller can register their own handler
                    // otherwise we will be back on the "success" chain
                    var def = new Deferred();
                    def.reject(err);
                    return def;
                });
            },

            ajaxp: function (url, data, callbackParamName) {
                // summary:
                //  Perform ajax call using jsonp.  
                //  Return deferred object.
                var url = url;
                var q = "";
                var hasQ = (url.indexOf("?") >= 0);
                ajaxpCount++;
                var sb = this._sandbox;
                sb.publish("Ajax/Start");
                var def = new dojo.Deferred();
                if (!window.SSS_SandboxAjax)
                    window.SSS_SandboxAjax = {};
                window.SSS_SandboxAjax["callback" + ajaxpCount] = function () {
                    sb.publish("Ajax/End");
                    def.resolve(arguments);
                };
                data[callbackParamName] = "SSS_SandboxAjax.callback" + ajaxpCount;
                for (var k in data) {
                    if (hasQ) {
                        q += "&";
                    } else {
                        q += "?";
                        hasQ = true;
                    }
                    q += k;
                    q += "=" + encodeURIComponent(data[k]);
                }
                url = url + q;
                var script = document.createElement("script");
                script.setAttribute("type", "text/javascript");
                script.setAttribute("src", url);
                document.body.appendChild(script);
                return def;
            }
        });

        Sandbox.AjaxIndicatorModule = dojo.declare(null, {
            constructor: function (div) {
                this._div = dojo.byId(div);
                this._div.style.visibility = "hidden";
                this._ajaxCount = 0;
            },
            initModule: function (sb) {
                sb.subscribe("Ajax/Start", dojo.hitch(this, "_showIndicator"));
                sb.subscribe("Ajax/End", dojo.hitch(this, "_hideIndicator"));
            },

            _showIndicator: function () {
                this._ajaxCount++;
                this._div.style.visibility = "visible";
            },

            _hideIndicator: function () {
                this._ajaxCount--;
                if (this._ajaxCount <= 0) {
                    this._ajaxCount = 0; // just in case
                    this._div.style.visibility = "hidden";
                }
            }
        });
    })();

    // SData Extension (wrapper for the SData client library)
    (function () {
        Sandbox.SData = dojo.declare(null, {
            initModule: function (sb) {
                this._sandbox = sb;
            },

            read: function (resourceKind, where, queryArgs) {
                // summary:
                //  Retrieve SData resources matching the specified criteria
                var svc = Sage.Utility.getSDataService();
                var req = new Sage.SData.Client.SDataResourceCollectionRequest(svc)
                .setResourceKind(resourceKind)
                .setQueryArg("where", where);
                if (queryArgs)
                    req.setQueryArgs(queryArgs);
                var def = new dojo.Deferred();
                this._sandbox.publish('Ajax/Start');
                req.read({
                    success: dojo.hitch(this, "onSuccess", def),
                    failure: dojo.hitch(this, "onFailure", def)
                });
                return def;
            },

            create: function (resourceKind, data) {
                // summary:
                //  Create resource
                var svc = Sage.Utility.getSDataService();
                var req = new Sage.SData.Client.SDataSingleResourceRequest(svc)
                .setResourceKind(resourceKind);
                var def = new dojo.Deferred();
                this._sandbox.publish('Ajax/Start');
                req.create(data, {
                    success: dojo.hitch(this, "onSuccess", def),
                    failure: dojo.hitch(this, "onFailure", def)
                });
                return def;
            },

            update: function (resourceKind, data) {
                // summary:
                //  Update designated resource.  The id ($key) must be provided as part of the data.
                var svc = Sage.Utility.getSDataService();
                var req = new Sage.SData.Client.SDataSingleResourceRequest(svc)
                .setResourceKind(resourceKind)
                .setResourceSelector("'" + data.$key + "'");
                var def = new dojo.Deferred();
                this._sandbox.publish('Ajax/Start');
                req.update(data, {
                    success: dojo.hitch(this, "onSuccess", def),
                    failure: dojo.hitch(this, "onFailure", def)
                });
                return def;
            },

            destroy: function (resourceKind, key) {
                // summary:
                //  delete designated resource.  
                var svc = Sage.Utility.getSDataService();
                var req = new Sage.SData.Client.SDataSingleResourceRequest(svc)
                .setResourceKind(resourceKind)
                .setResourceSelector("'" + key + "'");
                var def = new dojo.Deferred();
                this._sandbox.publish('Ajax/Start');
                req['delete']({ $key: key }, {
                    success: dojo.hitch(this, "onSuccess", def),
                    failure: dojo.hitch(this, "onFailure", def)
                });
                return def;
            },

            // event handlers
            onSuccess: function (def, feed) {
                this._sandbox.publish('Ajax/End');
                def.resolve(feed);
            },

            onFailure: function (def, error) {
                this._sandbox.publish('Ajax/End');
                this._sandbox.warn("SData Request failed!  " + error);
                def.reject(error);
            }
        });
    })();

    return Sandbox;
});