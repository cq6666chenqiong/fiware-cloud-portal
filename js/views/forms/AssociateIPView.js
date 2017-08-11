var AssociateIPView = Backbone.View.extend({

    _template: _.itemplate($('#associateIPFormTemplate').html()),

    events: {
      'click #cancelCreateBtn': 'close',
      'click #close': 'close',
      'submit #form': 'allocate',
      'click .modal-backdrop': 'close',
      'change #instance_switcher': 'onSelectInstance'
    },

    render: function () {
        $(this.el).append(this._template({model:this.model, instances: this.options.instances}));
        $('.modal:last').modal();
        return this;
    },

    close: function(e) {
        $('#associate_IP').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    onSelectInstance: function() {
        var html = '';
        var instance_id = this.$("#instance_switcher option:selected").val();
        var instance = this.options.instances.get(instance_id);
        var addr, addresses;
        if (instance !== undefined) {
            if (JSTACK.Keystone.getendpoint(UTILS.Auth.getCurrentRegion(), "network") !== undefined) {
                if (instance.get("addresses") != null) {
                    addresses = instance.get("addresses");
                    for (var i in addresses) {
                        var ips = addresses[i];
                        for (var j in ips) {
                            if (ips[j]["OS-EXT-IPS:type"] !== "floating") {
                                addr = ips[j].addr;
                                html += '<option value="'+ addr + '">'+addr+'</option>"';
                            }
                        }
                    }
                }
            } else {
                if ((instance.get("addresses") != null) && (instance.get("addresses")["public"] !== null || instance.get("addresses")["private"] !== null)) {
                    addresses = instance.get("addresses")["public"];
                    for (var addr_idx in addresses) {
                        addr = addresses[addr_idx].addr;
                        html += '<option value="'+ addr + '">'+addr+'</option>"';
                    }
                    addresses = instance.get("addresses")["private"];
                    for (var addr_idx2 in addresses) {
                        addr = addresses[addr_idx2].addr;
                        html += '<option value="'+ addr + '">'+addr+'</option>"';
                    }
                }
            }
        } else {
            html += '<option value="">Select IP to associate with</option>';
        }

        $('#instance_ip_pool').html(html);
    },

    allocate: function(e) {
        console.log(this.options.ip);
        self = this;
        var instance_id = this.$("#instance_switcher option:selected").val();
        var address = this.$("#instance_ip_pool option:selected").val();
        if (address === "") {
            address = undefined;
        }
        if (instance_id !== "") {
            var inst = self.options.instances.get(instance_id); 
            var instance = inst.get("name");
            self.model.associate(instance_id, address, UTILS.Messages.getCallbacks("Successfully associated Floating IP " +self.model.get("ip")+ " with Instance: " +instance));
            self.close();
        }        
    }   

});