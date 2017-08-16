var BPInstance = Backbone.Model.extend({

    _action:function(method, options) {
        var model = this;
        options = options || {};
        var error = options.error;
        options.success = function(resp) {
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
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

    addVMToTier: function(options) {
        this._action("addVM", options);
    },

    removeVMFromTier: function(options) {
        this._action("removeVM", options);
    },

    sync: function(method, model, options) {
        switch(method) {
            case "addVM":
                BP.API.addVMToTier(model.get('blueprintName'), options.tier, options.success, options.error);
                break;
            case "removeVM":
                BP.API.removeVMFromTier(model.get('blueprintName'), options.instance_name, options.success, options.error);
                break;
            case "read":
                BP.API.getBlueprintInstance(model.get('blueprintName'), options.success, options.error);
                break;
            case "create":
                BP.API.launchBlueprintInstance(model.toJSON(), options.success, options.error);
                break;
            case "delete":
                BP.API.stopBlueprintInstance(model.get('blueprintName'), options.success, options.error);
                break;
            case "update":

                break;

        }
    },

    parse: function(resp) {
        if (resp) {
            resp.id = resp.blueprintName;
            resp.name = resp.environmentInstanceName;
        }
        return resp;
    }
});

var BPInstances = Backbone.Collection.extend({

    model: BPInstance,

    _action: function(method, options) {
        var model = this;
        options = options || {};
        options.success = function(resp) {
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
            }
        };
        var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
        return xhr;
    },

    // getCatalogueProductDetails: function(options) {
    //     options = options || {};
    //     return this._action('getCatalogueProductDetails', options);
    // },

    getTask: function(options) {
        options = options || {};
        return this._action('getTask', options);
    },

    sync: function(method, model, options) {
        switch(method) {
            case "read":
                //BP.API.getBlueprintInstanceList(options.success, options.error);
                break;
            case 'getTask':
                /*BP.API.getTask(options.taskId, function (resp) {
                    var message = 'Blueprint Instance ' + resp.environment + ' status.';
                    message += '<br><br>Description: ' + resp.description;
                    message += '<br><br>Status: ' + resp._status;
                    if (resp.error) {
                        message += '<br><br>Error: ' + resp.error._message;
                    }
                    options.success(message);

                }, options.error);*/
                break;
            case 'getCatalogueProductDetails':
                // ServiceDC.API.getProductAttributes(options.id, options.success, options.error);
                break;
        }
    },

    parse: function(resp) {
        return resp;
    }
});

var BPTemplate = Backbone.Model.extend({

    _action:function(method, options) {
        var model = this;
        options = options || {};
        var error = options.error;
        options.success = function(resp) {
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
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

    addTier: function(options) {
        options = options || {};
        return this._action('addTier', options);
    },

    updateTier: function(options) {
        options = options || {};
        return this._action('updateTier', options);
    },

    deleteTier: function(options) {
        options = options || {};
        return this._action('deleteTier', options);
    },

    sync: function(method, model, options) {
        switch(method) {
            case "read":
                BP.API.getBlueprintTemplate(model.get('name'), options.success, options.error);
                break;
            case "create":
                BP.API.createBlueprintTemplate(model.toJSON(), options.success, options.error);
                break;
            case "delete":
                BP.API.deleteBlueprintTemplate(model.get('name'), options.success, options.error);
                break;
            case "update":
                break;
            case "addTier":
                BP.API.createBlueprintTemplateTier(model.get('name'), options.tier, options.success, options.error);
                break;
            case "updateTier":
                BP.API.updateBlueprintTemplateTier(model.get('name'), options.tier, options.success, options.error);
                break;
            case "deleteTier":
                BP.API.deleteBlueprintTemplateTier(model.get('name'), options.tier, options.success, options.error);
                break;
        }
    },

    parse: function(resp) {
        resp.id = resp.name;
        return resp;
    }
});

var BPTemplates = Backbone.Collection.extend({

    model: BPTemplate,

    catalogList: {},

    _action: function(method, options) {
        var model = this;
        options = options || {};
        options.success = function(resp) {
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
            }
        };
        var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
        return xhr;
    },

    getCatalogBlueprint: function(options) {
        options = options || {};
        return this._action('getCatalogBlueprint', options);
    },

    fetchCollection: function(options) {

        var self = this;

        BP.API.getBlueprintCatalogList(function (resp) {
            BP.API.getBlueprintTemplateList(function (resp2) {
                self.catalogList = resp;
                options.success(resp2);
            }, options.error);

        }, options.error);
    },

    sync: function(method, model, options) {
        switch(method) {
            case "read":
                this.fetchCollection(options);
                break;
            case 'getCatalogBlueprint':
                BP.API.getBlueprintCatalog(options.id, options.success, options.error);
                break;
        }
    },

    parse: function(resp) {
        return resp;
    }
});
var Container = Backbone.Model.extend({

    _action:function(method, options) {
        var model = this;
        options = options || {};
        var error = options.error;
        options.success = function(resp) {
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
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

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    copyObject: function(currentObject, targetContainer, targetObject, options) {
        console.log("Copy object");
        options = options || {};
        options.currentObject = currentObject;
        options.targetContainer = targetContainer;
        options.targetObject = targetObject;
        return this._action('copyObject', options);
    },

    uploadObject: function(objectName, object, options) {
        console.log("Upload object");
        options = options || {};
        options.objectName = objectName;
        options.object = object;
        return this._action('uploadObject', options);
    },

    downloadObject: function(objectName, options) {
        options = options || {};
        options.objectName = objectName;
        return this._action('downloadObject', options);
    },

    deleteObject: function(objectName, options) {
        console.log("Delete objects");
        options = options || {};
        options.objectName = objectName;
        return this._action('deleteObject', options);
    },

    sync: function(method, model, options) {
        switch (method) {
            case "read":
                mySucess = function(objects) {
                    var cont = {};
                    cont.objects = objects;
                    return options.success(cont);
                };
                // trick for supporting Ceph regions
                var ceph = false;
                if (this.getRegion() === 'Zurich2') {
                    ceph = true;
                }
                JSTACK.Swift.getobjectlist(model.get('name'), mySucess, options.error, this.getRegion(), ceph);
                break;
            case "delete":
                JSTACK.Swift.deletecontainer(model.get('name'), options.success, options.error, this.getRegion());
                break;
            case "create":
                JSTACK.Swift.createcontainer(model.get('name'), options.success, options.error, this.getRegion());
                break;
            case "copyObject":
                JSTACK.Swift.copyobject(model.get('name'), options.currentObject, options.targetContainer, options.targetObject, options.success, options.error, this.getRegion());
                break;
            case "uploadObject":
                var reader = new FileReader();
                var self = this;
                reader.onload = function(event) {
                    var data = event.target.result.toString();
                    var data_index = data.indexOf('base64') + 7;
                    var data_index2 = data.indexOf('data:') + 5;
                    var filedata = data.slice(data_index, data.length);
                    var filetype = data.slice(data_index2, data_index-8);
                  JSTACK.Swift.uploadobject(model.get('name'), options.objectName, filedata, filetype, options.success, options.error, self.getRegion());
                };
                reader.readAsDataURL(options.object);
                break;
            case "downloadObject":
                JSTACK.Swift.downloadobject(model.get('name'), options.objectName, options.success, options.error, this.getRegion());
                break;
            case "deleteObject":
                JSTACK.Swift.deleteobject(model.get('name'), options.objectName, options.success, options.error, this.getRegion());
                break;
        }
    },

    parse: function(resp) {
        if (resp !== undefined && resp.container !== undefined) {
            resp.container.id = resp.container.name;
            return resp.container;
        } else if (resp !== undefined) {
            resp.id = resp.name;
            return resp;
        } else {
            return {};
        }
    }
});

var Containers = Backbone.Collection.extend({
    model: Container,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
        if (method === "read") {
            JSTACK.Swift.getcontainerlist(options.success, options.error, this.getRegion());
        }
    },

    comparator: function(container) {
        return container.get("id");
    },

    parse: function(resp) {
        return resp;
    }

});
var Flavor = Backbone.Model.extend({

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
           switch(method) {
               case "read":
                   JSTACK.Nova.getflavordetail(model.get("id"), options.success, options.error, this.getRegion());
                   break;
               case "delete":
                   JSTACK.Nova.deleteflavor(model.get("id"), options.success, options.error, this.getRegion());
                   break;
               case "create":
                   JSTACK.Nova.createflavor( model.get("name"), model.get("ram"), model.get("vcpus"),
                            model.get("disk"), model.get("flavor_id"), model.get("ephemeral"), undefined,
                            undefined, options.success, options.error, this.getRegion());
                   break;
           }
    },

    parse: function(resp) {
        if (resp.flavor !== undefined) {
            return resp.flavor;
        } else {
            return resp;
        }
    }
});

var Flavors = Backbone.Collection.extend({
    model: Flavor,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
        if (method === "read") {
            JSTACK.Nova.getflavorlist(true, options.success, options.error, this.getRegion());
        }
    },

    comparator: function(flavor) {
        return flavor.get("id");
    },

    parse: function(resp) {
        return resp.flavors;
    }

});
var FloatingIP = Backbone.Model.extend({

    initialize: function() {
        this.id = this.get("id");
    },

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },
    
    _action:function(method, options) {
        var model = this;
        options = options || {};
        var error = options.error;
        options.success = function(resp) {
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
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

    allocate: function(pool, options) {
      options = options || {};
      options.pool = pool;
      return this._action('allocate', options);
    },

    associate: function(server_id, fixed_address, options) {
      options = options || {};
      options.server_id = server_id;
      options.fixed_address = fixed_address;
      return this._action('associate', options);
    },

    dissasociate: function(server_id, options) {
      options = options || {};
      options.server_id = server_id;
      return this._action('dissasociate', options);
    },

    sync: function(method, model, options) {
           switch(method) {
               case "read":
                   JSTACK.Nova.getfloatingIPdetail(model.get("id"), options.success, options.error, this.getRegion());
                   break;
               case "allocate":
                   JSTACK.Nova.allocatefloatingIP(options.pool, options.success, options.error, this.getRegion());
                   break;
               case "associate":
                   JSTACK.Nova.associatefloatingIP(options.server_id, model.get("ip"), options.fixed_address, options.success, options.error, this.getRegion());
                   break;
               case "dissasociate":
                   JSTACK.Nova.disassociatefloatingIP(options.server_id, model.get("ip"), options.success, options.error, this.getRegion());
                   break;    
               case "delete":
                   JSTACK.Nova.releasefloatingIP(model.get("id"), options.success, options.error, this.getRegion());
                   break;               
           }
    }

});

var FloatingIPs = Backbone.Collection.extend({
    model: FloatingIP,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
        if (method === "read") {
            //JSTACK.Nova.getfloatingIPs(options.success, options.error, this.getRegion());
            OTHERCLOUD.API.describeBgpip(options.success,options.error);
        }
    },

    parse: function(resp) {
        var list = [];
        /*for (var index in resp.floating_ips) {
            var floating_ip = resp.floating_ips[index];
            list.push(floating_ip);
        }*/
        console.log(resp.instanceInfos);
        resp.instanceInfos.forEach(function(instance){
              instance.id = instance.id + '-' + instance.orderId + '-' + instance.orderItemId;
              console.log("------------fetched gaofangip---------------");
              console.log(instance.id);
        });
        //return list;
        return resp.instanceInfos;
    }

});

var floatingIPPool = Backbone.Model.extend({


});

var FloatingIPPools = Backbone.Collection.extend({
    model: floatingIPPool,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
        if (method === "read") {
            JSTACK.Nova.getfloatingIPpools(options.success, options.error, this.getRegion());
        }
    },

    parse: function(resp) {
        var list = [];
        for (var index in resp.floating_ip_pools) {
            var floating_ip_pool = resp.floating_ip_pools[index];
            list.push(floating_ip_pool);
        }
        return list;
    }

});
var GaoFangIP = Backbone.Model.extend({

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    _action:function(method, options) {
        var model = this;
        options = options || {};
        var error = options.error;
        options.success = function(resp) {
          console.log("Success");
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
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

    createSecurityGroupRule: function(ip_protocol, from_port, to_port, cidr, group_id, parent_group_id, options) {
        options = options || {};
        options.ip_protocol = ip_protocol;
        options.from_port = from_port;
        options.to_port = to_port;
        options.cidr = cidr;
        options.group_id = group_id;
        options.parent_group_id = parent_group_id;
        return this._action('createSecurityGroupRule', options);
    },

    deleteSecurityGroupRule: function(sec_group_rule_id, options) {
        console.log("Delete security group rule");
        options = options || {};
        options.secGroupRuleId = sec_group_rule_id;
        return this._action('deleteSecurityGroupRule', options);
    },

    getSecurityGroupforServer: function(server_id, options) {
        console.log("Get security groups for server");
        options = options || {};
        options.serverId = server_id;
        return this._action('getSecurityGroupforServer', options);
    },

    sync: function(method, model, options) {
           switch(method) {
               case "read":
            //       JSTACK.Nova.getsecuritygroupdetail(model.get("id"), options.success, options.error, this.getRegion());
                   break;
               case "delete":
              //     JSTACK.Nova.deletesecuritygroup(model.get("id"), options.success, options.error, this.getRegion());
                   break;
               case "create":
               console.log("Creating, ", options.success);
              //     JSTACK.Nova.createsecuritygroup( model.get("name"), model.get("description"), options.success, options.error, this.getRegion());
                   break;
               case "createSecurityGroupRule":
               //console.log(options.ip_protocol, options.from_port, options.to_port, options.cidr, options.group_id, options.parent_group_id);
              //     JSTACK.Nova.createsecuritygrouprule(options.ip_protocol, options.from_port, options.to_port, options.cidr, options.group_id, options.parent_group_id, options.success, options.error, this.getRegion());
                   break;
                case "deleteSecurityGroupRule":
              //     JSTACK.Nova.deletesecuritygrouprule(options.secGroupRuleId, options.success, options.error, this.getRegion());
                   break;
                case "getSecurityGroupforServer":
                    mySuccess = function(object) {
                        var obj = {};
                        obj.object = object;
                        return options.success(obj);
                    };
                //   JSTACK.Nova.getsecuritygroupforserver(options.serverId, mySuccess, options.error, this.getRegion());
                   break;
           }
    },

    parse: function(resp) {
        if (resp.security_group !== undefined) {
            return resp.security_group;
        } else {
            return resp;
        }
    }
});

var GaoFangIPs = Backbone.Collection.extend({
    model: GaoFangIP,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
        if(method === "read") {
           // JSTACK.Nova.getsecuritygrouplist(options.success, options.error, this.getRegion());
        }
    },

    parse: function(resp) {
        return resp.security_groups;
    }

});


var GFIPInfoModel = Backbone.Model.extend({

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    _action:function(method, options) {
        var model = this;
        options = options || {};
        var error = options.error;
        options.success = function(resp) {
            console.log("Success");
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
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

    createSecurityGroupRule: function(ip_protocol, from_port, to_port, cidr, group_id, parent_group_id, options) {
        options = options || {};
        options.ip_protocol = ip_protocol;
        options.from_port = from_port;
        options.to_port = to_port;
        options.cidr = cidr;
        options.group_id = group_id;
        options.parent_group_id = parent_group_id;
        return this._action('createSecurityGroupRule', options);
    },

    deleteSecurityGroupRule: function(sec_group_rule_id, options) {
        console.log("Delete security group rule");
        options = options || {};
        options.secGroupRuleId = sec_group_rule_id;
        return this._action('deleteSecurityGroupRule', options);
    },

    getSecurityGroupforServer: function(server_id, options) {
        console.log("Get security groups for server");
        options = options || {};
        options.serverId = server_id;
        return this._action('getSecurityGroupforServer', options);
    },

    sync: function(method, model, options) {
        switch(method) {
            case "read":
                //       JSTACK.Nova.getsecuritygroupdetail(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "delete":
                //     JSTACK.Nova.deletesecuritygroup(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "create":
                console.log("Creating, ", options.success);
                //     JSTACK.Nova.createsecuritygroup( model.get("name"), model.get("description"), options.success, options.error, this.getRegion());
                break;
            case "createSecurityGroupRule":
                //console.log(options.ip_protocol, options.from_port, options.to_port, options.cidr, options.group_id, options.parent_group_id);
                //     JSTACK.Nova.createsecuritygrouprule(options.ip_protocol, options.from_port, options.to_port, options.cidr, options.group_id, options.parent_group_id, options.success, options.error, this.getRegion());
                break;
            case "deleteSecurityGroupRule":
                //     JSTACK.Nova.deletesecuritygrouprule(options.secGroupRuleId, options.success, options.error, this.getRegion());
                break;
            case "getSecurityGroupforServer":
                mySuccess = function(object) {
                    var obj = {};
                    obj.object = object;
                    return options.success(obj);
                };
                //   JSTACK.Nova.getsecuritygroupforserver(options.serverId, mySuccess, options.error, this.getRegion());
                break;
        }
    },

    parse: function(resp) {
        if (resp.security_group !== undefined) {
            return resp.security_group;
        } else {
            return resp;
        }
    }
});

var GFIPInfoModels = Backbone.Collection.extend({
    model: GFIPInfoModel,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
        if(method === "read") {
            // JSTACK.Nova.getsecuritygrouplist(options.success, options.error, this.getRegion());
        }
    },

    parse: function(resp) {
        return resp.security_groups;
    }

});


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

    getDetailInfo: function(id,obj){
      var options =  options || {};
      options.id = id;
      options.obj = obj;
      this._action("detail",options);
    },

    updateInfo: function(context,obj){
        var options = options || {};
        options.context = context;
        options.obj = obj;
        this._action("update",options);
    },

    sync: function(method, model, options) {
        switch(method) {
            case "detail":
                OTHERCLOUD.API.getGFIPInfo(model, options.success, options.error,options, this.getRegion());
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

        var options = {};
        options.getGFRegionName = this.getGFRegionName;
        options.getGFStatusName = this.getGFStatusName;
        options.getTransTargetName = this.getTransTargetName;
        resp.gfips.forEach(function(instance){
           instance.GFRegionName = options.getGFRegionName(instance.region);
           instance.GFStatusName = options.getGFStatusName(instance.status);
           instance.TransTargetName = options.getTransTargetName(instance.transTarget);
        });
        return resp.gfips;

    },

    getGFRegionName:function(region){
        var name = "";
        switch(region){
            case "sh":
                name = "上海";
                break;
            case "bj":
                name = "北京";
                break;
            case "gz":
                name = "广州";
                break;
        }
        return name;
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


var GFIPRuleModel = Backbone.Model.extend({

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    _action:function(method, options) {
        var model = this;
        options = options || {};
        var error = options.error;
        options.success = function(resp) {
            console.log("Success");
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
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

    createSecurityGroupRule: function(ip_protocol, from_port, to_port, cidr, group_id, parent_group_id, options) {
        options = options || {};
        options.ip_protocol = ip_protocol;
        options.from_port = from_port;
        options.to_port = to_port;
        options.cidr = cidr;
        options.group_id = group_id;
        options.parent_group_id = parent_group_id;
        return this._action('createSecurityGroupRule', options);
    },

    deleteSecurityGroupRule: function(sec_group_rule_id, options) {
        console.log("Delete security group rule");
        options = options || {};
        options.secGroupRuleId = sec_group_rule_id;
        return this._action('deleteSecurityGroupRule', options);
    },

    getSecurityGroupforServer: function(server_id, options) {
        console.log("Get security groups for server");
        options = options || {};
        options.serverId = server_id;
        return this._action('getSecurityGroupforServer', options);
    },

    sync: function(method, model, options) {
        switch(method) {
            case "read":
                //       JSTACK.Nova.getsecuritygroupdetail(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "delete":
                //     JSTACK.Nova.deletesecuritygroup(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "create":
                console.log("Creating, ", options.success);
                //     JSTACK.Nova.createsecuritygroup( model.get("name"), model.get("description"), options.success, options.error, this.getRegion());
                break;
            case "createSecurityGroupRule":
                //console.log(options.ip_protocol, options.from_port, options.to_port, options.cidr, options.group_id, options.parent_group_id);
                //     JSTACK.Nova.createsecuritygrouprule(options.ip_protocol, options.from_port, options.to_port, options.cidr, options.group_id, options.parent_group_id, options.success, options.error, this.getRegion());
                break;
            case "deleteSecurityGroupRule":
                //     JSTACK.Nova.deletesecuritygrouprule(options.secGroupRuleId, options.success, options.error, this.getRegion());
                break;
            case "getSecurityGroupforServer":
                mySuccess = function(object) {
                    var obj = {};
                    obj.object = object;
                    return options.success(obj);
                };
                //   JSTACK.Nova.getsecuritygroupforserver(options.serverId, mySuccess, options.error, this.getRegion());
                break;
        }
    },

    parse: function(resp) {
        if (resp.security_group !== undefined) {
            return resp.security_group;
        } else {
            return resp;
        }
    }
});

var GFIPRuleModels = Backbone.Collection.extend({
    model: GFIPRuleModel,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    getRuleList:function(parent_id,obj){
        var options = options || {};
        options.parent_id = parent_id;
        options.obj = obj;
        return this._action('getList', options);
    },

    delRule:function(ruleId,obj){
        var options = options || {};
        options.ruleId = ruleId;
        options.obj = obj;
        return this._action('delRule', options);
    },

    addRule:function(context,obj){
        var options = options || {};
        options.context = context;
        options.obj = obj;
        return this._action('addRule', options);
    },

    _action:function(method, options) {
        var model = this;
        options = options || {};
        var error = options.error;
        options.parse = this.parse;
        options.success = function(resp) {
            options.obj.model.reset();
            options.obj.model.set(options.parse(resp));
            options.obj.proRender();
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

    sync: function(method, model, options) {
        switch(method) {
            case "read":
            break;
            case "getList":
                OTHERCLOUD.API.getRuleList(model, options.success, options.error, options,this.getRegion());
            break;
            case "delRule":
                OTHERCLOUD.API.delRule(model, options.success, options.error, options,this.getRegion());
            break;
            case "addRule":
                OTHERCLOUD.API.addRule(model, options.success, options.error, options,this.getRegion());
            break;
        }

    },

    parse: function(resp) {
        resp.gfipRules.forEach(function(instance){
            instance.operate = "<button id=\'delRule\' class=\'btn btn-blue pull-right\' attrId='"+instance.id+"'>删除规则</button>";
        });
        return resp.gfipRules;
    }

});

var ImageVM = Backbone.Model.extend({

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
           switch(method) {
               case "read":
                   JSTACK.Glance.getimagedetail(model.get("id"), options.success, options.error, this.getRegion());
                   break;
               case "delete":
                   JSTACK.Nova.deleteimage(model.get("id"), options.success, options.error, this.getRegion());
                   break;
               case "update":
                    JSTACK.Glance.updateimage(model.get("id"), model.get("name"), model.get("visibility"), undefined, options.success, options.error, this.getRegion());
                    break;
           }
   },

   parse: function(resp) {
        if (resp.image !== undefined) {
            return resp.image;
        } else {
            return resp;
        }
    }
});

var Images = Backbone.Collection.extend({
    model: ImageVM,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
        if (method === "read") {
//            JSTACK.Glance.getimagelist(true, options.success, options.error, this.getRegion());
        }
    },

    parse: function(resp) {
        return resp.images;
    }

});

var Instance = Backbone.Model.extend({

    _action:function(method, options) {
        var model = this;
        options = options || {};
        var error = options.error;
        options.success = function(resp) {
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
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

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    createsnapshot: function(options) {
        return this._action('snapshot', options);
    },

    stopserver: function(options) {
        return this._action('stop', options);
    },

    startserver: function(options) {
        return this._action('start', options);
    },

    pauseserver: function(options) {
        return this._action('pause', options);
    },

    unpauseserver: function(options) {
        return this._action('unpause', options);
    },

    suspendserver: function(options) {
        return this._action('suspend', options);
    },

    resumeserver: function(options) {
        return this._action('resume', options);
    },

    reboot: function(soft, options) {
        options = options || {};

        options.soft = soft;
        return this._action("reboot", options);
    },

    resize: function(flavor, options) {
        options = options || {};
        options.flavor = flavor;
        return this._action('resize', options);
    },

    confirmresize: function(options) {
        return this._action('confirm-resize', options);
    },

    revertresize: function(options) {
        return this._action('revert-resize', options);
    },

    changepassword: function(adminPass, options) {
        options = options || {};
        options.adminPass = adminPass;
        return this._action('change-password', options);
    },

    createimage: function(name, options) {
        options = options || {};
        options.name = name;
        return this._action('create-image', options);
    },

    vncconsole: function(options) {
        return this._action('get-vncconsole', options);
    },

    consoleoutput: function(options) {
        if (options === undefined) {
            options = {};
        }
        if (options.length === undefined) {
            options.length = 35;
        }
        return this._action('consoleoutput', options);
    },

    attachvolume: function(options) {
        if (options === undefined) {
            options = {};
        }
        return this._action('attachvolume', options);
    },

    detachvolume: function(options) {
        if (options === undefined) {
            options = {};
        }
        return this._action('detachvolume', options);
    },

    attachedvolumes: function(options) {
        if (options === undefined) {
            options = {};
        }
        return this._action('attachedvolumes', options);
    },

    getsecuritygroup: function(options) {
        if (options === undefined) {
            options = {};
        }
        return this._action('getsecuritygroup', options);
    },

    getMonitoringStats: function(options) {
        if (options === undefined) {
            options = {};
        }
        return this._action('getMonitoringStats', options);
    },

    getHistoricMonitoringStats: function(options) {
        if (options === undefined) {
            options = {};
        }
        return this._action('getHistoricMonitoringStats', options);
    },

    sync: function(method, model, options) {
        switch(method) {
            case "create":
                JSTACK.Nova.createserver(model.get("name"), model.get("image_id"), model.get("flavor"), model.get("keypair"),
                   model.get("user_data"), model.get("groups"), model.get("min_count"), model.get("max_count"),
                   model.get("availability_zone"), model.get("networks"), model.get("block_device_mapping"), model.get("metadata"), options.success, options.error, this.getRegion());
                break;
            case "delete":
                JSTACK.Nova.deleteserver(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "update":
                JSTACK.Nova.updateserver(model.get("id"), model.get("name"), options.success, options.error, this.getRegion());
                break;
            case "read":
                JSTACK.Nova.getserverdetail(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "reboot":
                OTHERCLOUD.API.rebootQcloudIns(model.get("unInstanceId"),options.success,options.error);
                break;
            case "resize":
                JSTACK.Nova.resizeserver(model.get("id"), options.flavor.id, options.success, options.error, this.getRegion());
                break;
            case "confirm-resize":
                JSTACK.Nova.confirmresizedserver(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "revert-resize":
                JSTACK.Nova.revertresizedserver(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "stop":
                OTHERCLOUD.API.stopQcloudIns(model.get("unInstanceId"),options.success,options.error);
                break;
            case "start":
                OTHERCLOUD.API.startQcloudIns(model.get("unInstanceId"),options.success,options.error);
                break;
            case "pause":
                JSTACK.Nova.pauseserver(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "unpause":
                JSTACK.Nova.unpauseserver(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "suspend":
                JSTACK.Nova.suspendserver(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "resume":
                JSTACK.Nova.resumeserver(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "change-password":
                JSTACK.Nova.changepasswordserver(model.get("id"), options.adminPass, options.success, options.error, this.getRegion());
                break;
            case "create-image":
                JSTACK.Nova.createimage(model.get("id"), options.name, undefined, options.success, options.error, this.getRegion());
                break;
            case "get-vncconsole":
                JSTACK.Nova.getvncconsole(model.get("id"), "novnc", options.success, options.error, this.getRegion());
                break;
            case "consoleoutput":
                JSTACK.Nova.getconsoleoutput(model.get("id"), options.length, options.success, options.error, this.getRegion());
                break;
            case "attachvolume":
                JSTACK.Nova.attachvolume(model.get("id"), options.volume_id, options.device, options.success, options.error, this.getRegion());
                break;
            case "detachvolume":
                JSTACK.Nova.detachvolume(model.get("id"), options.volume_id, options.success, options.error, this.getRegion());
                break;
            case "attachedvolumes":
                JSTACK.Nova.getattachedvolumes(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "getsecuritygroup":
                JSTACK.Nova.getsecuritygroupforserver(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "getMonitoringStats":
                // var ip;
                // if (JSTACK.Keystone.getendpoint(UTILS.Auth.getCurrentRegion(), "network") !== undefined) {
                //     if (model.get("addresses") != null) {
                //         var ips = model.get("addresses")[Object.keys(model.get("addresses"))[0]];
                //         for (var p in ips) {
                //             if (ips[p]['OS-EXT-IPS:type'] === 'floating') {
                //                 ip = ips[p].addr;
                //             }
                //         }
                //     }
                // } else {
                //     if ((model.get("addresses") != null) && (model.get("addresses")["public"] !== null || model.get("addresses")["private"] !== null)) {
                //         ip = model.get("addresses")["public"][0];
                //     }
                // }
                Monitoring.API.getVMmeasures(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "getHistoricMonitoringStats":
                Monitoring.API.getHistoricVMmeasures(model.get("id"), options.success, options.error, this.getRegion());
                break;
        }
    },

    parse: function(resp) {
        if (resp.server !== undefined) {
            return resp.server;
        } else {
            console.log("return message");
            console.log(resp);
            return resp;
        }
    }
});

var Instances = Backbone.Collection.extend({

    model: Instance,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
        if (method === "read") {
            OTHERCLOUD.API.describeQcloudIns(options.success,options.error);
        }
    },

    parse: function(resp) {
        resp.instanceInfos.forEach(function(instance){
              instance.id = instance.orderId + '-' + instance.orderItemId + '-' + instance.unInstanceId;
        });
        return resp.instanceInfos;
    }

});

var InstanceSnapshot = Backbone.Model.extend({

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
           switch(method) {
               case "read":
                   JSTACK.Glance.getimagedetail(model.get("id"), options.success, options.error, this.getRegion());
                   break;
               case "delete":
                   JSTACK.Nova.deleteimage(model.get("id"), options.success, options.error, this.getRegion());
                   break;
               case "update":
                    JSTACK.Glance.updateimage(model.get("id"), model.get("name"), model.get("visibility"), undefined, options.success, options.error, this.getRegion());
                    break;
           }
   },

   parse: function(resp) {
        if (resp.image !== undefined) {
            return resp.image;
        } else {
            return resp;
        }
    }
});

var InstanceSnapshots = Backbone.Collection.extend({
    model: InstanceSnapshot,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
        if (method === "read") {
/*            if (JSTACK.Glance.getVersion(UTILS.Auth.getCurrentRegion()) === 2) {
              JSTACK.Glance.getimagelist(true, options.success, options.error, this.getRegion());
            } else {
              JSTACK.Nova.getimagelist(true, options.success, options.error, this.getRegion());
           }
*/        }
    },

    parse: function(resp) {
        return resp.images;
    }

});

var Keypair = Backbone.Model.extend({

    initialize: function() {
      //this.id = this.get("name");
        this.id = this.get("id");
    },

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },
    destroy: function(options) {
        return this._action('delete', options);
    },

    _action:function(method, options) {
        var model = this;
        options = options || {};
        var error = options.error;
        options.success = function(resp) {
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
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

    sync: function(method, model, options) {
           switch(method) {
               case "create":
                   //JSTACK.Nova.createkeypair(model.get("name"), model.get("public_key"), options.success, options.error, this.getRegion());
                   console.log('create keypair:' + model.get("name") + '/' + model.get("public_key"));
                   OTHERCLOUD.API.createQcloudKeypair(model.get("name"),'bj',model.get("public_key"),options.success, options.error);
                   break;
               case "delete":
                   //JSTACK.Nova.deletekeypair(model.get("name"), options.success, options.error, this.getRegion());
                   OTHERCLOUD.API.delQcloudKeypair(model.get("instanceId"),model.get("region"),options.success, options.error);
                   break;
           }
   }


});

var Keypairs = Backbone.Collection.extend({
    model: Keypair,
    
    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
        if (method === "read") {
            //JSTACK.Nova.getkeypairlist(options.success, options.error, this.getRegion());
            OTHERCLOUD.API.describeQcloudKeypair(options.success, options.error)
        }
    },

    parse: function(resp) {
        resp.instanceInfos.forEach(function (keypair) {
            keypair.id = keypair.orderId + '-' + keypair.orderItemId + '-' + keypair.instanceId;
        });

        console.log(resp.instanceInfos);
        return resp.instanceInfos;
    }
});
var LoginStatus = Backbone.Model.extend({

    defaults: {
        loggedIn: false,
        username: null,
        password: null,
        access_token: '',
        error_msg: null,
        token: '',
        tenant: undefined,
        tenant_id: undefined,
        tenants: undefined,
        expired: true,
        current_region: undefined,
        regions: undefined
    },

    initialize: function () {

        var self = this;
        if (!UTILS.Auth.isIDM()) {
            this.bind('credentials', this.onCredentialsChange, this);
            this.bind('change:token', this.onTokenChange, this);
            this.set({'token-ts': localStorage.getItem('token-ts')});
            this.set({'tenant-id': localStorage.getItem('tenant-id')});
            this.set({'token': localStorage.getItem('token')});
            this.bind('error', this.onValidateError, this);
        } else {
            this.bind('change:access_token', this.onAccessTokenChange, this);
            this.bind('error', this.onValidateError, this);

            var regex = new RegExp("[\\#&]token=([^&#]*)");
            var token = regex.exec(location.hash);

            if (token !== null) {
                var regex1 = new RegExp("[\\&]expires=([^&#]*)");
                var expires = regex1.exec(location.hash);
                console.log('URL', token[1], expires[1]);

                if (localStorage.getItem('tenant_id')) {
                    console.log('TENANT localStorage: ', localStorage.getItem('tenant_id'));
                    self.set({tenant_id: localStorage.getItem('tenant_id')});
                }
                self.setAccessToken(token[1], expires[1]);
                

            } else {
                UTILS.Auth.goAuth();
            }
        }

        

        if (localStorage.getItem('current_region')) {
            this.set({'current_region': localStorage.getItem('current_region')});
            UTILS.Auth.switchRegion(this.get('current_region'));       
        }
    },

    onValidateError: function (model, error) {
        model.set({error_msg: "Username and password are mandatory."});
        model.trigger('auth-error', error.msg);
    },

    onCredentialsChange: function (model, password) {
        var self = this;
        if (self.get("username") !== '' && self.get("password") !== '') {
            UTILS.Auth.authenticateWithCredentials(self.get("username"), self.get("password"), undefined, undefined, function() {
                console.log("Authenticated with credentials");
                self.setToken();
                self.set({username: UTILS.Auth.getName(), tenant: UTILS.Auth.getCurrentTenant()});
                console.log("Tenant: ", self.get('tenant').name);
                UTILS.Auth.getTenants(function(tenants) {
                    self.set({tenants: tenants.tenants});
                    self.set({'loggedIn': true});
                });
                self.updateRegions();
            }, function(msg) {
                self.set({'error_msg': msg});
                self.trigger('auth-error', msg);
            });
        } else {
            var msg = "Username and password are mandatory.";
            self.set({'error_msg': msg});
            self.trigger('auth-error', msg);
        }
    },

    onTokenChange: function (context, token) {
        var self = context;
        if (!UTILS.Auth.isAuthenticated() && token !== '' && (new Date().getTime()) < self.get('token-ts') + 24*60*60*1000 ) {
            UTILS.Auth.authenticateWithCredentials(undefined, undefined, this.get('tenant-id'), token, function() {
                console.log("Authenticated with token: ", + 24*60*60*1000-(new Date().getTime())-self.get('token-ts'));
                self.set({username: UTILS.Auth.getName(), tenant: UTILS.Auth.getCurrentTenant()});
                console.log("New tenant: " + self.attributes.tenant.name);
                self.set({'tenant': self.attributes.tenant});
                //console.log("New tenant: " + self.get("name"));
                UTILS.Auth.getTenants(function(tenants) {
                    self.set({tenants: tenants.tenants});
                    self.set({'loggedIn': true});
                });
                self.updateRegions();

            }, function(msg) {
                console.log("Error authenticating with token");
                self.set({'expired': true});
                self.trigger('auth-needed', "");
                self.set({'loggedIn': false});
                self.trigger('auth-error', "");
            });
        } else {
            console.log("Not logged In");
            self.set({'expired': true});
            self.trigger('auth-needed', "");
            self.set({'loggedIn': false});
        }
    },

    onAccessTokenChange: function (context, access_token) {
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAaa");
        var self = context;
        if (!UTILS.Auth.isAuthenticated() && access_token !== '' && (new Date().getTime()) < self.get('token-ts') + self.get('token-ex')) {
            console.log('Auth with ', this.get('tenant_id'), access_token); 
            console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB");
            console.log(this.get('tenant_id'));
            console.log("CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCc");
            UTILS.Auth.authenticate(this.get('tenant_id'), access_token, function(tenant) {
                console.log("Authenticated with token: ", + self.get('token-ex') - (new Date().getTime())-self.get('token-ts'));
                //console.log("New tenant: " + self.attributes.tenant.name);
                //self.set({'tenant': self.attributes.tenant});
                //console.log("New tenant: " + self.get("name"));
                self.set({username: UTILS.Auth.getName()});
                UTILS.Auth.checkGravatar(function (gravatar) {
                    if (gravatar) {
                        self.set({gravatar: md5(UTILS.Auth.getName())});
                    }
                });
                UTILS.Auth.getTenants(function(tenants) {
                    self.set({tenant_id: tenant.id});
                    self.set({tenants: tenants.tenants});
                    self.set({'loggedIn': true});
                    localStorage.setItem('tenant_id', tenant.id);
                    localStorage.setItem('tenant-id', tenant.id);
        //            localStorage.setItem('tenant-id', "02406a83814b45d28f69f70ad5edca7a");
                    var subview = new MessagesView({state: "Info", title: "Connected to project " + tenant.name + " (ID " + tenant.id + ")"});
        //            var subview = new MessagesView({state: "Info", title: "Connected to project " + "xxx" + " (ID " + "02406a83814b45d28f69f70ad5edca7a" + ")"});
                    subview.render();
                });
      //          self.updateRegions();
            }, function(msg) {
                if (msg === -1) {
                    window.location.href = '#not_auth';
                    console.log("Error authenticating ... no tenants");
                } else {
                    console.log("Error authenticating with token");
                    UTILS.Auth.logout();
                }
                    
            });
        } else {
            console.log("Not logged In");
            UTILS.Auth.logout();
        }
    },

    setToken: function() {
        if (localStorage.getItem('token') !== UTILS.Auth.getToken()) {
            localStorage.setItem('token-ts', new Date().getTime());
            localStorage.setItem('tenant-id', UTILS.Auth.getCurrentTenant().id);
        }
        localStorage.setItem('token', UTILS.Auth.getToken());
        this.set({'token': UTILS.Auth.getToken()});
    },

    setAccessToken: function(access_token, expires) {
        console.log('setToken', access_token, expires*1000);
        this.set({'token-ts': new Date().getTime()});
        this.set({'token-ex': expires*1000});
        this.set({'access_token': access_token});

    },

    isAdmin: function() {
        return UTILS.Auth.isAdmin();
    },

    removeToken: function() {
        this.set({'access_token': ''});
    },

    setCredentials: function(username, password) {
        console.log("Setting credentials");
        this.set({'username': username, 'password': password, 'error_msg':undefined});
        this.trigger('credentials', this);
    },

    switchTenant: function(tenantID) {
        var self = this;
        console.log("Tenant: " + tenantID);
        if (!UTILS.Auth.isIDM()) {
            console.log("Old tenant ", UTILS.Auth.getCurrentTenant().id);
            UTILS.Auth.switchTenant(tenantID, UTILS.Auth.getToken(), function(resp) {
                console.log("Updated to ", UTILS.Auth.getCurrentTenant().id);
                self.set({username: UTILS.Auth.getName(), tenant: UTILS.Auth.getCurrentTenant(), tenant_id: UTILS.Auth.getCurrentTenant().id});
                localStorage.setItem('token', UTILS.Auth.getToken());
                localStorage.setItem('tenant-id', UTILS.Auth.getCurrentTenant().id);
                localStorage.setItem('tenant_id', UTILS.Auth.getCurrentTenant().id);
                self.trigger('switch-tenant');
                var subview = new MessagesView({state: "Info", title: "Connected to project " + UTILS.Auth.getCurrentTenant().name + " (ID " + UTILS.Auth.getCurrentTenant().id + ")"});
                subview.render();
            });
        } else {
            UTILS.Auth.switchTenant(tenantID, this.get('access_token'), function(tenant) {
                self.set({username: UTILS.Auth.getName(), tenant_id: tenant.id});
                localStorage.setItem('tenant_id', tenant.id);
                localStorage.setItem('tenant-id', tenant.id);
                self.updateRegions();
                self.trigger('switch-tenant');
                var subview = new MessagesView({state: "Info", title: "Connected to project " + tenant.name + " (ID " + tenant.id + ")"});
                subview.render();
            });
        }
    },

    switchRegion: function(regionId) {
        UTILS.Auth.switchRegion(regionId);
      
        this.set('current_region', regionId);
        localStorage.setItem('current_region', regionId);
        this.trigger('switch-region');
        var subview = new MessagesView({state: "Info", title: "Switched to region " + regionId});
        subview.render();
    },

    updateRegions: function() {

        UTILS.Auth.updateRegionsStatus();

        this.set('regions', UTILS.Auth.getRegions());
        if (this.get('current_region') === undefined || this.get('regions').indexOf(this.get('current_region')) === -1) {
            this.switchRegion(this.get('regions')[0]);
        }
    },

    clearAll: function() {
        if (!UTILS.Auth.isIDM()) {
            localStorage.setItem('token', '');    
        } else {
            localStorage.removeItem('tenant_id');
            document.cookie = 'oauth_token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
        localStorage.removeItem('current_region');
        this.set(this.defaults);
    }

});

// var BPInstance = Backbone.Model.extend({

//     region: undefined,

//     getRegion: function() {
//         if (this.region) {
//             return this.region;
//         }
//         return UTILS.Auth.getCurrentRegion();
//     },

//     _action:function(method, options) {
//         var model = this;
//         options = options || {};
//         var error = options.error;
//         options.success = function(resp) {
//             model.trigger('sync', model, resp, options);
//             if (options.callback!==undefined) {
//                 options.callback(resp);
//             }
//         };
//         options.error = function(resp) {
//             model.trigger('error', model, resp, options);
//             if (error!==undefined) {
//                 error(model, resp);
//             }
//         };
//         var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
//         return xhr;
//     },

//     addVMToTier: function(options) {
//         this._action("addVM", options);
//     },

//     removeVMFromTier: function(options) {
//         this._action("removeVM", options);
//     },

//     sync: function(method, model, options) {
//         switch(method) {
//             case "addVM":
//                 JSTACK.Murano.addVMToTier(model.get('blueprintName'), options.tier, options.success, options.error, this.getRegion());
//                 break;
//             case "removeVM":
//                 JSTACK.Murano.removeVMFromTier(model.get('blueprintName'), options.instance_name, options.success, options.error, this.getRegion());
//                 break;
//             case "read":
//                 JSTACK.Murano.getBlueprintInstance(model.get('blueprintName'), options.success, options.error, this.getRegion());
//                 break;
//             case "create":
//                 JSTACK.Murano.launchBlueprintInstance(model.get('environmentDto').id, model.get('blueprintName'), options.success, options.error, this.getRegion());
//                 break;
//             case "delete":
//                 JSTACK.Murano.stopBlueprintInstance(model.id, options.success, options.error, this.getRegion());
//                 break;
//             case "update":

//                 break;

//         }
//     },

//     parse: function(resp) {
//         // if (resp) {
//         //     resp.id = resp.blueprintName;
//         //     resp.name = resp.environmentInstanceName;
//         // }
//         return resp;
//     }
// });

// var BPInstances = Backbone.Collection.extend({

//     region: undefined,

//     getRegion: function() {
//         if (this.region) {
//             return this.region;
//         }
//         return UTILS.Auth.getCurrentRegion();
//     },

//     model: BPInstance,

//     _action: function(method, options) {
//         var model = this;
//         options = options || {};
//         options.success = function(resp) {
//             model.trigger('sync', model, resp, options);
//             if (options.callback!==undefined) {
//                 options.callback(resp);
//             }
//         };
//         var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
//         return xhr;
//     },

//     // getCatalogueProductDetails: function(options) {
//     //     options = options || {};
//     //     return this._action('getCatalogueProductDetails', options);
//     // },

//     getTask: function(options) {
//         options = options || {};
//         return this._action('getTask', options);
//     },

//     sync: function(method, model, options) {
//         switch(method) {
//             case "read":
//                 JSTACK.Murano.getBlueprintInstanceList(options.success, options.error, this.getRegion());
//                 break;
//             case 'getTask':
//                 //JSTACK.Murano.getTask(options.taskId, function (resp) {
//                     var message = 'Blueprint Instance ' + model.models[0].get('name') + ' status.';
//                     message += '<br><br>Status: ' + model.models[0].get('status');
//                     // if (resp.error) {
//                     //     message += '<br><br>Error: ' + resp.error._message;
//                     // }
//                     options.success(message);

//                 //}, options.error, this.getRegion());
//                 break;
//             case 'getCatalogueProductDetails':
//                 // ServiceDC.API.getProductAttributes(options.id, options.success, options.error, this.getRegion());
//                 break;
//         }
//     },

//     parse: function(resp) {
//         return resp;
//     }
// });

// var SoftwareCatalog = Backbone.Model.extend({

//     region: undefined,

//     getRegion: function() {
//         if (this.region) {
//             return this.region;
//         }
//         return UTILS.Auth.getCurrentRegion();
//     },

//     _action:function(method, options) {
//         var model = this;
//         options = options || {};
//         var error = options.error;
//         options.success = function(resp) {
//             model.trigger('sync', model, resp, options);
//             if (options.callback!==undefined) {
//                 options.callback(resp);
//             }
//         };
//         options.error = function(resp) {
//             model.trigger('error', model, resp, options);
//             if (error!==undefined) {
//                 error(model, resp);
//             }
//         };
//         var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
//         return xhr;
//     },

//     sync: function(method, model, options) {
//         switch(method) {
//             case "read":
//              options.success();
//      //            JSTACK.Murano.getPackage(model.id, function (result) {
//      //options.success(result);
//      //            }, options.error, this.getRegion());
//                 break;
//             case "create":
//                 ServiceDC.API.addRecipe(model.get('name'), model.get('version'), 
//                     model.get('repo'), model.get('url'), model.get('config_management'), 
//                     model.get('operating_systems'), model.get('description'), model.get('attributes'), 
//                     model.get('tcp_ports'), model.get('udp_ports'), model.get('dependencies'), 
//                     options.success, options.error, this.getRegion());
//                 break;
//             case "delete":
                
//                 break;
//             case "update":
                
//                 break;

//         }
//     }
// });

// var SoftwareCatalogs = Backbone.Collection.extend({

//     model: SoftwareCatalog,

//     region: undefined,

//     getRegion: function() {
//         if (this.region) {
//             return this.region;
//         }
//         return UTILS.Auth.getCurrentRegion();
//     },

//     _action: function(method, options) {
//         var model = this;
//         options = options || {};
//         options.success = function(resp) {
//             model.trigger('sync', model, resp, options);
//             if (options.callback!==undefined) {
//                 options.callback(resp);
//             }
//         };
//         var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
//         return xhr;
//     },

//     sync: function(method, model, options) {
//         switch(method) {
//             case 'read':
//                 JSTACK.Murano.getPackages(function(packages) {
//                     for (var p in packages) {
//                         var attributes = [];
//                         for (var t in packages[p].tags) {
//                             if (packages[p].tags[t].split('attributes=').length > 1) {
//                                 var attr = packages[p].tags[t].split('attributes=')[1].split(';');
//                                 for (var a = 0; a < attr.length - 1; a++) {
//                                     var at = {};
//                                     at.key = attr[a].split(':')[0];
//                                     at.value = attr[a].split(':')[1];
//                                     at.description = '';
//                                     attributes.push(at);
//                                 }

//                             }
//                         }
//                         packages[p].attributes_asArray = attributes;
//                     }
//                     options.success(packages);
//                 }, options.error, this.getRegion());
//                 break;
//             case 'create':
//                 break;
//         }
//     },

//     parse: function(resp) {
//         return resp;
//     }
// });
// var BPTemplate = Backbone.Model.extend({

//     region: undefined,

//     getRegion: function() {
//         if (this.region) {
//             return this.region;
//         }
//         return UTILS.Auth.getCurrentRegion();
//     },

//     _action:function(method, options) {
//         var model = this;
//         options = options || {};
//         var error = options.error;
//         options.success = function(resp) {
//             model.trigger('sync', model, resp, options);
//             if (options.callback!==undefined) {
//                 options.callback(resp);
//             }
//         };
//         options.error = function(resp) {
//             model.trigger('error', model, resp, options);
//             if (error!==undefined) {
//                 error(model, resp);
//             }
//         };
//         var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
//         return xhr;
//     },

//     addTier: function(options) {
//         options = options || {};
//         return this._action('addTier', options);
//     },

//     updateTier: function(options) {
//         options = options || {};
//         return this._action('updateTier', options);
//     },

//     deleteTier: function(options) {
//         options = options || {};
//         return this._action('deleteTier', options);
//     },

//     sync: function(method, model, options) {
//         switch(method) {
//             case "read":
//                  JSTACK.Murano.getTemplate(model.id, function(result) {

//                  result.tierDtos_asArray = [];

//                  for (var s in result.services) {
//                         // new tier
//                         if (typeof(result.services[s].instance) !== 'string') {

//                             var inst = result.services[s].instance['?'];
                            
//                             var tier = {
//                                 id: inst.id,
//                                 name: result.services[s].instance.flavor,
//                                 flavour: result.services[s].instance.flavor,
//                                 image: result.services[s].instance.image,
//                                 keypair: result.services[s].instance.keypair,
//                                 productReleaseDtos_asArray: [{productName: result.services[s].name, version: ''}]

//                             };
//                             result.tierDtos_asArray.push(tier);
//                         }
//                  }

//                     for (var s1 in result.services) {
//                         // product of already registered tier
//                         if (typeof(result.services[s1].instance) === 'string') {
//                             for (var t in result.tierDtos_asArray) {
//                                 if (result.tierDtos_asArray[t].id === result.services[s1].instance) {
//                                     var prod = {productName: result.services[s1].name, version: ''};
//                                     result.tierDtos_asArray[t].productReleaseDtos_asArray.push(prod);
//                                 }
//                             }
//                         }
//                     }

//                      options.success(result);

//                  }, options.error, this.getRegion());

//                 break;
//             case "create":
//                 JSTACK.Murano.createTemplate(model.toJSON().name, options.success, options.error, this.getRegion());
//                 break;
//             case "delete":
//                 JSTACK.Murano.deleteTemplate(model.id, options.success, options.error, this.getRegion());
//                 break;
//             case "update":
//                 break;
//             case "addTier":


//                 var tier = options.tier;
//                 var instance_id = JSTACK.Utils.guid();

//                 var instance = {
//                     "flavor": tier.flavour, 
//                     "keypair": tier.keypair, 
//                     "image": tier.image, 
//                     "?": {
//                         "type": "io.murano.resources.ConfLangInstance",         
//                         "id":  instance_id
//                     }, 
//                     "name": tier.name
//                 };

//                 if (tier.networkDto) {
//                     instance.networks = {
//                         "useFlatNetwork": false, 
//                         "primaryNetwork": null, 
//                         "useEnvironmentNetwork": false, 
//                         "customNetworks": []
//                     };

//                     var net;

//                     for (var n in tier.networkDto) {
//                         if (tier.networkDto[n].networkId) {
//                             // Network exists in Openstack
//                             net = {
//                                 "internalNetworkName": tier.networkDto[n].networkName, 
//                                 "?": {
//                                     "type": "io.murano.resources.ExistingNeutronNetwork", 
//                                     "id": tier.networkDto[n].networkId
//                                 }
//                             };

//                             instance.networks.customNetworks.push(net);

//                         } else {
//                             // New network created using an alias
//                             net = {
//                                 "autoUplink": true, 
//                                 "name": tier.networkDto[n].networkName, 
//                                 "?": {
//                                     "type": "io.murano.resources.NeutronNetworkBase", 
//                                     "id": JSTACK.Utils.guid()
//                                 }, 
//                                 "autogenerateSubnet": true
//                             };

//                             instance.networks.customNetworks.push(net);
//                         }
//                     }
//                 }

//                 var services = tier.productReleaseDtos;

//                 if (services) {
//                     this.createServices(0, services, model.id, instance, instance_id, options.success, options.error);
//                 } else {
//                     options.error('No services selected');
//                 }
//                 break;
//             case "updateTier":
//                 JSTACK.Murano.updateBlueprintTemplateTier(model.id, options.tier, options.success, options.error, this.getRegion());
//                 break;
//             case "deleteTier":
//                 JSTACK.Murano.deleteBlueprintTemplateTier(model.id, options.tier, options.success, options.error, this.getRegion());
//                 break;
//         }
//     },

//     createServices: function (index, services, template_id, instance, instance_id, callback, error) {

//         var self = this;

//         if (index === services.length) {
//             callback();
//             return;
//         }

//         var inst;

//         if (index === 0) inst = instance;
//         else inst = instance_id;

//         var ser = services[index];

//         JSTACK.Murano.createService(template_id, ser.info, inst, function () {
//             self.createServices(++index, services, template_id, instance, instance_id, callback, error);
//         }, error, this.getRegion());

//     },

//     parse: function(resp) {
//         //resp.id = resp.name;
//         return resp;
//     }
// });

// var BPTemplates = Backbone.Collection.extend({

//     model: BPTemplate,

//     catalogList: {},

//     region: undefined,

//     getRegion: function() {
//         if (this.region) {
//             return this.region;
//         }
//         return UTILS.Auth.getCurrentRegion();
//     },

//     _action: function(method, options) {
//         var model = this;
//         options = options || {};
//         options.success = function(resp) {
//             model.trigger('sync', model, resp, options);
//             if (options.callback!==undefined) {
//                 options.callback(resp);
//             }
//         };
//         var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
//         return xhr;
//     },

//     getCatalogBlueprint: function(options) {
//         options = options || {};
//         return this._action('getCatalogBlueprint', options);
//     },

//     fetchCollection: function(options) {

//         var self = this;

//         JSTACK.Murano.getBlueprintCatalogList(function (resp) {
//             JSTACK.Murano.getBlueprintTemplateList(function (resp2) {
//                 self.catalogList = resp;
//                 options.success(resp2);
//             }, options.error);

//         }, options.error);
//     },

//     sync: function(method, model, options) {
//         switch(method) {
//             case "read":
//                 // BlueprintCatalogue not available yet
//                 //this.fetchCollection(options);
//                 JSTACK.Murano.getTemplateList(options.success, options.error, this.getRegion());
//                 break;
//             case 'getCatalogBlueprint':
//                 JSTACK.Murano.getBlueprintCatalog(options.id, options.success, options.error);
//                 break;
//         }
//     },

//     parse: function(resp) {
//         return resp;
//     }
// });
var NavTabModel = Backbone.Model.extend({

    defaults: {
        name: undefined,
        active: false,
        url: undefined,
        css: undefined
    }

});


var NavTabModels = Backbone.Collection.extend({
    model: NavTabModel,

    setActive: function(name) {
        for (var index in this.models) {
            var tab = this.models[index];
            if (tab.get('name') === name) {
                tab.set({'active': true});
            } else {
                tab.set({'active': false});
            }
        }
        this.trigger("change:actives", "Changes");
    },

    getActive: function() {
        for (var index in this.models) {
            var tab = this.models[index];
            if (tab.get('active')) {
                return tab.get('name');
            }
        }
    }
});
var Network = Backbone.Model.extend({

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
           switch(method) {
              case "read":
                   JSTACK.Neutron.getnetworkdetail(model.get("id"), options.success, options.error, this.getRegion());
                   break;
              case "create":
                   JSTACK.Neutron.createnetwork(model.get("name"), model.get("admin_state_up"), model.get("shared"), model.get("tenant_id"), options.success, options.error, this.getRegion());
                   break;
              case "delete":
                   JSTACK.Neutron.deletenetwork(model.get("id"), options.success, options.error, this.getRegion());
                   break;
              case "update":
                    JSTACK.Neutron.updatenetwork(model.get("id"), model.get("name"), model.get("admin_state_up"), options.success, options.error, this.getRegion());
                    break;
           }
   },

    parse: function(resp) {
      return resp;
    }
});

var Networks = Backbone.Collection.extend({
    model: Network,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
        if (method === "read") {
            JSTACK.Neutron.getnetworkslist(options.success, options.error, this.getRegion());
        }
    },

    parse: function(resp) {
        return resp;
    }

});
var Overview = Backbone.Model.extend({

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
           switch(method) {
               case "read":
                   JSTACK.Nova.getimagedetail(model.get("id"), options.success, options.error, this.getRegion());
                   break;
               case "downloadSummary":
                   JSTACK.Nova.getimagedetail(model.get("id"), options.success, options.error, this.getRegion());
                   break;
           }
   }
});

var Overviewes = Backbone.Collection.extend({
    model: Overview,
    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
        if (method === "read") {
            JSTACK.Nova.getusagesummary(true, options.success, options.error, this.getRegion());
        }
    },

    parse: function(resp) {
        return resp.overview;
    }

});
var Port = Backbone.Model.extend({

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
           switch(method) {
              case "read":
                   JSTACK.Neutron.getportdetail(model.get("id"), options.success, options.error, this.getRegion());
                   break;
              case "create":
                   JSTACK.Neutron.createport(model.get("name"), options.success, options.error, this.getRegion());
                   break;
              case "delete":
                   JSTACK.Neutron.deleteport(model.get("id"), options.success, options.error, this.getRegion());
                   break;
              case "update":
                    JSTACK.Neutron.updateport(model.get("id"), model.get("name"), model.get("admin_state_up"), options.success, options.error, this.getRegion());
                    break;
           }
   },

   parse: function(resp) {
        if (resp.networks !== undefined) {
            return resp.ports;
        } else {
            return resp;
        }
    }
});

var Ports = Backbone.Collection.extend({
    model: Port,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
        if (method === "read") {
            JSTACK.Neutron.getportslist(options.success, options.error, this.getRegion());
        }
    },

    parse: function(resp) {
        return resp.ports;
    }

});
var Project = Backbone.Model.extend({
    sync: function(method, model, options) {
           switch(method) {
               case "read":
                   //JSTACK.Keystone.gettenant(model.get("id"), options.success, options.error);
                   break;
               case "delete":
                   JSTACK.Keystone.deletetenant(model.get("id"), options.success, options.error);
                    break;
               case "create":
                   JSTACK.Keystone.createtenant(model.get("name"), model.get("description"), model.get("enabled"), options.success, options.error);
                   break;
               case "update":
                    JSTACK.Keystone.edittenant(model.get("id"), model.get("name"), model.get("description"), model.get("enabled"), options.success, options.error);
                    break;
               //case "filter":
               //    JSTACK.Keystone.filtertenant(model.get("id"), options.success, options.error);
               //    break;
           }
   }
});

var Projects = Backbone.Collection.extend({
    model: Project,

    sync: function(method, model, options) {
        if (method === "read") {
            //JSTACK.Keystone.gettenants(options.success, false);
            UTILS.Auth.getTenants(options.success);
        }
    },

    parse: function(resp) {
        return resp;
    }

});
var Quota = Backbone.Model.extend({

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },
    
    sync: function(method, model, options) {
        switch(method) {
               case "read":
                   JSTACK.Nova.getquotalist(model.get("id"), options.success, options.error, this.getRegion());
                   break;
                case "update":
                    JSTACK.Nova.updatequota(
                        model.get("id"),
                        model.get("instances"),
                        model.get("cores"),
                        model.get("ram"),
                        model.get("volumes"),
                        model.get("gigabytes"),
                        model.get("floating_ips"),
                        model.get("metadata_items"),
                        model.get("injected_files"),
                        model.get("injected_file_content_bytes"),
                        undefined,
                        model.get("security_groups"),
                        model.get("security_group_rules"),
                        undefined,
                        options.success,
                        options.error, this.getRegion());
                break;
       }
    }

});

var Quotas = Backbone.Collection.extend({
    model: Quota,

    sync: function(method, model, options) {
    }


});
var Role = Backbone.Model.extend({
});

var Roles = Backbone.Collection.extend({
    model: Role,

    sync: function(method, model, options) {
        if(method === "read") {
            var resp = JSTACK.Keystone.getroles(options.success, options.error);
        }
    },

    parse: function(resp) {
        return resp.roles;
    }

});
var Router = Backbone.Model.extend({

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    _action:function(method, options) {
        var model = this;
        options = options || {};
        var error = options.error;
        options.success = function(resp) {
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
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

    addinterfacetorouter: function(router_id, subnet_id, options) {
      options = options || {};
      options.router_id = router_id;
      options.subnet_id = subnet_id;
      options.port_id = undefined;
      return this._action('addinterfacetorouter', options);
    },

    removeinterfacefromrouter: function(router_id, port_id, options) {
      options = options || {};
      options.router_id = router_id;
      options.port_id = port_id;
      options.subnet_id = undefined;
      return this._action('removeinterfacefromrouter', options);
    },

    sync: function(method, model, options) {
           switch(method) {
              case "read":
                   JSTACK.Neutron.getrouterdetail(model.get("id"), options.success, options.error, this.getRegion());
                   break;
              case "create":
                   JSTACK.Neutron.createrouter(model.get("name"), model.get("admin_state_up"), model.get("network_id"), model.get("tenant_id"), options.success, options.error, this.getRegion());
                   break;
              case "delete":
                   JSTACK.Neutron.deleterouter(model.get("id"), options.success, options.error, this.getRegion());
                   break;
              case "update":
                    JSTACK.Neutron.updaterouter(model.get("id"), model.get("external_gateway_info:network_id"), model.get("name"), model.get("admin_state_up"), options.success, options.error, this.getRegion());
                    break;
              case "addinterfacetorouter":
                    JSTACK.Neutron.addinterfacetorouter(options.router_id, options.subnet_id, options.port_id, options.success, options.error, this.getRegion());
                    break;
              case "removeinterfacefromrouter":
                    JSTACK.Neutron.removeinterfacefromrouter(options.router_id, options.port_id, options.subnet_id, options.success, options.error, this.getRegion());
                    break;
           }
   },

   parse: function(resp) {
        if (resp.routers !== undefined) {
            return resp.routers;
        } else {
            return resp;
        }
    }
});

var Routers = Backbone.Collection.extend({
    model: Router,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
        if (method === "read") {
            JSTACK.Neutron.getrouterslist(options.success, options.error, this.getRegion());
        }
    },

    parse: function(resp) {
        return resp.routers;
    }

});
var SecurityGroup = Backbone.Model.extend({

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    _action:function(method, options) {
        var model = this;
        options = options || {};
        var error = options.error;
        options.success = function(resp) {
          console.log("Success");
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
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

    readSecurityGroupRuleDetails:function (options) {
        return this._action('read',options);
    },

    createSecurityGroupRule: function(ip_protocol, from_port, to_port, cidr, group_id, parent_group_id, options) {
        options = options || {};
        options.ip_protocol = ip_protocol;
        options.from_port = from_port;
        options.to_port = to_port;
        options.cidr = cidr;
        options.group_id = group_id;
        options.parent_group_id = parent_group_id;
        return this._action('createSecurityGroupRule', options);
    },

    deleteSecurityGroupRule: function(sec_group_rule_id, options) {
        console.log("Delete security group rule");
        options = options || {};
        options.secGroupRuleId = sec_group_rule_id;
        return this._action('deleteSecurityGroupRule', options);
    },

    getSecurityGroupforServer: function(server_id, options) {
        console.log("Get security groups for server");
        options = options || {};
        options.serverId = server_id;
        return this._action('getSecurityGroupforServer', options);
    },

    sync: function(method, model, options) {
           switch(method) {
               case "read":
                   //JSTACK.Nova.getsecuritygroupdetail(model.get("id"), options.success, options.error, this.getRegion());
                   OTHERCLOUD.API.describeSecurityGroupDetail(model.get('instanceId'),model.get('region'),options.success, options.error);
                   break;
               case "delete":
                   //JSTACK.Nova.deletesecuritygroup(model.get("id"), options.success, options.error, this.getRegion());
                   OTHERCLOUD.API.delSecurityGroup(model.get("instanceId"),model.get("region"),options.success, options.error);
                   break;
               case "create":
               console.log("Creating, ", options.success);
                   //JSTACK.Nova.createsecuritygroup( model.get("name"), model.get("description"), options.success, options.error, this.getRegion());
                   OTHERCLOUD.API.createSecurityGroup(model.get("name"),'bj',model.get("description"),options.success, options.error);
                   break;
               case "createSecurityGroupRule":
               //console.log(options.ip_protocol, options.from_port, options.to_port, options.cidr, options.group_id, options.parent_group_id);
                   JSTACK.Nova.createsecuritygrouprule(options.ip_protocol, options.from_port, options.to_port, options.cidr, options.group_id, options.parent_group_id, options.success, options.error, this.getRegion());
                   break;
                case "deleteSecurityGroupRule":
                   JSTACK.Nova.deletesecuritygrouprule(options.secGroupRuleId, options.success, options.error, this.getRegion());
                   break;
                case "getSecurityGroupforServer":
                    mySuccess = function(object) {
                        var obj = {};
                        obj.object = object;
                        return options.success(obj);
                    };
                   JSTACK.Nova.getsecuritygroupforserver(options.serverId, mySuccess, options.error, this.getRegion());
                   break;
           }
    },

    parse: function(resp) {
        if (resp.security_group !== undefined) {
            return resp.security_group;
        } else {
            return resp;
        }
    }
});

var SecurityGroups = Backbone.Collection.extend({
    model: SecurityGroup,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
        if(method === "read") {
            //JSTACK.Nova.getsecuritygrouplist(options.success, options.error, this.getRegion());
            OTHERCLOUD.API.describeSecurityGroup(options.success, options.error);
        }
    },

    parse: function(resp) {
        resp.instanceInfos.forEach(function(instance){
            instance.id = instance.orderId + '-' + instance.orderItemId + '-' + instance.instanceId;
        });
        return resp.instanceInfos;
    }

});
var Service = Backbone.Model.extend({
    sync: function(method, model, options) {
           switch(method) {
               case "read":
                   JSTACK.Keystone.getservice(model.get("id"), options.success, options.error);
                   break;
               case "filter":
                   JSTACK.Keystone.filterservice(model.get("id"), options.success, options.error);
                   break;
           }
   }
});

var Services = Backbone.Collection.extend({
    model: Service,

    sync: function(method, model, options) {
        if(method === "read") {
            var resp = JSTACK.Keystone.getservicelist();
            options.success(resp);
        }
    },

    parse: function(resp) {
        return resp;
    }

});
var SoftwareCatalog = Backbone.Model.extend({

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    _action:function(method, options) {
        var model = this;
        options = options || {};
        var error = options.error;
        options.success = function(resp) {
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
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

    sync: function(method, model, options) {
        switch(method) {
            case "read":
					// Using SDC we already have all the needed info. This is thougth for murano
					options.success();
                break;
            case "create":
                ServiceDC.API.addRecipe(model.get('name'), model.get('version'), 
                    model.get('repo'), model.get('url'), model.get('config_management'), 
                    model.get('operating_systems'), model.get('description'), model.get('attributes'), 
                    model.get('tcp_ports'), model.get('udp_ports'), model.get('dependencies'), 
                    options.success, options.error, this.getRegion());
                break;
            case "delete":
                
                break;
            case "update":
                
                break;

        }
    }
});

var SoftwareCatalogs = Backbone.Collection.extend({

    model: SoftwareCatalog,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    _action: function(method, options) {
        var model = this;
        options = options || {};
        options.success = function(resp) {
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
            }
        };
        var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
        return xhr;
    },

    // getCatalogueListWithReleases: function(options) {
    //     var self = this;

    //     self.releasesList = [];

    //     ServiceDC.API.getProductList(function (resp) {

    //         var products = resp.product_asArray;
    //         self.getReleases(products, 0, options.success, options.error);

    //     }, options.error, this.getRegion());
    // },

    getCatalogueListWithReleases: function(options) {
        var self = this;

        self.releasesList = [];

        ServiceDC.API.getProductAndReleaseList(function (resp) {

            var list = [];

            for (var p in resp) {
                resp[p].product.version = resp[p].version;

                var meta = {};
                
                for (var m in resp[p].product.metadatas_asArray) {
                    meta[resp[p].product.metadatas_asArray[m].key] = resp[p].product.metadatas_asArray[m].value;
                }

                delete resp[p].product.metadatas_asArray;
                delete resp[p].product.metadatas;

                resp[p].product.metadatas = meta;

                list.push(resp[p].product);

            }

            options.success(list);

        }, options.error, this.getRegion());
    },

    sync: function(method, model, options) {
        switch(method) {
            case 'read':
                this.getCatalogueListWithReleases(options);
                break;
            case 'create':
                break;
        }
    },

    parse: function(resp) {
        return resp;
    },

    releasesList: [],

    getReleases: function (products, index, callback, error) {

        var self = this;

        ServiceDC.API.getProductReleases(products[index].name, function (resp) {

            var releases = resp.productRelease_asArray;

            for (var r in releases) {
                var pr = {};
                pr.name = products[index].name;
                pr.description = products[index].description;
                pr.attributes_asArray = products[index].attributes_asArray;
                pr.version = releases[r].version;
                pr.metadata = {};
                for (var m in products[index].metadatas_asArray) {
                    pr.metadata[products[index].metadatas_asArray[m].key] = products[index].metadatas_asArray[m].value;
                }
                self.releasesList.push(pr);
            }

            index ++;

            if (index == products.length) {
                callback(self.releasesList);
            } else {
                self.getReleases(products, index, callback, error);
            }

        }, function(e) {

            console.log('ERROR getting releases of product: ', products[index].name);

            index ++;

            if (index == products.length) {
                callback(self.releasesList);
            } else {
                self.getReleases(products, index, callback, error);
            }
        }, this.getRegion());
    }
});
var Software = Backbone.Model.extend({

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    _action:function(method, options) {
        var model = this;
        options = options || {};
        var error = options.error;
        options.success = function(resp) {
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
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

    sync: function(method, model, options) {
        switch(method) {
            case "read":
                ServiceDC.API.getProductInstance(model.get('name'), options.success, options.error, this.getRegion());
                break;
            case "create":
                ServiceDC.API.installProductInstance(model.get('ip'), model.get('fqn'), model.get('product'), model.get('hostname'), options.success, options.error, this.getRegion());
                break;
            case "delete":
                ServiceDC.API.uninstallProductInstance(model.get('name'), options.success, options.error, this.getRegion());
                break;
            case "update":
                var att = model.get('productRelease').product.attributes;
                ServiceDC.API.reconfigureProductInstance(model.get('name'), att, options.success, options.error, this.getRegion());
                break;

        }
    }
});

var Softwares = Backbone.Collection.extend({

    model: Software,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    _action: function(method, options) {
        var model = this;
        options = options || {};
        options.success = function(resp) {
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
            }
        };
        var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
        return xhr;
    },

    sync: function(method, model, options) {
        switch(method) {
            case "read":
                ServiceDC.API.getProductInstanceList(options.success, options.error, this.getRegion());
                break;
            case "create":
                break;
        }
    },

    parse: function(resp) {
        return resp;
    }
});
var Subnet = Backbone.Model.extend({

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
           switch(method) {
              case "read":
                   JSTACK.Neutron.getsubnetdetail(model.get("id"), options.success, options.error, this.getRegion());
                   break;
              case "create":
                   JSTACK.Neutron.createsubnet(model.get("network_id"), model.get("cidr"), model.get("name"), model.get("allocation_pools"), 
                   model.get("tenant_id"), model.get("gateway_ip"), model.get("ip_version"), model.get("enable_dhcp"), model.get("dns_nameservers"),
                   model.get("host_routes"), options.success, options.error, this.getRegion());
                   break;
              case "delete":
                   JSTACK.Neutron.deletesubnet(model.get("id"), options.success, options.error, this.getRegion());
                   break;
              case "update":
                    JSTACK.Neutron.updatesubnet(model.get("id"), model.get("name"), model.get("gateway_ip"), model.get("enable_dhcp"), model.get("dns_nameservers"), 
                    model.get("host_routes"), options.success, options.error, this.getRegion());
                    break;
           }
   },

   parse: function(resp) {
        if (resp.networks !== undefined) {
            return resp.subnets;
        } else {
            return resp;
        }
    }
});

var Subnets = Backbone.Collection.extend({
    model: Subnet,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
        if (method === "read") {
            JSTACK.Neutron.getsubnetslist(options.success, options.error, this.getRegion());
        }
    },

    parse: function(resp) {
        return resp.subnets;
    }

});
var TopBarModel = Backbone.Model.extend({
});
var User = Backbone.Model.extend({
    sync: function(method, model, options) {
           switch(method) {
               case "read":
                   JSTACK.Keystone.getuser(model.get("id"), options.success, options.error);
                   break;
               case "delete":
                   JSTACK.Keystone.deleteuser(model.get("id"), options.success, options.error);
                     break;
               case "create":
                   JSTACK.Keystone.createuser(model.get("name"), model.get("password"), model.get("tenant_id"), model.get("email"), model.get("enabled"), options.success, options.error);
                   break;
               case "get-roles":
                   JSTACK.Keystone.getuserroles(model.get("id"), options.tenant, options.success, options.error);
                   break;
               case "add-role":
                   JSTACK.Keystone.adduserrole(model.get("id"), options.role, options.tenant, options.success, options.error);
                   break;
               case "remove-role":
                   JSTACK.Keystone.removeuserrole(model.get("id"), options.role, options.tenant, options.success, options.error);
                   break;
               case "update":
                   JSTACK.Keystone.edituser(model.get("id"), model.get("name"), model.get("password"), model.get("tenant_id"), model.get("email"), model.get("enabled"), options.success, options.error);
                   break;
           }
   },

   addRole: function(role, tenant, options) {
      options = options || {success: function(){}};
      options.role = role;
      options.tenant = tenant;
      this.sync("add-role", this, options);
   },

   getRoles: function(tenant, options) {
      options = options || {success: function(){}};
      options.tenant = tenant;
      this.sync("get-roles", this, options);
   },

   removeRole: function(role, tenant, options) {
      options = options || {success: function(){}};
      options.role = role;
      options.tenant = tenant;
      this.sync("remove-role", this, options);
   }

});

var Users = Backbone.Collection.extend({
    model: User,
    _tenant_id: undefined,

    sync: function(method, model, options) {
        if(method === "read") {
            if (this._tenant_id !== undefined) {
              JSTACK.Keystone.getusersfortenant(this._tenant_id, options.success, options.error);
            } else {
              JSTACK.Keystone.getusers(options.success, options.error);
            }
        }
    },

    parse: function(resp) {
        return resp.users;
    },

    tenant: function(tenant_id) {
        this._tenant_id = tenant_id;
    }

});
var VolumeBackup = Backbone.Model.extend({

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    _action:function(method, options) {
        var model = this;
        options = options || {};
        var error = options.error;
        options.success = function(resp) {
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
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

    restore: function(options) {
        return this._action('restore', options);
    },

    sync: function(method, model, options) {
        switch(method) {
            case "create":
                JSTACK.Cinder.createbackup(model.get("volume_id"), model.get("name"), model.get("description"), options.success, options.error, this.getRegion());
                break;
            case "delete":
                JSTACK.Cinder.deletebackup(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "restore":
                JSTACK.Cinder.restorebackup(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "read":
                JSTACK.Cinder.getbackup(model.get("id"), options.success, options.error, this.getRegion());
                break;
        }
    },

    parse: function(resp) {
        if (resp.backup !== undefined) {
            return resp.backup;
        } else {
            return resp;
        }
    }
});

var VolumeBackups = Backbone.Collection.extend({

    model: VolumeBackup,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
        if(method === "read") {
            JSTACK.Cinder.getbackuplist(options.success, options.error, this.getRegion());
        }
    },

    parse: function(resp) {
        return resp.backups;
    }

});
var Volume = Backbone.Model.extend({

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    _action:function(method, options) {
        var model = this;
        options = options || {};
        var error = options.error;
        options.success = function(resp) {
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
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

    sync: function(method, model, options) {
        switch(method) {
            case "create":
                JSTACK.Cinder.createvolume(model.get("size"), model.get("name"), model.get("description"), options.success, options.error, this.getRegion());
                break;
            case "delete":
                JSTACK.Cinder.deletevolume(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "update":
                break;
            case "read":
                JSTACK.Cinder.getvolume(model.get("id"), options.success, options.error, this.getRegion());
                break;
        }
    },

    parse: function(resp) {
        if (resp.volume !== undefined) {
            return resp.volume;
        } else {
            return resp;
        }
    }
});

var Volumes = Backbone.Collection.extend({

    model: Volume,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
        if (method == 'read') {
            JSTACK.Cinder.getvolumelist(true, options.success, options.error, this.getRegion());
        }
    },

    parse: function(resp) {
        return resp.volumes;
    }

});
var VolumeSnapshot = Backbone.Model.extend({

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    _action:function(method, options) {
        var model = this;
        options = options || {};
        var error = options.error;
        options.success = function(resp) {
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
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

    sync: function(method, model, options) {
        switch(method) {
            case "create":
                JSTACK.Cinder.createsnapshot(model.get("volume_id"), model.get("name"), model.get("description"), options.success, options.error, this.getRegion());
                break;
            case "delete":
                JSTACK.Cinder.deletesnapshot(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "update":
                break;
            case "read":
                JSTACK.Cinder.getsnapshot(model.get("id"), options.success, options.error, this.getRegion());
                break;
        }
    },

    parse: function(resp) {
        if (resp.snapshot !== undefined) {
            return resp.snapshot;
        } else {
            return resp;
        }
    }
});

var VolumeSnapshots = Backbone.Collection.extend({

    model: VolumeSnapshot,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    sync: function(method, model, options) {
        if(method === "read") {
            JSTACK.Cinder.getsnapshotlist(true, options.success, options.error, this.getRegion());
        }
    },

    parse: function(resp) {
        return resp.snapshots;
    }

});
var WhiteListModel = Backbone.Model.extend({
    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    _action:function(method, options) {
        var model = this;
        options = options || {};
        var error = options.error;
        options.success = function(resp) {
            console.log("Success");
            model.trigger('sync', model, resp, options);
            if (options.callback!==undefined) {
                options.callback(resp);
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

    createSecurityGroupRule: function(ip_protocol, from_port, to_port, cidr, group_id, parent_group_id, options) {
        options = options || {};
        options.ip_protocol = ip_protocol;
        options.from_port = from_port;
        options.to_port = to_port;
        options.cidr = cidr;
        options.group_id = group_id;
        options.parent_group_id = parent_group_id;
        return this._action('createSecurityGroupRule', options);
    },

    deleteSecurityGroupRule: function(sec_group_rule_id, options) {
        console.log("Delete security group rule");
        options = options || {};
        options.secGroupRuleId = sec_group_rule_id;
        return this._action('deleteSecurityGroupRule', options);
    },

    getSecurityGroupforServer: function(server_id, options) {
        console.log("Get security groups for server");
        options = options || {};
        options.serverId = server_id;
        return this._action('getSecurityGroupforServer', options);
    },

    sync: function(method, model, options) {
        switch(method) {
            case "read":
                //       JSTACK.Nova.getsecuritygroupdetail(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "delete":
                //     JSTACK.Nova.deletesecuritygroup(model.get("id"), options.success, options.error, this.getRegion());
                break;
            case "create":
                console.log("Creating, ", options.success);
                //     JSTACK.Nova.createsecuritygroup( model.get("name"), model.get("description"), options.success, options.error, this.getRegion());
                break;
            case "createSecurityGroupRule":
                //console.log(options.ip_protocol, options.from_port, options.to_port, options.cidr, options.group_id, options.parent_group_id);
                //     JSTACK.Nova.createsecuritygrouprule(options.ip_protocol, options.from_port, options.to_port, options.cidr, options.group_id, options.parent_group_id, options.success, options.error, this.getRegion());
                break;
            case "deleteSecurityGroupRule":
                //     JSTACK.Nova.deletesecuritygrouprule(options.secGroupRuleId, options.success, options.error, this.getRegion());
                break;
            case "getSecurityGroupforServer":
                mySuccess = function(object) {
                    var obj = {};
                    obj.object = object;
                    return options.success(obj);
                };
                //   JSTACK.Nova.getsecuritygroupforserver(options.serverId, mySuccess, options.error, this.getRegion());
                break;
        }
    },

    parse: function(resp) {
        if (resp.security_group !== undefined) {
            return resp.security_group;
        } else {
            return resp;
        }
    }
});


var WhiteListModels = Backbone.Collection.extend({

    model: WhiteListModel,

    region: undefined,

    getRegion: function() {
        if (this.region) {
            return this.region;
        }
        return UTILS.Auth.getCurrentRegion();
    },

    getWhiteList:function(parent_id,obj){
        var options = options || {};
        options.parent_id = parent_id;
        options.obj = obj;
        return this._action('getWhiteList', options);
    },

    delWhiteList:function(url,obj){
        var options = options || {};
        options.url = url;
        options.obj = obj;
        return this._action('delWhiteList', options);
    },

    addWhiteList:function(context,obj){
        var options = options || {};
        options.context = context;
        options.obj = obj;
        return this._action('addWhiteList', options);
    },

    _action:function(method, options) {
        var model = this;
        options = options || {};
        var error = options.error;
        options.parse = this.parse;
        options.success = function(resp) {
            options.obj.model.reset();
            options.obj.model.set(options.parse(resp));
            options.obj.proRender();
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

    sync: function(method, model, options) {

        switch(method) {
            case "getWhiteList":
                OTHERCLOUD.API.getWhiteList(model, options.success, options.error, options,this.getRegion());
            break;
            case "delWhiteList":
                OTHERCLOUD.API.delWhiteList(model, options.success, options.error, options,this.getRegion());
            break;
            case "addWhiteList":
                OTHERCLOUD.API.addWhiteList(model, options.success, options.error, options,this.getRegion());
            break;
        }

    },

    parse: function(resp) {

        resp.whitelist.forEach(function(instance){
            instance.operate = "<button id=\'delWhiteList\' class=\'btn btn-blue\' attrId='"+instance.id+"'>删除规则</button>";
        });
        alert(JSON.stringify(resp.whitelist));
        return resp.whitelist;

    }

});