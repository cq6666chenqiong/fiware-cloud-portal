var NovaVolumesView = Backbone.View.extend({

    _template: _.itemplate($('#novaVolumesTemplate').html()),

    tableView: undefined,

    initialize: function() {
        this.options.volumeSnapshotsModel = UTILS.GlobalModels.get("volumeSnapshotsModel");
        this.options.instancesModel = UTILS.GlobalModels.get("instancesModel");
        this.options.flavors = UTILS.GlobalModels.get("flavors");
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.renderFirst();
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [{
            label: "Create Volume",
            action: "create"
        }];
    },

    getDropdownButtons: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        var self = this;
        var oneSelected = function(size, id) {
            if (size === 1) {
                var entry = self.model.get(id);
                if (entry.get("status") !== "error") {
                    return true;
                }
            }
        };
        var groupSelected = function(size, id) {
            if (size >= 1) {
                return true;
            }
        };
        var attachSelected = function(size, id) {
            if (size === 1) {
                var entry = self.model.get(id);
                if (entry.get("status") === "available") {
                    return true;
                }
            }
        };
        var groupAttachSelected = function(size, ids) {
            if (size >= 1) {
                for (var id in ids) {
                    var entry = self.model.get(ids[id]);
                    if (entry.get("status") === "in-use") {
                        return false;
                    }
                }
                return true;
            }
        };
        return [{
                label: "Edit Attachments",
                action: "attachment",
                activatePattern: oneSelected
            }, {
                label: "Create Snapshot",
                action: "snapshot",
                activatePattern: attachSelected
            //Add when cinder v2 is available (for volume backups)
            }, {
                label: "Create Backup",
                action: "backup",
                activatePattern: attachSelected
            }, {
                label: "Delete Volumes",
                action: "delete",
                warn: true,
                activatePattern: groupAttachSelected
            }];
    },

    getHeaders: function() {
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        return [{
                type: "checkbox",
                size: "5%"
            }, {
                name: "Name",
                tooltip: "Volume's name",
                size: "25%",
                hidden_phone: false,
                hidden_tablet: false
            }, {
                name: "Description",
                tooltip: "Volume's Description",
                size: "15%",
                hidden_phone: true,
                hidden_tablet: false
            }, {
                name: "Size (GB)",
                tooltip: "Current volume size",
                size: "15%",
                hidden_phone: true,
                hidden_tablet: false
            }, {
                name: "Status",
                tooltip: "Current volume status (available, none, ...)",
                size: "15%",
                hidden_phone: true,
                hidden_tablet: false
            }, {
                name: "Attachments",
                tooltip: "Servers the snapshot is attached to",
                size: "15%",
                hidden_phone: true,
                hidden_tablet: false
            }];
    },

    getEntries: function() {
        var entries = [];
        for (var index in this.model.models) {
            var volume = this.model.models[index];
            var entry = {
                id: volume.get('id'),
                cells: [{
                    value: volume.get("name") ? volume.get("name") : volume.get('display_name'),
                    link: "#nova/volumes/" + volume.get("id") + "/detail"
                }, {
                    value: (volume.get("display_description") !== '' && volume.get('display_description')!== null) ? volume.get("display_description"):'-'
                }, {
                    value: volume.get('size')
                }, {
                    value: volume.get("status")
                }, {
                    value: (volume.get("attachments").length === 0) ? "-": volume.get("attachments").length
                }]
            };
            entries.push(entry);
        }
        return entries;
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
        this.model.unbind("sync", this.render, this);
    },

    onAction: function(action, volumeIds) {
        var volume, vol, subview;
        var self = this;
        if (volumeIds.length === 1) {
            volume = volumeIds[0];
            vol = this.model.get(volume);
        }
        switch (action) {
            case 'attachment':
                subview = new EditVolumeAttachmentsView({el: 'body', model: vol, instances: this.options.instancesModel});
                subview.render();
                break;
            case 'create':
                subview = new CreateVolumeView({el: 'body'});
                subview.render();
                break;
            case 'snapshot':
                subview = new CreateVolumeSnapshotView({el: 'body', volume_id: volume});
                subview.render();
                break;
            case 'backup':
                subview = new CreateVolumeBackupView({el: 'body', volume_id: volume});
                subview.render();
                break;
            case 'delete':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Delete Volumes",
                    btn_message: "Delete Volumes",
                    onAccept: function() {
                        volumeIds.forEach(function(volume) {
                            vol = self.model.get(volume);
                            vol.destroy(UTILS.Messages.getCallbacks("Volume " + vol.get("display_name") + " deleted", "Error deleting volume " + vol.get("display_name")));
                        });
                    }
                });
                subview.render();
               break;
        }
    },

    renderFirst: function() {
        this.undelegateEvents();
        this.delegateEvents(this.events);
        UTILS.Render.animateRender(this.el, this._template, {models:this.model.models, volumeSnapshotsModel:this.options.volumeSnapshotModel, instances: this.options.instancesModel});
        this.tableView = new TableView({
            model: this.model,
            el: '#volumes-table',
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