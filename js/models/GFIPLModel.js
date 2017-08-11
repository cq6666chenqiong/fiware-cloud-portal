
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
    },

    getGFRegionName:function(region){
        switch(region){
            case "sh":
                return "上海";
            case "bj":
                return "北京";
            case "gz":
                return "广州";
        }
    },

    getGFStatusName: function(status){

        switch(status){
            case "idle":
                return "正常工作中";
            case "attacking":
                return "正在被攻击";
            case "blocking":
                return "被封堵";
            case "creating":
                return "正常创建中";
            case "isolate":
                return "到期后被隔离";
        }

    },

    getTransTargetName: function(transTarget){

        switch(transTarget){
            case "qcloud":
                return "腾讯云内";
            case "nqcloud":
                return "腾讯云外";

        }

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
            OTHERCLOUD.API.getGFIPList(model, options.success, options.error, this.getRegion());
        }
    },

    parse: function(resp) {

        resp.gfips.forEach(function(instance){
            instance.GFRegionName = this.getGFRegionName(instance.region);
            instance.GFStatusName = this.getGFStatusName(instance.status);
            instance.TransTargetName = this.getTransTargetName(instance.transTarget);
        });

        return resp.gfips;
    },

    getGFRegionName:function(region){
        switch(region){
            case "sh":
                return "上海";
            case "bj":
                return "北京";
            case "gz":
                return "广州";
        }
    },

    getGFStatusName: function(status){

        switch(status){
            case "idle":
                return "正常工作中";
            case "attacking":
                return "正在被攻击";
            case "blocking":
                return "被封堵";
            case "creating":
                return "正常创建中";
            case "isolate":
                return "到期后被隔离";
        }

    },

    getTransTargetName: function(transTarget){

        switch(transTarget){
            case "qcloud":
                return "腾讯云内";
            case "nqcloud":
                return "腾讯云外";

        }

    }

});
