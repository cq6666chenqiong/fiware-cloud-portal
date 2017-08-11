var InstanceConnectionView = Backbone.View.extend({

    _template: _.itemplate($('#instanceConnectionTemplate').html()),

    vncUrl: undefined,
    public_ip: undefined,

    events: {
        'click #vnc-button': 'onVnc'
    },

    initialize: function() {

        var self = this;
        this.options = this.options || {};

        this.model.fetch({success: function(model){
            self.public_ip = false;
            if (JSTACK.Keystone.getendpoint(UTILS.Auth.getCurrentRegion(), "network") !== undefined) {
                if (model.get("addresses") != null) {
                    var addresses = model.get("addresses");
                    for (var i in addresses) {
                        var ips = addresses[i];
                        for (var j in ips) {
                            if (ips[j]['OS-EXT-IPS:type'] === 'floating') {
                                self.public_ip = ips[j].addr;
                                break;
                            }
                        }
                    }
                }
            } else {
                if ((model.get("addresses") != null) && model.get("addresses")["public"] !== null) {
                    if (model.get("addresses")["public"] !== undefined) {
                        this.public_ip = model.get("addresses")["public"][0]; 
                    }
                }
            }              
            self.render();
        }});

        this.model.vncconsole({callback: function(resp) {
            self.vncUrl = resp.console.url.replace("127.0.0.1", "130.206.82.10");
            self.render();
        }});

        self.render();
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
    },

    close: function(e) {
        this.undelegateEvents();
        this.onClose();
    },

    onVnc: function () {
        if (this.vncUrl) {
            var url = '/vnc?url=' + this.vncUrl;
            window.open(url, 'VNC Display', "height=680,width=850");
        }
        // var subview = new VNCView({el: 'body', model: this.model});
        // subview.render();
    },

    render: function () {
        var self = this;

        var template = self._template({public_ip: self.public_ip, vncUrl: self.vncUrl});
        $(self.el).empty().html(template);

        return this;
    }
});
