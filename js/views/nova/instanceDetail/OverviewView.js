var InstanceOverviewView = Backbone.View.extend({

    _template: _.itemplate($('#instanceOverviewTemplate').html()),

    flavorResp: false,
    imageResp: false,
    security_groupsResp: false,

    events: {
        'click #editSoftware': 'editSoftware'
    },

    initialize: function() {

        var self = this;
        this.options = this.options || {};

        this.model.bind("change", this.onInstanceDetail, this);
        this.model.fetch();

        this.options.sdcs.bind("change", this.render, this);
        this.options.sdcs.fetch();

        var options = {};
        options.callback_sec = function(resp) {
            self.options.security_groups = resp;
            self.security_groupsResp = true;
            self.checkAll();
        };
        this.model.getsecuritygroup({callback: options.callback_sec});

        options.callback_vol = function(resp) {
            self.options.volumes = resp;
            self.checkAll();
        };
        this.model.attachedvolumes({callback: options.callback_vol});
    },

    editSoftware: function(e) {

        var subview = new EditInstanceSoftwareView({el: 'body', model: this.options.sdcs, sdcCatalog: this.options.sdcCatalog, instanceModel: this.model});
        subview.render();
    },

    onInstanceDetail: function() {
        var self = this;
        this.options.flavor = new Flavor();
        this.options.flavor.set({id: this.model.get("flavor").id});
        this.options.flavor.bind("change", function() {
            self.flavorResp = true;
            self.checkAll();
        }, this);
        this.options.image = new ImageVM();
        //this.options.image.set({id: this.model.get("image").id});
        this.options.image.set({id: this.model.get("instanceName")});
        this.options.image.bind("change", function() {
            self.imageResp = true;
            self.checkAll();
        }, this);
        this.options.image.fetch();
        this.options.flavor.fetch();
        this.checkAll();
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
        this.model.unbind("change");
        if (this.options.flavor) {
            this.options.flavor.unbind("change");
        }
        if (this.options.image) {
            this.options.image.unbind("change");
        }
    },

    close: function(e) {
        this.undelegateEvents();
        this.onClose();
    },

    checkAll: function() {
        var self = this;
        //if (this.flavorResp && this.imageResp && this.vncResp && this.logResp) {
        if (this.flavorResp || this.imageResp) {
            this.render();
        }
    },

    render: function () {
        var self = this;

        var installedSoftware = [];

        if (this.options.sdcs.models.length !== 0) {
         
            var id = this.model.get("id");
            if (id) {

                var products= this.options.sdcs.models;

                for (var product in products) {
                    var stat = products[product].get('status');
                    if (products[product].get('vm').fqn === id) {// && stat !== 'ERROR' && stat !== 'UNINSTALLED') {
                        installedSoftware.push({name: products[product].get('product').name,
                                                    version: products[product].get('product').version,
                                                    status: products[product].get('status')
                                                    });
                    }
                }
            }
        }

        var security_groups;

        if (self.options.security_groups) {
            security_groups = self.options.security_groups.security_groups;
        }

        var volumes;

        if (self.options.volumes) {
            volumes = self.options.volumes.volumeAttachments;
        }

        var template = self._template({security_groups: security_groups, volumes: volumes, model:self.model, flavor:self.options.flavor, image:self.options.image, installedSoftware: installedSoftware});
        $(self.el).empty().html(template);

        return this;
    }
});
