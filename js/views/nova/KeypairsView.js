var NovaKeypairsView = Backbone.View.extend({

    _template: _.itemplate($('#novaKeypairsTemplate').html()),

    tableView: undefined,

    initialize: function() {
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.renderFirst();
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [{
            label: "Create Keypair",
            action: "create"
        }, {
            label: "Import Keypair",
            action: "import"
        }];
    },

    getDropdownButtons: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        var self = this;
        var groupSelected = function(size, id) {
            if (size >= 1) {
                return true;
            }
        };
        return [{
            label: "Delete Keypairs",
            action: "delete",
            warn: true,
            activatePattern: groupSelected
        }];
    },

    getHeaders: function() {
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        return [{
            type: "checkbox",
            size: "5%"
        }, {
            name: "Name",
            tooltip: "Keypair's name",
            size: "60%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Fingerprint",
            tooltip: "Keypair's unique fingerprint",
            size: "35%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var entries = [];
        for (var index in this.model.models) {
            var keypair = this.model.models[index];
            var entry = {
                id: keypair.get('id'),
                cells: [{
                    value: keypair.get("KeyId") + '/' + keypair.get("KeyName")
                }, {
                    value: keypair.get("Description")
                }]
            };
            entries.push(entry);
        }
        return entries;
    },

    onAction: function(action, keypairIds) {
        console.log(JSON.stringify(keypairIds));
        var keypair, kp, subview;
        var self = this;
        if (keypairIds.length === 1) {
            keypair = keypairIds[0];
            kp = this.model.get(keypair);
        }
        switch (action) {
            case 'create':
                subview = new CreateKeypairView({el: 'body', model: this.model});
                subview.render();
                break;
            case 'import':
                subview = new ImportKeypairView({el: 'body',  model: this.model});
                subview.render();
                break;
            case 'delete':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Delete Keypair",
                    btn_message: "Delete Keypair",
                    onAccept: function() {
                        keypairIds.forEach(function(keypair) {
                            kp = self.model.get(keypair);
                            kp.destroy(UTILS.Messages.getCallbacks("Keypair "+kp.get("instanceId") + " deleted.", "Error deleting keypair "+ kp.get("instanceId")));
                        });
                    }
                });
                subview.render();
                break;
        }
    },

    onClose: function() {
        this.tableView.close();
        this.model.unbind("sync", this.render, this);
        this.unbind();
        this.undelegateEvents();
    },

    renderFirst: function() {
        this.undelegateEvents();
        var that = this;
        UTILS.Render.animateRender(this.el, this._template, {models: this.model.models});
        this.tableView = new TableView({
            model: this.model,
            el: '#keypairs-table',
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