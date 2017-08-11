
var GFIPLModel = Backbone.Model.extend({

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    initialize: function() {

    },


    _action:function(method, options) {
        var model = this;
        options = options || {};
        options.parse = this.parse;
        var error = options.error;

        options.callback = function(resp){
            options.obj.model.set(resp);
            options.obj.proRender();
        };
        options.success = function(resp) {
            console.log("Success");
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(options.parse(resp));
            }
        };
        options.error = function(resp) {
            model.trigger('error', model, resp, options);
            if (error!==undefined) {
                error(model, resp);
            }
        };
        var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
        return xhr;
    },

    updateInfo: function(context,obj){
        var options = options || {};
        options.context = context;
        options.obj = obj;
        this._action("update",options);
    },

    sync: function(method, model, options) {
        switch(method) {
            case "read":
                break;
            case "update":
                OTHERCLOUD.API.updateGFIPInfo(model, options.success, options.error,options, this.getRegion());
                break;

        }
    },

    parse: function(resp) {

       return resp;

        /*
        if (resp.security_group !== undefined) {
            return resp.security_group;
        } else {
            return resp.gfip;
        }
        */
    }
});

var GFIPLModels = Backbone.Collection.extend({

    model: GFIPLModel,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    update: function(){

    },

    sync: function(method, model, options) {
        if (method === "read") {
            //JSTACK.Nova.getfloatingIPs(options.success, options.error, this.getRegion());
            OTHERCLOUD.API.getGFIPList(model, options.success, options.error, this.getRegion());
        }
    },

    parse: function(resp) {
        return resp.gfips;
    }


});
