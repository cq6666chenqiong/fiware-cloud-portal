var NovaFloatingIPsView = Backbone.View.extend({

    _template: _.itemplate($('#novaFloatingIPsTemplate').html()),

    tableView: undefined,

    initialize: function() {
        this.options.pools = UTILS.GlobalModels.get("floatingIPPoolsModel");
        this.options.instances = UTILS.GlobalModels.get("instancesModel");
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.renderFirst();
    },

    getMainButtons: function() {
        var btns = [];

        UTILS.GlobalModels.get("quotas");
        btns.push({
            //label:  "Allocate IP to Project",
			label:  "分配IP",
            action: "allocate"
        });
        return btns;
    },

    getDropdownButtons: function() {
        var self = this;
        var btns = [];
        var oneSelected = function(size, id) {
            if (size === 1) {
                return true;
            }
        };
        var groupSelected = function(size, id) {
            if (size >= 1) {
                return true;
            }
        };
        var associateSelected = function(size, ids) {
            if (size >= 1) {
                for (var id in ids) {
                    var entry = self.model.get(ids[id]);
                    if (entry.get("instance_id") !== null || entry.get("fixed_ip") !== null) {
                        return true;
                    }
                }
                return false;
            }
        };
        var disassociateSelected = function(size, ids) {
            if (size === 1) {

                for (var id in ids) {
                    var entry = self.model.get(ids[id]);
                    if (entry.get("instance_id") !== null || entry.get("fixed_ip") !== null) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
            }
        };

        btns.push ({
            label: "Associate IP",
            action: "associate",
            activatePattern: disassociateSelected
        },  {
            label: "Dissasociate Floating IP",
            action: "disassociate",
            activatePattern: associateSelected
        },  {
            label: "Release Floating IPs",
            action: "release",
            warn: true,
            activatePattern: groupSelected
        }
        );
        return btns;
    },

    getHeaders: function() {
        var btns = [
        {
            name: "ID/IP地址",
            tooltip: "IP Address",
            size: "25%",
            hidden_phone: false,
            hidden_tablet: false
        },
        {
            name: "转发目标",
            tooltip: "Instance the IP is attached to",
            size: "25%",
            hidden_phone: true,
            hidden_tablet: false
        },
        {
            name: "固定IP",
            tooltip: "Fixed address the IP is attached to",
            size: "20%",
            hidden_phone: true,
            hidden_tablet: false
        },
        {
            name: "外部IP池",
            tooltip: "Corresponding Floating Pool",
            size: "25%",
            hidden_phone: false,
            hidden_tablet: false
        }];

        btns.splice(0,0, {
            type: "checkbox",
            size: "5%"
        });

        return btns;
    },

    getEntries: function() {
	var TARGET = {
		nqcloud : "非腾讯云",
		qcloud: "腾讯云"
	};
        var entries = [];
        for (var index in this.model.models) {
            var floating_ip = this.model.models[index];
            
            var instance, instance_name;
            var instance_id = floating_ip.get("instance_id");
            var fixed_ip = floating_ip.get("fixed_ip");
            

            if (fixed_ip === null) {
                // Not associated
                instance_name = "-";
                fixed_ip = '-';
            } else if (fixed_ip !== null && instance_id !== null){

                instance_name = '-';
                instance = this.options.instances.get(instance_id);
                
                if (instance !== undefined) {
                    instance_name = instance.get("name");
                }
            } else if (fixed_ip !== null && instance_id === null) {
                // Bug in Neutron, let's try to find the assiciated instance it in instances model
                instance_name = '-';

                for (var i in this.options.instances.models) {
                    var adds = this.options.instances.models[i].get('addresses');

                    for (var a in adds) {
                        for (var itf in adds[a]) {
                            if (adds[a][itf].addr === fixed_ip) {
                                instance_name = this.options.instances.models[i].get('name');
                            }
                        }
                    }
                }
            }
/*            
            var entry = {
                id: floating_ip.get('id'),
                cells: [{
                    value: floating_ip.get("ip")
                }, {
                    value:  instance_name
                }, {
                    value:  fixed_ip
                },{
                    value: floating_ip.get("pool")
                }]
            };
*/
            var entry = {
                id: floating_ip.get('id'),
                cells: [{
                    value: floating_ip.get('id') + '/' +floating_ip.get("boundIP")
                }, {
                    value:  TARGET[floating_ip.get("transTarget")]
                }, {
                    value:  '-'
                },{
                    value: '-'
                }]
            };
            entries.push(entry);
        }
        return entries;
    },

    onClose: function() {
        this.tableView.close();
        this.model.unbind("sync");
        this.unbind();
        this.undelegateEvents();
    },

    onAction: function(action, floatingIds) {
        var floating, floa, subview;
        var self = this;
        if (floatingIds.length === 1) {
            floating = floatingIds[0];
            floa = self.model.get(floating);
        }
        switch (action) {
            case 'allocate':
                subview = new AllocateIPView({el: 'body', pools: this.options.pools, model: self.model});
                subview.render();
            break;
            case 'associate':
                subview = new AssociateIPView({el: 'body',  model: floa, instances: this.options.instances});
                subview.render();
            break;
            case 'release':
                subview = new ConfirmView({el: 'body', title: "Confirm Release Floating IPs", btn_message: "Release Floating IPs", onAccept: function() {
                    floatingIds.forEach(function(floating) {
                        floa = self.model.get(floating);
                        floa.destroy(UTILS.Messages.getCallbacks("Released Floating IP " + floa.get("ip"), "Error releasing floating IP " + floa.get("ip")));
                    });
                }});
                subview.render();
            break;
            case 'disassociate':
                subview = new ConfirmView({el: 'body', title: "Confirm Dissasociate IPs", btn_message: "Dissasociate IPs", onAccept: function() {
                    floatingIds.forEach(function(floating) {
                        floa = self.model.get(floating);
                        var inst_id = floa.get("instance_id");

                        if (inst_id === null) {
                            for (var i in self.options.instances.models) {
                                var adds = self.options.instances.models[i].get('addresses');

                                for (var a in adds) {
                                    for (var itf in adds[a]) {
                                        if (adds[a][itf].addr === floa.get('fixed_ip')) {
                                            inst_id = self.options.instances.models[i].id;
                                        }
                                    }
                                }
                            }
                        }

                        floa.dissasociate(inst_id, UTILS.Messages.getCallbacks("Successfully disassociated Floating IP " + floa.get("ip"), "Error releasing floating IP " + floa.get("ip")));
                    });
                }});
                subview.render();
            break;
        }
    },

    renderFirst: function() {
        $(this.el).empty();
        UTILS.Render.animateRender(this.el, this._template, {models: this.model.models, pools: this.options.pools, instances: this.options.instances});
        this.tableView = new TableView({
            model: this.model,
            el: '#floatingIPs-table',
            onAction: this.onAction,
            getDropdownButtons: this.getDropdownButtons,
            getMainButtons: this.getMainButtons,
            getHeaders: this.getHeaders,
            getEntries: this.getEntries,
            context: this
        });
        this.tableView.render();
    },

    render: function() {
        if ($(this.el).html() !== null) {
            this.tableView.render();
        }
        return this;
    }
});
