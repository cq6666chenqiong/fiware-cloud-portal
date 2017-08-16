var AccessAndSecurityView = Backbone.View.extend({

    _template: _.itemplate($('#novaAccessAndSecurityTemplate').html()),

    keypairsView: undefined,
    securityGroupsView: undefined,
    floatingIPsView: undefined,
    newGFIPView:undefined,

    initialize: function() {
        this.render();
        this.floatingIPsView = new NovaFloatingIPsView({model: UTILS.GlobalModels.get("floatingIPsModel"), el: '#floating_ips'});
        this.secuirtyGroupsView = new NovaSecurityGroupsView({model: UTILS.GlobalModels.get("securityGroupsModel"), el: '#security_groups'});
        this.keyparisView = new NovaKeypairsView({model: UTILS.GlobalModels.get("keypairsModel"), el: '#keypairs'});
        this.newGFIPView = new NovaGFIPView({model: UTILS.GlobalModels.get("gFIPLModels"), el: '#gf_ips'});
        this.whiteListView = new WhiteListView({ el: '#whitelist'});

    },

    close: function(e) {
        this.undelegateEvents();
        this.unbind();
    },

    onClose: function() {
        this.keyparisView.close();
        this.secuirtyGroupsView.close();
        this.floatingIPsView.close();
        this.undelegateEvents();
        this.unbind();
    },

    render: function() {
        var self = this;
        UTILS.Render.animateRender(this.el, this._template);

    }

});
