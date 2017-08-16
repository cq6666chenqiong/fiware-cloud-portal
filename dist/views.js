var AddInterfaceToRouterView = Backbone.View.extend({

    _template: _.itemplate($('#addInterfaceToRouterFormTemplate').html()),

    events: {
      'click #cancelBtn-interface-router': 'close',
      'click .close': 'close',
      'click .modal-backdrop': 'close',
      'click #add_interface_router_button': 'addInterface'
    },

    initialize: function() {
    },

    render: function () {
        if ($('#add_interface_router').html() != null) {
            return;
        }
        $(this.el).append(this._template({model:this.model, subnets:this.options.subnets, networks:this.options.networks, tenant_id: this.options.tenant_id}));
        $('#add_interface_router').modal();
        return this;
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
    },

    close: function(e) {
        if (e !== undefined) {
            e.preventDefault();
        }
        $('#add_interface_router').remove();
        $('.modal-backdrop:last').remove();
        this.onClose();
        this.model.unbind("sync", this.render, this);
    },

    addInterface: function(e) {
        var subnet_id = $('#subnet option:selected').val();
        var router_id = this.model.get('id');
        if (subnet_id !== "") {
            this.model.addinterfacetorouter(router_id, subnet_id, UTILS.Messages.getCallbacks("Interface added.", "Failed to add interface to router ",  {context: this})); 
            this.close();
        }          
    }
});
var AddUserToProjectView = Backbone.View.extend({

    _template: _.itemplate($('#addUserToProjectFormTemplate').html()),

    events: {
      'click #cancelBtn': 'close',
      'click #close': 'close',
      'click #updateBtn': 'update',
      'click .modal-backdrop': 'close'
    },

    initialize: function() {
    },

    onClose: function() {
        $('#add_user').remove();
        $('.modal-backdrop').remove();
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($('#add_user').html() != null) {
            return;
        }
        $(this.el).append(this._template({roles: this.options.roles}));
        $('.modal:last').modal();
        return this;
    },

    close: function(e) {
        $('#add_user').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    update: function(e) {
        var roleReg;
        $("#id_role_id option:selected").each(function () {
                var role = $(this).val();
                if (role !== "") {
                    roleReg = role;
                }
        });
        var tenant = this.options.tenant.get('id');
        if (roleReg && tenant) {
            for (var user in this.options.users) {
                var usr = this.options.users[user];
                usr.addRole(roleReg, tenant, UTILS.Messages.getCallbacks("User "+usr.get("name") + " added.", "Error adding user "+usr.get("name"), {context: this}));
            }
        }

    }

});
var AllocateIPView = Backbone.View.extend({

    _template: _.itemplate($('#allocateIPFormTemplate').html()),

    events: {
      'click #cancelCreateBtn': 'close',
      'click .close': 'close',
      'submit #form': 'allocate',
      'click .modal-backdrop': 'close'
    },

    render: function () {
        this.options.quotas = UTILS.GlobalModels.get("quotas");
        $(this.el).append(this._template({pools: this.options.pools, used: this.model.models.length, quotas: this.options.quotas}));
        $('.modal:last').modal();
        return this;
    },

    close: function(e) {
        $('#allocate_IP').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    allocate: function(e) {
        self = this;
        var pool = this.$("#pool_switcher option:selected").val();
        var newIP = new FloatingIP();
        newIP.allocate(pool, UTILS.Messages.getCallbacks("Successfully allocated floating IP", "Error allocating IP address"));
        self.close();
    }

});
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
var ChangePasswordView = Backbone.View.extend({

    _template: _.itemplate($('#changePasswordFormTemplate').html()),

    events: {
      'click #cancelBtn': 'close',
      'click #close': 'close',
      'submit #form': 'update',
      'click .modal-backdrop': 'close'
    },

    initialize: function() {
    },

    onClose: function() {
        $('#change_password').remove();
        $('.modal-backdrop').remove();
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($('#change_password').html() != null) {
            return;
        }
        $(this.el).append(this._template({model:this.model}));
        $('.modal:last').modal();
        return this;
    },

    close: function(e) {
        this.model.unbind("change", this.render, this);
        $('#change_password').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    update: function(e) {
        var self = this;
        var password = $('input[name=instance_password]').val();
        this.model.changepassword(password, UTILS.Messages.getCallbacks("Password changed", "Error changing password", {context: self}));
    }

});
var CloneBlueprintView = Backbone.View.extend({

    _template: _.itemplate($('#cloneBlueprintFormTemplate').html()),

    events: {
        'submit #form': 'onClone',
        'click #cancelBtn': 'close',
        'click #close': 'close',
        'click .modal-backdrop': 'close'
    },

    initialize: function() {
        this.options = this.options || {};
    },

    close: function(e) {
        $('#clone_blueprint').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($('#clone_blueprint').html() != null) {
            $('#clone_blueprint').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({model:this.model}));
        $('.modal:last').modal();
        return this;
    },

    onClone: function(e){
        var self = this;
        e.preventDefault();
        var name = this.$('input[name=name]').val();
        var descr = this.$('textarea[name=description]').val();
        var callbacks = UTILS.Messages.getCallbacks("Blueprint "+name + " cloned.", "Error cloning blueprint "+name, {context: self, href:"#nova/blueprints/templates/"});

        var bp = new BPTemplate();
        bp.set({'name': name});
        bp.set({'description': descr});

        if (this.options.bpTemplate) {
            if (this.options.bpTemplate.tierDtos_asArray) {
                bp.set({'tierDtos': this.options.bpTemplate.tierDtos_asArray});
            }
        } else {
            if (this.model.get("tierDtos_asArray")) {
                bp.set({'tierDtos': this.model.get("tierDtos_asArray")});
            }
        }

        console.log(bp);

        bp.save(undefined, callbacks);
    }
});

var ConfirmView = Backbone.View.extend({

    _template: _.itemplate($('#confirmTemplate').html()),

    initialize: function() {
        this.delegateEvents({
            'click #confirm_btn': 'onAccept',
            'click #cancelBtn': 'close',
            'click #closeModalConfirm': 'close',
            'click .modal-backdrop': 'close'
        });
        //this.options.title = this.options.title || "Are you sure?";
        this.options.title = this.options.title || "确定吗？";
        //this.options.message = this.options.message || "Please confirm your selection. This action cannot be undone.";
        this.options.message = this.options.message || "请确认，这个操作不能被撤销";
        //this.options.btn_message = this.options.btn_message || "Confirm";
        this.options.btn_message = this.options.btn_message || "确认";
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
        $('#confirm').remove();
    },

    render: function () {
        if ($('#confirm').html() != null) {
            $('#confirm').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({title:this.options.title, message:this.options.message, btn_message: this.options.btn_message, style: this.options.style}));

        $('.modal:last').modal();
        $('.modal:last').css('z-index', '105011');
        $(".modal-backdrop:last").css('z-index', '105010');

        return this;
    },

    onAccept: function(e){
        this.close();
        this.options.onAccept();
    },

    close: function(e) {
        this.onClose();
    }

});

var CopyObjectView = Backbone.View.extend({

    _template: _.itemplate($('#copyObjectFormTemplate').html()),

    events: {
        'click #submit': 'onSubmit',
        'click #cancelBtn': 'close',
        'click #close': 'close',
        'click .modal-backdrop': 'close'
    },

    close: function(e) {
        $('#copy_object').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($('#create_container').html() != null) {
            $('#create_container').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({title: this.options.title, container: this.containerName, model: this.options}));
        $('.modal:last').modal();
        return this;
    },

    onSubmit: function(e){
        e.preventDefault();
        var self = this;
        var currentContainer, currentObject, targetContainer, targetObject, subview;
        if (this.$('input[name=objName]').val() === undefined) {
          subview = new MessagesView({state: "Error", title: "Wrong input values for container. Please try again."});
          subview.render();
          this.close();
          return;
        } else {
            currentContainer = this.model.get("name");
            currentObject = this.options.title;
            targetContainer = this.$("#container_switcher option:selected").val();
            if (e.target.value === undefined || e.target.value === "") {
                targetObject = this.$('input[name=objName]').val();
            } else {
                targetObject = e.target.value;
            }
            subview = new MessagesView({state: "Success", title: "Object " + targetObject + " copied to container " + targetContainer});
            subview.render();
        }
        self.model.copyObject(currentObject, targetContainer, targetObject);
        this.close();
    }

});

var CreateBlueprintInstanceView = Backbone.View.extend({

    _template: _.itemplate($('#createBlueprintInstanceFormTemplate').html()),

    events: {
        'submit #form': 'onCreate',
        'click #cancelBtn': 'close',
        'click .close': 'close',
        'click .modal-backdrop': 'close'
    },

    initialize: function() {
        this.options = this.options || {};
    },

    close: function(e) {
        $('#create_blueprint_instance').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($('#create_blueprint_instance').html() != null) {
            $('#create_blueprint_instance').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({model:this.model}));
        $('.modal:last').modal();
        return this;
    },

    onCreate: function(e){
        var self = this;
        e.preventDefault();
        var name = this.$('input[name=name]').val();
        var descr = this.$('textarea[name=description]').val();
        var callbacks = UTILS.Messages.getCallbacks("Blueprint "+name + " launched.", "Error launching blueprint "+name, {context: self});

        var bp = this.model;
        var bpi = new BPInstance();
        bpi.set({"blueprintName": name});
        bpi.set({"description": descr});
        bpi.set({"environmentDto": bp.toJSON()});
        bpi.save(undefined, callbacks);

        window.location.href = "#nova/blueprints/instances/";
    }
});
var CreateBlueprintView = Backbone.View.extend({

    _template: _.itemplate($('#createBlueprintFormTemplate').html()),

    events: {
        'submit #form': 'onCreate',
        'click #cancelBtn': 'close',
        'click .close': 'close',
        'click .modal-backdrop': 'close'
    },

    initialize: function() {
        this.options = this.options || {};
    },

    close: function(e) {
        $('#create_blueprint').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($('#create_blueprint').html() != null) {
            $('#create_blueprint').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({model:this.model}));
        $('.modal:last').modal();
        return this;
    },

    onCreate: function(e){
        var self = this;
        e.preventDefault();
        var name = this.$('input[name=name]').val();
        var descr = this.$('textarea[name=description]').val();
        var callbacks = UTILS.Messages.getCallbacks("Blueprint "+name + " created.", "Error creating blueprint "+name, {context: self});
        var bp = new BPTemplate();
        bp.set({'name': name});
        bp.set({'description': descr});
        bp.save(undefined, callbacks);
    }
});
var CreateContainerView = Backbone.View.extend({

    _template: _.itemplate($('#createContainerFormTemplate').html()),

    events: {
        'submit #create_container_form': 'onSubmit',
        'click #cancelBtn': 'close',
        'click #close': 'close',
        'click .modal-backdrop': 'close'
    },

    close: function(e) {
        $('#create_container').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($('#create_container').html() != null) {
            $('#create_container').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({model:this.model}));
        $('.modal:last').modal();
        return this;
    },

    onSubmit: function(e){
        e.preventDefault();
        var subview, index;
        //Check if the field is empty
        console.log("Creating container...");
        if ((this.$('input[name=name]').val() === "")||(this.$('input[name=name]').val() === undefined)) {
          console.log("Error!");
          subview = new MessagesView({state: "Error", title: "Wrong input values for container. Please try again."});
          subview.render();
        } else {
            console.log("Checking if it already exists...");
            for (index in this.model.models) {
                if (this.$('input[name=name]').val() === this.model.models[index].get("id")) {
                    subview = new MessagesView({state: "Error", title: "Container with the same name already exists."});
                    subview.render();
                    this.close();
                    return;
                }
            }
            var newContainer = new Container();
            newContainer.set({'name': this.$('input[name=name]').val()});
            var callbacks = UTILS.Messages.getCallbacks("Container " + newContainer.get('name') + " created.", "Error creating container "+name, {context: this});
            console.log("Saving...");
            newContainer.save(undefined, callbacks);
            console.log("Created!");
        }
        console.log("Closing...");
        this.close();
    }

});
var CreateFlavorView = Backbone.View.extend({

    _template: _.itemplate($('#createFlavorFormTemplate').html()),

    events: {
        'submit #form': 'onSubmit',
        'click #cancelBtn': 'close',
        'click #close': 'close',
        'input input': 'onInput',
        'click .modal-backdrop': 'close'
    },

    initialize: function() {
        this.model.bind("change", this.render, this);
    },

    close: function(e) {
        this.model.unbind("change", this.render, this);
        $('#create_flavor').remove();
        $('.modal-backdrop').remove();
        console.log("closing flavor create");
        this.onClose();
    },

    onClose: function() {
        console.log("closing flavor create");
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {

        for (var index = 0; index < this.model.length; index++) {
        }
        if ($('#create_flavor').html() != null) {
            $('#create_flavor').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({model:this.model}));
        $('.modal:last').modal();
        return this;
    },

    onInput: function () {
        var message = '';
        var newFlavor = new Flavor();
        newFlavor.set({'flavor_id': this.$('input[name=flavor_id]').val()});
        newFlavor.set({'name': this.$('input[name=name]').val()});
        newFlavor.set({'vcpus': parseInt(this.$('input[name=vcpus]').val(), 0)});
        newFlavor.set({'ram': parseInt(this.$('input[name=memory_mb]').val(), 0)});
        newFlavor.set({'disk': parseInt(this.$('input[name=disk_gb]').val(), 0)});
        if (this.$('input[name=eph_gb]').val() !== "") {
            newFlavor.set({'ephemeral': parseInt(this.$('input[name=eph_gb]').val(), 0)});
        }

        // Check if there is a similar existing flavor.
        for (var idx in this.options.flavors.models) {
            if (this.options.flavors.models.hasOwnProperty(idx)) {
                var flav = this.options.flavors.models[idx];
                if (flav.get('vcpus') === newFlavor.get('vcpus') &&
                    flav.get('ram') === newFlavor.get('ram') &&
                    flav.get('disk') === newFlavor.get('disk') &&
                    flav.get('ephemeral') === newFlavor.get('ephemeral')
                    ) {
                    message = 'This flavor already exists.';
                }
            }
        }
        console.log(message);
        this.$('input[name=vcpus]')[0].setCustomValidity(message);
        this.$('input[name=memory_mb]')[0].setCustomValidity(message);
        this.$('input[name=disk_gb]')[0].setCustomValidity(message);
        this.$('input[name=eph_gb]')[0].setCustomValidity(message);
    },

    onSubmit: function(e){
        e.preventDefault();
        var subview;
        //Check if the fields are not empty, and the numbers are not negative nor decimal

        if ( (this.$('input[name=flavor_id]').val()==="") ||
             (this.$('input[name=flavor_id]').val()%1!==0) ||
             (this.$('input[name=flavor_id]').val()<=0) ||

             (this.$('input[name=name]').val()==="") ||

             (this.$('input[name=vcpus]').val()==="") ||
             (this.$('input[name=vcpus]').val()%1!==0) ||
             (this.$('input[name=vcpus]').val()<=0) ||

             (this.$('input[name=memory_mb]').val()==="") ||
             (this.$('input[name=memory_mb]').val()<=0) ||
             (this.$('input[name=memory_mb]').val()%1!==0) ||

             (this.$('input[name=disk_gb]').val()==="") ||
             (this.$('input[name=disk_gb]').val()<0) ||

             (this.$('input[name=eph_gb]').val()==="") ||
             (this.$('input[name=eph_gb]').val()%1!==0) ||
             (this.$('input[name=eph_gb]').val()<0)

             ) {

                console.log($('input[name=flavor_id]').val());
                console.log($('input[name=name]').val());
                console.log($('input[name=vcpus]').val());
                console.log($('input[name=memory_mb]').val());
                console.log($('input[name=disk_gb]').val());
                console.log($('input[name=eph_gb]').val());

              subview = new MessagesView({state: "Error", title: "Wrong input values for flavor. Please try again."});
              subview.render();
        } else {
            var newFlavor = new Flavor();
            newFlavor.set({'flavor_id': this.$('input[name=flavor_id]').val()});
            newFlavor.set({'name': this.$('input[name=name]').val()});
            newFlavor.set({'vcpus': parseInt(this.$('input[name=vcpus]').val(), 0)});
            newFlavor.set({'ram': parseInt(this.$('input[name=memory_mb]').val(), 0)});
            newFlavor.set({'disk': parseInt(this.$('input[name=disk_gb]').val(), 0)});
            if (this.$('input[name=eph_gb]').val() !== "") {
                newFlavor.set({'ephemeral': parseInt(this.$('input[name=eph_gb]').val(), 0)});
            }

            // Check if there is a similar existing flavor.
            for (var idx in this.options.flavors.models) {
                if (this.options.flavors.models.hasOwnProperty(idx)) {
                    var flav = this.options.flavors.models[idx];
                    if (flav.get('vcpus') === newFlavor.get('vcpus') &&
                        flav.get('ram') === newFlavor.get('ram') &&
                        flav.get('disk') === newFlavor.get('disk') &&
                        flav.get('ephemeral') === newFlavor.get('ephemeral')
                        ) {
                        subview = new MessagesView({state: "Error", title: "This flavor already exists. Please try again."});
                        subview.render();
                    }
                }
            }

            newFlavor.save(undefined, UTILS.Messages.getCallbacks("Flavor "+newFlavor.get("name") + " created.", "Error creating flavor "+newFlavor.get("name"), {context: this}));
        }
    }

});
var CreateKeypairView = Backbone.View.extend({

    _template: _.itemplate($('#createKeypairFormTemplate').html()),

    events: {
      'click #cancelCreateBtn': 'close',
      'click #close': 'close',
      'submit #create_keypair_form': 'create',
      'click .modal-backdrop': 'close',
      'click #name': 'showTooltipName'
    },

    render: function () {
        $(this.el).append(this._template({model:this.model}));
        $('.modal:last').modal();
        $('.createKeypair').attr("download", '.pem');
        return this;
    },

    close: function(e) {
        this.onClose();
    },

    onClose: function () {
        $('#create_keypair').remove();
        $('.modal-backdrop').remove();
        this.undelegateEvents();
        this.unbind();
    },

    showTooltipName: function() {
        $('#name').tooltip('show');
    },

    create: function(e) {
        e.preventDefault();
        self = this;
        var namePattern = /^[A-Za-z0-9_\-]{1,87}$/;
        var name = $('input[name=name]').val();
        var nameOK, subview;

        nameOK = namePattern.test(name);

        if (nameOK) {
            for (var index in self.model.models) {
                if (self.model.models[index].attributes.name === name) {
                    subview = new MessagesView({state: "Error", title: "Keypair "+name+" already exists. Please try again."});
                    subview.render();
                    return;
                }
            }
            var mySuccess = function(model) {
                var privateKey = model.get('private_key');
                self.blob = new Blob([privateKey], { type: "application/x-pem-file" });
                self.blobURL = window.URL.createObjectURL(self.blob);

                //window.open(blobURL, 'Save Keypair','width=0,height=0');

                $('.downloadKeypair').append("Download Keypair");
                $('.downloadKeypair').attr("href", self.blobURL);
                $('.downloadKeypair').attr("download", name + '.pem');
                $('.downloadKeypair').on("click", function() {
                    if (window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(self.blob, name + ".pem");
                    }
                });
                if (self.options.callback !== undefined) {
                    self.options.callback(model);
                }    
            };
            var callbacks = UTILS.Messages.getCallbacks("Keypair " + name + " created.", "Error creating keypair", {success: mySuccess});
            var keypair = new Keypair();
            keypair.set({'name': name});
            keypair.save(undefined, callbacks);

        } else {
            subview = new MessagesView({state: "Error", title: "Wrong values for Keypair. Please try again."});
            subview.render();
        }

        $('#createBtn1').hide();
        $('#cancelBtn1').text('Close');
    }
});
var CreateNetworkView = Backbone.View.extend({

    _template: _.itemplate($('#createNetworkFormTemplate').html()),

    events: {
      'click #cancelBtn-network': 'close',
      'click .close': 'close',
      'click .modal-backdrop': 'close',
      'click #switch_subnet': 'switch_subnet',
      'submit #form': 'create'
    },

    initialize: function() {
        this.add_subnet = false;
    },

    render: function () {
        if ($('#create_network').html() != null) {
            return;
        }
        $(this.el).append(this._template({model:this.model, subnets: this.options.subnets, tenant_id: this.options.tenant_id}));
        $('#create_network').modal();
        return this;
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
    },

    close: function(e) {
        if (e !== undefined) {
            e.preventDefault();
        }
        $('#create_network').remove();
        $('.modal-backdrop:last').remove();
        this.onClose();
        this.model.unbind("sync", this.render, this);
    },

    prefix_ip_version: function(cidr) {
	var cidr_ipv4 = /^((\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\/(3[012]|[012]?\d)$/i;
	var cidr_ipv6 = /^\s*((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*\/(1([01]\d|2[0-8])|\d\d?)$/i;
        if (cidr_ipv4.test(cidr)) {
            return 4;
        } else if (cidr_ipv6.test(cidr)) {
            return 6;
        }
    },

    switch_subnet: function(e) {
        if (this.add_subnet) {

            $('#subnet_details').addClass('hide');
            $('#switch_subnet').html('Add subnet');
            $('#network_modal').css('height', '140px');
            document.getElementById('network_address').removeAttribute('pattern');
            document.getElementById('network_address').removeAttribute('required');

            this.add_subnet = false;

        } else {

            $('#subnet_details').removeClass('hide');
            $('#switch_subnet').html('Remove subnet');
            $('#network_modal').css('height', '475px');

            var reg = new RegExp();
            $('#network_address').attr('pattern', '^((\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\.){3}(\\d|[1-9]\\d|1\\d{2}|2[0-4]\\d|25[0-5])\\/(3[012]|[012]?\\d)$|^\\s*((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(\\.(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:)))(%.+)?\\s*\\/(1([01]\\d|2[0-8])|\\d\\d?)$');
            $('#network_address').attr('required', 'required');

            this.add_subnet = true;
        }
    },

    create: function(e) {
        
        var self = this;

        var network = new Network();
        var name = $('input[name=network]').val();
        var admin_state = this.$('input[name=admin_state]').is(':checked');
        
        network.set({'admin_state_up': admin_state});

        if (name !== "") network.set({'name': name});
        
        if (this.add_subnet) {

            var subnet = new Subnet();
            var tenant_id = this.options.tenant_id;
            var subnet_name = $('input[name=subnet_name]').val();
            var cidr = $('input[name=network_address]').val();
            var ip_version = self.prefix_ip_version(cidr);
            var gateway_ip = $('input[name=gateway_ip]').val();

            var enable_dhcp = this.$('input[name=enable_dhcp]').is(':checked');
            var allocation_pools = $('textarea[name=allocation_pools]').val();
            var dns_name_servers = $('textarea[name=dns_name_servers]').val();
            var host_routers = $('textarea[name=host_routers]').val();

            
            subnet.set({'cidr': cidr});
            subnet.set({'ip_version': ip_version});
            subnet.set({'tenant_id': tenant_id});
            subnet.set({'enable_dhcp': enable_dhcp});

            if (subnet_name !== "") subnet.set({'name': subnet_name});
            if (gateway_ip !== "") subnet.set({'gateway_ip': gateway_ip});

            if (allocation_pools !== "") {
                var pools = [];
                var lines = allocation_pools.split('\n');
                for (var l in lines) {
                    var pool = {start: lines[l].split(',')[0], end: lines[l].split(',')[1]};
                    pools.push(pool);
                }
                subnet.set({'allocation_pools': pools});
            }

            if (dns_name_servers !== "") {
                var dnss = dns_name_servers.split('\n');
                subnet.set({'dns_nameservers': dnss});
            }

            if (host_routers !== "") {
                var hosts = [];
                var lines1 = host_routers.split('\n');
                for (var l1 in lines1) {
                    var host = {destination: lines1[l1].split(',')[0], nexthop: lines1[l1].split(',')[1]};
                    hosts.push(host);
                }
                subnet.set({'host_routers': hosts});
            }

        
            //console.log('CON SUBNET', network.attributes, subnet.attributes);
           
            network.save(undefined, {success: function(model, response) {     
                var network_id = model.attributes.network.id; 
                subnet.set({'network_id': network_id});
                subnet.save(undefined, UTILS.Messages.getCallbacks("Network " + name + " created.", "Error creating network " + name, {context: self}));   
            }, error: function(response) {
                console.log("error", response);
            }});  

        } else {
            //console.log('NO SUBNET', network.attributes);
            network.save(undefined, UTILS.Messages.getCallbacks("Network " + name + " created.", "Error creating network " + name, {context: self})); 
        }             
    }
});

var CreateProjectView = Backbone.View.extend({

    _template: _.itemplate($('#createProjectFormTemplate').html()),

    events: {
        'submit #form': 'onCreate',
        'click #cancelBtn': 'close',
        'click #close': 'close',
        'click .modal-backdrop': 'close'
    },

    initialize: function() {
        this.options = this.options || {};
        this.options.roles = new Roles();
        this.options.roles.fetch();
    },

    close: function(e) {
        $('#create_project').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($('#create_project').html() != null) {
            $('#create_project').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({model:this.model}));
        $('.modal:last').modal();
        return this;
    },

    onCreate: function(e){
        var self = this;
        e.preventDefault();
        var name = this.$('input[name=name]').val();
        var descr = this.$('textarea[name=description]').val();
        var enabled = this.$('input[name=enabled]').is(':checked');
        var project = new Project();
        project.set({'name': name});
        project.set({'description': descr});
        project.set({'enabled': enabled});
        var callbacks = UTILS.Messages.getCallbacks("Project "+project.get("name") + " created.", "Error creating project "+project.get("name"));
        var cbs = {};
        cbs.success = function(resp) {
            console.log("resp ", resp);
            var proj = resp.get('tenant').id;
            //TODO Add user to project
            var myId = Utils.Me().get('id');
            var roleReg;
            for (var idx in self.options.roles.models) {
                var role = self.options.roles.models[idx];
                if (role.get('name') === "admin") {
                    roleReg = role.get('id');
                }
            }
            if (roleReg) {
                Utils.Me().addRole(roleReg, proj, UTILS.Messages.getCallbacks("User added to project.", "Error adding user to project", {context: self}));
            }
        };
        cbs.error = callbacks.error;
        project.save(undefined, cbs);

    }

});
var CreateRouterView = Backbone.View.extend({

    _template: _.itemplate($('#createRouterFormTemplate').html()),

    events: {
      'click #cancelBtn-router': 'close',
      'click .close': 'close',
      'click .modal-backdrop': 'close',
      'submit #form': 'create'
    },

    initialize: function() {
    },

    render: function () {
        if ($('#create_router').html() != null) {
            return;
        }
        $(this.el).append(this._template({model:this.model, tenant_id: this.options.tenant_id}));
        $('#create_router').modal();
        return this;
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
    },

    close: function(e) {
        if (e !== undefined) {
            e.preventDefault();
        }
        $('#create_router').remove();
        $('.modal-backdrop:last').remove();
        this.onClose();
        this.model.unbind("sync", this.render, this);
    },

    create: function(e) {
        var self = this;
        var router = new Router();
        var name = $('input[name=router]').val();
        
        if (name !== "") {
            router.set({'name': name});
            router.save(undefined, UTILS.Messages.getCallbacks("Router "+router.get("name") + " created.", "Error creating router "+router.get("name"), {context: self})); 
        }

        
    }
});
var CreateSecurityGroupView = Backbone.View.extend({

    _template: _.itemplate($('#createSecurityGroupFormTemplate').html()),

    events: {
      'click #create_security_group #cancelBtn': 'close',
      'click #create_security_group #close': 'close',
      'submit #create_security_group #form': 'createSecurityGroup',
      'click .modal-backdrop:last': 'close',
      'click #name': 'showTooltipName',
      'input input': 'onInput'
    },

    render: function (options) {
        $(this.el).append(this._template({securityGroupsModel: this.model}));
        $('#create_security_group').modal(options);
        return this;
    },

    close: function(e) {
        this.model.unbind("change", this.render, this);
        $('#create_security_group + .modal-backdrop:last').remove();
        $('#create_security_group').remove();
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    showTooltipName: function() {
        $('#name').tooltip('show');
    },

    onInput: function (e) {
        e.preventDefault();
        self = this;
        var name = $('input[name=name]').val();
        var message = '';

        for (var index in self.model.models) {
            if (self.model.models[index].get('name') === name) {
                message = "Security group already exists";
            }
        }
        this.$('input[name=name]')[0].setCustomValidity(message);

    },

    createSecurityGroup: function(e) {
        e.preventDefault();
        self = this;
        var namePattern = /^[a-z0-9_\-]{1,87}$/;
        var name = $('input[name=name]').val();
        var description = $('input[name=description]').val();
        var nameOK, descriptionOK, subview;

        nameOK = namePattern.test(name) ? true : false;

        descriptionOK = (description !== "" && description !== undefined) ? true : false;

        if (nameOK && descriptionOK) {
            for (var index in self.model.models) {
                if (self.model.models[index].get('name') === name) {
                    subview = new MessagesView({state: "Error", title: "Security Group "+name+" already exists. Please try again."});
                    subview.render();
                    return;
                }
            }
            var newSecurityGroup = new SecurityGroup();
            newSecurityGroup.set({'name': name, 'description': description});
            newSecurityGroup.save(undefined, UTILS.Messages.getCallbacks("Security group "+name + " created.", "Error creating security group "+name, {context: self, success: function() {
                if (self.options.callback !== undefined) {
                    self.options.callback(true);
                }    
            }, error: function() {
                if (self.options.callback !== undefined) {
                    self.options.callback(false);
                }  
            }}));
            
        } else {
            subview = new MessagesView({state: "Error", title: "Wrong values for Security Group. Please try again."});
            subview.render();
            if (self.options.callback !== undefined) {
                self.options.callback(false);
            }
            self.close();
        }
    }

});
var CreateSnapshotView = Backbone.View.extend({

    _template: _.itemplate($('#createSnapshotFormTemplate').html()),

    events: {
      'click #cancelBtn': 'close',
      'click #close': 'close',
      'submit #form': 'update',
      'click .modal-backdrop': 'close'
    },

    initialize: function() {
    },

    render: function () {
        if ($('#create_snapshot').html() != null) {
            return;
        }
        $(this.el).append(this._template({model:this.model}));
        $('.modal:last').modal();
        return this;
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    close: function(e) {
        this.model.unbind("change", this.render, this);
        $('#create_snapshot').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    update: function(e) {
        var name = $('input[name=snapshot_name]').val();
        this.model.createimage(name, UTILS.Messages.getCallbacks("Snapshot "+ name + " created", "Error creating snapshot " + name, {context: this}));
    }

});
var CreateSoftwareView = Backbone.View.extend({

    _template: _.itemplate($('#createSoftwareFormTemplate').html()),

    tableView: undefined,
    tableViewNew: undefined,

    events: {
      'click #cancelBtn-software': 'close',
      'click .close': 'close',
      'click .modal-backdrop': 'close',
      'submit form': 'create',
      'click input[name=so]': 'switchSO'
    },

    initialize: function() {
        this.addedProducts = [];
        this.options.images = UTILS.GlobalModels.get("images");
        this.model.unbind("sync", this.renderTables, this);
        this.model.bind("sync", this.renderTables, this);
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
    },

    close: function(e) {
        if (e !== undefined) {
            e.preventDefault();
        }
        $('#create_software').remove();
        $('.modal-backdrop:last').remove();
        this.onClose();
        this.model.unbind("sync", this.render, this);
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
            label: "Remove",
            action: "remove",
            activatePattern: groupSelected
        }];
    },

    getHeaders: function() {
        return [{
            name: "Name",
            tooltip: "Software name",
            size: "55%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var entries = [];

        for (var product in this.addedProducts) {

            entries.push(
                {id: product, cells:[
                    {value: this.addedProducts[product].get('name') + ' ' + this.addedProducts[product].get('version'),
                    tooltip: this.addedProducts[product].get('description')}
                    ]
                });

        }

        return entries;
    },

    getDropdownButtonsNew: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        var self = this;
        var groupSelected = function(size, id) {
            if (size >= 1) {
                return true;
            }
        };
        return [{
            label: "Add",
            action: "add",
            activatePattern: groupSelected
        }];
    },

    getHeadersNew: function() {
        return [{
            name: "Name",
            tooltip: "Software name",
            size: "40%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getEntriesNew: function() {
        var entries = [];
        var products = this.model.models;

        if (products === undefined) {
            return 'loading';
        }

        for (var product in products) {
            entries.push(
                {id: product, cells:[
                {value: products[product].get('name') + ' ' + products[product].get('version'),
                tooltip: products[product].get('description')}]});
        }

        return entries;

    },

    movingSoftware: function(id, targetId) {
        var product = this.addedProducts[id];
        this.addedProducts.splice(id, 1);
        var offset = 0;
        if (id < targetId) {
            offset = 1;
        }
        targetId = targetId || this.addedProducts.length - offset;
        console.log("Moving to: ", targetId);
        this.addedProducts.splice(targetId, 0, product);
        this.tableView.render();
    },

    onAction: function(action, ids) {

        var self = this;

        var product;

        switch (action) {
            case 'add':
                this.installSoftware(ids);
            break;
            case 'remove':
                this.uninstallSoftware(ids);
            break;
        }
        return false;
    },

    installSoftware: function(id, targetId) {
        product = this.model.models[id];
        var exists = false;
        for (var a in this.addedProducts) {
            if (this.addedProducts[a].get('name') === product.get('name')) {
                exists = true;
                continue;
            }
        }
        if (!exists) {
            //this.addedProducts.push(product);
            targetId = targetId || this.addedProducts.length;
            console.log("Installing on: ", targetId);
            this.addedProducts.splice(targetId, 0, product);
            this.tableView.render();
        }
    },

    uninstallSoftware: function(id) {
        this.addedProducts.splice(id, 1);
        this.tableView.render();
    },

    onCatalogDrag: function(entryId) {
        console.log("Obtained:", entryId);
        return entryId;
    },

    onCatalogDrop: function(targetId, entryId) {
        console.log("Uninstalled:", targetId, entryId);
        this.uninstallSoftware(entryId);
    },

    onInstalledSoftwareDrop: function(targetId, entryId) {
        console.log("Installing:", targetId, entryId);
        this.installSoftware(entryId, targetId);
    },

    onInstalledSoftwareDrag: function(entryId) {
        return entryId;
    },

    onInstalledSoftwareMove: function(targetId, entryId) {
        console.log("Moving:", targetId, entryId);
        this.movingSoftware(entryId, targetId);
    },

    switchSO: function(e) {
        var length = $('input[name=so]:checked').length;
        var i;
    
        if (length !== 0) {
            for (i = 0; i < $('input[name=so]').length; i++) {
                $('input[name=so]')[i].setCustomValidity('');
            }
        } else {
            for (i = 0; i < $('input[name=so]').length; i++) {
                $('input[name=so]')[i].setCustomValidity('Select at least one operating system');
            }
        }
    },

    create: function(e) {

        console.log('CREATE');

        var self = this;

        var software = new SoftwareCatalog();

        var name = $('input[name=name]').val();
        var version = $('input[name=version]').val();
        var repo = $('select[name=repo]').val();
        var url = $('input[name=url]').val();
        var config_management = $('input[name=config_management]:checked').val();

        var sos = [];

        for (i = 0; i < $('input[name=so]:checked').length; i++) {
            sos.push($('input[name=so]:checked')[i].value);
        }
        
        var description = $('textarea[name=description]').val();
        var attributes = $('textarea[name=attributes]').val();
        var tcp_ports = $('input[name=tcp_ports]').val();
        var udp_ports = $('input[name=udp_ports]').val();

        software.set({'name': name});
        software.set({'version': version});
        software.set({'repo': repo});
        software.set({'url': url});
        software.set({'config_management': config_management});
        software.set({'operating_systems': sos});

        if (description !== "") software.set({'description': description});

        if (attributes !== "") {
            var at = [];
            var lines = attributes.split('\n');
            for (var l in lines) {
                var a = {attribute: lines[l].split(',')[0], value: lines[l].split(',')[1], description: lines[l].split(',')[2]};
                at.push(a);
            }
            software.set({'attributes': at});
        }

        if (tcp_ports !== "") {
            var tport = tcp_ports.split(',');
            software.set({'tcp_ports': tport});
        }

        if (udp_ports !== "") {
            var uport = udp_ports.split(',');
            software.set({'udp_ports': uport});
        }
        
        if (this.addedProducts.length !== 0) {
            var prods = [];
            var prod; 
            for (var p in this.addedProducts) {
                prod = {name: this.addedProducts[p].get('name'), version: this.addedProducts[p].get('version')};
                prods.push(prod);
            }
            software.set({'dependencies': prods});
        }

        console.log('VA', software.attributes);
        software.save(undefined, UTILS.Messages.getCallbacks("Software " + name + " created.", "Error creating software " + name, {context: self}));          
    },

    renderTables: function () {
        this.tableView.render();
        this.tableViewNew.render();
    },

    render: function () {
        if ($('#create_software').html() != null) {
            return;
        }
        $(this.el).append(this._template({model:this.model, images: this.options.images}));
        $('#create_software').modal();

        for (var i = 0; i < $('input[name=so]').length; i++) {
            $('input[name=so]')[i].setCustomValidity('Select at least one operating system');
        }

        this.tableView = new TableView({
            el: '#installedSoftware-table',
            actionsClass: "actionsSDCTier",
            headerClass: "headerSDCTier",
            bodyClass: "bodySDCTier",
            footerClass: "footerSDCTier",
            onAction: this.onAction,
            getDropdownButtons: this.getDropdownButtons,
            getMainButtons: function(){return[];},
            getHeaders: this.getHeaders,
            getEntries: this.getEntries,
            disableActionButton: true,
            context: this,
            order: false,
            draggable: true,
            dropable: true,
            sortable: true,
            onDrop: this.onInstalledSoftwareDrop,
            onDrag: this.onInstalledSoftwareDrag,
            onMove: this.onInstalledSoftwareMove
        });

        // catalogo
        this.tableViewNew = new TableView({
            el: '#newSoftware-table',
            actionsClass: "actionsSDCTier",
            headerClass: "headerSDCTier",
            bodyClass: "bodySDCTier",
            footerClass: "footerSDCTier",
            onAction: this.onAction,
            getDropdownButtons: this.getDropdownButtonsNew,
            getMainButtons: function(){return[];},
            getHeaders: this.getHeadersNew,
            getEntries: this.getEntriesNew,
            disableActionButton: true,
            context: this,
            dropable: true,
            draggable: true,
            onDrag: this.onCatalogDrag,
            onDrop: this.onCatalogDrop
        });
        this.tableView.render();
        this.tableViewNew.render();
    
        return this;
    }
});
var CreateSubnetView = Backbone.View.extend({

    _template: _.itemplate($('#createSubnetFormTemplate').html()),

    events: {
      'click #cancelBtn-subnet': 'close',
      'click .close': 'close',
      'click .modal-backdrop': 'close',
      'submit #form': 'create'
    },

    initialize: function() {
    },

    render: function () {
        if ($('#create_subnet').html() != null) {
            return;
        }
        $(this.el).append(this._template({tenant_id: this.options.tenant_id, network_id: this.options.network_id}));
        $('#create_subnet').modal();
        return this;
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
    },

    close: function(e) {
        if (e !== undefined) {
            e.preventDefault();
        }
        $('#create_subnet').remove();
        $('.modal-backdrop:last').remove();
        this.onClose();
    },

    create: function(e) {
        var self = this;
        var network_id = this.options.network_id;
        
        var subnet = new Subnet();
        var tenant_id = this.options.tenant_id;
        var subnet_name = $('input[name=subnet_name]').val();
        var cidr = $('input[name=network_address]').val();
        //var ip_version = $('select[name=ip_version]').val();
        var gateway_ip = $('input[name=gateway_ip]').val();

        var enable_dhcp = this.$('input[name=enable_dhcp]').is(':checked');
        var allocation_pools = $('textarea[name=allocation_pools]').val();
        var dns_name_servers = $('textarea[name=dns_name_servers]').val();
        var host_routes = $('textarea[name=host_routes]').val();

        subnet.set({'network_id': network_id});    
        subnet.set({'cidr': cidr});
        subnet.set({'ip_version': subnet.prefix_ip_version(cidr)});
        subnet.set({'tenant_id': tenant_id});
        subnet.set({'enable_dhcp': enable_dhcp});

        if (subnet_name !== "") subnet.set({'name': subnet_name});
        if (gateway_ip !== "") subnet.set({'gateway_ip': gateway_ip});

        if (allocation_pools !== "") {
            var pools = [];
            var lines = allocation_pools.split('\n');
            for (var l in lines) {
                var pool = {start: lines[l].split(',')[0], end: lines[l].split(',')[1]};
                pools.push(pool);
            }
            subnet.set({'allocation_pools': pools});
        }

        if (dns_name_servers !== "") {
            var dnss = dns_name_servers.split('\n');
            subnet.set({'dns_nameservers': dnss});
        }

        if (host_routes !== "") {
            var hosts = [];
            var lines1 = host_routes.split('\n');
            for (var l1 in lines1) {
                var host = {destination: lines1[l1].split(',')[0], nexthop: lines1[l1].split(',')[1]};
                hosts.push(host);
            }
            subnet.set({'host_routes': hosts});
        }

        //console.log('CON SUBNET', subnet.attributes);
                 
        subnet.save(undefined, UTILS.Messages.getCallbacks("Subnet " + subnet_name + " created.", "Error creating subnet " + subnet_name, {context: self, success: self.options.success_callback}));   
    }       
});

var CreateUserView = Backbone.View.extend({

    _template: _.itemplate($('#createUserFormTemplate').html()),

    events: {
        'submit #form': 'onCreate',
        'input .password': 'onInput',
        'click #cancelBtn': 'close',
        'click #close': 'close',
        'click .modal-backdrop': 'close',
        'click .btn-eye': 'showPassword',
        'click .btn-eye-active': 'hidePassword'
    },

    close: function(e) {
        $('#create_user').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($('#create_user').html() != null) {
            $('#create_user').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({tenants:this.options.tenants}));
        $('.modal:last').modal();
        return this;
    },

    onInput: function() {
        console.log("on input");
        console.log(this.$('input[name=user_password]').val());
        console.log(this.$('input[name=confirm_password]').val());
        var message = '';
        var password = this.$('input[name=user_password]').val();
        var confirm = this.$('input[name=confirm_password]').val();
        if (password !== confirm) {
            message = 'Please, confirm the password.';
        }
        console.log(message);
        this.$('input[name=confirm_password]')[0].setCustomValidity(message);
    },

    showPassword: function() {
        console.log($('.user_password').val());
        var password = this.$('input[name=user_password]').val();
        var confirm_password = this.$('input[name=confirm_password]').val();
        console.log("confirm_pass = "+this.$('input[name=confirm_password]').val());
        $('#user_password').replaceWith('<input required id="user_password" type="text" class="password" name="user_password" maxlength="255">');
        $('#confirm_password').replaceWith('<input required id="confirm_password" type="text" class="password" name="confirm_password" maxlength="255">');
        $('#user_password').val(password);
        $('#confirm_password').val(confirm_password);
        $('.btn-eye').hide();
        $('.btn-eye-active').show();
        this.onInput();
    },

    hidePassword: function() {
        console.log($('.show_password').val());
        var password = this.$('input[name=user_password]').val();
        var confirm_password = this.$('input[name=confirm_password]').val();
        $('#user_password').replaceWith('<input required id="user_password" type="password" class="password" name="user_password" maxlength="255">');
        $('#confirm_password').replaceWith('<input required id="confirm_password" type="password" class="password" name="confirm_password" maxlength="255">');
        $('#user_password').val(password);
        $('#confirm_password').val(confirm_password);
        $('.btn-eye').show();
        $('.btn-eye-active').hide();
        this.onInput();
    },

    onCreate: function(e){
        e.preventDefault();
        var name = this.$('input[name=name]').val();
        var email = this.$('input[name=email]').val();
        var password = this.$('input[name=user_password]').val();
        var tenant_name;
        $("#project_switcher option:selected").each(function () {
                var tenant = $(this).val();
                if (tenant !== "") {
                    tenant_id = tenant;
                }
        });
        var user = new User();
        user.set({'name': name});
        user.set({'email': email});
        user.set({'password': password});
        user.set({'tenant_id': tenant_id});
        user.set({'enabled': true});
        user.save(undefined, UTILS.Messages.getCallbacks("User "+user.get("name") + " created.", "Error creating user "+user.get("name"), {context: this}));
    }

});
var CreateVolumeBackupView = Backbone.View.extend({

    _template: _.itemplate($('#createVolumeBackupFormTemplate').html()),

    events: {
      'click #cancelBtn': 'close',
      'click .close': 'close',
      'click #createBtn': 'create',
      'click .modal-backdrop': 'close'
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
    },

    initialize: function() {
    },

    render: function () {
        if ($('#create_volume_modal').html() != null) {
            return;
        }
        $(this.el).append(this._template());
        $('.modal:last').modal();
        return this;
    },

    close: function(e) {
        $('#create_volume_backup_modal').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    create: function(e) {
        var name = $('input[name=name]').val();
        var description = $('textarea[name=description]').val();
        var backup = new VolumeBackup();
        backup.set({volume_id: this.options.volume_id, name: name, description: description});
        backup.save(undefined, UTILS.Messages.getCallbacks("Volume backup "+ name + " created.", "Error creating volume backup "+ name, {context: this}));
    }

});
var CreateVolumeSnapshotView = Backbone.View.extend({

    _template: _.itemplate($('#createVolumeSnapshotFormTemplate').html()),

    events: {
      'click #cancelBtn': 'close',
      'click .close': 'close',
      'click #createBtn': 'create',
      'click .modal-backdrop': 'close'
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
    },

    initialize: function() {
    },

    render: function () {
        if ($('#create_volume_modal').html() != null) {
            return;
        }
        $(this.el).append(this._template());
        $('.modal:last').modal();
        return this;
    },

    close: function(e) {
        $('#create_volume_snapshot_modal').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    create: function(e) {
        var name = $('input[name=name]').val();
        var description = $('textarea[name=description]').val();
        var snapshot = new VolumeSnapshot();
        //this.options.volumeSnapshotsModel = new VolumeSnapshot();
        snapshot.set({volume_id: this.options.volume_id, name: name, description: description});
        snapshot.save(undefined, UTILS.Messages.getCallbacks("Volume snapshot "+ name + " created.", "Error creating volume snapshot "+ name, {context: this}));
    }

});
var CreateVolumeView = Backbone.View.extend({

    _template: _.itemplate($('#createVolumeFormTemplate').html()),

    events: {
          'submit #form': 'create',
          'click #cancelBtn': 'close',
          'click #close': 'close',
          'click .modal-backdrop': 'close'
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
    },

    initialize: function() {
    },

    render: function () {
        if ($('#create_volume_modal').html() != null) {
            return;
        }
        $(this.el).append(this._template());
        $('.modal:last').modal();
        return this;
    },

    close: function(e) {
        $('#create_volume_modal').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    create: function(e) {
        e.preventDefault();
        var name = $('input[name=name]').val();
        var description = $('textarea[name=description]').val();
        var size= $('input[name=size]').val();
        this.model = new Volume();
        this.model.set({name: name, description: description, size: size});
        this.model.save(undefined, UTILS.Messages.getCallbacks("Volume " + name + " created", "Error creating volume " + name, {context: this}));
    }

});

var DownloadKeypairView = Backbone.View.extend({

    _template: _.itemplate($('#downloadKeypairFormTemplate').html()),
    blob: undefined,
    blobURL: undefined,
    initialize: function() {
    },

    events: {
    },

    render: function () {
        $(this.el).html(this._template({model:this.model}));
        this.createKeypair();
        return this;
    },

    createKeypair: function(e) {
        var name = this.model.get('name');
        var self = this;
        var mySuccess = function(model) {
            var privateKey = model.get('private_key');
            self.blob = new Blob([privateKey], { type: "application/x-pem-file" });
            self.blobURL = window.URL.createObjectURL(self.blob);

            //window.open(blobURL, 'Save Keypair','width=0,height=0');

            $('.downloadKeypair').append("Download Keypair");
            $('.downloadKeypair').attr("href", self.blobURL);
            $('.downloadKeypair').attr("download", name + '.pem');
            $('.downloadKeypair').on("click", function() {
                if (window.navigator.msSaveOrOpenBlob) {
                    window.navigator.msSaveOrOpenBlob(self.blob, name + ".pem");
                }
            });            
        };
        var callbacks = UTILS.Messages.getCallbacks("Keypair " + name + " created.", "Error creating keypair", {success: mySuccess});
        this.model.save(undefined, callbacks);
    }
});

var EditBlueprintView = Backbone.View.extend({

    _template: _.itemplate($('#editBlueprintFormTemplate').html()),

    events: {
        'submit #form': 'onCreate',
        'click #cancelBtn': 'close',
        'click #close': 'close',
        'click .modal-backdrop': 'close'
    },

    initialize: function() {
        this.options = this.options || {};
    },

    close: function(e) {
        $('#edit_blueprint').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($('#edit_blueprint').html() != null) {
            $('#edit_blueprint').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({model:this.model}));
        $('.modal:last').modal();
        return this;
    },

    onCreate: function(e){
        var self = this;
        e.preventDefault();
        var name = this.$('input[name=name]').val();
        var descr = this.$('textarea[name=description]').val();
        var callbacks = UTILS.Messages.getCallbacks("Blueprint "+name + " updated.", "Error editing blueprint "+name);
        //blueprint.save(undefined, callbacks);
    }
});
var EditGaoFangIPRulesView = Backbone.View.extend({

    _template: _.itemplate($('#editGaoFangIPRulesFormTemplate').html()),

    tableView: undefined,

    events: {
        'click #closeModal': 'close',
        'click #deleteRuleBtn': 'deleteRule',
        'click #cancel': 'close',
        'submit #rulesForm': 'createRule',
        'click .editSecGroup': 'close',
        'click #from_port': 'showTooltipFromPort',
        'click #to_port': 'showTooltipToPort',
        'click #cidr': 'showTooltipCidr',
        'change .secGroupSelect': 'dissapearCIDR',
        'change .IPProtocolSelect': 'changeInputs'
    },

    initialize: function() {
        console.log("initializing EditGaoFangIPRulesView");
        var self = this;
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [];
    },

    getDropdownButtons: function() {
        return [];
    },

    getHeaders: function() {
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        return [{
            name: "IP Protocol",
            tooltip: "TCP, UDP, ...",
            size: "20%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "From Port",
            tooltip: "Min port number",
            size: "20%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "To Port",
            tooltip: "Max port number",
            size: "20%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Source",
            tooltip: "Source address",
            size: "20%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Action",
            tooltip: "Available actions",
            size: "20%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var entries = [];
        var securityGroupsModel = this.model.get(this.options.securityGroupId);
        console.log("get securityGroupsModel in edit gaofangip view");
        var securityGroupRules;
/*        for (var i in securityGroupsModel.get('rules')) {
            securityGroupRules = securityGroupsModel.get('rules')[i];
            if (securityGroupRules.from_port === null || securityGroupRules.ip_protocol === null) {
                continue;
            }
            var entry = {
                id: securityGroupRules.id,
                cells: [{
                    value: securityGroupRules.ip_protocol.toUpperCase()
                }, {
                    value: securityGroupRules.from_port
                }, {
                    value: securityGroupRules.to_port
                }, {
                    value: securityGroupRules.group.name !== undefined ? securityGroupRules.group.name : securityGroupRules.ip_range.cidr+" (CIDR)"
                }, {
                    value: '<button type="button" id="deleteRuleBtn" value="' + securityGroupRules.id + '" class="ajax-modal btn btn-small btn-blue btn-delete btn-danger"  data-i18n="Delete Rule">Delete Rule</button>'
                }]
            };
            entries.push(entry);
        }*/
            var entry = {
                id: "111",
                cells: [{
                    value: "ip"
                }, {
                    value: "0"
                }, {
                    value: "65535"
                }, {
                    value: "abc"
                }, {
                    value: '<button type="button" id="deleteRuleBtn" value="' + "111" + '" class="ajax-modal btn btn-small btn-blue btn-delete btn-danger"  data-i18n="Delete Rule">Delete Rule</button>'
                }]
            };
            entries.push(entry);
        return entries;
    },

    onAction: function(action, ruleIds) {

    },

    render: function() {
        console.log(this.model);
        console.log(this.options.securityGroupId);
        $(this.el).append(this._template({
            model: this.model,
            securityGroupId: this.options.securityGroupId
        }));
        $('.modal:last').modal();
        $('.modal-backdrop').addClass("editSecGroup");
        this.tableView = new TableView({
            model: this.model,
            el: '#edit_gaofangip_rules',
            onAction: this.onAction,
            getDropdownButtons: this.getDropdownButtons,
            getMainButtons: this.getMainButtons,
            getHeaders: this.getHeaders,
            getEntries: this.getEntries,
            context: this
        });
        this.tableView.render();
        return this;
    },

    autoRender: function() {

        /*$(this.el).find("#edit_security_group_rule").remove();
        $(this.el).append(self._template({
            model: this.model,
            securityGroupId: this.options.securityGroupId
        }));*/
        this.tableView.render();
    },

    close: function(e) {
        this.onClose();
    },

    onClose: function() {
        $('#edit_security_group_rule').remove();
        $('.modal-backdrop').remove();
        this.undelegateEvents();
        this.unbind();
        this.tableView.close();
    },

    showTooltipFromPort: function() {
        $('#from_port').tooltip('show');
    },

    showTooltipToPort: function() {
        $('#to_port').tooltip('show');
    },

    showTooltipCidr: function() {
        $('#cidr').tooltip('show');
    },

    dissapearCIDR: function(e) {
        if ($('.secGroupSelect :selected').val() !== 'CIDR') {
            $('.cidrSelect').hide();
        } else {
            if ($('.cidrSelect:hidden')) {
                $('.cidrSelect').show();
            }
        }
    },

    changeInputs: function(e) {
        if ($('.IPProtocolSelect :selected').val() == 'ICMP') {
            // $("label[for='from_port']").text("Type");
            // $("label[for='to_port']").text("Code");
            $("#from_port").prop('max', 255);
            $("#from_port").prop('min', -1);
            $("#to_port").prop('max', 255);
            $("#to_port").prop('min', -1);
        } else {
            $("label[for='from_port']").text("From Port*");
            $("label[for='to_port']").text("To Port*");
            $("#from_port").prop('max', 65535);
            $("#from_port").prop('min', -1);
            $("#to_port").prop('max', 65535);
            $("#to_port").prop('min', -1);
        }
    },

    deleteRule: function(e) {
        self = this;
        var secGroupRuleId = e.target.value;
        var securityGroupsModel = this.model.get(this.options.securityGroupId);

        var subview = new ConfirmView({
            el: 'body',
            title: "Delete Security Group Rule",
            btn_message: "Delete Security Group Rule",
            onAccept: function() {
                securityGroupsModel.deleteSecurityGroupRule(secGroupRuleId, {
                    callback: function(resp) {
                        securityGroupsModel.fetch({
                            success: function(resp) {
                                self.autoRender();
                                var subview2 = new MessagesView({
                                    state: "Success",
                                    title: "Security Group Rule deleted.",
                                    el: "#log-messages-rules"
                                });
                                subview2.render();
                            }, error: function(model, resp) {
                                var subview3 = new MessagesView({
                                    state: "Error", title: "Error deleting security group rule. Cause: " + resp.message, info: resp.body,
                                    el: "#log-messages-rules"
                                });
                                subview3.render();
                            }
                        });
                    }
                });
            }
        });
        subview.render();
    },

    createRule: function(e) {
        console.log("Creating rule");
        e.preventDefault();
        self = this;

        var cidrOK, fromPortOK, toPortOK;
	// Derived from "Regular Expressions Cookbook, 2nd Edition" by
	// Jan Goyvaerts and Steven Levithan, O'Reilly Media.
	// Copyright Jan Goyvaerts and Steven Levithan, 2012, ISBN
	// 978-1-449-31943-4.
        var cidr_pattern = /^((\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\/(3[012]|[012]?\d)$|^\s*((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*\/(1([01]\d|2[0-8])|\d\d?)$/i;
        //var portPattern = /^([1-65535]){1,5}$/;
        //var icmpPattern = /^([\-1-255]){1,3}$/;

        var parentGroupId = this.options.securityGroupId;
        var ipProtocol = $('.IPProtocolSelect :selected').val();
        var fromPort = $('input[name=fromPort]').val();
        var toPort = $('input[name=toPort]').val();
        var sourceGroup = $('.secGroupSelect :selected').val();
        var cidr = $('input[name=cidr]').val();

        var subview;

        cidrOK = cidr_pattern.test(cidr);
        fromPortOK = (fromPort >= -1 && fromPort <= 65535);
        toPortOK = (toPort >= -1 && toPort <= 65535);

        var securityGroupsModel = self.model.get(this.options.securityGroupId);

        for (var index in securityGroupsModel.get('rules')) {
            var securityGroupRules = securityGroupsModel.get('rules')[index];
            if (securityGroupRules.ip_protocol === null) {
                continue;
            }

            var thisIpProtocol = securityGroupRules.ip_protocol.toUpperCase();
            var thisFromPort = securityGroupRules.from_port;
            var thisToPort = securityGroupRules.to_port;
            var thisSourceGroup = securityGroupRules.group.name;
            var thisCidr = securityGroupRules.ip_range.cidr;

            if ((ipProtocol == thisIpProtocol) && (fromPort == thisFromPort) && (toPort == thisToPort)) {
                console.log("first three equal");
                if ((sourceGroup == thisSourceGroup) || (cidr == thisCidr)) {
                    subview = new MessagesView({
                        state: "Error",
                        title: "Security Group Rule already exists. Please try again.",
                        el: "#log-messages-rules"
                    });
                    subview.render();
                    return false;
                }
            }

        }

        if (cidrOK && fromPortOK && toPortOK) {
            if ($('.secGroupSelect :selected').val() !== 'CIDR') {
                securityGroupsModel.createSecurityGroupRule(ipProtocol, fromPort, toPort, "", sourceGroup, parentGroupId, {
                    callback: function(resp) {
                        securityGroupsModel.fetch({
                            success: function(resp) {
                                self.autoRender();
                                subview = new MessagesView({
                                    state: "Success",
                                    title: "Security group rule created.",
                                    el: "#log-messages-rules"
                                });
                                subview.render();
                            },
                            error: function(model, resp) {
                                var subview3 = new MessagesView({
                                    state: "Error", title: "Error creating security group rule. Cause: " + resp.message, info: resp.body,
                                    el: "#log-messages-rules"
                                });
                                subview3.render();
                            }
                        });
                    }
                });
            } else {
                securityGroupsModel.createSecurityGroupRule(ipProtocol, fromPort, toPort, cidr, undefined, parentGroupId, {
                    callback: function(resp) {
                        securityGroupsModel.fetch({
                            success: function(resp) {
                                self.autoRender();
                                subview = new MessagesView({
                                    state: "Success",
                                    title: "Security group rule created.",
                                    el: "#log-messages-rules"
                                });
                                subview.render();
                            }, error: function(model, resp) {
                                var subview3 = new MessagesView({
                                    state: "Error", title: "Error creating security group rule. Cause: " + resp.message, info: resp.body,
                                    el: "#log-messages-rules"
                                });
                                subview3.render();
                            }
                        });
                    }
                });
            }


        } else {
            subview = new MessagesView({
                state: "Error",
                title: "Wrong input values for Security Group Rule. Please try again.",
                el: "#log-messages-rules"
            });
            subview.render();
        }
    }
});

var EditInstanceSoftwareView = Backbone.View.extend({

    _template: _.itemplate($('#editInstanceSoftwareFormTemplate').html()),

    tableView: undefined,
    tableViewNew: undefined,

    dial: undefined,

    events: {
        'submit #form': 'close',
        'click .close': 'close',
        'click .modal-backdrop': 'close',
        'click #cancel-attrs': 'cancelAttrs',
        'click #accept-attrs': 'acceptAttrs'
    },

    initialize: function() {
        this.options = this.options || {};

        var self = this;
        
        self.model.bind("change", self.render, self);

        this.editing = -1;

    },

    close: function(e) {
        this.onClose();
    },

    onClose: function () {  
        $('#edit_instance_software').remove();
        $('.modal-backdrop').remove();
        this.tableView.close();
        this.tableViewNew.close();
        this.unbind();
        this.undelegateEvents();
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [];
        // [{
        //     label: "Allocate IP to Project",
        //     action: "allocate"
        // }];
    },

    getDropdownButtons: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        var self = this;
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
        return [{
            label: "Uninstall",
            action: "uninstall",
            activatePattern: groupSelected
        // }, {
        //     label: "Edit Attributes",
        //     action: "edit",
        //     activatePattern: oneSelected
        }];
    },

    getHeaders: function() {
        return [{
            name: "Name",
            tooltip: "Software name",
            size: "65%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Status",
            tooltip: "Software name",
            size: "35%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var entries = [];

        if (this.model.models.length === 0) {
            return entries;
        }

        var id = this.options.instanceModel.get("id");
        if (id) {

            var products= this.model.models;

            for (var product in products) {
                var stat = products[product].get('status');
                if (products[product].get('vm').fqn === id) {// && stat !== 'ERROR' && stat !== 'UNINSTALLED') {
                    var name = products[product].get('product').name + ' ' + products[product].get('product').version;
                    entries.push({id:products[product].get('name'), cells:[
                    {value: name,
                    tooltip: products[product].get('description')},
                    {value: products[product].get('status')}]});
                }
            }
        }

        return entries;
    },

    getMainButtonsNew: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [];
        // [{
        //     label: "Allocate IP to Project",
        //     action: "allocate"
        // }];
    },

    getDropdownButtonsNew: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        var self = this;
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
        return [{
            label: "Install",
            action: "install",
            activatePattern: groupSelected
        }];
    },

    getHeadersNew: function() {
        return [{
            name: "Name",
            tooltip: "Software name",
            size: "40%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getEntriesNew: function() {
        var entries = [];
        
        var products = this.options.sdcCatalog.models;

        if (products === undefined) {
            return 'loading';
        }

        for (var product in products) {
            var comp = true;

            if (products[product].get('metadatas').image) {
                comp = false;
                if (typeof(products[product].get('metadatas').image) === 'string') {
                    var compImages = products[product].get('metadatas').image.split(' ');
                    for (var im in compImages) {
                        if (compImages[im] === this.options.instanceModel.get('image').id) {
                            comp = true;
                        }
                    }
                }
            } 

            if (comp) {
                entries.push(
                    {id: product, cells:[
                    {value: products[product].get('name') + ' ' + products[product].get('version'),
                    tooltip: products[product].get('description')}]});
            }

        }
        return entries;

    },

    installSoftware: function(ids) {
        var product = new Software();
        var ip;
        var addrs = this.options.instanceModel.get("addresses");

        if (JSTACK.Keystone.getendpoint(UTILS.Auth.getCurrentRegion(), "network") !== undefined) {
            ip = addrs[Object.keys(addrs)[0]][0].addr;
        } else {
            ip = addrs["private"][0].addr; 
        }
        var fqn = this.options.instanceModel.get("id");
        var name = this.options.sdcCatalog.models[ids[0]].get('name');
        var version = this.options.sdcCatalog.models[ids[0]].get('version');
        var hostname = this.options.instanceModel.get('name');

        product.set({"name": fqn + '_' + name + '_' + version});
        product.set({"ip": ip});
        product.set({"product": {name: name, version: version}});
        product.set({"fqn": fqn});
        product.set({"hostname": hostname});

        product.save(undefined, UTILS.Messages.getCallbacks('Product "' + this.options.sdcCatalog.models[ids[0]].get('name') + '" installing...', 'Error installing product "' + name + '"', {el: '#log-messages-software'}));
    },

    uninstallSoftware: function(ids) {
        var product = this.model.findWhere({name: ids[0]});
        var pname = product.get('productRelease').product.name;
        product.destroy(UTILS.Messages.getCallbacks('Product "' + pname + '" uninstalling...', 'Error uninstalling product "' + ids[0] + '"', {el: '#log-messages-software'}));
    },

    onAction: function(action, ids) {

        var self = this;

        switch (action) {
            case 'install':
                this.installSoftware(ids);
                break;

            case 'uninstall':
                this.uninstallSoftware(ids);
                break;

            case 'edit':
                var product = this.addedProducts[ids];
                this.edit = ids;
                console.log(product);
                var productAttributes = product.attributes_asArray;
                var str='';
                for (var i in productAttributes) {
                    attr = productAttributes[i];
                    str += '<tr id="sec_groups__row__" class="ajax-update status_down"><td>'+attr.key+'</td><td><input type="text" name="attr_'+i+'" value="'+attr.value+'""></td><td>'+attr.description+'</td></tr>';
                }
                if (str === '') {
                    str = '<tr id="sec_groups__row__" class="ajax-update status_down"><td></td><td style="text-align: center;">No items to display</td><td></td></tr>';

                }
                $('#software-attrs-table').html(str);
                $('#software_edit').animate({
                    marginTop: '+=220px'
                }, 300, function() {
                    // Animation complete.
                });
                var effects = {};
                effects["-webkit-filter"] = "blur(1px)";
                effects.opacity = "0.3";
                $('.blurable').animate(effects, 200, function() {
                    $('.blurable').addClass("blur");
                    $('.blurable').bind("click", false);
                });
                $('#attributes_edit').css('display', 'block');
            break;
        }
        return false;
    },

    attrsDone: function() {
        $('#software_edit').animate({
            marginTop: '-=220px'
        }, 300, function() {
            // Animation complete.
        });
        $('#attributes_edit').css('display', 'none');
        var effects = {};
        effects["-webkit-filter"] = "blur(0px)";
        effects.opacity = "1";
        $('.blurable').animate(effects, 100, function() {
            $('.blurable').removeClass("blur");
            $('.blurable').unbind("click", false);
        });

        if (this.addedProducts[this.edit].attributes_asArray) {

            for (var at in this.addedProducts[this.edit].attributes_asArray) {
                var inp = 'input[name=attr_'+ at+']';
                this.addedProducts[this.edit].attributes_asArray[at].value = this.$(inp).val();
            }
        }
    },

    cancelAttrs: function(evt) {
        evt.preventDefault();
        this.attrsDone();
    },

    acceptAttrs: function(evt) {
        evt.preventDefault();
        this.attrsDone();
    },

    onCatalogDrag: function(entryId) {
        return entryId;
    },

    onCatalogDrop: function(targetId, entryId) {
        console.log("Uninstalled:", targetId, entryId);
        this.uninstallSoftware([entryId]);
    },

    onInstalledSoftwareDrop: function(targetId, entryId) {
        console.log("Installing:", targetId, entryId);
        this.installSoftware([entryId]);
    },

    onInstalledSoftwareDrag: function(entryId) {
        return entryId;
    },

    onInstalledSoftwareMove: function(targetId, entryId) {
        //this.movingSoftware(entryId, targetId);
    },

    render: function () {
        if ($('#edit_instance_software').html() !== null) {
            $('#edit_instance_software').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({model:this.model}));
        this.tableView = new TableView({
            el: '#installedInstanceSoftware-table',
            actionsClass: "actionsSDCTier",
            headerClass: "headerSDCTier",
            bodyClass: "bodySDCTier",
            footerClass: "footerSDCTier",
            onAction: this.onAction,
            getDropdownButtons: this.getDropdownButtons,
            getMainButtons: this.getMainButtons,
            getHeaders: this.getHeaders,
            getEntries: this.getEntries,
            disableActionButton: true,
            dropable: true,
            draggable: true,
            onDrop: this.onInstalledSoftwareDrop,
            onDrag: this.onInstalledSoftwareDrag,
            context: this,
            order: false
        });

        this.tableViewNew = new TableView({
            el: '#newInstanceSoftware-table',
            actionsClass: "actionsSDCTier",
            headerClass: "headerSDCTier",
            bodyClass: "bodySDCTier",
            footerClass: "footerSDCTier",
            onAction: this.onAction,
            getDropdownButtons: this.getDropdownButtonsNew,
            getMainButtons: this.getMainButtonsNew,
            getHeaders: this.getHeadersNew,
            getEntries: this.getEntriesNew,
            dropable: true,
            draggable: true,
            disableActionButton: true,
            onDrag: this.onCatalogDrag,
            onDrop: this.onCatalogDrop,
            context: this
        });
        this.tableView.render();
        this.tableViewNew.render();
        $('.modal:last').modal();
        this.dial = $(".dial-form").knob();
        return this;
    }
});

var EditNetworkView = Backbone.View.extend({

    _template: _.itemplate($('#editNetworkFormTemplate').html()),

    events: {
        'click .update-network': 'onUpdate',
        'click #cancelBtn': 'close',
        'click #close': 'close',
        'click .modal-backdrop': 'close'
    },

    close: function(e) {
        $('#edit_network').remove();
        $('.edit-backdrop').remove();
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($('#edit_network').html() != null) {
            $('#edit_network').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({model:this.model}));
        $('.modal:last').modal();
        return this;
    },

    onUpdate: function(e){
        var name = this.$('input[name=name]').val();
        var admin_state = this.$('input[name=admin_state]').is(':checked');
        this.model.set({'name': name});
        this.model.set({'admin_state_up': admin_state});
        this.model.save(undefined, UTILS.Messages.getCallbacks("Network "+ name + " was successfully updated.", "Error updating network "+ name, {context: this}));
    }

});
var EditPortView = Backbone.View.extend({

    _template: _.itemplate($('#editPortFormTemplate').html()),

    events: {
        'click .update-port': 'onUpdate',
        'click #cancelBtn': 'close',
        'click #close': 'close',
        'click .modal-backdrop': 'close'
    },

    close: function(e) {
        $('#edit_port').remove();
        $('.edit-backdrop').remove();
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($('#edit_port').html() != null) {
            $('#edit_port').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({model:this.model.attributes}));
        $('.modal:last').modal();
        return this;
    },

    onUpdate: function(e){
        var name = this.$('input[name=name]').val();
        var admin_state = this.$('input[name=admin_state]').is(':checked');
        this.model.set({'name': name});
        this.model.set({'admin_state_up': admin_state});
        this.model.save(undefined, {success: function(model, response) {
        UTILS.Messages.getCallbacks("Port "+ name + " was successfully updated.", "Error updating port "+ name, {context: this});
        this.model.bind("sync", this.render, this);
        }, error: function(response) {
            console.log("error", response);
        }});  
        this.close();  
    }

});
var EditProjectView = Backbone.View.extend({

    _template: _.itemplate($('#editProjectFormTemplate').html()),

    events: {
        'click .update-project': 'onUpdate',
        'click #cancelBtn': 'close',
        'click #close': 'close',
        'click .modal-backdrop': 'close'
    },

    close: function(e) {
        $('#edit_project').remove();
        $('.edit-backdrop').remove();
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($('#edit_project').html() != null) {
            $('#edit_project').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({model:this.model}));
        $('.modal:last').modal();
        return this;
    },

    onUpdate: function(e){
        var name = this.$('input[name=name]').val();
        var descr = this.$('textarea[name=description]').val();
        var enabled = this.$('input[name=enabled]').is(':checked');
        this.model.set({'name': name});
        this.model.set({'description': descr});
        this.model.set({'enabled': enabled});
        this.model.save(undefined, UTILS.Messages.getCallbacks("Project "+ name + " updated.", "Error updating project "+ name, {context: this}));
    }

});
var EditRouterView = Backbone.View.extend({

    _template: _.itemplate($('#editRouterFormTemplate').html()),

    events: {
      'click #cancelBtn-router': 'close',
      'click .close': 'close',
      'click .modal-backdrop': 'close',
      'click #update_router_button': 'onUpdate'
    },

    initialize: function() {
    },

    render: function () {
        if ($('#edit_router').html() != null) {
            return;
        }
        $(this.el).append(this._template({model:this.model, networks: this.options.networks}));
        $('#edit_router').modal();
        return this;
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
    },

    close: function(e) {
        if (e !== undefined) {
            e.preventDefault();
        }
        $('#edit_router').remove();
        $('.modal-backdrop:last').remove();
        this.onClose();
        this.model.unbind("sync", this.render, this);
    },

    onUpdate: function(e) {
        var external_network_id = $('#external_network option:selected').val();
        if (external_network_id !== "") {
            this.model.set({'external_gateway_info:network_id': external_network_id});
            this.model.save(undefined, UTILS.Messages.getCallbacks("Gateway interface is added.", "Failed to set gateway to router "), {context: this}); 
            this.close();
        }         
    }
});
var EditSecurityGroupRulesView = Backbone.View.extend({

    _template: _.itemplate($('#editSecurityGroupRulesFormTemplate').html()),

    tableView: undefined,

    events: {
        'click #closeModal': 'close',
        'click #deleteRuleBtn': 'deleteRule',
        'click #cancel': 'close',
        'submit #rulesForm': 'createRule',
        'click .editSecGroup': 'close',
        'click #from_port': 'showTooltipFromPort',
        'click #to_port': 'showTooltipToPort',
        'click #cidr': 'showTooltipCidr',
        'change .secGroupSelect': 'dissapearCIDR',
        'change .IPProtocolSelect': 'changeInputs'
    },

    initialize: function() {
        var self = this;
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [];
    },

    getDropdownButtons: function() {
        return [];
    },

    getHeaders: function() {
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        return [{
            name: "IP Protocol",
            tooltip: "TCP, UDP, ...",
            size: "20%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "From Port",
            tooltip: "Min port number",
            size: "20%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "To Port",
            tooltip: "Max port number",
            size: "20%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Source",
            tooltip: "Source address",
            size: "20%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Action",
            tooltip: "Available actions",
            size: "20%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var entries = [];
        var securityGroupsModel = this.model.get(this.options.securityGroupId);
        console.log('BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB');
        console.log(this.options.securityGroupId);
        console.log(securityGroupsModel);
        var securityGroupRules;
/*        for (var i in securityGroupsModel.get('rules')) {
            securityGroupRules = securityGroupsModel.get('rules')[i];
            if (securityGroupRules.from_port === null || securityGroupRules.ip_protocol === null) {
                continue;
            }
            var entry = {
                id: securityGroupRules.id,
                cells: [{
                    value: securityGroupRules.ip_protocol.toUpperCase()
                }, {
                    value: securityGroupRules.from_port
                }, {
                    value: securityGroupRules.to_port
                }, {
                    value: securityGroupRules.group.name !== undefined ? securityGroupRules.group.name : securityGroupRules.ip_range.cidr+" (CIDR)"
                }, {
                    value: '<button type="button" id="deleteRuleBtn" value="' + securityGroupRules.id + '" class="ajax-modal btn btn-small btn-blue btn-delete btn-danger"  data-i18n="Delete Rule">Delete Rule</button>'
                }]
            };
            entries.push(entry);
        }*/

        for (var i in securityGroupsModel.get('ingress')) {
            securityGroupRules = securityGroupsModel.get('ingress')[i];

            if(securityGroupRules.portRange.split(',')[1] != undefined) {
                console.log(", 格式");
            }else if(securityGroupRules.portRange.split('-')[1] != undefined){
                console.log("range");
            }else {
                console.log("unkown format");
            }


            if (securityGroupRules.portRange === null || securityGroupRules.ipProtocol === null) {
                continue;
            }

            var from_port = securityGroupRules.portRange.split('-')[0];

            var entry = {
                id: securityGroupRules.id,
                cells: [{
                    value: securityGroupRules.ipProtocol.toUpperCase()
                }, {
                    value: securityGroupRules.portRange.split()
                }, {
                    value: securityGroupRules.to_port
                }, {
                    value: securityGroupRules.group.name !== undefined ? securityGroupRules.group.name : securityGroupRules.ip_range.cidr+" (CIDR)"
                }, {
                    value: '<button type="button" id="deleteRuleBtn" value="' + securityGroupRules.id + '" class="ajax-modal btn btn-small btn-blue btn-delete btn-danger"  data-i18n="Delete Rule">Delete Rule</button>'
                }]
            };
            entries.push(entry);
        }

        return entries;
    },

    onAction: function(action, ruleIds) {

    },

    render: function() {
        $(this.el).append(this._template({
            model: this.model,
            securityGroupId: this.options.securityGroupId
        }));
        $('.modal:last').modal();
        $('.modal-backdrop').addClass("editSecGroup");
        this.tableView = new TableView({
            model: this.model,
            el: '#edit_security_group_rules',
            onAction: this.onAction,
            getDropdownButtons: this.getDropdownButtons,
            getMainButtons: this.getMainButtons,
            getHeaders: this.getHeaders,
            getEntries: this.getEntries,
            context: this
        });
        this.tableView.render();
        return this;
    },

    autoRender: function() {

        /*$(this.el).find("#edit_security_group_rule").remove();
        $(this.el).append(self._template({
            model: this.model,
            securityGroupId: this.options.securityGroupId
        }));*/
        this.tableView.render();
    },

    close: function(e) {
        this.onClose();
    },

    onClose: function() {
        $('#edit_security_group_rule').remove();
        $('.modal-backdrop').remove();
        this.undelegateEvents();
        this.unbind();
        this.tableView.close();
    },

    showTooltipFromPort: function() {
        $('#from_port').tooltip('show');
    },

    showTooltipToPort: function() {
        $('#to_port').tooltip('show');
    },

    showTooltipCidr: function() {
        $('#cidr').tooltip('show');
    },

    dissapearCIDR: function(e) {
        if ($('.secGroupSelect :selected').val() !== 'CIDR') {
            $('.cidrSelect').hide();
        } else {
            if ($('.cidrSelect:hidden')) {
                $('.cidrSelect').show();
            }
        }
    },

    changeInputs: function(e) {
        if ($('.IPProtocolSelect :selected').val() == 'ICMP') {
            // $("label[for='from_port']").text("Type");
            // $("label[for='to_port']").text("Code");
            $("#from_port").prop('max', 255);
            $("#from_port").prop('min', -1);
            $("#to_port").prop('max', 255);
            $("#to_port").prop('min', -1);
        } else {
            $("label[for='from_port']").text("From Port*");
            $("label[for='to_port']").text("To Port*");
            $("#from_port").prop('max', 65535);
            $("#from_port").prop('min', -1);
            $("#to_port").prop('max', 65535);
            $("#to_port").prop('min', -1);
        }
    },

    deleteRule: function(e) {
        self = this;
        var secGroupRuleId = e.target.value;
        var securityGroupsModel = this.model.get(this.options.securityGroupId);

        var subview = new ConfirmView({
            el: 'body',
            title: "Delete Security Group Rule",
            btn_message: "Delete Security Group Rule",
            onAccept: function() {
                securityGroupsModel.deleteSecurityGroupRule(secGroupRuleId, {
                    callback: function(resp) {
                        securityGroupsModel.fetch({
                            success: function(resp) {
                                self.autoRender();
                                var subview2 = new MessagesView({
                                    state: "Success",
                                    title: "Security Group Rule deleted.",
                                    el: "#log-messages-rules"
                                });
                                subview2.render();
                            }, error: function(model, resp) {
                                var subview3 = new MessagesView({
                                    state: "Error", title: "Error deleting security group rule. Cause: " + resp.message, info: resp.body,
                                    el: "#log-messages-rules"
                                });
                                subview3.render();
                            }
                        });
                    }
                });
            }
        });
        subview.render();
    },

    createRule: function(e) {
        console.log("Creating rule");
        e.preventDefault();
        self = this;

        var cidrOK, fromPortOK, toPortOK;
	// Derived from "Regular Expressions Cookbook, 2nd Edition" by
	// Jan Goyvaerts and Steven Levithan, O'Reilly Media.
	// Copyright Jan Goyvaerts and Steven Levithan, 2012, ISBN
	// 978-1-449-31943-4.
        var cidr_pattern = /^((\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\/(3[012]|[012]?\d)$|^\s*((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*\/(1([01]\d|2[0-8])|\d\d?)$/i;
        //var portPattern = /^([1-65535]){1,5}$/;
        //var icmpPattern = /^([\-1-255]){1,3}$/;

        var parentGroupId = this.options.securityGroupId;
        var ipProtocol = $('.IPProtocolSelect :selected').val();
        var fromPort = $('input[name=fromPort]').val();
        var toPort = $('input[name=toPort]').val();
        var sourceGroup = $('.secGroupSelect :selected').val();
        var cidr = $('input[name=cidr]').val();

        var subview;

        cidrOK = cidr_pattern.test(cidr);
        fromPortOK = (fromPort >= -1 && fromPort <= 65535);
        toPortOK = (toPort >= -1 && toPort <= 65535);

        var securityGroupsModel = self.model.get(this.options.securityGroupId);

        for (var index in securityGroupsModel.get('rules')) {
            var securityGroupRules = securityGroupsModel.get('rules')[index];
            if (securityGroupRules.ip_protocol === null) {
                continue;
            }

            var thisIpProtocol = securityGroupRules.ip_protocol.toUpperCase();
            var thisFromPort = securityGroupRules.from_port;
            var thisToPort = securityGroupRules.to_port;
            var thisSourceGroup = securityGroupRules.group.name;
            var thisCidr = securityGroupRules.ip_range.cidr;

            if ((ipProtocol == thisIpProtocol) && (fromPort == thisFromPort) && (toPort == thisToPort)) {
                console.log("first three equal");
                if ((sourceGroup == thisSourceGroup) || (cidr == thisCidr)) {
                    subview = new MessagesView({
                        state: "Error",
                        title: "Security Group Rule already exists. Please try again.",
                        el: "#log-messages-rules"
                    });
                    subview.render();
                    return false;
                }
            }

        }

        if (cidrOK && fromPortOK && toPortOK) {
            if ($('.secGroupSelect :selected').val() !== 'CIDR') {
                securityGroupsModel.createSecurityGroupRule(ipProtocol, fromPort, toPort, "", sourceGroup, parentGroupId, {
                    callback: function(resp) {
                        securityGroupsModel.fetch({
                            success: function(resp) {
                                self.autoRender();
                                subview = new MessagesView({
                                    state: "Success",
                                    title: "Security group rule created.",
                                    el: "#log-messages-rules"
                                });
                                subview.render();
                            },
                            error: function(model, resp) {
                                var subview3 = new MessagesView({
                                    state: "Error", title: "Error creating security group rule. Cause: " + resp.message, info: resp.body,
                                    el: "#log-messages-rules"
                                });
                                subview3.render();
                            }
                        });
                    }
                });
            } else {
                securityGroupsModel.createSecurityGroupRule(ipProtocol, fromPort, toPort, cidr, undefined, parentGroupId, {
                    callback: function(resp) {
                        securityGroupsModel.fetch({
                            success: function(resp) {
                                self.autoRender();
                                subview = new MessagesView({
                                    state: "Success",
                                    title: "Security group rule created.",
                                    el: "#log-messages-rules"
                                });
                                subview.render();
                            }, error: function(model, resp) {
                                var subview3 = new MessagesView({
                                    state: "Error", title: "Error creating security group rule. Cause: " + resp.message, info: resp.body,
                                    el: "#log-messages-rules"
                                });
                                subview3.render();
                            }
                        });
                    }
                });
            }


        } else {
            subview = new MessagesView({
                state: "Error",
                title: "Wrong input values for Security Group Rule. Please try again.",
                el: "#log-messages-rules"
            });
            subview.render();
        }
    }
});

var EditSubnetView = Backbone.View.extend({

    _template: _.itemplate($('#editSubnetFormTemplate').html()),

    events: {
        'click #update_subnet_button': 'onUpdate',
        'click #cancelBtn-subnet': 'close',
        'click #close': 'close',
        'click .modal-backdrop': 'close'
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
    },

    close: function(e) {
        if (e !== undefined) {
            e.preventDefault();
        }
        $('#edit_subnet').remove();
        $('.modal-backdrop:last').remove();
        this.onClose();
    },

    render: function () {
        if ($('#edit_subnet').html() != null) {
            $('#edit_subnet').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({model:this.model}));
        $('.modal:last').modal();
        return this;
    },

    onUpdate: function(e){
        var self = this;
        
        var subnet = this.model;
        var subnet_name = $('input[name=subnet_name]').val();
        //var ip_version = $('select[name=ip_version]').val();
        var gateway_ip = $('input[name=gateway_ip]').val();

        var enable_dhcp = this.$('input[name=enable_dhcp]').is(':checked');
        var dns_name_servers = $('textarea[name=dns_name_servers]').val();
        var host_routes = $('textarea[name=host_routes]').val();

        subnet.set({'enable_dhcp': enable_dhcp});

        if (subnet_name !== "") subnet.set({'name': subnet_name});
        if (gateway_ip !== "") subnet.set({'gateway_ip': gateway_ip});

        if (dns_name_servers !== "") {
            var dnss = dns_name_servers.split('\n');
            subnet.set({'dns_nameservers': dnss});
        }

        if (host_routes !== "") {
            var hosts = [];
            var lines1 = host_routes.split('\n');
            for (var l1 in lines1) {
                var host = {destination: lines1[l1].split(',')[0], nexthop: lines1[l1].split(',')[1]};
                hosts.push(host);
            }
            subnet.set({'host_routes': hosts});
        } else {
            subnet.set({'host_routes': []});
        }

        console.log('CON SUBNET', subnet.attributes);
                 
        subnet.save(undefined, UTILS.Messages.getCallbacks("Subnet " + subnet_name + " updated.", "Error updating subnet " + subnet_name, {context: self, success: self.options.success_callback}));
    }

});
var EditTierView = Backbone.View.extend({

    _template: _.itemplate($('#editTierFormTemplate').html()),

    tableView: undefined,
    tableViewNew: undefined,
    netTableView: undefined,
    netTableViewNew: undefined,

    dial: undefined,

    currentStep: 0,

    events: {
        'click #close-image': 'close',
        'click .modal-backdrop': 'close',
        'keyup .tier-values': 'onInput',
        'click #cancel-attrs': 'cancelAttrs',
        'click #accept-attrs': 'acceptAttrs',
        'click #btn-apply-icon': 'applyIcon',
        'click #btn-show-networks': 'showNetworks',
        'click #btn-hide-networks': 'hideNetworks',
        'click #addNewAlias': 'addNewAlias',
        'change #id_region': 'onRegionChange',
        'change #id_image': 'onImageChange',
        'click #cancelBtn-image': 'goPrev',
        'submit #form': 'goNext'
    },

    initialize: function() {
        this.options = this.options || {};
        
        this.editing = -1;

        this.addedProducts = [];
        this.addedNetworks = [];

        // Here we detect if we want to create a Tier
        this.options.tier = this.options.tier || {};

        var self = this;
        if (this.options.tier.icono === undefined || this.options.tier.icono.toString() === "[object Object]") {
            this.options.tier.icono = "";
        }
        if (this.options.tier.productReleaseDtos_asArray) {
            this.options.tier.productReleaseDtos_asArray.forEach(function(product) {
                product.name = product.productName;
                product.description = product.productDescription;
                var prod = new Software(product);
                self.addedProducts.push(prod);
            });
        }

        this.tmpModels = {
            images: new Images(),
            flavors: new Flavors(),
            keypairs: new Keypairs(),
            sdcs: new Softwares(),
            sdcCatalog: new SoftwareCatalogs(),
            networks: new Networks(),
            subnets: new Subnets()
        };

        this.current_region = UTILS.Auth.getCurrentRegion();
    },

    updateTmpModels: function(region) {

        var self = this;

        var image_selector = $("#id_image");
        var flavor_selector = $("#id_flavor");
        var keypair_selector = $("#id_keypair");

        image_selector.empty();
        flavor_selector.empty();
        keypair_selector.empty();

        image_selector.append(new Option('Loading ...', ''));
        flavor_selector.append(new Option('Loading ...', ''));
        keypair_selector.append(new Option('Loading ...', ''));

        // Update images, flavors and keypairs tmp models

        this.tmpModels.images.region = region;
        this.tmpModels.flavors.region = region;
        this.tmpModels.keypairs.region = region;

        this.tmpModels.images.fetch({success: function(collection) {

            var images = collection.models;

            image_selector.empty();

            var sdcImages = 0;
            for (var i in images) {
                if ((images[i].get("properties") !== undefined && images[i].get("properties").sdc_aware) || images[i].get("sdc_aware")) {
                    sdcImages++;
                    if (images[i].get('id') === self.options.tier.image) {
                         image_selector.append(new Option(images[i].get("name"), images[i].get('id'), true, true));
                    } else {
                         image_selector.append(new Option(images[i].get("name"), images[i].get('id')));
                    }
                }
            }

            if (images.length === 0 || sdcImages === 0) {
                image_selector.append(new Option('No images available', ''));
            }
            self.tableViewNew.render();
        }});

        this.tmpModels.flavors.fetch({success: function(collection) {

            var flavors = collection.models;

            flavor_selector.empty();

            for (var f in flavors) {
                if (flavors[f].get('disk') !== 0) {
                    var text = flavors[f].get("name") + " (" + flavors[f].get("vcpus") + "VCPU / " + flavors[f].get("disk") + "GB Disk / " + flavors[f].get("ram") + "MB Ram )";
                    if (flavors[f].id === self.options.tier.flavour) {
                        flavor_selector.append(new Option(text, flavors[f].id, true, true));
                    } else {
                        flavor_selector.append(new Option(text, flavors[f].id));
                    }
                }
            }
        }});

        this.tmpModels.keypairs.fetch({success: function(collection) {

            var keypairs = collection.models;

            keypair_selector.empty();

            if (keypairs.length === 0) {
                keypair_selector.append(new Option('No keypairs available', ''));
            } else {
                for (var k in keypairs) {
                    if(keypairs[k].get('name') === self.options.tier.keypair) {
                        keypair_selector.append(new Option(keypairs[k].get('name'), keypairs[k].get('name'), true, true));
                    } else {
                        keypair_selector.append(new Option(keypairs[k].get('name'), keypairs[k].get('name')));

                    }
                }
            }
        }});

        // Update networks and subnets tmp model

        this.tmpModels.networks.region = region;
        this.tmpModels.subnets.region = region;

        this.networkList = [];
        var current_tenant_id = JSTACK.Keystone.params.access.token.tenant.id;

        this.tmpModels.subnets.fetch({success: function(subnets_collection) {
            self.tmpModels.networks.fetch({success: function(net_collection) {
                var added = {};

                var all_subnets = subnets_collection.models;
                for (var index in net_collection.models) {
                    var network = net_collection.models[index];
                    var tenant_id = network.get("tenant_id");
                    var subnets = [];
                    var subnet_ids = network.get("subnets");
                    if ((current_tenant_id == tenant_id && network.get("router:external") !== true) || network.get('shared') === true) {
                        for (var i in subnet_ids) {
                            sub_id = subnet_ids[i];
                            for (var j in all_subnets) {
                                if (sub_id == all_subnets[j].id) {
                                    var sub_cidr = all_subnets[j].attributes.name+" "+all_subnets[j].attributes.cidr;
                                    subnets.push(sub_cidr);
                                }
                            }
                        }
                        if (subnets.length > 0) {
                            var temp = network.attributes.name === "" ? "("+network.get("id").slice(0,8)+")" : network.attributes.name;
                            var name = temp + " (" + subnets + ")";
                            added[temp] = {displayName: name, name: network.attributes.name, net_id: network.id};
                            self.networkList.push(added[temp]);
                        }
                    }
                }

                self.addedNetworks = [];
                var myTier = self.options.tier;
                if (myTier.hasOwnProperty("networkDto_asArray")) {
                    var myNets = myTier.networkDto_asArray;
                    for (var myNetIdx in myNets) {
                        var myNet = myNets[myNetIdx];
                        var displayName = myNet.networkName;
                        if (added[myNet.networkName] !== undefined) {
                            displayName = added[myNet.networkName].displayName;
                        }
                        self.addedNetworks.push({displayName: displayName, name: myNet.networkName, alias: true /* TODO Check if it is not an alias*/});
                    }
                }

                var tiers = self.model.get("tierDtos_asArray");

                for (var tierIdx in tiers) {
                    var tier = tiers[tierIdx];
                    if (tier.hasOwnProperty("networkDto_asArray")) {
                        var nets = tier.networkDto_asArray;
                        for (var netIdx in nets) {
                            var net = nets[netIdx];
                            if (added[net.networkName] === undefined) {
                                self.networkList.push({displayName: net.networkName, name: net.networkName, alias: true /* TODO Check if it is not an alias*/});
                                added[net.networkName] = net;
                            }
                        }
                    }
                }

                if (added.Internet === undefined) {
                    self.networkList.push({displayName: "Internet", name: "Internet"});
                }

                self.netTableView.render();
                self.netTableViewNew.render();

            }});
        }});

        // Update SDC tmp model

        this.tmpModels.sdcCatalog.fetch({success: function () {

            self.tableViewNew.render();
            self.tableView.render();

        }, error: function (e) {
            self.tableViewNew.render();
            self.tableView.render();
            console.log(e);
        }});
    },

    onRegionChange: function(e) {
        this.current_region = e.currentTarget.value;
        this.render();
    },

    onImageChange: function(e) {
        this.tableViewNew.render();
    },

    close: function(e) {
        this.onClose();
    },

    onClose: function () {
        $('#edit_tier').remove();
        $('.modal-backdrop').remove();
        this.tableView.close();
        this.tableViewNew.close();
        this.netTableView.close();
        this.netTableViewNew.close();
        this.unbind();
        this.undelegateEvents();
    },

    onInput: function() {
        var min = parseInt($('#tier-min-value').val(), 0);
        var max = parseInt($('#tier-max-value').val(), 0);
        var dial = this.dial[0];

        dial.o.min = min;
        dial.o.max = max;

        dial.cv = dial.o.min;

        if (dial.cv > dial.o.max) {
            dial.cv = dial.o.max;
        } else if (dial.cv < dial.o.min) {
            dial.cv = dial.o.min;
        }
        dial.v = dial.cv;

        if (min > max) {
            this.$('input[name=tier-max-value]')[0].setCustomValidity("Max value should be greater than min value");
            dial.v = '-';
        } else {
            this.$('input[name=tier-max-value]')[0].setCustomValidity("");
        }

        if (isNaN(min) || isNaN(max)) {
            dial.v = '-';
        }

        dial._draw();
    },

    getNetMainButtons: function() {
        return [];
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [];
        // [{
        //     label: "Allocate IP to Project",
        //     action: "allocate"
        // }];
    },

    getNetDropdownButtons: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        var self = this;
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
        return [{
            label: "Remove",
            action: "uninstall",
            activatePattern: groupSelected
        }];
    },

    getDropdownButtons: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        var self = this;
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
        return [{
            label: "Remove",
            action: "uninstall",
            activatePattern: groupSelected
        }, {
            label: "Edit Attributes",
            action: "edit",
            activatePattern: oneSelected
        }];
    },

    getNetHeaders: function() {
        return [{
            name: "Name",
            tooltip: "Network name",
            size: "55%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getHeaders: function() {
        return [{
            name: "Name",
            tooltip: "Software name",
            size: "55%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getNetEntries: function() {
        var entries = [];

        for (var network in this.addedNetworks) {
            var name = this.addedNetworks[network].displayName;

            entries.push(
                {id: network, cells:[
                    {value: name}
                    ]
                });

        }

        return entries;
    },

    getEntries: function() {
        var entries = [];

        for (var product in this.addedProducts) {
            if (this.addedProducts[product].get('name') === 'testingpuppet') {
                console.log(this.addedProducts[product]);
            }

            var version = this.addedProducts[product].get('version') || '';

            entries.push(
                {id: product, cells:[
                    {value: this.addedProducts[product].get('name') + ' ' + version,
                    tooltip: this.addedProducts[product].get('description')}
                    ]
                });

        }

        return entries;
    },

    getNetMainButtonsNew: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [];
    },

    getMainButtonsNew: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [];
        // [{
        //     label: "Allocate IP to Project",
        //     action: "allocate"
        // }];
    },

    getNetDropdownButtonsNew: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        var self = this;
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
        return [{
            label: "Add",
            action: "install",
            activatePattern: groupSelected
        }];
    },

    getDropdownButtonsNew: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        var self = this;
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
        return [{
            label: "Add",
            action: "install",
            activatePattern: groupSelected
        }];
    },

    getNetHeadersNew: function() {
        return [{
            name: "Name",
            tooltip: "Network name",
            size: "40%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getHeadersNew: function() {
        return [{
            name: "Name",
            tooltip: "Software name",
            size: "40%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getNetEntriesNew: function() {
        var entries = [];

        var networks = this.networkList;

        if (networks === undefined) {
            return 'loading';
        }

        for (var network in networks) {
            var name = networks[network].displayName;
            entries.push(
                {id: network, cells:[
                {value: name}]});

        }

        entries = [{id: networks.length, isDraggable: false, cells:[
                {value: '<input type="text" id="aliasName" placeholder="Enter the alias of a new network..."><button id="addNewAlias">+</button>'}]}].concat(entries);
        return entries;

    },

    getEntriesNew: function() {
        var entries = [];

        var products = this.tmpModels.sdcCatalog.models;

        if (products.length === 0) {
            return 'loading';
        }

        var imageId = $("#id_image option:selected")[0].value;

        for (var product in products) {
            var comp = true;

            if (products[product].get('metadatas') && typeof products[product].get('metadatas').image === 'string') {
                comp = false;
                var compImages = products[product].get('metadatas').image.split(' ');
                for (var im in compImages) {
                    if (compImages[im] === imageId) {
                        comp = true;
                    }
                }
            } 

            var version = products[product].get('version') || '';

            if (comp) {
                entries.push(
                    {id: product, cells:[
                    {value: products[product].get('name') + ' ' + version,
                    tooltip: products[product].get('description')}]});
            }

        }

        return entries;

    },

    addNewAlias: function() {
        var name = $("#aliasName").val();
        var exists = false;
        for (var id in this.networkList) {
            var net = this.networkList[id];
            if (net.name === name) {
                exists = true;
                continue;
            }
        }
        if (!exists) {
            for (var a in this.addedNetworks) {
                if (this.addedNetworks[a].name === name) {
                    exists = true;
                    continue;
                }
            }
        }
        if (!exists) {
            this.networkList = [{name: name, displayName: name}].concat(this.networkList);
        }
        this.netTableViewNew.render();
    },

    installSoftware: function(id, targetId) {
        product = this.tmpModels.sdcCatalog.models[id];
        var self = this;

        var exists = false;
        for (var a in self.addedProducts) {
            if (self.addedProducts[a].get('name') === product.get('name')) {
                exists = true;
                continue;
            }
        }
        if (!exists) {
            //self.addedProducts.push(product);
            product.fetch({success: function (resp) {
                targetId = targetId || self.addedProducts.length;
                console.log("Installing on: ", targetId);
                self.addedProducts.splice(targetId, 0, product);
                self.tableView.render();

            }, error: function (e) {

            }});
        }
    },

    installNetwork: function(id, targetId) {
        network = this.networkList[id];
        var exists = false;
        for (var a in this.addedNetworks) {
            if (this.addedNetworks[a].name === network.name) {
                exists = true;
                continue;
            }
        }
        if (!exists) {
            targetId = targetId || this.addedNetworks.length;
            this.addedNetworks.splice(targetId, 0, network);
            this.netTableView.render();
        }
    },

    movingSoftware: function(id, targetId) {
        var product = this.addedProducts[id];
        this.addedProducts.splice(id, 1);
        var offset = 0;
        if (id < targetId) {
            offset = 1;
        }
        targetId = targetId || this.addedProducts.length - offset;
        console.log("Moving to: ", targetId);
        this.addedProducts.splice(targetId, 0, product);
        this.tableView.render();
    },

    movingNetwork: function(id, targetId) {
        var network = this.addedNetworks[id];
        this.addedNetworks.splice(id, 1);
        var offset = 0;
        if (id < targetId) {
            offset = 1;
        }
        targetId = targetId || this.addedNetworks.length - offset;
        this.addedNetworks.splice(targetId, 0, network);
        this.netTableView.render();
    },

    uninstallSoftware: function(id) {
        this.addedProducts.splice(id, 1);
        this.tableView.render();
    },

    uninstallNetwork: function(id) {
        this.addedNetworks.splice(id, 1);
        this.netTableView.render();
    },

    showNetworks: function() {
        $('#scroll-based-layer-networks').animate({
            scrollLeft: $('#scroll-based-layer-networks').width()+1
        }, 500, function() {
            // Animation complete.
        });
        $('#btn-show-networks').animate({
            opacity: 0
        }, 500, function() {
            // Animation complete.
            $('#btn-show-networks').hide();
        });
        $('#btn-hide-networks').animate({
            opacity: 1
        }, 500, function() {
            // Animation complete.
            $('#btn-hide-networks').show();
        });
    },

    hideNetworks: function() {
        $('#scroll-based-layer-networks').animate({
            scrollLeft: 0
        }, 500, function() {
            // Animation complete.
        });
        $('#btn-show-networks').animate({
            opacity: 1
        }, 500, function() {
            // Animation complete.
            $('#btn-show-networks').show();
        });
        $('#btn-hide-networks').animate({
            opacity: 0
        }, 500, function() {
            // Animation complete.
            $('#btn-hide-networks').hide();
        });
    },

    onNetAction: function(action, ids) {

        var self = this;

        var product;

        switch (action) {
            case 'install':
                this.installNetwork(ids);
            break;
            case 'uninstall':
                this.uninstallNetwork(ids);
            break;
        }
        return false;
    },

    onAction: function(action, ids) {

            var self = this;

            var product;

            switch (action) {
                case 'install':
                    self.installSoftware(ids);

                break;
                case 'uninstall':
                    self.uninstallSoftware(ids);
                break;
                case 'edit':
                    product = this.addedProducts[ids];
                    this.edit = ids;
                    var productAttributes = product.get('attributes_asArray');
                    var str='';
                    for (var i in productAttributes) {
                        attr = productAttributes[i];
                        if (attr.description === undefined) attr.description = '-';
                        if (attr.type === 'IP' || attr.type === 'IPALL') {

                            str += 
                            '<tr id="sec_groups__row__" class="ajax-update status_down">' +
                                '<td>' + attr.key + '</td>' +
                                '<td>' +
                                    '<select name="attr_' + i + '">';

                                    var my_name = this.$('input[name=name]').val();
                                    var im_new = true;

                                    for (var t in this.model.get('tierDtos_asArray')) {
                                        var ti = this.model.get('tierDtos_asArray')[t];
                                        if (attr.value === ti.name) {
                                            str += '<option selected value="' + ti.name + '">Tier ' + ti.name + ' IP address</option>';
                                        } else {
                                            str += '<option value="' + ti.name + '">Tier ' + ti.name + ' IP address</option>';
                                        }
                                        if (ti.name === my_name) {
                                            im_new = false;
                                        }
                                    }

                                    if (im_new) {
                                        str += '<option value="' + my_name + '">Tier ' + my_name + ' IP address</option>';
                                    }
                                        
                            str +=                                   
                                    '</select>' +
                                '</td>' +
                                '<td>' + attr.description + '</td>' +
                            '</tr>';

                        } else {
                            str += 
                            "<tr id='sec_groups__row__' class='ajax-update status_down'>" +
                                "<td>" + attr.key + "</td>" +
                                "<td>" +
                                    "<input type='text' name='attr_" + i + "' value='" + attr.value + "'>" +
                                "</td>" +
                                "<td>" + attr.description + "</td>" +
                            "</tr>";
                        }
                    }
                    if (str === '') {
                        str = 
                        '<tr id="sec_groups__row__" class="ajax-update status_down">' +
                            '<td></td>' +
                            '<td style="text-align: center;">No items to display</td>' +
                            '<td></td>' +
                        '</tr>';

                    }
                    $('#software-attrs-table').html(str);
                    $('#scroll-based-layer').animate({
                        scrollLeft: $('#scroll-based-layer').width()
                    }, 500, function() {
                        // Animation complete.
                    });
                    var effects = {};
                    effects["-webkit-filter"] = "blur(1px)";
                    effects.opacity = "0.3";
                    $('.blurable').animate(effects, 500, function() {
                        $('.blurable').addClass("blur");
                        $('.blurable').bind("click", false);
                    });
                break;
            }
            return false;
        },

    attrsDone: function() {
        $('#scroll-based-layer').animate({
            scrollLeft: 0
        }, 500, function() {
            // Animation complete.
        });
        var effects = {};
        effects["-webkit-filter"] = "blur(0px)";
        effects.opacity = "1";
        $('.blurable').animate(effects, 500, function() {
            $('.blurable').removeClass("blur");
            $('.blurable').unbind("click", false);
        });

        var atts = this.addedProducts[this.edit].get('attributes_asArray');

        if (atts) {
            for (var at in atts) {
                var val;
                if (atts[at].type === 'IP' || atts[at].type === 'IPALL') {
                    val = atts[at].type + '(' + this.$('select[name=attr_'+ at+']').val() + ')';
                } else {
                    val = this.$('input[name=attr_'+ at+']').val();
                }
                atts[at].value = val;
            }
        }
    },

    cancelAttrs: function(evt) {
        evt.preventDefault();
        this.attrsDone();
    },

    acceptAttrs: function(evt) {
        evt.preventDefault();
        this.attrsDone();
        // TODO Update attributes in JSON
    },

    onUpdate: function(e){
        var self = this;
        var name, flavorReg, key_name, image, public_ip, min, max, initial, region;

        name = this.$('input[name=name]').val();

        flavorReg = $("#id_flavor option:selected")[0].value;

        image = $("#id_image option:selected")[0].value;

        image = $("#id_image option:selected")[0].value;

        icon = this.$('input[name=icon]').val();

        if ($("#id_keypair option:selected")[0].value !== '') {
            key_name = $("#id_keypair option:selected")[0].value;
        }

        region = $("#id_region option:selected")[0].value;

        public_ip = ($('input[name=public_ip]:checked').length > 0);

        min = this.$('input[name=tier-min-value]').val();

        max = this.$('input[name=tier-max-value]').val();

        initial = this.dial[0].v;

        var tier = {
            name: name,
            flavour: flavorReg,
            floatingip: public_ip,
            image: image,
            icono: icon,
            keypair: key_name,
            region: region,
            minimumNumberInstances: min,
            maximumNumberInstances: max,
            initialNumberInstances: initial
        };

        if (this.addedProducts.length !== 0) {

            tier.productReleaseDtos = [];
            for (var p in this.addedProducts) {
                var nP = {productName: this.addedProducts[p].get('name'), version: this.addedProducts[p].get('version'), info: this.addedProducts[p].attributes};

                var attrs = this.addedProducts[p].get('attributes_asArray');
                if (attrs) {
                    nP.attributes = [];
                    for (var at in attrs) {
                        var inp = 'input[name=attr_'+ this.addedProducts[p].get('name')+'_'+ at+']';
                        var attrib = {key: attrs[at].key, value: attrs[at].value, type: attrs[at].type};
                        nP.attributes.push(attrib);
                    }
                }
                tier.productReleaseDtos.push(nP);
            }
        }

        if (this.addedNetworks.length !== 0) {

            tier.networkDto = [];
            for (var n in this.addedNetworks) {
                var nN = {networkName: this.addedNetworks[n].name};
                if (this.addedNetworks[n].net_id !== undefined) {
                    nN.networkId = this.addedNetworks[n].net_id;
                }
                tier.networkDto.push(nN);
            }
        }

        var success_mg = "Tier "+name + " created.";
        var error_msg = "Error creating tier "+name;
        if (this.options.tier.flavour !== undefined) {
            success_mg = "Tier "+name + " updated.";
            error_msg = "Error updating tier "+name;
        }
        
        var options = UTILS.Messages.getCallbacks(success_mg, error_msg, {context: self});

        options.tier = tier;

        var cb2 = options.callback;

        options.callback = function () {
            cb2();
            self.options.callback();
        };
        if (this.options.tier.flavour !== undefined) {
            self.model.updateTier(options);
        } else {
            self.model.addTier(options);
        }
        
    },

    applyIcon: function() {
        var icon = this.$('input[name=icon]').val();
        if (icon !== "") {
            this.$('#edit-tier-image').attr("src", icon);
            this.$('#edit-tier-image').show();
            this.$('.tier-image-back').hide();
        } else {
            this.$('#edit-tier-image').attr("src", "");
            this.$('#edit-tier-image').hide();
            this.$('.tier-image-back').show();
        }
    },

    onCatalogDrag: function(entryId) {
        console.log("Obtained:", entryId);
        return entryId;
    },

    onCatalogDrop: function(targetId, entryId) {
        console.log("Uninstalled:", targetId, entryId);
        this.uninstallSoftware(entryId);
    },

    onInstalledSoftwareDrop: function(targetId, entryId) {
        console.log("Installing:", targetId, entryId);
        this.installSoftware(entryId, targetId);
    },

    onInstalledSoftwareDrag: function(entryId) {
        return entryId;
    },

    onInstalledSoftwareMove: function(targetId, entryId) {
        console.log("Moving:", targetId, entryId);
        this.movingSoftware(entryId, targetId);
    },

    onNewNetworkDrag: function(entryId) {
        console.log("Obtained:", entryId);
        return entryId;
    },

    onNewNetworkDrop: function(targetId, entryId) {
        console.log("Uninstalled:", targetId, entryId);
        this.uninstallNetwork(entryId);
    },

    onInstalledNetworkDrop: function(targetId, entryId) {
        console.log("Installing:", targetId, entryId);
        this.installNetwork(entryId, targetId);
    },

    onInstalledNetworkDrag: function(entryId) {
        return entryId;
    },

    onInstalledNetworkMove: function(targetId, entryId) {
        console.log("Moving:", targetId, entryId);
        this.movingNetwork(entryId, targetId);
    },

    goNext: function() {

        if (this.currentStep === this.steps.length - 1) {
            this.onUpdate();
        } else {
            if (this.currentStep === 0) {
                $('#cancelBtn-image').html('Back');
            }
            if (this.currentStep === this.steps.length - 2) {
                if (this.options.tier.flavour !== undefined) {
                    $('#nextBtn-image').val('Edit tier');
                } else {
                    $('#nextBtn-image').val('Create tier');
                }
            }

            var curr_id = '#' + this.steps[this.currentStep].id;
            var next_id = '#' + this.steps[this.currentStep + 1].id;
            var next_tab = next_id + '_tab';
            var next_line = next_id + '_line';
            
            $(curr_id).hide();
            $(next_id).show();
            $(next_tab).addClass('active');
            $(next_line).addClass('active');

            this.currentStep = this.currentStep + 1;
        }
    }, 

    goPrev: function() {

        if (this.currentStep === 0) {
            this.close();
        } else {
            if (this.currentStep === 1) {
                $('#cancelBtn-image').html('Cancel');
            }
            if (this.currentStep === this.steps.length - 1) {
                $('#nextBtn-image').val('Next');
                $('#nextBtn-image').attr("disabled", null);
            }

            var curr_id = '#' + this.steps[this.currentStep].id;
            var curr_tab = curr_id + '_tab';
            var curr_line = curr_id + '_line';
            var prev_id = '#' + this.steps[this.currentStep - 1].id;
            
            $(curr_id).hide();
            $(prev_id).show();
            $(curr_tab).removeClass('active');
            $(curr_line).removeClass('active');

            this.currentStep = this.currentStep - 1;
        }
    },

    render: function () {
        if ($('#edit_tier').html() !== null) {
            $('#edit_tier').remove();
            $('.modal-backdrop').remove();
        }


        if (JSTACK.Keystone.getendpoint(this.current_region, "network") !== undefined) {
            this.networks = undefined;
            this.steps = [
            {id: 'input_details', name: 'Details'}, 
            {id: 'software_tab', name: 'Install Software'},
            {id: 'network_tab', name: 'Connect Network'}
            ];
        
        } else {
            this.networks = [];
            this.steps = [
                {id: 'input_details', name: 'Details'}, 
                {id: 'software_tab', name: 'Install Software'}                ];
        }


        $(this.el).append(this._template({model:this.model, tier: this.options.tier, regions: this.options.regions, steps: this.steps, current_region: this.current_region}));
        this.tableView = new TableView({
            el: '#installedSoftware-table',
            actionsClass: "actionsSDCTier",
            headerClass: "headerSDCTier",
            bodyClass: "bodySDCTier",
            footerClass: "footerSDCTier",
            onAction: this.onAction,
            getDropdownButtons: this.getDropdownButtons,
            getMainButtons: this.getMainButtons,
            getHeaders: this.getHeaders,
            getEntries: this.getEntries,
            disableActionButton: true,
            context: this,
            order: false,
            draggable: true,
            dropable: true,
            sortable: true,
            onDrop: this.onInstalledSoftwareDrop,
            onDrag: this.onInstalledSoftwareDrag,
            onMove: this.onInstalledSoftwareMove
        });

        this.tableViewNew = new TableView({
            el: '#newSoftware-table',
            actionsClass: "actionsSDCTier",
            headerClass: "headerSDCTier",
            bodyClass: "bodySDCTier",
            footerClass: "footerSDCTier",
            onAction: this.onAction,
            getDropdownButtons: this.getDropdownButtonsNew,
            getMainButtons: this.getMainButtonsNew,
            getHeaders: this.getHeadersNew,
            getEntries: this.getEntriesNew,
            disableActionButton: true,
            dropable: true,
            draggable: true,
            context: this,
            onDrag: this.onCatalogDrag,
            onDrop: this.onCatalogDrop
        });
        this.tableView.render();
        this.tableViewNew.render();

        this.netTableView = new TableView({
            el: '#installedNetwork-table',
            actionsClass: "actionsNetTier",
            headerClass: "headerNetTier",
            bodyClass: "bodyNetTier",
            footerClass: "footerNetTier",
            onAction: this.onNetAction,
            getDropdownButtons: this.getNetDropdownButtons,
            getMainButtons: this.getNetMainButtons,
            getHeaders: this.getNetHeaders,
            getEntries: this.getNetEntries,
            disableActionButton: true,
            context: this,
            order: false,
            draggable: true,
            dropable: true,
            sortable: true,
            onDrop: this.onInstalledNetworkDrop,
            onDrag: this.onInstalledNetworkDrag,
            onMove: this.onInstalledNetworkMove
        });

        this.netTableViewNew = new TableView({
            el: '#newNetwork-table',
            actionsClass: "actionsNetTier",
            headerClass: "headerNetTier",
            bodyClass: "bodyNetTier",
            footerClass: "footerNetTier",
            onAction: this.onNetAction,
            getDropdownButtons: this.getNetDropdownButtonsNew,
            getMainButtons: this.getNetMainButtonsNew,
            getHeaders: this.getNetHeadersNew,
            getEntries: this.getNetEntriesNew,
            disableActionButton: true,
            context: this,
            dropable: true,
            draggable: true,
            order: false,
            sortable: false,
            onDrag: this.onNewNetworkDrag,
            onDrop: this.onNewNetworkDrop
        });

        this.netTableView.render();
        this.netTableViewNew.render();

        $('.modal:last').modal();
        this.dial = $(".dial-form").knob();
        this.applyIcon();

        this.updateTmpModels(this.current_region);

        return this;
    }

});

var EditUserView = Backbone.View.extend({

    _template: _.itemplate($('#editUserFormTemplate').html()),

    events: {
        'submit #form': 'onUpdate',
        'input .password': 'onInput',
        'click #cancelBtn': 'close',
        'click .close': 'close',
        'click .modal-backdrop': 'close',
        'click .btn-eye': 'showPassword',
        'click .btn-eye-active': 'hidePassword'
    },

    close: function(e) {
        this.onClose();
    },

    onClose: function () {
        $('#edit_user').remove();
        $('.modal-backdrop').remove();
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($('#edit_user').html() != null) {
            $('#edit_user').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({model:this.model, tenants: this.options.tenants}));

        $('.modal:last').modal();
        return this;
    },

    onInput: function() {
        var message = '';
        var password = this.$('input[name=user_password]').val();
        var confirm = this.$('input[name=confirm_password]').val();
        if (password !== confirm) {
            message = 'Please, confirm the password.';
        }
        this.$('input[name=confirm_password]')[0].setCustomValidity(message);
    },

    showPassword: function() {
        var password = this.$('input[name=user_password]').val();
        var confirm_password = this.$('input[name=confirm_password]').val();
        $('#user_password').replaceWith('<input required id="user_password" type="text" class="password" name="user_password" maxlength="255">');
        $('#confirm_password').replaceWith('<input required id="confirm_password" type="text" class="password" name="confirm_password" maxlength="255">');
        $('#user_password').val(password);
        $('#confirm_password').val(confirm_password);
        $('.btn-eye').hide();
        $('.btn-eye-active').show();
        this.onInput();
    },

    hidePassword: function() {
        var password = this.$('input[name=user_password]').val();
        var confirm_password = this.$('input[name=confirm_password]').val();
        $('#user_password').replaceWith('<input required id="user_password" type="password" class="password" name="user_password" maxlength="255">');
        $('#confirm_password').replaceWith('<input required id="confirm_password" type="password" class="password" name="confirm_password" maxlength="255">');
        $('#user_password').val(password);
        $('#confirm_password').val(confirm_password);
        $('.btn-eye').show();
        $('.btn-eye-active').hide();
        this.onInput();
    },

    onUpdate: function(e){
        var name = this.$('input[name=name]').val();
        var email = this.$('input[name=email]').val();
        var password = this.$('input[name=user_password]').val();
        var tenant_name;
        $("#project_switcher option:selected").each(function () {
                var tenant = $(this).val();
                if (tenant !== "") {
                    tenant_id = tenant;
                }
        });
        this.model.set({'name': name});
        this.model.set({'email': email});
        if (password !== "") {
            this.model.set({'password': password});
        }
        this.model.set({'tenant_id': tenant_id});
        this.model.set({'enabled': true});
        this.model.save(undefined, UTILS.Messages.getCallbacks("User "+this.model.get("name") + " updated.", "Error updating user "+this.model.get("name"), {context: this}));
    }

});
var EditVolumeAttachmentsView = Backbone.View.extend({

    _template: _.itemplate($('#editVolumeAttachmentsFormTemplate').html()),

    events: {
      'click .cancelBtn': 'close',
      'click .close': 'close',
      'click .attachBtn': 'attach',
      'click .detachBtn': 'detach',
      'click .checkbox_attachments': 'enableDisableDettachButton',
      'click .modal-backdrop': 'close',
      'click #attachments__action_detach': 'detachGroup'
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
    },

    initialize: function() {
    },

    render: function () {
        if ($('#create_volume_modal').html() != null) {
            return;
        }
        $(this.el).append(this._template({model:this.model, instancesModel: this.options.instances}));
        $('.modal:last').modal();
        return this;
    },

    close: function(e) {
        $('#attach_volume_modal').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    detach: function(evt) {
        var instance = evt.target.value;
        console.log("Detaching " + instance);
        var self = this;
        var subview = new ConfirmView({el: 'body', title: "Detach Volume", btn_message: "Detach Volume", style: "top: 80px; display: block; z-index: 10501010;", onAccept: function() {
            var cbs = UTILS.Messages.getCallbacks("Volume detached", "Error detaching volume", {context: self});
            self.options.instances.get(instance).detachvolume({volume_id: self.model.id, callback: cbs.success, error: cbs.error});
        }});
        subview.render();
        //this.close();
    },

    attach: function(e) {
        var self = this;
        var instance = $('select[id=id_instance]').val();
        var device = $('input[name=device]').val();

        var cbs = UTILS.Messages.getCallbacks("Volume attached", "Error ataching volume", {context: self});
        if (instance === '') {
            cbs.error(undefined, {message: 'You have to select an instance'});    
        }
        this.options.instances.get(instance).attachvolume({volume_id: this.model.id, device:device, callback: cbs.success, error: cbs.error});
    },

    detachGroup: function(evt) {
        var self = this;
        var attachments = $(".checkbox_attachments:checked");
        this.close();
        var subview = new ConfirmView({el: 'body', title: "Detach Volumes", btn_message: "Detach Volumes", style: "top: 80px; display: block; z-index: 10501010;", onAccept: function() {
            attachments.each(function () {
                    var instance = $(this).val();
                    var inst = self.options.instances.get(instance);
                    var cbs = UTILS.Messages.getCallbacks("Volumes detached", "Error detaching volumes", {context: self});
                    self.options.instances.get(instance).detachvolume({volume_id: self.model.id, callback: cbs.success, error: cbs.error});
            });
        }});
        subview.render();
    },

    enableDisableDettachButton: function () {
        if ($(".checkbox_attachments:checked").size() > 0) {
            $("#attachments__action_detach").attr("disabled", false);
        } else {
            $("#attachments__action_detach").attr("disabled", true);
        }

    }

});
var ImportKeypairView = Backbone.View.extend({

    _template: _.itemplate($('#importKeypairFormTemplate').html()),

    events: {
      'click #cancelImportBtn': 'close',
      'click #close': 'close',
      'click #importBtn': 'importKeypair',
      'click .modal-backdrop': 'close'
    },

    render: function () {
        $(this.el).append(this._template({model:this.model}));
        $('.modal:last').modal();
        return this;
    },

    close: function(e) {
        //this.model.unbind("change", this.render, this);
        $('#import_keypair').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    importKeypair: function(e) {
        self = this;
        var name = $('input[name=name]').val();
        var publicKey = $('textarea[name=public_key]').val();
        var newKeypair = new Keypair();
        var subview;
        for (var index in self.model.models) {
            if (self.model.models[index].attributes.name === name) {
                subview = new MessagesView({state: "Error", title: "Keypair "+name+" already exists. Please try again."});
                subview.render();
                return;
            }
        }
        newKeypair.set({'name': name, 'public_key': publicKey});
        newKeypair.save(undefined, UTILS.Messages.getCallbacks("Keypair "+ name + " imported.", "Error importing keypair "+ name));

        this.close();
    }

});
var InstallSoftwareView = Backbone.View.extend({

    _template: _.itemplate($('#installSoftwareFormTemplate').html()),

    events: {
        'click #submit': 'onSubmit',
        'click #cancelBtn': 'close',
        'click .close': 'close',
        'click .modal-backdrop': 'close'
    },
    
    close: function(e) {
        $('#install_software').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($('#install_software').html() != null) {
            $('#install_software').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({model:this.model}));
        $('.modal:last').modal();
        return this;
    },
    
    onSubmit: function(e){
  
    }
           
});
var LaunchImageView = Backbone.View.extend({

    _template: _.itemplate($('#launchImageTemplate').html()),

    events: {
      'click #cancelBtn-image':                 'goPrev',
      'click #close-image':                     'close',
      'click .modal-backdrop':                  'close',
      'click #add-sec-group':                   'onCreateSecurityGroup',
      'click #add-keypair':                     'onCreateKeypair',
      'submit #launch_image  #form':            'goNext',
      'change .volumeOptionsSelect':            'changeVolumeOptions',
      'change .flavorOptionsSelect':            'changeFlavorOptions', 
      'keyup #icount':                          'changeICount',
      'change #id_user_data':                   'changeUserData'
    },

    initialize: function() {
        var self = this;
        this.options.keypairs.fetch();
        this.options.flavors.fetch();
        this.options.secGroups.fetch();

        this.user_data_edited = false;

        console.log('IMAGE', this.model);
        
        if (JSTACK.Keystone.getendpoint(UTILS.Auth.getCurrentRegion(), "network") === undefined) {
            this.networks = undefined;
            this.steps = [
            {id: 'input_details', name: 'Details'}, 
            {id: 'input_access_and_security', name: 'Access & Security'}, 
            {id: 'input_post-creation', name: 'Post-Creation'},
            {id: 'input_summary', name: 'Summary'}];
        
        } else {
            this.networks = [];

            for (var index in this.options.networks.models) {
                var network = this.options.networks.models[index];
                var tenant_id = network.get('tenant_id');
                if (tenant_id == this.options.tenant || network.get('shared')) {
                    this.networks.push(network);
                }
            }

            this.steps = [
                {id: 'input_details', name: 'Details'}, 
                {id: 'input_access_and_security', name: 'Access & Security'}, 
                {id: 'input_networks', name: 'Networking'},
                //{id: 'input_volumes', name: 'Volume Options'},
                {id: 'input_post-creation', name: 'Post-Creation'},
                {id: 'input_summary', name: 'Summary'}];
        }

        this.instanceData = {};
        this.currentStep = 0;

        this.quotas = {};
        this.quotas.cpus = 0;
        this.quotas.ram = 0;
        this.quotas.disk = 0;

        this.quotas.flavor_error = false;
        this.quotas.count_error = false;

        this.quotas.quota_set = this.options.quotas.get("quota_set");

        for (var instIdx in this.options.instancesModel.models) {
            var instance = this.options.instancesModel.models[instIdx];
            var flavor = this.options.flavors.get(instance.get("flavor").id);
            if (flavor) {
                this.quotas.cpus = this.quotas.cpus + flavor.get('vcpus');
                this.quotas.ram = this.quotas.ram + flavor.get('ram');
                this.quotas.disk = this.quotas.disk + flavor.get('disk');
            }
        }

        JSTACK.Aiakos.getGPG(function(gpg){
            self.gpgKey = gpg;
        }, function(error){}, UTILS.Auth.getCurrentRegion());

        JSTACK.Aiakos.getSSH(function(ssh){
            self.sshKey = ssh;
        }, function(error){}, UTILS.Auth.getCurrentRegion());
    },

    render: function () {
        if ($('#launch_image').html() != null) {
            $('#launch_image').remove();
            $('#launch_image + .modal-backdrop').remove();
        }
        $(this.el).append(this._template({model:this.model, volumes: this.options.volumes, flavors: this.options.flavors, keypairs: this.options.keypairs, secGroups: this.options.secGroups, quotas: this.quotas, instancesModel: this.options.instancesModel, networks: this.networks, ports: this.options.ports, volumeSnapshots: this.options.volumeSnapshots, steps: this.steps}));
        $('#launch_image').modal();
        $('.network-sortable').sortable({
            connectWith: '.connected'
        });
        this.changeFlavorOptions();
        this.changeICount();
        return this;
    },

    updateSecGroups: function() {
        var html = '';
        for (var index in this.options.secGroups.models) {
            var sec = this.options.secGroups.models[index];
            html += '<li><p><input style="width: 15px;float:left;" type="checkbox" name="security_groups" value="' + sec.get('name') + '">';
            html += '<div style="width: 300px; overflow: hidden; text-overflow: ellipsis">'+sec.get('name')+'</div></p></li>';
        }
        $('ul#security_groups_list').html(html);
    },

    updateKeypairs: function(new_kp) {
        var html = '';
        for (var index in this.options.keypairs.models) {
            var kp = this.options.keypairs.models[index];
            html += '<option value="' + kp.get('name') + '"';
            if (kp.get('name') === new_kp.get('name')) {
                html += 'selected="selected"';
            }
            html += '>' + kp.get('name') + '</option>';
        }
        $('#id_keypair').html(html);
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
    },

    close: function(e) {
        if (e !== undefined) {
            e.preventDefault();
        }
        if (this.options.subview !== undefined) {
            this.options.subview.close();
            this.options.subview = undefined;
        }
        $('#launch_image  + .modal-backdrop').remove();
        $('#launch_image').remove();
        this.onClose();
        this.model.unbind("sync", this.render, this);
    },

    onCreateSecurityGroup: function() {
        var self = this;
        this.options.subview = new CreateSecurityGroupView({el: 'body', model: this.model, callback: function() {
            self.options.secGroups.fetch({success: function() {
                self.updateSecGroups();
            }});
        }});
        this.options.subview.render({backdrop: false});
    },

    onCreateKeypair: function() {
        var self = this;
        this.options.subview = new CreateKeypairView({el: 'body', model: this.model, callback: function(new_kp) {
            self.options.keypairs.fetch({success: function() {
                self.updateKeypairs(new_kp);
            }});
        }});
        this.options.subview.render({backdrop: false});
    },

    changeVolumeOptions: function(e) {
        if ($('.volumeOptionsSelect :selected').val() == 'not_volume') {
            if ($('.volume').show()) {
                $('.volume').hide();
            }
            if ($('.device_name').show()){
                $('.device_name').hide();
            }
            if ($('.delete_on_terminate').show()){
                $('.delete_on_terminate').hide();
            }            
        } else if ($('.volumeOptionsSelect :selected').val() == 'volume') {
            if ($('.volume').hide()) {
                $('.volume').show();
                $("label[for='volume']").text("Volume");
                $("select[name=volume_snapshot] option:first").text("Select Volume");
            }
            if ($('.device_name').hide()){
                $('.device_name').show();
            }
            if ($('.delete_on_terminate').hide()){
                $('.delete_on_terminate').show();
            }  
        } else if ($('.volumeOptionsSelect :selected').val() == 'snapshot') {
            if ($('.volume').hide()) {
                $('.volume').show();
                $("label[for='volume']").text("Volume Snapshot");
                $("select[name=volume_snapshot] option:first").text("Select Volume Snapshot");
            }
            if ($('.device_name').hide()){
                $('.device_name').show();
            }
            if ($('.delete_on_terminate').hide()){
                $('.delete_on_terminate').show();
            }  
        }

    },

    changeFlavorOptions: function(e) {
        var flavor_id = $( "#id_flavor option:selected")[0].value;
        for (var i in this.options.flavors.models) {
            if (this.options.flavors.models[i].id === flavor_id) {
                var flavor = this.options.flavors.models[i];
                $("#flavor_name").text(flavor.get('name')); 
                $("#flavor_vcpus").text(flavor.get('vcpus')); 
                $("#flavor_disk").text(flavor.get('disk')); 
                $("#flavor_ephemeral").text(flavor.get('OS-FLV-EXT-DATA:ephemeral')); 
                $("#flavor_disk_total").text(flavor.get("disk")+flavor.get('OS-FLV-EXT-DATA:ephemeral')); 
                $("#flavor_ram").text(flavor.get('ram'));   

                var quotaset = this.quotas.quota_set;

                $('#cpubar').css('background-color', '#468847');
                $('#diskbar').css('background-color', '#468847');
                $('#rambar').css('background-color', '#468847');

                var cpu_width = 100 * (this.quotas.cpus + flavor.get('vcpus')) / quotaset.cores;
                var disk_width = 100 * (this.quotas.disk + flavor.get("disk")) / quotaset.gigabytes;
                var mem_width = 100 * (this.quotas.ram + flavor.get('ram')) / quotaset.ram;

                this.quotas.flavor_error = false;

                if (cpu_width > 100) {
                    cpu_width = 100;
                    $('#icountbar').css('background-color', '#b94a48');
                    this.quotas.flavor_error = true;
                }   
                if (disk_width > 100) {
                    disk_width = 100;
                    $('#diskbar').css('background-color', '#b94a48');
                    this.quotas.flavor_error = true;
                }
                if (mem_width > 100) {
                    mem_width = 100;
                    $('#rambar').css('background-color', '#b94a48');
                    this.quotas.flavor_error = true;
                }

                $('#cpubar').width(cpu_width + '%');
                $('#diskbar').width(disk_width + '%');
                $('#rambar').width(mem_width + '%');

            }
        }
    },

    changeICount: function(e) {

        var count = parseInt($("input:[name=count]").val(), 10);
        if (isNaN(count)) {
            count = 0;
        }
        var quotaset = this.quotas.quota_set;
        var width = 100 * (this.options.instancesModel.length + count) / quotaset.instances;

        this.quotas.count_error = false;

        //console.log(width, this.options.instancesModel.length, count, quotaset.instances);

        $('#icountbar').css('background-color', '#468847');

        if (width > 100) {
            width = 100;
            $('#icountbar').css('background-color', '#b94a48');
            this.quotas.count_error = true;
        }   

        $('#icountbar').width(width + '%');
    },

    changeUserData: function() {
        this.user_data_edited = true;
    },

    indent: function (str, numOfIndents, opt_spacesPerIndent) {
      //str = str.replace(/^(?=.)/gm, new Array(numOfIndents + 1).join('\t'));
      str = str || '';
      return str.replace(/^(?=.)/gm, new Array(numOfIndents + 1).join('      '));
      //numOfIndents = new Array(opt_spacesPerIndent + 1 || 0).join(' '); // re-use
      // return opt_spacesPerIndent ? str.replace(/^\t+/g, function(tabs) {
      //       return tabs.replace(/./g, numOfIndents);
      //   })
      //   : str;
    },

    checkNetworks: function() {
        if (!this.user_data_edited) {
            var compiled = _.template($('#cloud_init_template').html());
            var num_interfaces = 0;
            if (JSTACK.Keystone.getendpoint(UTILS.Auth.getCurrentRegion(), "network") !== undefined) {
                num_interfaces = $('#network-selected li div').length;
            }
            data = compiled({num_interfaces: num_interfaces, ssh: this.sshKey, gpg: this.indent(this.gpgKey, 1, 3)});
            $("#id_user_data").val(data);
        }
    },

    goNext: function() {
        this.checkNetworks();
        if (this.currentStep === this.steps.length - 1) {
            this.launch();
        } else {
            if (this.currentStep === 0) {
                $('#cancelBtn-image').html('Back');
            }
            if (this.currentStep === this.steps.length - 2) {
                $('#nextBtn-image').val('Launch instance');
                this.makeSummary();
            }

            var curr_id = '#' + this.steps[this.currentStep].id;
            var next_id = '#' + this.steps[this.currentStep + 1].id;
            var next_tab = next_id + '_tab';
            var next_line = next_id + '_line';
            
            $(curr_id).hide();
            $(next_id).show();
            $(next_tab).addClass('active');
            $(next_line).addClass('active');

            this.currentStep = this.currentStep + 1;
        }
    }, 

    goPrev: function() {
        this.checkNetworks();
        if (this.currentStep === 0) {
            this.close();
        } else {
            if (this.currentStep === 1) {
                $('#cancelBtn-image').html('Cancel');
            }
            if (this.currentStep === this.steps.length - 1) {
                $('#nextBtn-image').val('Next');
                $('#nextBtn-image').attr("disabled", null);
            }

            var curr_id = '#' + this.steps[this.currentStep].id;
            var curr_tab = curr_id + '_tab';
            var curr_line = curr_id + '_line';
            var prev_id = '#' + this.steps[this.currentStep - 1].id;
            
            $(curr_id).hide();
            $(prev_id).show();
            $(curr_tab).removeClass('active');
            $(curr_line).removeClass('active');

            this.currentStep = this.currentStep - 1;
        }
    },

    makeSummary: function() {

        var self = this;

        var name = $('input[name=instance_name]').val();
        var image_id = this.model.id;
        var flavor, keypair, availability_zone;
        var groups = [];
        
        var netws = [];
        var ip_address = [];
        var network_id = "";
        var block_device_mapping;

        if ($("#id_keypair option:selected")[0].value !== '') {
            keypair = $("#id_keypair option:selected")[0].value;
        }

        if ($("#volume option:selected")[0].value !== '') {
            var volume_id = $("#volume option:selected")[0].value;
            var device_name = $('input[name=device_name]').val();
            var volume = $('input[name=volume_snapshot]').val();
            var delete_on_terminate = $('input[name=delete_on_terminate]').is(':checked') ? "on" : "off";
            var seleceted_volume = this.options.volumes.get(volume_id);
            var volume_size = seleceted_volume.get('size');

            block_device_mapping = {};
            block_device_mapping.volume_id = volume_id;
            block_device_mapping.device_name = device_name;
            //block_device_mapping.volume_size = volume_size;
            block_device_mapping.delete_on_terminate = delete_on_terminate;
        }

        flavor = $("#id_flavor option:selected")[0].value;

        $('input[name=security_groups]:checked').each(function () {
            groups.push($(this)[0].value);
        });
        $('#network-selected li div').each(function() {
            var network_id = this.getAttribute("value");
            var chosen_network = self.options.networks.get(network_id);
            var nets = {};
            nets.uuid = network_id;
            netws.push(nets);
        }); 

        var user_data = $('textarea[name=user_data]').val();
        var min_count = $('input[name=instance_count]').val();
        var max_count = $('input[name=instance_count]').val();

        this.instanceData.name = name;
        this.instanceData.image_id = image_id;
        this.instanceData.flavor = flavor;
        this.instanceData.keypair = keypair;
        this.instanceData.user_data = user_data;
        this.instanceData.groups = groups;
        this.instanceData.min_count = min_count;
        this.instanceData.max_count = max_count;
        this.instanceData.availability_zone = availability_zone;

        this.instanceData.networks = netws;
        this.instanceData.block_device_mapping = block_device_mapping;

        $('#sum_instanceName').html(this.instanceData.name);
        $('#sum_image').html(this.model.get('name'));
        $('#sum_flavour').html($("#id_flavor option:selected")[0].text);
        $('#sum_instanceCount').html(this.instanceData.min_count);

        if (this.instanceData.keypair !== undefined) {
            $('#sum_keypair').html(this.instanceData.keypair);
            $('#sum_keypair').removeClass('warning');
        } else {
            $('#sum_keypair').html('No keypair selected. You will need a keypair to access the instance.');
            $('#sum_keypair').addClass('warning');
        }

        if (this.instanceData.groups.length > 0) {
            var secs = '';
            for (var s in this.instanceData.groups) {
                secs = secs + this.instanceData.groups[s] + ', ';
            }
            secs = secs.substring(0, secs.length - 2);
            $('#sum_secgroup').html(secs);
            $('#sum_secgroup').removeClass('warning');
        } else {
            $('#sum_secgroup').html('No security group selected. You will need a security group to access the instance.');
            $('#sum_secgroup').addClass('warning');
        }

        $('#summary_errors').hide();
        $('#quota error').hide();
        $('#network_error').hide();
        $('#nextBtn-image').attr("disabled", null);

        if (this.quotas.count_error || this.quotas.flavor_error) {
            $('#summary_errors').show();
            $('#quota_error').show();
            $('#nextBtn-image').attr("disabled", "disabled");
            $('#nextBtn-image').css("background-color", "#0489B7");
        }

        if (this.networks && this.networks.length !== 0 && netws.length === 0) {
            $('#summary_errors').show();
            $('#network_error').show();
            $('#nextBtn-image').attr("disabled", "disabled");
            $('#nextBtn-image').css("background-color", "#0489B7");
        }

        // TODO: check if it really exists. OJO: puede que sea llamada asíncrona (quizá hay que hacerla antes de cargar esta vista). 
        // var monitoring_network = true;

        // if (!monitoring_network) {
        //     $('#summary_monitoring_true').addClass('hide');
        //     $('#summary_monitoring_false').removeClass('hide');
        // }
    },

    launch: function(e) {
        var self = this;

        // var create_monit_network = $("input[name='create_monit_network']").prop('checked');

        // if (create_monit_network) {
        //     // TODO: create monitoring network
        // }

        var instance = new Instance();
        instance.set({"name": this.instanceData.name});
        instance.set({"image_id": this.instanceData.image_id});
        instance.set({"flavor": this.instanceData.flavor});
        instance.set({"keypair": this.instanceData.keypair});
        instance.set({"user_data": this.instanceData.user_data});
        instance.set({"groups": this.instanceData.groups});
        instance.set({"min_count": this.instanceData.min_count});
        instance.set({"max_count": this.instanceData.max_count});
        instance.set({"availability_zone": this.instanceData.availability_zone});
        instance.set({"networks": this.instanceData.networks});
        //instance.set({"nics": this.instanceData.network});
        instance.set({"block_device_mapping": this.instanceData.block_device_mapping});
        
        var metadata = {"region": UTILS.Auth.getCurrentRegion()};

        if (this.model.get('properties') && this.model.get('properties').nid) {
            metadata.nid = this.model.get('properties').nid;
        }

        instance.set({"metadata": metadata});

        if (this.instanceData.flavorReg !== "") {
            instance.save(undefined, UTILS.Messages.getCallbacks("Instance "+instance.get("name") + " launched.", "Error launching instance "+instance.get("name"),
            {context:self, href:"#nova/instances/"}));
        }
        
        /*instance.save(undefined, {success: function () {
            self.close();
            window.location.href = "#nova/instances/";
            var subview = new MessagesView({state: "Success", title: "Instance "+instance.get("name")+" launched."});
            subview.render();

        }, error: function (model, error) {
            self.close();
            console.log("Error: ", error);
            window.location.href = "#nova/instances/";
            var subview = new MessagesView({state: "Error", title: " Error launching instance "+instance.get("name") + ". Cause: " + error.message, info: error.body});
            subview.render();
        }});*/

        //this.options.addInstance(instance);
    }
});
var MessagesView = Backbone.View.extend({

    _template: _.template($('#messagesTemplate').html()),

    cid: undefined,

    initialize: function() {

        this.el = this.options.el || "#log-messages";
        this.cid = Math.round(Math.random() * 1000000);
        this.options.state = this.options.state || "Success";

    },

    safe_tags_replace: function (str) {
        var tagsToReplace = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;'
        };
        return str.replace(/[&<>]/g, function(tag) {
            return tagsToReplace[tag] || tag;
        });
    },

    showInfo: function(evt) {
        console.log("Showing info");
        var self = this;
        evt.preventDefault();
        evt.stopPropagation();
        var subview = new ConfirmView({el: 'body', title: this.options.title, message: this.safe_tags_replace(this.options.info), btn_message: "Ok"});
        subview.render();
    },

    close: function() {
        $('.messages').remove();
        this.undelegateEvents();
    },

    render: function () {
        var self = this;
        $(this.el).append(this._template({title:this.options.title, state:this.options.state, info:this.options.info, cid: this.cid}));
        $(this.el).animate({scrollTop: ($('.messages').length-1)*(48)+'px'}, 500);
        /*$('.messages').fadeOut(4000, function() {
            self.close();
        });*/
        var events = {};
        $('#info_' + this.cid).click(_.bind(this.showInfo, this));
        return this;
    }

});

var ModifyQuotasView = Backbone.View.extend({

    _template: _.itemplate($('#modifyQuotasFormTemplate').html()),

    events: {
        'click .update-quota': 'onUpdate',
        'click #cancelBtn': 'close',
        'click .close': 'close',
        'click .modal-backdrop': 'close'
    },

    close: function(e) {
        this.onClose();
    },

    onClose: function () {
        $('#modify_quota').remove();
        $('.modal-backdrop').remove();
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        $(this.el).append(this._template({model:this.model, project:this.options.project}));
        $('.modal:last').modal();
        return this;
    },

    onUpdate: function(e){
        var metadata_items = this.$('input[name=metadata_items]').val();
        var injected_files = this.$('input[name=injected_files]').val();
        var injected_file_content_bytes = this.$('input[name=injected_file_content_bytes]').val();
        var cores = this.$('input[name=cores]').val();
        var instances = this.$('input[name=instances]').val();
        var volumes = this.$('input[name=volumes]').val();
        var gigabytes = this.$('input[name=gigabytes]').val();
        var ram = this.$('input[name=ram]').val();
        var floating_ips = this.$('input[name=floating_ips]').val();

        this.model.set({'metadata_items': metadata_items});
        this.model.set({'injected_files': injected_files});
        this.model.set({'injected_file_content_bytes': injected_file_content_bytes});
        this.model.set({'cores': cores});
        this.model.set({'instances': instances});
        this.model.set({'volumes': volumes});
        this.model.set({'gigabytes': gigabytes});
        this.model.set({'ram': ram});
        this.model.set({'floating_ips': floating_ips});

        this.model.save(undefined, UTILS.Messages.getCallbacks(" Quotas for "+ this.options.project + " were successfully updated.", "Error updating quotas", {context: this}));
    }

});
var ModifyUsersView = Backbone.View.extend({

    _template: _.itemplate($('#modifyUsersTemplate').html()),

    usersForProjectView: undefined,
    newUsersView: undefined,

    initialize: function() {
        this.render();
        this.usersForProjectView = new UsersForProjectView({model: this.model, el: '#users_for_project'});
        this.newUsersView = new NewUsersView({model: this.model, el: '#add_new_users'});
    },


    close: function(e) {
       // this.options.usersModel.unbind("change", this.render, this);
        this.model.unbind("change", this.render, this);
        $('#users_for_project').remove();
        $('#new_add_users').remove();
        this.undelegateEvents();
        this.unbind();
    },

    onClose: function() {
        this.usersForProjectView.close();
        this.newUsersViewView.close();
        this.undelegateEvents();
        this.unbind();
    },

    render: function() {
        var self = this;
        UTILS.Render.animateRender(this.el, this._template);


    }

});
var DownloadOpenrcView = Backbone.View.extend({

    _template: _.itemplate($('#projectInfoFormTemplate').html()),

    events: {
        'submit #project_info_form': 'onSubmit',
        'click #cancelBtn': 'close',
        'click #close': 'close',
        'click .modal-backdrop': 'close'
    },

    close: function(e) {
        $('#project_info').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($('#project_info').html() != null) {
            $('#project_info').remove();
            $('.modal-backdrop').remove();
        }

        var name = UTILS.Auth.getName();
        var tenant = UTILS.Auth.getCurrentTenant();
        var region = UTILS.Auth.getCurrentRegion();
        var url = JSTACK.Comm.getEndpoint(JSTACK.Keystone.getservice("identity"), UTILS.Auth.getCurrentRegion(),  'publicURL');

        $(this.el).append(this._template({  username: name,
                                            tenant_name: tenant.name,
                                            tenant_id: tenant.id,
                                            current_region: region,
                                            auth_url: url

        }));
        //console.log(UTILS.Auth.getCurrentTenant());
        $('.modal:last').modal();
        return this;
    },

    onSubmit: function(e){
        e.preventDefault();
        var subview, name, tenant, region, url, blob, filename;
        
        name = UTILS.Auth.getName();
        tenant = UTILS.Auth.getCurrentTenant();
        region = UTILS.Auth.getCurrentRegion();
        url = JSTACK.Keystone.getendpoint(region, 'identity');
        openrc = [];

        openrc.push('export OS_USERNAME=' + name + '\n');
        openrc.push('export OS_PASSWORD= \n');
        openrc.push('export OS_TENANT_NAME=' + tenant.name + '\n');
        openrc.push('export OS_REGION_NAME=' + region + '\n');
        openrc.push('export OS_AUTH_URL=' + url.publicURL);

        filename = name + '-openrc';

        blob = new Blob(openrc, {type: 'text/plain'});

        saveAs(blob, filename);

        subview = new MessagesView({state: "Success", title: "Openrc file downloaded"});
        subview.render();

        console.log("Closing...");
        this.close();
    }

});
var UpdateImageView = Backbone.View.extend({

    _template: _.itemplate($('#updateImageFormTemplate').html()),

    initialize: function() {
        this.model.bind("change", this.render, this);
        this.model.fetch();
    },

    events: {
        'click #image_update': 'onUpdateImage',
        'click #cancelBtn': 'close',
        'click #close': 'close',
        'click .modal-backdrop': 'close'
    },

    render: function () {
        if ($('#update_image').html() != null) {
            //return;
            $('#update_image').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({model:this.model}));
        $('.modal:last').modal();
        return this;

    },

    onUpdateImage: function(e){
        var self = this;
        e.preventDefault();
        this.model.set({"name": this.$('input[name=name]').val()});
        // if ($('#id_public:checked').length === 1) {
        //     this.model.set({"visibility": "public"});
        // } else {
        //     this.model.set({"visibility": "private"});
        // }
        this.model.save(undefined, UTILS.Messages.getCallbacks("Image "+this.model.get("name") + " updated", "Error updating image "+this.model.get("name"), {context: self}));
    },

    close: function(e) {
        this.model.unbind("change", this.render, this);
        $('#update_image').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
    }

});
var UpdateInstanceView = Backbone.View.extend({

    _template: _.itemplate($('#updateInstanceFormTemplate').html()),

    events: {
        'submit #update_instance_form': 'update',
        'click #cancelBtn': 'close',
        'click #close': 'close',
        'click .modal-backdrop': 'close'
    },

    initialize: function() {
        this.model.bind("change", this.render, this);
        this.model.fetch();
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($('#update_instance').html() != null) {
            return;
        }
        $(this.el).append(this._template({model:this.model}));
        $('.modal:last').modal();
        return this;
    },

    close: function(e) {
        this.model.unbind("change", this.render, this);
        $('#update_instance').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    update: function(e) {
        e.preventDefault();
        this.model.set({"name": this.$('input[name=name]').val()});
        var newName = $('input[name=name]').val();
        this.model.save(undefined, UTILS.Messages.getCallbacks("Instance "+ newName + " updated", "Error updating instance "+ newName, {context: this}));
    }

});
var UploadObjectView = Backbone.View.extend({

    _template: _.itemplate($('#uploadObjectFormTemplate').html()),

    events: {
        'click #submit': 'onSubmit',
        'click #cancelBtn': 'close',
        'click #close': 'close',
        'click .modal-backdrop': 'close'
    },

    close: function(e) {
        $('#upload_object').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($('#upload_object').html() != null) {
            $('#upload_object').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({model:this.model}));
        $('.modal:last').modal();
        return this;
    },

    onSubmit: function(e){
        e.preventDefault();
        var self = this;
        var contName, objName, obj, subview;
        if (this.$('input[name=objName]').val() === "") {
            //this.close();
          subview = new MessagesView({state: "Error", title: "Wrong input values for container. Please try again."});
          subview.render();
          this.close();
          return;
        } else {
            contName = self.model.get("name");
            objName = self.$('input[name=objName]').val();
            obj = document.getElementById("id_object_file").files[0];
            self.model.uploadObject(objName, obj);
            subview = new MessagesView({state: "Success", title: "Object " + objName + " uploaded."});
            subview.render();
            this.close();
        }
    }

});
var VNCView = Backbone.View.extend({

    _template: _.itemplate($('#vncTemplate').html()),

    events: {
        'click #cancelBtn': 'close',
        'click #close': 'close',
        'click .modal-backdrop': 'close',
        'click #full-screen-button': 'onFullScreen',
        'keydown': 'onKey'
    },

    initialize: function () {
        var self = this;

        $(document).on('webkitfullscreenchange mozfullscreenchange fullscreenchange', this.onFullScreenChanged);
        var options = {};
        options.callback = function(resp) {
            self.vncUrl = resp.console.url.replace("127.0.0.1", "130.206.82.10");
            self.render();
        };
        this.model.vncconsole(options);
    },

    close: function (e) {
        $('#vnc-temp').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    onClose: function() {
        $(document).off('webkitfullscreenchange mozfullscreenchange fullscreenchange', this.onFullScreenChanged);
        this.undelegateEvents();
        this.unbind();
    },

    onKey: function (e) {
        if(e.which === 27) {
            this.close();
        }
    },

    onFullScreen: function () {
        var elem = document.getElementById('vnc-screen');

        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        } else {
          return;
        }

    },

    onFullScreenChanged: function (e) {

        var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;

        if (fullscreenElement === null) {

            // When closing full-screen mode
            $('#vnc-screen').css('width', '');
            $('#vnc-screen').css('max-height', '');
            $('#vnc-iframe').css('height', '420px');

        } else {

            // When starting full-screen mode
            $('#vnc-screen').css('max-height', '100000000px');
            $('#vnc-screen').css('height', '98%');
            $('#vnc-screen').css('width', '98%');
            var h = screen.availHeight - 60;
            $('#vnc-iframe').css('height', h + 'px');

        }
    },

    render: function () {
        if ($('#vnc-temp').html() != null) {
            $('#vnc-temp').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({vncUrl: this.vncUrl}));
        $('.modal:last').modal({keyboard: false});

        return this;
    }
});
var LoginView = Backbone.View.extend({

    _template: _.itemplate($('#not_logged_in').html()),

    initialize: function () {
    console.log("Init Login view");
        this.model.bind('change:loggedIn', this.onLogin, this);
        this.model.bind('auth-error', this.renderonerror, this);
        this.model.bind('auth-needed', this.render, this);
        this.onLogin();
    },

    events: {
        'click #home_loginbtn': 'onCredentialsSubmit',
        'click .close': 'onCloseErrorMsg'
    },

    onCredentialsSubmit: function(e){
        e.preventDefault();
        this.model.setCredentials(this.$('input[name=username]').val(), this.$('input[name=password]').val());
    },

    onCloseErrorMsg: function(e) {
        this.model.set({"error_msg": null});
        this.renderonerror();
    },

    onLogin: function() {
        if (this.model.get('loggedIn')) {
            if (this.options.next_view !== undefined) {
                window.location.href = "#" + this.options.next_view;
            } else {
                window.location.href = "#syspanel";
            }
        }
    },

    render: function () {
        var self = this;
        $(this.el).fadeOut('slow', function() {
            $('#root').css('display', 'none');
            $(self.el).empty().html(self._template(self.model));
            $(self.el).fadeIn('slow');
        });
        return this;
    },

    renderonerror: function() {
        $('#root').css('display','none');
        $(this.el).empty().html(this._template(this.model));
        return this;
    }
});
var NavTabView = Backbone.View.extend({

    _template: _.itemplate($('#navTabTemplate').html()),

    initialize: function() {
        this.model.bind('change:actives', this.render, this);
        this.options.loginModel = UTILS.GlobalModels.get("loginModel");
    },

    render: function () {
        var self = this;
        $(self.el).empty().html(self._template({models: self.model.models, showAdmin: self.options.loginModel.isAdmin(), tenants: self.options.tenants, tenant: self.options.tenant}));
        return this;
    }

});
var NetworkDetailView = Backbone.View.extend({

    _template: _.itemplate($('#networkDetailTemplate').html()),

    networkOverviewView: undefined,
    subnetsView: undefined,
    portsView: undefined,

    initialize: function() {
        this.options.subnets = UTILS.GlobalModels.get("subnets");
        this.options.ports = UTILS.GlobalModels.get("ports");
        this.render();
        this.networkOverviewView = new NetworkOverviewView({model: this.model, el: '#network_overview'});
        this.subnetsView = new NetworkSubnetsView({model: this.model, subnets: this.options.subnets, tenant_id: this.options.tenant_id, el: '#subnets'});
        this.portsView = new NetworkPortsView({model: this.model, ports: this.options.ports, el: '#ports'});
    },


    close: function(e) {
        this.model.unbind("change", this.render, this);
        this.options.subnets.unbind("change", this.render, this);
        this.options.ports.unbind("change", this.render, this);
        $('#network_overview').remove();
        $('#subnets').remove();
        $('#ports').remove();
        this.undelegateEvents();
        this.unbind();
    },

    onClose: function() {
        this.networkOverviewView.close();
        this.subnetsView.close();
        this.portsView.close();
        this.undelegateEvents();
        this.unbind();
    },

    render: function() {
        var self = this;
        UTILS.Render.animateRender(this.el, this._template);

    }

});
var NetworkOverviewView = Backbone.View.extend({

    _template: _.itemplate($('#networkOverviewTemplate').html()),

    initialize: function() {
        var self = this;
        this.model.bind("change", this.render, this);
        this.model.fetch({success: function() {
            self.render();
        }});
    },

    render: function () {
        if ($("#network_overview").html() == null) {
            UTILS.Render.animateRender(this.el, this._template, {model:this.model});
            console.log(this.model);
        } else {
            $(this.el).html(this._template({model:this.model}));
        }
        return this;
    }

});
var NetworkPortsView = Backbone.View.extend({

    _template: _.itemplate($('#networkPortsTemplate').html()),

    tableView: undefined,

    initialize: function() {
        var self = this;
        this.model.unbind("sync");
        this.model.bind("sync", self.render, this);
        this.model.fetch({success: function() {
            self.renderFirst();
        }});
    },

    getMainButtons: function() {
    },

    getDropdownButtons: function() {
        var self = this;
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
        return [{
            label: "Edit Port",
            action: "update",
            activatePattern: oneSelected
        }];
    },

    getHeaders: function() {
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        return [{
            type: "checkbox",
            size: "5%"
        }, {
            name: "Name",
            tooltip: "The name of the port.",
            size: "15%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Fixed IPs",
            tooltip: "IP addresses for the port. Includes the IP address and subnet ID.",
            size: "25%",
            hidden_phone: true,
            hidden_tablet: false
        }, {
            name: "Attached Device",
            tooltip: "The ID of the entity that uses this port. For example, a dhcp agent.",
            size: "30%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Status",
            tooltip: "The status of the port: UP or DOWN.",
            size: "15",
            hidden_phone: true,
            hidden_tablet: false
        }, {
            name: "Admin State",
            tooltip: "Administrative state of the router. (UP or DOWN)",
            size: "10%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getEntries: function() {   
        var network_id = this.model.id;
        var ports = this.options.ports.models;           
        var entries = [];       
        for (var index in ports) {
            var fixed_ips = [];
            var port = ports[index];
            var net_id = port.get('network_id');
            var port_id = port.get("id");
            var port_name = port_id.slice(0,8);
            if (net_id === network_id) {
                f_ips = port.get('fixed_ips');
                for (var i in f_ips) {
                    fixed_ips.push(f_ips[i].ip_address);
                } 
                var entry = {
                        id: port.get('id'),
                        cells: [{
                            value: port.get('name') === "" ? "("+port_name+")" : port.get('name'),
                            link: "#neutron/networks/ports/" + port.get('id')
                        }, {
                            value: fixed_ips
                        }, {  
                            value: port.get('device_owner') === "" ? "Detached" : port.get('device_owner')
                        },  {  
                            value: port.get('status')
                        },  {  
                            value: port.get('admin_state_up') ? "UP" : "DOWN"
                        }]
                    };
                entries.push(entry); 
            }    
        }          
        return entries;
    },

    onAction: function(action, portIDs) {
        var port, po, subview;
        var self = this;
        if (portIDs.length === 1) {
            po = portIDs[0];
            port = this.options.ports.get(po);
        }
        switch (action) {
            case 'update':
                subview = new EditPortView({
                    el: 'body',
                    model: port
                });
                subview.render();
                break;
            case 'other':
                break;
        }
    },

    renderFirst: function() {
        var self = this;
        UTILS.Render.animateRender(this.el, this._template, {
            model: this.model, ports: this.options.ports
        });
        this.tableView = new TableView({
            model: this.model,
            ports: this.options.ports,
            el: '#ports',
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
        if ($(this.el).html() !== null && this.tableView !== undefined) {
            this.tableView.render();
        }
        return this;
    }
});
var NetworkSubnetsView = Backbone.View.extend({

    _template: _.itemplate($('#networkSubnetsTemplate').html()),

    tableView: undefined,

    initialize: function() {
        var self = this;
        this.options.subnets.unbind("sync");
        this.options.subnets.bind("sync", this.render, this);
        this.options.subnets.fetch({success: function() {
            self.renderFirst();
        }});
    },

    getMainButtons: function() {
        return [{
            label: "Create Subnet",
            action: "create"
        }];
    },

    getDropdownButtons: function() {
        var self = this;
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
        return [{
            label: "Edit Subnet",
            action: "update",
            activatePattern: oneSelected
        }, {
            label: "Delete Subnets",
            action: "delete",
            warn: true,
            activatePattern: groupSelected
        }];
    },

    getHeaders: function() {
        return [{
            type: "checkbox",
            size: "5%"
        }, {
            name: "Name",
            tooltip: "Name of the subnet",
            size: "25%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Network Address",
            tooltip: "IP address of this subnet",
            size: "25%",
            hidden_phone: true,
            hidden_tablet: false
        }, {
            name: "IP Version",
            tooltip: "IP protocol version (Ipv4 or IPv6)",
            size: "20%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Gateway IP",
            tooltip: "IP address of the gateway",
            size: "15",
            hidden_phone: true,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var network_id = this.model.id;
        var subnets = this.options.subnets.models;
        var entries = [];
        for (var index in subnets) {
            var subnet = subnets[index];
            var subnet_id = subnet.get("id");
            var subnet_name = subnet_id.slice(0,8);
            if (network_id == subnet.get('network_id')){
            var entry = {
                    id: subnet.get("id"),
                    cells: [{
                        value: subnet.get('name') === "" ? "("+subnet_name+")" : subnet.get('name'),
                        link: "#neutron/networks/subnets/" + subnet.get("id")
                    }, {
                        value: subnet.get('cidr')
                    }, {  
                        value: subnet.get('ip_version') == "4" ? "IPv4" : "IPv6"  
                    },  {  
                        value: subnet.get('gateway_ip')
                    }]
                };
                entries.push(entry);
            }
        }
        return entries;
    },

    onAction: function(action, subnetIDs) {
        var subnet, snet, subview, s_net;
        var self = this;
        if (subnetIDs.length === 1) {
            snet = subnetIDs[0];
            subnets = this.options.subnets.models;
            for (var index in subnets) {
                if (subnets[index].id === snet) {
                    s_net = subnets[index];
                } 
            }
        }
        switch (action) {
            case 'create':
                subview = new CreateSubnetView({
                    el: 'body',
                    model: this.model,
                    tenant_id: this.options.tenant_id,
                    network_id: this.model.get('id'),
                    success_callback: function() {
                        self.options.subnets.fetch({success: function() {
                            self.render();
                        }});
                    }
                });
                subview.render();
                break;
            case 'update':
                subview = new EditSubnetView({
                    el: 'body',
                    model: s_net,
                    success_callback: function() {
                        self.options.subnets.fetch({success: function() {
                            self.render();
                        }});
                    }
                });
                subview.render();
                break;
            case 'delete':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Confirm Delete Subnet",
                    btn_message: "Delete Subnet",
                    onAccept: function() {
                        subnetIDs.forEach(function(subnet_id) {
                            var subnet = self.options.subnets.get(subnet_id);
                            subnet.destroy(UTILS.Messages.getCallbacks("Subnet "+subnet.get("name") + " deleted.", "Error deleting subnet "+subnet.get("name"), {context: self, success: function() {
                                self.options.subnets.fetch({success: function() {
                                    self.render();
                                }});
                            }}));                          
                        });
                    }
                });
                subview.render();
                break;
        }
    },

    renderFirst: function() {
        var self = this;
        UTILS.Render.animateRender(this.el, this._template, {
            model: this.model, subnets: this.options.subnets
        });
        this.tableView = new TableView({
            model: this.model,
            el: '#subnets',
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
        if ($(this.el).html() !== null  && this.tableView !== undefined) {
            this.tableView.render();
        }
        return this;
    }
});
var NeutronNetworksView = Backbone.View.extend({

    _template: _.itemplate($('#neutronNetworksTemplate').html()),

    tableView: undefined,

    initialize: function() {
        this.options.subnets = UTILS.GlobalModels.get("subnets");
        this.model.unbind("sync");
        this.options.subnets.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.options.subnets.bind("sync", this.render, this);
        this.renderFirst();
    },

    getMainButtons: function() {
        return [{
            label: "Create Network",
            action: "create"
        }];
    },

    getDropdownButtons: function() {
        var self = this;
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
        var editable = function(size, id) {
            if (oneSelected(size, id)) {
                var network = self.model.get(id);
                var current_tenant_id = self.options.tenant_id;
                if (current_tenant_id === network.get("tenant_id")) {
                    return true;
                }
            }
            return false;
        };
        return [{
            label: "Edit Network",
            action: "update",
            activatePattern: editable
        }, {
            label: "Add Subnet",
            action: "add_subnet",
            activatePattern: editable
        }, {
            label: "Delete Networks",
            action: "delete",
            warn: true,
            activatePattern: editable
        }];
    },

    getHeaders: function() {
        return [{
            type: "checkbox",
            size: "5%"
        }, {
            name: "Name",
            tooltip: "Network's name",
            size: "25%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Subnets associated",
            tooltip: "Subnets that are associated to this network",
            size: "30%",
            hidden_phone: true,
            hidden_tablet: false
        }, {
            name: "Shared",
            tooltip: "If the network is shared",
            size: "15%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Status",
            tooltip: "Current status of the network",
            size: "15",
            hidden_phone: true,
            hidden_tablet: false
        }, {
            name: "Admin State",
            tooltip: "State of the network",
            size: "15%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var all_subnets = this.options.subnets.models;
        var current_tenant_id = this.options.tenant_id;
        var entries = [];
        for (var index in this.model.models) {
            var subnets = [];
            var network = this.model.models[index];
            var tenant_id = network.get('tenant_id');
            var subnet_ids = network.get('subnets');
            if (current_tenant_id == tenant_id || network.get("shared") === true) {
                for (var i in subnet_ids) {
                    sub_id = subnet_ids[i];
                    for (var j in all_subnets) {
                        if (sub_id == all_subnets[j].get('id')) {
                            var sub_cidr = "<strong>" + all_subnets[j].get('name')+"</strong> "+all_subnets[j].get('cidr');
                            subnets.push(sub_cidr);
                        }
                    }
                }
                var entry = {
                        id: network.get('id'),
                        cells: [{
                            value: network.get('name') === "" ? "("+network.get("id").slice(0,8)+")" : network.get('name'),
                            link: "#neutron/networks/" + network.get('id')
                        }, {
                            value: subnets
                        }, {
                            value: network.get('shared') ? "Yes" : "No"
                        }, {
                            value: network.get('status')
                        },  {
                            value: network.get('admin_state_up') ? "UP" : "DOWN"
                        }]
                    };
                entries.push(entry);
            }
        }
        return entries;
    },

    onAction: function(action, networkIDs) {
        var network, net, subview;
        var self = this;
        if (networkIDs.length === 1) {
            network = networkIDs[0];
            net = this.model.get(network);
            this.options.network_id = network;
        }
        switch (action) {
            case 'create':
                subview = new CreateNetworkView({
                    el: 'body',
                    model: this.model,
                    subnets: this.options.subnets,
                    tenant_id: this.options.tenant_id
                });
                subview.render();
                break;
            case 'add_subnet':
                subview = new CreateSubnetView({
                    el: 'body',
                    model: this.model,
                    tenant_id: this.options.tenant_id,
                    network_id: this.options.network_id
                });
                subview.render();
                break;
            case 'update':
                subview = new EditNetworkView({
                    el: 'body',
                    model: net
                });
                subview.render();
                break;
            case 'delete':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Confirm Delete Network",
                    btn_message: "Delete Network",
                    onAccept: function() {
                        networkIDs.forEach(function(network) {
                            net = self.model.get(network);
                            net.destroy(UTILS.Messages.getCallbacks("Network "+net.get("name") + " deleted.", "Error deleting network "+net.get("name"), {context: self}));
                        });
                    }
                });
                subview.render();
                break;
        }
    },

    renderFirst: function() {
        var self = this;
        UTILS.Render.animateRender(this.el, this._template, {
            models: this.model.models, tenant_id: this.options.tenant_id, subnets: this.options.subnets
        });
        this.tableView = new TableView({
            model: this.model,
            subnets: this.options.subnets,
            el: '#networks-table',
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
var PortDetailView = Backbone.View.extend({

    _template: _.itemplate($('#portDetailTemplate').html()),

    initialize: function() {
        var self = this;
        this.model.bind("change", this.render, this);
        this.model.fetch({success: function() {
            self.render();
        }});
    },

    events: {
        'click #network_id': 'openNetworkOverview'
    },

    openNetworkOverview: function() {
        network_id = this.model.attributes.port.network_id;
        window.location.href = "#neutron/networks/" + network_id;
    },

    render: function () {
        if ($("#port_overview").html() == null) {
            UTILS.Render.animateRender(this.el, this._template, {model:this.model});
        } else {
            $(this.el).html(this._template({model:this.model}));
        }
        return this;
    }

});
var RouterDetailView = Backbone.View.extend({

    _template: _.itemplate($('#routerDetailTemplate').html()),

    routerOverviewView: undefined,
    routerInterfacesView: undefined,

    initialize: function() {
        this.options.networks = UTILS.GlobalModels.get("networks");
        this.options.ports = UTILS.GlobalModels.get("ports");
        this.options.subnets = UTILS.GlobalModels.get("subnets");
        this.render();
        this.routerOverviewView = new RouterOverviewView({model: this.model, networks: this.options.networks, el: '#router_overview'});
        this.routerInterfacesView = new RouterInterfacesView({model: this.model, subnets: this.options.subnets, networks: this.options.networks, ports: this.options.ports, tenant_id: this.options.tenant_id, el: '#interfaces'});
    },


    close: function(e) {
        this.model.unbind("change", this.render, this);
        this.options.subnets.unbind("change", this.render, this);
        this.options.ports.unbind("change", this.render, this);
        this.options.networks.unbind("change", this.render, this);
        $('#router_overview').remove();
        $('#interfaces').remove();
        this.undelegateEvents();
        this.unbind();
    },

    onClose: function() {
        this.routerOverviewView.close();
        this.routerInterfacesView.close();
        this.undelegateEvents();
        this.unbind();
    },

    render: function() {
        var self = this;
        UTILS.Render.animateRender(this.el, this._template);

    }

});
var RouterInterfacesView = Backbone.View.extend({

    _template: _.itemplate($('#routerInterfacesTemplate').html()),

    tableView: undefined,

    initialize: function() {
        var self = this;
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.options.ports.unbind("sync");
        this.options.ports.bind("sync", this.render, this);
        this.model.fetch({success: function() {
            self.renderFirst();
        }});
    },

    getMainButtons: function() {
        return [{
            label: "Add Interface",
            action: "create"
        }];
    },

    getDropdownButtons: function() {
        var self = this;
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
        return [{
            label: "Delete Interface",
            action: "delete",
            warn: true,
            activatePattern: groupSelected
        }];
    },

    getHeaders: function() {
        return [{
            type: "checkbox",
            size: "5%"
        }, {
            name: "Name",
            tooltip: "Name/ID of the interface (port)",
            size: "15%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Fixed IPs",
            tooltip: "IP addresses for the port. Includes the IP address and subnet ID.",
            size: "30%",
            hidden_phone: true,
            hidden_tablet: false
        }, {
            name: "Status",
            tooltip: "The status of the port: UP or DOWN.",
            size: "10%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Type",
            tooltip: "Type (Internal Interface/External Gateway)",
            size: "30%",
            hidden_phone: true,
            hidden_tablet: false
        }, {
            name: "Admin State",
            tooltip: "Administrative state of the router. (UP or DOWN)",
            size: "10%",
            hidden_phone: true,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var subnets = this.options.subnets.models;  
        var ports = this.options.ports.models;   
        var router_id = this.model.get('id');  
        var entries = [];
        //console.log('va ', ports, router_id);
        for (var index in ports) {
            var fixed_ips = [];
            var port = ports[index];
            var port_device_id = port.get("device_id");
            if (port_device_id == router_id) {
                //if (port.get('device_owner') == 'network:router_interface' || port.get('device_owner') == 'network:router_gateway') {
                    f_ips = port.get('fixed_ips');
                    for (var i in f_ips) {
                        fixed_ips.push(f_ips[i].ip_address);
                    } 
                    var entry = {
                            id: port.get('id'),
                            cells: [{
                                value: port.get('name') === "" ? "("+port.get('id').slice(0,8)+")" : port.get('name'),
                                link: "#neutron/networks/ports/" + port.get('id')
                            }, {
                                value: fixed_ips
                            }, {  
                                value: port.get('status')
                            },  {  
                                //value: port.get('device_owner') == 'network:router_interface' ? "Internal Interface" : "External Gateway"
                                value: port.get('device_owner').substring(8)
                            },  {  
                                value: port.get('admin_state_up') ? "UP" : "DOWN"
                            }]
                        };
                    entries.push(entry);
               //}
            }
        }
        return entries;
    },

    onAction: function(action, portIDs) {
        var port, po, subview;
        var self = this;
        if (portIDs.length === 1) {
            port = portIDs[0];
        }
        switch (action) {
            case 'create':
                subview = new AddInterfaceToRouterView({
                    el: 'body',
                    model: this.model,
                    subnets: this.options.subnets,
                    networks: this.options.networks,
                    tenant_id: this.options.tenant_id
                });
                subview.render();
                break;
            case 'delete':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Confirm Delete Interface",
                    btn_message: "Delete Interface",
                    onAccept: function() {
                        portIDs.forEach(function(port) {
                            var interf = self.options.ports.get(port);
                            var router_id = self.model.get('id');
                            self.model.removeinterfacefromrouter(router_id, port, UTILS.Messages.getCallbacks("Interface "+interf.get('name') + " deleted.", "Error deleting interface "+interf.get('name'), {context: self}));                          
                        });
                    }
                });
                subview.render();
                break;
        }
    },

    renderFirst: function() {
        var self = this;
        UTILS.Render.animateRender(this.el, this._template, {
            model: this.model, subnets: this.options.subnets, networks: this.options.networks, ports: this.options.ports, tenant_id: this.options.tenant_id
        });
        this.tableView = new TableView({
            model: this.model,
            subnets: this.options.subnets,
            networks: this.options.networks,
            ports: this.options.ports,
            el: '#interfaces',
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
        if ($(this.el).html() !== null  && this.tableView !== undefined) {
            this.tableView.render();
        }
        return this;
    }
});
var RouterOverviewView = Backbone.View.extend({

    _template: _.itemplate($('#routerOverviewTemplate').html()),

    initialize: function() {
        var self = this;
        this.model.bind("change", this.render, this);
        this.model.fetch({success: function() {
            self.render();
        }});
    },

    render: function () {
        if ($("#router_overview").html() == null) {
            UTILS.Render.animateRender(this.el, this._template, {model:this.model, networks:this.options.networks});
        } else {
            $(this.el).html(this._template({model:this.model, networks:this.options.networks}));
        }
        return this;
    }

});
var NeutronRoutersView = Backbone.View.extend({

    _template: _.itemplate($('#neutronRoutersTemplate').html()),

    tableView: undefined,

    initialize: function() {
        this.options.networks = UTILS.GlobalModels.get("networks");
        this.model.unbind("sync");
        this.options.networks.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.options.networks.bind("sync", this.render, this);
        this.renderFirst();
    },

    getMainButtons: function() {
        return [{
            label: "Create Router",
            action: "create"
        }];
    },

    getDropdownButtons: function() {
        var self = this;
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
        var gatewayUnSet= function(size, ids) {
            if (size === 1) {
                
                for (var id in ids) {
                    var entry = self.model.get(ids[id]);
                    if (entry.get("external_gateway_info") === null) {
                        return true;
                    }
                }
 
            } else {
                return false;
            }
        };
        var gatewaySet= function(size, ids) {
            if (size === 1) {
                
                for (var id in ids) {
                    var entry = self.model.get(ids[id]);
                    if (entry.get("external_gateway_info") !== null) {
                        return true;
                    }
                }
     
            } else {
                return false;
            }
        };
        return [{
            label: "Set Gateway",
            action: "set_gateway",
            activatePattern: gatewayUnSet
        }, {
            label: "Clear Gateway",
            action: "clear_gateway",
            warn: true,
            activatePattern: gatewaySet
        }, {
            label: "Delete Routers",
            action: "delete",
            warn: true,
            activatePattern: groupSelected
        }];
    },

    getHeaders: function() {
        return [{
            type: "checkbox",
            size: "5%"
        }, {
            name: "Name",
            tooltip: "Routers's name",
            size: "30%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Status",
            tooltip: "Current status of the router",
            size: "25%",
            hidden_phone: true,
            hidden_tablet: false
        }, {
            name: "External Network",
            tooltip: "Connected External Network",
            size: "40%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var networks = this.options.networks.models;
        var current_tenant_id = this.options.tenant_id;
        var entries = [];       
        var external_network; 
        for (var index in this.model.models) {
            var router = this.model.models[index];
            var tenant_id = router.get('tenant_id');
            if (current_tenant_id == tenant_id) {  
                for (var i in networks) {
                    var network_id = networks[i].get('id');
                    if (router.get('external_gateway_info') === null) {
                        external_network = '-';
                    } else if (network_id === router.get('external_gateway_info').network_id) {
                        external_network = networks[i].get('name');
                    }
                }        
                var entry = {
                        id: router.get('id'),
                        cells: [{
                            value: router.get('name'),
                            link: "#neutron/routers/" + router.get('id')
                        }, {
                            value: router.get('status') 
                        }, {  
                            value: external_network
                        }]
                    };
                entries.push(entry);
            }
        }
        return entries;
    },

    onAction: function(action, routerIDs) {
        var router, rout, subview;
        var self = this;
        if (routerIDs.length === 1) {
            router = routerIDs[0];
            rout = this.model.get(router);
        }
        switch (action) {
            case 'create':
                subview = new CreateRouterView({
                    el: 'body',
                    model: this.model,
                    tenant_id: this.options.tenant_id
                });
                subview.render();
                break;
            case 'set_gateway':
                subview = new EditRouterView({
                    el: 'body',
                    model: rout,
                    networks: this.options.networks
                });
                subview.render();
                break;
            case 'clear_gateway':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Confirm Clear Gateway",
                    btn_message: "Clear Gateway",
                    onAccept: function() {
                        routerIDs.forEach(function(router) {
                            rout = self.model.get(router);
                            rout.set({'external_gateway_info:network_id': undefined});
                            rout.save(undefined, UTILS.Messages.getCallbacks("Gateway removed: "+rout.get("name"), "Failed to remove gateway: "+rout.get("name")), {context: this});                       
                        });
                    }
                });
                subview.render();
                break;
            case 'delete':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Confirm Delete Router",
                    btn_message: "Delete Router",
                    onAccept: function() {
                        routerIDs.forEach(function(router) {
                            rout = self.model.get(router);
                            rout.destroy(UTILS.Messages.getCallbacks("Router "+rout.get("name") + " deleted.", "Error deleting router "+rout.get("name"), {context: self}));                       
                        });
                    }
                });
                subview.render();
                break;
        }
    },
   
    renderFirst: function() {
        var self = this;
        UTILS.Render.animateRender(this.el, this._template, {
            models: this.model.models, tenant_id: this.options.tenant_id, networks: this.options.networks
        });
        this.tableView = new TableView({
            model: this.model,
            el: '#routers-table',
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
var SubnetDetailView = Backbone.View.extend({

    _template: _.itemplate($('#subnetDetailTemplate').html()),

    initialize: function() {
        var self = this;
        this.model.bind("change", this.render, this);
        this.model.fetch({success: function() {
            self.render();
        }});
    },

    events: {
        'click #network_id': 'openNetworkOverview'
    },

    openNetworkOverview: function() {
        network_id = this.model.attributes.subnet.network_id;
        window.location.href = "#neutron/networks/" + network_id;
    },

    render: function () {
        if ($("#subnet_overview").html() == null) {
            UTILS.Render.animateRender(this.el, this._template, {model:this.model});
        } else {
            $(this.el).html(this._template({model:this.model}));
        }
        return this;
    }

});
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

var BlueprintInstancesView = Backbone.View.extend({

    _template: _.itemplate($('#blueprintInstancesTemplate').html()),

    tableView: undefined,

    initialize: function() {
        //console.log("Instances:", this.model);
        if (this.model) {
            this.model.unbind("sync");
            this.model.bind("sync", this.render, this);
        }
        this.renderFirst();
    },

    events: {
        'click .btn-task': 'onGetTask'
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [{label: "Launch New Blueprint", url: "#nova/blueprints/templates/"}];
    },

    getDropdownButtons: function() {
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
        return [{
            // label: "Start Instance",
            // action: "start",
            // activatePattern: oneSelected
            // },{
            // label: "Stop Instance",
            // action: "stop",
            // activatePattern: oneSelected
            // }, {
            label: "Terminate Instance",
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
            tooltip: "Instance's name",
            size: "35%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Description",
            tooltip: "Instance's description",
            size: "35%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Tiers",
            tooltip: "Number of tiers defined in this tier",
            size: "10%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Status",
            tooltip: "Current status of the instances",
            size: "20%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var entries = [];
        var i = 0;
        for (var index in this.model.models) {
            var bpInstance = this.model.models[index];
            i++;

            var nTiers = 0;
            if (bpInstance.get('tierDto_asArray')) {
                nTiers = bpInstance.get('tierDto_asArray').length;
            }
            var name = bpInstance.get('blueprintName');
            if (name === undefined || name.toString() === "[object Object]") name = "-";
            var entry = {
                id: index,
                cells: [{
                    value: name,
                    link: "#nova/blueprints/instances/" + bpInstance.id
                }, {
                    value: bpInstance.get('description')
                }, {
                    value: nTiers
                }, {
                    value: bpInstance.get('status') + '<img src="/images/info_icon.png" id="bpInstance__action_task__'+i+'" class="ajax-modal btn-task" name="' + bpInstance.get('taskId')  +'"></img>'
                }]
            };
            entries.push(entry);
        }
        return entries;
    },

    onGetTask: function(evt) {
        var taskId = evt.target.name;
        var options = UTILS.Messages.getCallbacks("", "Instance status information error.", {showSuccessResp: true, success: function() {
            if ( $('#message-resize-icon').hasClass('icon-resize-full')) {
                $('#message-resize-icon').click();    
            }
        }});
        options.taskId = taskId;
        this.model.getTask(options);
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
        this.tableView.close();
    },

    onAction: function(action, blueprintIds) {
        var blueprint, bp, subview;
        var self = this;
        if (blueprintIds.length === 1) {
            blueprint = blueprintIds[0];
            bp = this.model.models[blueprint];
        }
        switch (action) {
            case 'delete':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Terminate Blueprint Instance",
                    btn_message: "Terminate Blueprint Instance",
                    onAccept: function() {
                        blueprintIds.forEach(function(blueprint) {
                            bp = self.model.models[blueprint];
                            bp.destroy(UTILS.Messages.getCallbacks("Blueprint Instance terminated", "Error terminating Blueprint Instance."));
                        });
                    }
                });
                subview.render();
                break;
            case 'other':
                break;
        }
    },

    renderFirst: function() {
        UTILS.Render.animateRender(this.el, this._template);
        this.tableView = new TableView({
            model: this.model,
            el: '#blueprint-instances-table',
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

var BlueprintInstanceTierInstancesView = Backbone.View.extend({

    _template: _.itemplate($('#blueprintInstanceTierInstancesTemplate').html()),

    tableView: undefined,

    qtip: undefined,

    initialize: function() {
        var self = this;
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.options.projects = UTILS.GlobalModels.get("projects");
        //this.options.flavors = UTILS.GlobalModels.get("flavors");
        this.options.flavors = new Flavors();
        this.options.flavors.fetch({success: this.render});
        this.qtip = {
            content: '<input id="instances-to-add" type="test" value="1" class="tier-instances-num"><div class="btns"><a class="btn-plus">+</a><a class="btn-minus">-</a></div> instances <a id="add-instances" class="btn btn-blue btn-small">Add</a>',
            position: {
                my: 'top center',
                at: 'bottom center'
            },
            show: 'click',
            hide: 'unfocus',
            style: {
                tip: true,
                classes: 'ui-tooltip-add-instances'
            },
            events: {
                show: function(event, api) {
                    $('.btn-minus').bind('click', {self: self}, self.reduceNumInstances);
                    $('.btn-plus').bind('click', {self: self}, self.increaseNumInstances);
                    $('#add-instances').bind('click', {self: self}, self.addNumInstances);
                    $("#instances-to-add").val(1);
                },
                hide: function() {
                    $('.btn-minus').unbind();
                    $('.btn-plus').unbind();
                    $('#add-instances').unbind();
                }
            }
        };
        this.renderFirst();
    },

    addNumInstances: function(evt) {
        var self = evt.data.self;
        console.log("Self:",self);
        var num = parseInt($("#instances-to-add").val(), 0);
        subview = new ConfirmView({
            el: 'body',
            title: "Add " + num + " Instances",
            btn_message: "Add Instances",
            onAccept: function() {
                var bp = self.options.blueprint;
                var tier = self.options.tier;
                var options = UTILS.Messages.getCallbacks("VMs were succesfully added to tier", "Error adding VM to tier.");
                var finalCB = options.callback;
                var resp = 0;
                var cb = function() {
                    resp++;
                    if (resp === num) {
                        finalCB();
                    }
                };
                options.callback = cb;
                for (var i = 0; i<num; i++) {
                    delete tier.tierInstancePDto;
                    delete tier.tierInstancePDto_asArray;
                    options.tier = tier;
                    bp.addVMToTier(options);
                }
            }
        });
        subview.render();
    },

    reduceNumInstances: function() {
        var num = parseInt($("#instances-to-add").val(), 0);
        if (num>1) {
            $("#instances-to-add").val(num-1);
        }
    },

    increaseNumInstances: function() {
        var num = parseInt($("#instances-to-add").val(), 0);
        $("#instances-to-add").val(num+1);
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [{
            label: "Back to Tiers",
            url: "#nova/blueprints/instances/" + this.options.blueprint.get('blueprintName')
        },{
            label: "Add Instances",
            action: "add",
            cssclass: "btn-add-instances"
        }];
    },

    getDropdownButtons: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        var self = this;
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
        var activeSelected = function(size, id) {
            if (size === 1) {
                var entry = self.model.get(id);
                if (entry.get("status") !== "PAUSED" && entry.get("status") !== "SUSPENDED") {
                    return true;
                }
            }
        };
        var activeGroupSelected = function(size, ids) {
            if (size >= 1) {
                for (var id in ids) {
                    var entry = self.model.get(ids[id]);
                    if (entry.get("status") === "PAUSED" || entry.get("status") === "SUSPENDED") {
                        return false;
                    }
                }
                return true;
            }
        };
        var pausedSelected = function(size, ids) {
            if (size >= 1) {
                for (var id in ids) {
                    var entry = self.model.get(ids[id]);
                    if (entry.get("status") !== "PAUSED") {
                        return false;
                    }
                }
                return true;
            }
        };
        var suspendedSelected = function(size, ids) {
            if (size >= 1) {
                for (var id in ids) {
                    var entry = self.model.get(ids[id]);
                    if (entry.get("status") !== "SUSPENDED") {
                        return false;
                    }
                }
                return true;
            }
        };
        return [{
            label: "Edit Instance",
            action: "edit",
            activatePattern: oneSelected
        }, {
            label: "Connect to Instance",
            action: "vnc",
            activatePattern: oneSelected
        }, {
            label: "View Log",
            action: "log",
            activatePattern: oneSelected
        }, {
            label: "Create Snapshot",
            action: "snapshot",
            activatePattern: oneSelected
        }, {
            label: "Pause Instance",
            action: "pause",
            activatePattern: activeGroupSelected
        }, {
            label: "Unpause Instance",
            action: "unpause",
            activatePattern: pausedSelected
        }, {
            label: "Suspend Instance",
            action: "suspend",
            activatePattern: activeGroupSelected
        }, {
            label: "Resume Instance",
            action: "resume",
            activatePattern: suspendedSelected
        }, {
            label: "Change Password",
            action: "password",
            warn: true,
            activatePattern: activeSelected
        }, {
            label: "Reboot Instance",
            action: "reboot",
            warn: true,
            activatePattern: groupSelected
        }, {
            label: "Terminate Instance",
            action: "terminate",
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
            name: "Instance Name",
            tooltip: "Server's name",
            size: "25%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "IP Address",
            tooltip: "IP Address",
            size: "15%",
            hidden_phone: true,
            hidden_tablet: false
        }, {
            name: "Size",
            tooltip: "Server's RAM, number of virtual CPUs, and user disk",
            size: "25%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "PaaS Status",
            tooltip: "Current server status",
            size: "10%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Task",
            tooltip: "Current tasks performed on the server",
            size: "10%",
            hidden_phone: true,
            hidden_tablet: false
        }, {
            name: "Power State",
            tooltip: "Server's power state",
            size: "15%",
            hidden_phone: true,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var flavorlist = {};
        for (var index in this.options.flavors.models) {
            var flavor = this.options.flavors.models[index];
            flavorlist[flavor.id] = flavor.get("ram") + " MB RAM | " + flavor.get("vcpus") + " VCPU | " + flavor.get("disk") + "GB Disk";
        }
        var POWER_STATES = {
            0: "NO STATE",
            1: "RUNNING",
            2: "BLOCKED",
            3: "PAUSED",
            4: "SHUTDOWN",
            5: "SHUTOFF",
            6: "CRASHED",
            7: "SUSPENDED",
            8: "FAILED",
            9: "BUILDING"
        };
        // entries: [{id:id, cells: [{value: value, link: link}] }]
        var entries = [];
        for (var instance_idx in this.model.models) {
            var instance = this.model.models[instance_idx];

            var address = "";
            var addresses;

            if (instance.get("addresses") !== null) {
                var networks = instance.get("addresses");
                for (var net in networks) {
                    if (networks.hasOwnProperty(net)) {
                        addresses = networks[net];
                        for (var addr_idx in addresses) {
                            address += addresses[addr_idx].addr + "<br/>";
                        }
                    }
                }
            }
            var entry = {
                id: instance.get('id'),
                cells: [{
                    value: instance.get("name"),
                    link: "#nova/instances/" + instance.id + "/detail"
                }, {
                    value: address
                }, {
                    value: flavorlist[instance.get("flavor").id]
                }, {
                    value: instance.get("paasStatus")
                }, {
                    value: instance.get("OS-EXT-STS:task_state") ? instance.get("OS-EXT-STS:task_state") : "None"
                }, {
                    value: POWER_STATES[instance.get("OS-EXT-STS:power_state")]
                }]
            };
            entries.push(entry);
        }
        return entries;
    },

    onClose: function() {
        this.tableView.close();
        this.undelegateEvents();
        this.unbind();
        this.model.unbind("sync", this.render, this);
    },

    onAction: function(action, instanceIds) {
        var instance, inst, subview;
        var self = this;
        if (instanceIds.length === 1) {
            instance = instanceIds[0];
            inst = this.model.get(instance);
        }
        switch (action) {
            case 'add':
                break;
            case 'edit':
                subview = new UpdateInstanceView({
                    el: 'body',
                    model: inst
                });
                subview.render();
                break;
            case 'vnc':
                window.location.href = '#nova/instances/' + instance + '/detail?view=vnc';
                break;
            case 'log':
                window.location.href = 'nova/instances/' + instance + '/detail?view=log';
                break;
            case 'snapshot':
                subview = new CreateSnapshotView({
                    el: 'body',
                    model: this.model.get(instance)
                });
                subview.render();
                break;
            case 'password':
                subview = new ChangePasswordView({
                    el: 'body',
                    model: inst
                });
                subview.render();
                break;
            case 'pause':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Pause Instances",
                    btn_message: "Pause Instances",
                    onAccept: function() {
                        instanceIds.forEach(function(instance) {
                            inst = self.model.get(instance);
                            inst.pauseserver(UTILS.Messages.getCallbacks("Instance "+inst.get("name") + " paused.", "Error pausing instance "+inst.get("name")));
                        });
                    }
                });
                subview.render();
                break;
            case 'unpause':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Unpause Instances",
                    btn_message: "Unpause Instances",
                    onAccept: function() {
                        instanceIds.forEach(function(instance) {
                            inst = self.model.get(instance);
                            inst.unpauseserver(UTILS.Messages.getCallbacks("Instance "+inst.get("name") + " unpaused.", "Error unpausing instance "+inst.get("name")));
                        });
                    }
                });
                subview.render();
                break;
            case 'suspend':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Suspend Instances",
                    btn_message: "Suspend Instances",
                    onAccept: function() {
                        instanceIds.forEach(function(instance) {
                            inst = self.model.get(instance);
                            inst.suspendserver(UTILS.Messages.getCallbacks("Instance "+inst.get("name") + " suspended.", "Error suspending instance "+inst.get("name")));
                        });
                    }
                });
                subview.render();
                break;
            case 'resume':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Resume Instances",
                    btn_message: "Resume Instances",
                    onAccept: function() {
                        instanceIds.forEach(function(instance) {
                            inst = self.model.get(instance);
                            inst.resumeserver(UTILS.Messages.getCallbacks("Instance "+inst.get("name") + " resumed.", "Error resuming instance "+inst.get("name")));
                        });
                    }
                });
                subview.render();
                break;
            case 'reboot':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Reboot Instances",
                    btn_message: "Reboot Instances",
                    onAccept: function() {
                        instanceIds.forEach(function(instance) {
                            inst = self.model.get(instance);
                            inst.reboot(true, UTILS.Messages.getCallbacks("Instance "+inst.get("name") + " rebooted.", "Error rebooting instance "+inst.get("name")));
                        });
                    }
                });
                subview.render();
                break;
            case 'terminate':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Terminate Instances",
                    btn_message: "Terminate Instances",
                    onAccept: function() {
                        instanceIds.forEach(function(instance) {
                            inst = self.model.get(instance);
                            var options = UTILS.Messages.getCallbacks("VMs were succesfully added to tier", "Error adding VM to tier.");
                            var bp = self.options.blueprint;
                            options.instance_name = inst.get("name");
                            bp.removeVMFromTier(options);
                            //inst.destroy(UTILS.Messages.getCallbacks("Instance "+inst.get("name") + " terminated.", "Error terminating instance "+inst.get("name")));
                        });
                    }
                });
                subview.render();
                break;
            default:
                break;
        }
    },

    renderFirst: function() {
        UTILS.Render.animateRender(this.el, this._template, {
            models: this.model.models,
            flavors: this.options.flavors
        });
        this.tableView = new TableView({
            model: this.model,
            el: '#blueprint-instance-tier-instances-table',
            onAction: this.onAction,
            getDropdownButtons: this.getDropdownButtons,
            getMainButtons: this.getMainButtons,
            getHeaders: this.getHeaders,
            getEntries: this.getEntries,
            context: this
        });
        this.tableView.render();
        $('.btn-add-instances').qtip(this.qtip);
    },

    render: function() {
        if ($(this.el).html() !== null) {
            this.tableView.render();
        }
        $('.btn-add-instances').qtip(this.qtip);
        return this;
    }

});
var BlueprintInstanceView = Backbone.View.extend({

    _template: _.itemplate($('#blueprintInstanceTemplate').html()),

    tableView: undefined,
    sdcs: {},

    initialize: function() {
        var regions = UTILS.GlobalModels.get("loginModel").get("regions");
        this.options.flavors = {};
        this.options.images = {};
        var self = this;
        var render = function() {
            self.render.apply(self);
        };
        for (var idx in regions) {
            var region = regions[idx];
            var images = new Images();
            var flavors = new Flavors();
            images.region = region;
            flavors.region = region;
            images.fetch({success: render});
            flavors.fetch({success: render});
            this.options.flavors[region] = flavors;
            this.options.images[region] = images;
        }
        //this.options.images = UTILS.GlobalModels.get("images");
        //this.options.flavors = UTILS.GlobalModels.get("flavors");
        if (this.model) {
            this.model.unbind("sync");
            this.model.bind("sync", this.render, this);
        }
        this.model.fetch();
        this.renderFirst();
    },

    events: {
        'click .btn-launch': 'onLaunch'
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [{label: "Back to instances", url: "#nova/blueprints/instances/"}];
    },

    getDropdownButtons: function() {
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
        return [{
            label: "Edit Tier",
            action: "edit",
            activatePattern: oneSelected
            }, {
            label: "Delete Tier",
            action: "delete",
            warn: true,
            activatePattern: groupSelected
            }];
    },

    getActionButtons: function() {
        return [{
            icon: "fi-icon-play",
            action: "play"
            }, {
            icon: "fi-icon-instances",
            action: "show-instances"
            }];
    },


    getHeaders: function() {
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        return [{
            name: "Graph",
            tooltip: "Graph",
            size: "25%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Info",
            tooltip: "Template's info",
            size: "25%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Software",
            tooltip: "Software in tier",
            size: "50%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var entries = [];
        var i = 0;
        for (var index in this.model.get('tierDto_asArray')) {
            var tier = this.model.get('tierDto_asArray')[index];

            var products = [];
            var region = tier.region;
            for (var p in tier.productReleaseDtos_asArray) {
                products.push(tier.productReleaseDtos_asArray[p].productName + " " + tier.productReleaseDtos_asArray[p].version);
            }

            var currTiers = 0;
            if (tier.tierInstancePDto_asArray) {
                currTiers = tier.tierInstancePDto_asArray.length;
            }
            if (tier.keypair.toString() === "[object Object]") {
                tier.keypair = "-";
            }
            var image = "-";
            if (this.options.images[region] && this.options.images[region].get(tier.image) !== undefined) {
                image = this.options.images[region].get(tier.image).get("name");
            }
            var flavor = "-";
            if (this.options.flavors[region]) {
                flavor = this.options.flavors[region].get(tier.flavour) ? this.options.flavors[region].get(tier.flavour).get("name") : "-";
            }
            var entry = {
                id: tier.name,
                minValue: tier.minimumNumberInstances,
                maxValue: tier.maximumNumberInstances,
                currentValue: currTiers,
                icono: tier.icono,
                bootValue: tier.initialNumberInstances,
                name: tier.name,
                flavor: flavor,
                image: image,
                keypair: tier.keypair,
                publicIP: tier.floatingip,
                products: products,
                region: region
            };
            entries.push(entry);
        }
        function compare(a,b) {
          if (a.id < b.id)
             return -1;
          if (a.id > b.id)
            return 1;
          return 0;
        }

        entries.sort(compare);
        return entries;
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
        this.tableView.close();
    },

    onAction: function(action, tierIds) {
        var tier, tr, subview;
        var self = this;
        if (tierIds.length === 1) {
            tier = tierIds[0];
            tr = tier;
        }
        //console.log(tierIds);
        switch (action) {
            case 'show-instances':
                window.location.href = "#nova/blueprints/instances/"+self.model.get("blueprintName")+"/tiers/"+tier+"/instances";
                break;
            case 'edit':
                break;
        }
    },

    renderFirst: function() {
        UTILS.Render.animateRender(this.el, this._template);
        this.tableView = new TableTiersView({
            model: this.model,
            el: '#blueprint-instance-table',
            onAction: this.onAction,
            getDropdownButtons: this.getDropdownButtons,
            getMainButtons: this.getMainButtons,
            getActionButtons: this.getActionButtons,
            getHeaders: this.getHeaders,
            getEntries: this.getEntries,
            context: this,
            color: "#0093C6",
            color2: "#DDD"
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

var BlueprintTemplateCatalogView = Backbone.View.extend({

    _template: _.itemplate($('#blueprintTemplateCatalogTemplate').html()),

    tableView: undefined,
    bpTemplate: {},

    initialize: function() {

        var self = this;
        
        this.model.getCatalogBlueprint({id: this.options.templateId, callback: function (bpTemplate) {
            self.bpTemplate = bpTemplate;
            self.render();
        }, error: function (e) {
            console.log('Error getting catalog bp detail');
        }});

        this.options.flavors = {};
        this.options.images = {};

        this.renderFirst();
    },

    events: {
        'click .btn-launch': 'onLaunch'
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [{label: "Back to Catalog", url: "#nova/blueprints/catalog/", cssclass: "btn-catalog"}];
    },

    getDropdownButtons: function() {
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
        return [{
            label: "Edit Tier",
            action: "edit",
            activatePattern: oneSelected
            }, {
            label: "Delete Tier",
            action: "delete",
            warn: true,
            activatePattern: groupSelected
            }];
    },

    getHeaders: function() {
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        return [{
            name: "Graph",
            tooltip: "Graph",
            size: "25%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Info",
            tooltip: "Template's info",
            size: "25%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Software",
            tooltip: "Software in tier",
            size: "50%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var self = this;
        var render = function() {
            self.render.apply(self);
        };
        var entries = [];
        var i = 0;
        for (var index in this.bpTemplate.tierDtos_asArray) {
            var tier = this.bpTemplate.tierDtos_asArray[index];

            var products = [];
            for (var p in tier.productReleaseDtos_asArray) {
                products.push(tier.productReleaseDtos_asArray[p].productName + " " + tier.productReleaseDtos_asArray[p].version);
            }

            var region = tier.region;

            var image = "Loading...";
            if (!this.options.images[region]) {
                var images = new Images();
                images.region = region;
                this.options.images[region] = images;
                images.fetch({success: render});
                
            } else if (this.options.images[region].get(tier.image)){
                image = this.options.images[region].get(tier.image).get("name");
            }

            var flavor = "Loading...";
            if (!this.options.flavors[region]) {
                var flavors = new Flavors();
                flavors.region = region;
                this.options.flavors[region] = flavors;
                flavors.fetch({success: render});
            } else if (this.options.flavors[region].get(tier.flavour)) {
                flavor = this.options.flavors[region].get(tier.flavour).get("name");
            }

            var entry = {
                id: tier.name,
                minValue: tier.minimumNumberInstances,
                maxValue: tier.maximumNumberInstances,
                bootValue: tier.initialNumberInstances,
                name: tier.name,
                flavor: flavor,
                image: image,
                products: products,
                icon: tier.icono
            };

            entries.push(entry);
        }
        return entries;
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
        this.tableView.close();
    },

    onAction: function(action, blueprintIds) {
        var blueprint, bp, subview;
        var self = this;
        if (blueprintIds.length === 1) {
            blueprint = blueprintIds[0];
            bp = blueprint;
        }
        switch (action) {
            case 'add':
                break;
            case 'edit':
                break;
            case 'delete':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Delete Tier",
                    btn_message: "Delete Tier",
                    onAccept: function() {
                        blueprintIds.forEach(function(blueprint) {
                            bp.destroy(UTILS.Messages.getCallbacks("Tier deleted", "Error deleting Tier."));
                        });
                    }
                });
                subview.render();
                break;
        }
    },

    renderFirst: function() {
        $(this.el).html('<p style="padding:50px;">Loading...</p>');
    },

    render: function() {
        if (this.tableView === undefined) {
            UTILS.Render.animateRender(this.el, this._template);
            this.tableView = new TableTiersView({
                model: this.model,
                el: '#blueprint-templateCatalog-table',
                onAction: this.onAction,
                getDropdownButtons: this.getDropdownButtons,
                getMainButtons: this.getMainButtons,
                getHeaders: this.getHeaders,
                getEntries: this.getEntries,
                context: this,
                color: "#95C11F",
                color2: "#95C11F"
            });
        } 
        this.tableView.render();
    }

});
var BlueprintTemplatesCatalogView = Backbone.View.extend({

    _template: _.itemplate($('#blueprintTemplatesCatalogTemplate').html()),

    tableView: undefined,

    initialize: function() {

        if (this.model) {
            this.model.unbind("sync");
            this.model.bind("sync", this.render, this);
        }
        this.renderFirst();
    },

    events: {
        'click .btn-launch': 'onLaunch'
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [{label: "Close Catalog", url: "#nova/blueprints/templates/", cssclass: "btn-catalog"}];
    },

    getDropdownButtons: function() {
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
        return [{
            label: "Clone Template",
            action: "clone",
            activatePattern: oneSelected
            }];
    },

    getHeaders: function() {
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        return [{
            type: "checkbox",
            size: "5%"
        }, {
            name: "Name",
            tooltip: "Template's name",
            size: "45%",
            hidden_phone: false,
            hidden_tablet: false,
            cssclass: "link-catalog"
        }, {
            name: "Description",
            tooltip: "Template's description",
            size: "45%",
            hidden_phone: false,
            hidden_tablet: false,
            cssclass: "link-catalog"
        }, {
            name: "Tiers",
            tooltip: "Number of tiers defined in this tier",
            size: "10%",
            hidden_phone: false,
            hidden_tablet: false,
            cssclass: "link-catalog"
        }];
    },

    getEntries: function() {
        var entries = [];

        for (var index in this.model.catalogList) {
            var template = this.model.catalogList[index];
            var nTiers = 0;
            if (template.tierDtos_asArray) {
                nTiers = template.tierDtos_asArray.length;
            }
            var entry = {
                id: index,
                cells: [{
                    value: template.name,
                    link: "#nova/blueprints/catalog/" + template.name
                }, {
                    value: template.description
                }, {
                    value: nTiers
                }]
            };
            entries.push(entry);
        }
        return entries;
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
        this.tableView.close();
    },

    onAction: function(action, blueprintIds) {
        var blueprint, bp, subview;
        var self = this;
        if (blueprintIds.length === 1) {
            blueprint = blueprintIds[0];
            bp = this.model.catalogList[blueprint];
            console.log(bp);
        }
        switch (action) {
            case 'clone':
                subview = new CloneBlueprintView({el: 'body', bpTemplate: bp});
                subview.render();
                break;
            case 'other':
                break;
        }
    },

    renderFirst: function() {
        UTILS.Render.animateRender(this.el, this._template);
        this.tableView = new TableView({
            model: this.model,
            el: '#blueprint-templatesCatalog-table',
            onAction: this.onAction,
            getDropdownButtons: this.getDropdownButtons,
            getMainButtons: this.getMainButtons,
            getHeaders: this.getHeaders,
            getEntries: this.getEntries,
            context: this,
            dropdown_buttons_class: "btn-catalog"
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
var BlueprintTemplatesView = Backbone.View.extend({

    _template: _.itemplate($('#blueprintTemplatesTemplate').html()),

    tableView: undefined,

    initialize: function() {
        if (this.model) {
            this.model.unbind("sync");
            this.model.bind("sync", this.render, this);
        }
        this.renderFirst();
    },

    events: {
        'click .btn-launch': 'onLaunch'
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [{label: "Open Catalog", url: "#nova/blueprints/catalog/", cssclass: "btn-catalog"},
                {label: "Create New Template", action: "create"}];
    },

    getDropdownButtons: function() {
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
        return [{
            label: "Launch Template",
            action: "launch",
            activatePattern: oneSelected
            }, {
            label: "Clone Template",
            action: "clone",
            activatePattern: oneSelected
            }, {
            // label: "Edit Template",
            // action: "edit",
            // activatePattern: oneSelected
            // }, {
            label: "Delete Template",
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
            tooltip: "Template's name",
            size: "45%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Description",
            tooltip: "Template's description",
            size: "45%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Tiers",
            tooltip: "Number of tiers defined in this tier",
            size: "10%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var entries = [];
        for (var index in this.model.models) {
            var template = this.model.models[index];
            var nTiers = 0;
            if (template.get('tierDtos_asArray')) {
                nTiers = template.get('tierDtos_asArray').length;
            }
            var name = template.get('name');
            if (name.toString() === "[object Object]") {
                name = "-";
            }
            var entry = {
                id: index,
                cells: [{
                    value: name,
                    link: "#nova/blueprints/templates/" + template.id
                }, {
                    value: template.get('description')
                }, {
                    value: nTiers
                }]
            };
            entries.push(entry);
        }
        return entries;
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
        this.tableView.close();
    },

    onAction: function(action, blueprintIds) {
        var blueprint, bp, subview;
        var self = this;
        if (blueprintIds.length === 1) {
            blueprint = blueprintIds[0];
            bp = this.model.models[blueprint];
        }
        switch (action) {
            case 'create':
                subview = new CreateBlueprintView({el: 'body'});
                subview.render();
                break;
            case 'launch':
                subview = new CreateBlueprintInstanceView({el: 'body', model: bp});
                subview.render();
                // subview = new ConfirmView({
                //     el: 'body',
                //     title: "Launch Blueprint Instance",
                //     btn_message: "Launch Blueprint Instance",
                //     onAccept: function() {
                //         var bpi = new BPInstance();
                //         bpi.set({"name": bp.get('name')});
                //         bpi.set({"description": bp.get('description')});
                //         bpi.set({"tierDtos": bp.get("tierDtos_asArray")});
                //         var callbacks = UTILS.Messages.getCallbacks("Blueprint "+name + " launched.", "Error launching blueprint "+name, {context: self});
                //         bpi.save(undefined, callbacks);

                //         window.location.href = "#nova/blueprints/instances/";
                //     }
                // });
                // subview.render();
                break;
            case 'clone':
                subview = new CloneBlueprintView({el: 'body', model: bp});
                subview.render();
                break;
            case 'edit':
                subview = new EditBlueprintView({el: 'body', model: bp});
                subview.render();
                break;
            case 'delete':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Delete Blueprint Template",
                    btn_message: "Delete Blueprint Template",
                    onAccept: function() {
                        blueprintIds.forEach(function(b) {
                            var bprint = self.model.models[b];
                            bprint.destroy(UTILS.Messages.getCallbacks("Blueprint Template deleted", "Error deleting Blueprint Template."));
                        });
                    }
                });
                subview.render();
                break;
        }
    },

    renderFirst: function() {
        UTILS.Render.animateRender(this.el, this._template);
        this.tableView = new TableView({
            model: this.model,
            el: '#blueprint-templates-table',
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

var BlueprintTemplateView = Backbone.View.extend({

    _template: _.itemplate($('#blueprintTemplateTemplate').html()),

    tableView: undefined,

    initialize: function() {
        var regions = UTILS.GlobalModels.get("loginModel").get("regions");
        this.options.flavors = {};
        this.options.images = {};
        //this.options.flavors = UTILS.GlobalModels.get("flavors");
        this.options.securityGroupsModel = UTILS.GlobalModels.get("securityGroupsModel");
        //this.options.images = UTILS.GlobalModels.get("images");
        this.options.loginModel = UTILS.GlobalModels.get("loginModel");
        if (this.model) {
            this.model.unbind("sync");
            this.model.bind("sync", this.render, this);
        }
        this.model.fetch();
        this.renderFirst();
    },

    events: {
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        var main_buttons = [];
        if (JSTACK.Keystone.getendpoint(UTILS.Auth.getCurrentRegion(), "network") !== undefined) {
            main_buttons.push({label: "Topology", action: "show_nets"});
        }

        main_buttons.push({label: "Add Tier", action: "add"});
        return main_buttons;
    },

    getDropdownButtons: function() {
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
        return [{
            label: "Edit Tier",
            action: "edit",
            activatePattern: oneSelected
            }, {
            label: "Delete Tier",
            action: "delete",
            warn: true,
            activatePattern: groupSelected
            }];
    },

    getHeaders: function() {
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        return [{
            name: "Graph",
            tooltip: "Graph",
            size: "25%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Info",
            tooltip: "Template's info",
            size: "25%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Software",
            tooltip: "Software in tier",
            size: "50%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getActionButtons: function() {
        return [{
            icon: "fi-icon-edit",
            action: "edit",
            tooltip: "Edit tier"
            }, {
            icon: "fi-icon-delete",
            action: "delete",
            tooltip: "Delete tier"
            }];
    },

    getEntries: function() {
        var self = this;
        var render = function() {
            self.render.apply(self);
        };
        var entries = [];
        var i = 0;
        for (var index in this.model.get('tierDtos_asArray')) {
            var tier = this.model.get('tierDtos_asArray')[index];
            var region = tier.region;
            var products = [];
            for (var p in tier.productReleaseDtos_asArray) {
                products.push(tier.productReleaseDtos_asArray[p].productName + " " + tier.productReleaseDtos_asArray[p].version);
            }

            if (tier.keypair.toString() === "[object Object]") {
                tier.keypair = "-";
            }

            var image = "Loading...";
            if (!this.options.images[region]) {
                var images = new Images();
                images.region = region;
                this.options.images[region] = images;
                images.fetch({success: render});
                
            } else if (this.options.images[region].get(tier.image)){
                image = this.options.images[region].get(tier.image).get("name");
            }

            var flavor = "Loading...";
            if (!this.options.flavors[region]) {
                var flavors = new Flavors();
                flavors.region = region;
                this.options.flavors[region] = flavors;
                flavors.fetch({success: render});
            } else if (this.options.flavors[region].get(tier.flavour)) {
                flavor = this.options.flavors[region].get(tier.flavour).get("name");
            }

            var entry = {
                id: tier.id,
                minValue: tier.minimumNumberInstances,
                maxValue: tier.maximumNumberInstances,
                bootValue: tier.initialNumberInstances,
                name: tier.name,
                icono: tier.icono,
                flavor: flavor,
                image: image,
                keypair: tier.keypair,
                publicIP: tier.floatingip,
                region: tier.region,
                products: products
            };
            entries.push(entry);
        }
        function compare(a,b) {
          if (a.id < b.id)
             return -1;
          if (a.id > b.id)
            return 1;
          return 0;
        }

        entries.sort(compare);
        return entries;
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
        this.tableView.close();
    },

    onAction: function(action, tierIds) {
        var tier, tr, subview;
        var self = this;
        if (tierIds.length === 1) {
            tier = tierIds[0];
            this.model.get('tierDtos_asArray').forEach(function(cur) {
                if (cur.id === tier) {
                    tr = cur;
                }
            });
        }
        switch (action) {
            case 'show_nets':
                subview = new MatrixNetView({el: 'body', model: self.model});
                subview.render();

                break;
            case 'add':

                subview = new EditTierView({el: 'body', model: self.model, securityGroupsModel: self.options.securityGroupsModel, regions: self.options.loginModel.get("regions"), callback: function () {
                    self.model.fetch({success: function () {
                        self.render();
                    }});
                }});
                subview.render();

                break;
            case 'edit':

                subview = new EditTierView({el: 'body', model: self.model, tier: tr, securityGroupsModel: self.options.securityGroupsModel, regions: self.options.loginModel.get("regions"), callback: function () {
                    self.model.fetch({success: function () {
                        self.render();
                    }});
                }});
                subview.render();

                break;
            case 'delete':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Delete Tier",
                    btn_message: "Delete Tier",
                    onAccept: function() {
                        tierIds.forEach(function(tier) {
                            console.log('Deleting', tier);
                            var options = UTILS.Messages.getCallbacks("Tier deleted", "Error deleting Tier.");
                            options.tier = tier;
                            var cb = options.callback;
                            options.callback = function() {
                                setTimeout(function() {
                                    self.model.fetch({success: function () {
                                        self.render();
                                    }});
                                }, 1000);
                                cb();
                            };
                            self.model.deleteTier(options);
                        });
                    }
                });
                subview.render();
                break;
        }
    },

    renderFirst: function() {
        $(this.el).html('<p style="padding:50px;">Loading...</p>');
    },

    render: function() {
        $('#page-title').children().html('Blueprint Templates / ' + this.model.get('name'));
        if (this.tableView === undefined) {
            UTILS.Render.animateRender(this.el, this._template);
            this.tableView = new TableTiersView({
                model: this.model,
                el: '#blueprint-template-table',
                onAction: this.onAction,
                getDropdownButtons: this.getDropdownButtons,
                getMainButtons: this.getMainButtons,
                getActionButtons: this.getActionButtons,
                getHeaders: this.getHeaders,
                getEntries: this.getEntries,
                context: this,
                color: "#0093C6",
                color2: "#0093C6"
            });
        }
        this.tableView.render();
    }

});

var MatrixNetView = Backbone.View.extend({

    _template: _.itemplate($('#matrixNetTemplate').html()),


    initialize: function() {
    },

    events: {
    },

    close: function(e) {
        $('#matrix_net').remove();
        $('.modal-backdrop').remove();
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    render: function() {
        if ($('#matrix_net').html() != null) {
            $('#matrix_net').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({model:this.model}));
        $('.modal:last').modal();
        return this;
    }
});
var SoftwareView = Backbone.View.extend({

    _template: _.itemplate($('#softwareTemplate').html()),

    tableView: undefined,

    initialize: function() {
        var self = this;

        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.renderFirst();
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [{
            label: "Add new software",
            action: 'create'
        }];
    },

    getDropdownButtons: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        var self = this;
        var privateOneSelected = function(size, id) {
            if (size === 1) {
                // TODO tiene que ser privado para poder editarse o borrarse
                return true;
            }
        };
        var privateGroupSelected = function(size, id) {
            if (size >= 1) {
                // TODO tiene que ser privado para poder editarse o borrarse
                return true;
            }
        };
        return [{
            label: "Edit Software",
            action: "edit",
            activatePattern: privateOneSelected
        }, {
            label: "Delete Software",
            action: "delete",
            warn: true,
            activatePattern: privateOneSelected
        }];
    },

    getHeaders: function() {
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        return [{
            type: "checkbox",
            size: "5%"
        }, {
            name: "Software Name",
            tooltip: "Software's name",
            size: "20%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Version",
            tooltip: "Release version",
            size: "10%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Visibility",
            tooltip: "Check if the software is open to the public",
            size: "20%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Description",
            tooltip: "Software's description",
            size: "45%",
            hidden_phone: true,
            hidden_tablet: true
        }];
    },

    getEntries: function() {
        // entries: [{id:id, cells: [{value: value, link: link}] }]
        var entries = [];
        var models = this.model.models;
        for (var sft in models) {
            var pub = 'private';
            if (models[sft].get('metadatas') && models[sft].get('metadatas')['public']) pub = 'public';
            var desc = models[sft].get('description');
            if (!desc || desc.toString() === "[object Object]") {
                desc = "-";
            }
            var entry = {
                id: sft,
                // TODO qué id usar
                cells: [{
                    value: models[sft].get('name')
                    //link: "#nova/instances/" + instance.id + "/detail"
                }, {
                    value: models[sft].get('version')
                    //link: "#nova/instances/" + instance.id + "/detail"
                }, {
                    value: pub
                }, {
                    value: desc
                }]
            };
            entries.push(entry);
        }
        return entries;
    },

    onClose: function() {
        this.tableView.close();
        this.undelegateEvents();
        this.unbind();
        this.model.unbind("sync", this.render, this);
    },

    onAction: function(action, sftIds) {
        var software, sft, subview;
        var self = this;
        if (sftIds.length === 1) {
            software = sftIds[0];
            sft = this.model.get(software);
        }
        switch (action) {
            case 'create':
                subview = new CreateSoftwareView({el: 'body', model: this.model});
                subview.render();
                break;
            case 'edit':
                // subview = new EditBlueprintView({el: 'body', model: bp});
                // subview.render();
                break;
            case 'delete':
                // subview = new ConfirmView({
                //     el: 'body',
                //     title: "Delete Software",
                //     btn_message: "Delete Software",
                //     onAccept: function() {
                //         sftIds.forEach(function(b) {
                //             var s = self.model.models[b];
                //             s.destroy(UTILS.Messages.getCallbacks("Software deleted", "Error deleting Software."));
                //         });
                //     }
                // });
                //subview.render();
                break;
            
        }
    },

    renderFirst: function() {
        UTILS.Render.animateRender(this.el, this._template, {
            //models: this.model.models,
        });
        this.tableView = new TableView({
            model: this.model,
            el: '#software-table',
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
var EditGFIPInfoView = Backbone.View.extend({

    _template: _.itemplate($('#editGaoFangIPInfoTemplate').html()),

    events: {
        'click #cancelCreateBtn': 'close',
        'click .close': 'close',
        'submit #form_gaofangipInfo': 'updateGFIPInfo',
        'click #threshold_button':'editThreshold',
        'click #cc_protect_button':'editCCprotect',
        'click .modal-backdrop': 'close'
    },

    initialize: function(){
           //this.model.set({'cc_protect':0,'threshold':100});
    },

    proRender:function(){
        while($('#edit_info').html()!=null||$('.modal-backdrop').html()!=null){
            $('#edit_info').remove();
            $('.modal-backdrop').remove();
        }
        this.render();
    },

    render: function () {
        //alert(JSON.stringify(this.model));
        while($('#editGaoFangipInfo').html()!=null){
            $('#editGaoFangipInfo').remove();
            $('.modal-backdrop').remove();
        }
        $(this.el).append(this._template({ model: this.model}));
        $('.modal:last').modal();
        return this;
    },

    editThreshold: function(){
        alert("editThreshold-23");
        var value = $("#threshold").val();
        this.model.set({'threshold':value});
        alert(value);
    },

    editCCprotect: function(){
        alert("editCCprotect-1");
        var value=$('#cc_protect option:selected').val();
        this.model.set({'cc_protect':value});
        alert(value);
    },

    close: function(e) {
        while($('#editGaoFangipInfo').html()!=null){
            $('#editGaoFangipInfo').remove();
            $('.modal-backdrop').remove();
        }
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    updateGFIPInfo: function() {
        var context = $('#form_gaofangipInfo').serialize();
        context = decodeURIComponent(context,true);
        context = context.replace(/&/g, "','" );
        context = context.replace(/=/g, "':'" );
        context = "({'" +context + "'})" ;
        var p = eval(context);
        this.model.updateInfo(p,this);
    }
})


var EditGFIPRuleView = Backbone.View.extend({

    _template: _.itemplate($('#editGFIPRuleTemplate').html()),
    tableView:undefined,
    model_parent_id:undefined,

    events: {
        'click #cancelCreateBtn': 'close',
        'click .close': 'close',
        'click #delRule':'delRule',
        'click #gfipRule_add': 'addRule'
    },

    initialize: function() {

        this.model = new GFIPRuleModels();

    },

    getList:function(parent_id){
        this.model.getRuleList(parent_id,this);
    },

    proRender: function(){
        $('#edit_rule').remove();
        $('.modal-backdrop').remove();
        this.render();
    },

    delRule:function(e){
        alert($(e.target).attr("attrId"));
        var ruleId = $(e.target).attr("attrId");
        this.model.delRule(ruleId,this);
    },

    render: function () {
        this.options.quotas = UTILS.GlobalModels.get("quotas");
        $(this.el).append(this._template({ model: this.model}));
        $('.modal:last').modal();
        var header = {"id":"id","protocol":"协议","virtualPort":"转发端口","sourcePort":"源站端口","ipList":"源IPs","operate":"操作"};
        this.tableView = new SmalltableView({
            el: '#iprule-table',
            model: this.model,
            context: this
        });
        this.tableView.header = header;
        this.tableView.hasId = false;
        this.tableView.title = "规则列表";
        this.tableView.render();

        return this;
    },

    close: function(e) {
        while($('#edit_rule').html()!=null||$('.modal-backdrop').html()!=null){
             $('#edit_rule').remove();
        $('.modal-backdrop').remove();
        }
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    addRule: function() {
        var param = $('#gfipRule_form').serialize();
        param = param.replace(/&/g, "','" );
        param = param.replace(/=/g, "':'" );
        param = "({'" +param + "'})" ;
        param = eval(param);
        //var a = $("#abc").serialize().split("%0D%0A");
        this.model.addRule(param,this);
    }

});
var EditWhiteListView = Backbone.View.extend({

    _template: _.itemplate($('#editWhiteListTemplate').html()),
    tableView:undefined,


    events: {
        'click #cancelCreateBtn': 'close',
        'click .close': 'close',
        'click #delWhiteList':'delWhiteList',
        'click #whiteList_add': 'addWhiteList'
    },

    initialize: function() {
        this.model = new WhiteListModels();
        this.model.getWhiteList(null,this);
    },

    proRender: function(){
        $('#edit_whitelist').remove();
        $('.modal-backdrop').remove();
        this.render();
    },

    delWhiteList:function(e){
        alert($(e.target).attr("attrId"));
        var whiteId = $(e.target).attr("attrId");
        var url = "";
        for(var i=0;i<this.model.length;i++){
             alert("idmodel====="+JSON.stringify(this.model.models[i]));
            if(this.model.models[i].id==whiteId){
                alert("url==="+this.model.models[i].get("url"));
                url = this.model.models[i].get("url");
            }
        }
        this.model.delWhiteList(url,this);
    },

    render: function () {
        $(this.el).append(this._template({ model: this.model}));
        $('.modal:last').modal();
        var header = {"url":"url","operate":"操作"};
        this.tableView = new SmalltableView({
            el: '#whitelist-table',
            model: this.model,
            context: this
        });
        this.tableView.header = header;
        this.tableView.hasId = false;
        this.tableView.title = "白名单列表";
        this.tableView.render();
        return this;
    },

    close: function(e) {
        while($('#edit_whitelist').html()!=null||$('.modal-backdrop').html()!=null){
             $('#edit_whitelist').remove();
             $('.modal-backdrop').remove();
        }
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    addWhiteList: function() {
        var param = $('#whitelist_form').serialize();
        param = param.replace(/&/g, "','" );
        param = param.replace(/=/g, "':'" );
        param = "({'" +param + "'})" ;
        param = eval(param);
        //var a = $("#abc").serialize().split("%0D%0A");
        this.model.addWhiteList(param,this);
    }

});
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

var NovaGaoFangIPsView = Backbone.View.extend({

    _template: _.itemplate($('#novaGaoFangIPsTemplate').html()),

    tableView: undefined,

    initialize: function() {
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.renderFirst();
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [{
            label: "Create Security Group",
            action: "create"
        }];
    },

    getDropdownButtons: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        var self = this;
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
        return [{
            label: "Edit Rules",
            action: "edit",
            activatePattern: oneSelected
        }, {
            label: "Delete Rules",
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
            name: "ID",
            tooltip: "gaofangIP's ID/Name",
            size: "16%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "IP",
            tooltip: "gaofangIP's IP",
            size: "16%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Rules",
            tooltip: "the count of transfermation rule",
            size: "16%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Target",
            tooltip: "Transfermation Target",
            size: "16%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Peak",
            tooltip: "Protection peak's value",
            size: "16%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "OverPeaks",
            tooltip: "the count of exceeding peak",
            size: "15%",
            hidden_phone: true,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var entries = [];
       /* var sec_group, descr;
        for (var i in this.model.models) {
            sec_group = this.model.models[i];
            descr = sec_group.get("description");
            if (descr === null || descr === undefined || descr === "null") {
                descr = "-";
            }
            var entry = {
                id: sec_group.get('id'),
                cells: [{
                    value: sec_group.get("name")
                }, {
                    value: descr
                }]
            };
            entries.push(entry);
        }*/
     entry = {
         id: "123",
         cells:[{
              value: "mygaofangip"
         },{
              value: "123.123.123.123"
         },{
              value: "0"
         },{
              value: "not qcloud"
         },{
              value: "20Gbps"
         },{
              value: "0"
         }]     
     }; 
      entries.push(entry);
        return entries;
    },

    onAction: function(action, secGroupIds) {
        var securityGroup, sg, subview;
        var self = this;
        if (secGroupIds.length === 1) {
            securityGroup = secGroupIds[0];
            sg = this.model.get(securityGroup);
        }
        switch (action) {
            case 'create':
                subview = new CreateSecurityGroupView({el: 'body', model: this.model});
                subview.render();
                break;
            case 'edit':
                console.log("push edit action");
                subview = new EditGaoFangIPRulesView({el: 'body', securityGroupId: securityGroup, model: this.model});
                subview.render();
            break;
            case 'delete':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Delete Security Group",
                    btn_message: "Delete Security Group",
                    onAccept: function() {
                        secGroupIds.forEach(function(securityGroup) {
                            sg = self.model.get(securityGroup);
                            sg.destroy(UTILS.Messages.getCallbacks("Security group "+ sg.get("name") + " deleted.", "Error deleting security group "+sg.get("name")));
                        });
                    }
                });
                subview.render();
            break;
        }
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
        this.tableView.close();
    },

    renderFirst: function () {
        this.undelegateEvents();
        var that = this;
        UTILS.Render.animateRender(this.el, this._template, this.model);
        this.tableView = new TableView({
            model: this.model,
            el: '#gaoFangIPs-table',
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

var GaoFangIPView = Backbone.View.extend({

    _template: _.itemplate($('#novaGaoFangIPTemplate').html()),

    keypairsView: undefined,
    gaoFangIPsView: undefined,
    floatingIPsView: undefined,

    initialize: function() {
        this.render();
        this.floatingIPsView = new NovaFloatingIPsView({model: UTILS.GlobalModels.get("floatingIPsModel"), el: '#floating_ips'});
        this.gaoFangIPsView = new NovaGaoFangIPsView({model: UTILS.GlobalModels.get("gaoFangIPsModel"), el: '#gaoFangIPs'});
        this.keyparisView = new NovaKeypairsView({model: UTILS.GlobalModels.get("keypairsModel"), el: '#keypairs'});
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

var GFIPInfoView = Backbone.View.extend({

    _template: _.itemplate($('#gfipInfoTemplate').html()),

    events: {
        'click #cancelCreateBtn': 'close',
        'click .close': 'close'
        //'click .modal-backdrop': 'close'
    },

    initialize: function() {
        /*
        this.model.bind("change", this.render, this);
        this.model.fetch();
        */
    },

    render: function () {
        $(this.el).append(this._template({ model: this.model}));
        $('.modal:last').modal();
        return this;
    },

    close: function(e) {
        while($('#gfip_info').html()!=null||$('.modal-backdrop').html()!=null){
            $('#gfip_info').remove();
            $('.modal-backdrop').remove();
        }
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    }

});
var GFIPListView = Backbone.View.extend({

    _template: _.itemplate($('#gfiplistTemplate').html()),

    keypairsView: undefined,
    securityGroupsView: undefined,
    floatingIPsView: undefined,

    initialize: function() {
        this.render();
        this.floatingIPsView = new NovaGFIPView({model: UTILS.GlobalModels.get("gFIPLModels"), el: '#gf_ips'});
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

var NovaGFIPView = Backbone.View.extend({

    _template: _.itemplate($('#novaGFIPTableTemplate').html()),

    tableView: undefined,

    initialize: function() {
        this.options.pools = UTILS.GlobalModels.get("novaGFIPModel");
        this.options.instances = UTILS.GlobalModels.get("instancesModel");
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        //this.model.bind("sync", this.renderFirst, this);
        this.renderFirst();
    },


    getOneSelectedID: function(){
        if(this.tableView.getSelectedEntries().length == 1)
            return this.tableView.getSelectedEntries()[0];
        else return undefined;
    },

    getMainButtons: function() {
        var btns = [];
        UTILS.GlobalModels.get("quotas");

        btns.push({
            //label:  "Allocate IP to Project",
            label:  "详情",
            action: "detail"
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
        btns.push ({
                label: "修改高仿ip信息",
                action: "editInfo",
                activatePattern: oneSelected
            },  {
                label: "修改高仿ip规则",
                action: "editRule",
                activatePattern: oneSelected
            },  {
                label: "修改高仿ip白名单",
                action: "editWhiteList",
                activatePattern: oneSelected
            }
        );
        return btns;
    },

    getHeaders: function() {
        var btns = [
            {
                name: "ID/名称",
                tooltip: "IP Address",
                size: "15%",
                hidden_phone: false,
                hidden_tablet: false
            },
            {
                name: "高防IP",
                tooltip: "Instance the IP is attached to",
                size: "10%",
                hidden_phone: true,
                hidden_tablet: false
            },
            {
                name: "转发规则数",
                tooltip: "Fixed address the IP is attached to",
                size: "10%",
                hidden_phone: true,
                hidden_tablet: false
            },
            {
                name: "转发目标",
                tooltip: "Corresponding Floating Pool",
                size: "15%",
                hidden_phone: false,
                hidden_tablet: false
            },
            {
                name: "保底防护峰值",
                tooltip: "Fixed address the IP is attached to",
                size: "15%",
                hidden_phone: true,
                hidden_tablet: false
            },
            {
                name: "超峰次数",
                tooltip: "Fixed address the IP is attached to",
                size: "15%",
                hidden_phone: true,
                hidden_tablet: false
            },
            {
                name: "运行状态",
                tooltip: "Fixed address the IP is attached to",
                size: "15%",
                hidden_phone: true,
                hidden_tablet: false
            },
            {
                name: "到期时间",
                tooltip: "Fixed address the IP is attached to",
                size: "25%",
                hidden_phone: true,
                hidden_tablet: false
            }];

        btns.splice(0,0, {
            type: "checkbox",
            size: "5%"
        });

        return btns;
    },

    getEntries: function() {
        var entries = [];
        for (var index in this.model.models) {
            var gf_ip = this.model.models[index];
            var entry = {
                id: gf_ip.get('id'),
                cells: [{
                    value:  gf_ip.get('id')
                }, {
                    value:  gf_ip.get("boundIP")
                }, {
                    value:  gf_ip.get("transRules")
                },{
                    value:  gf_ip.get("TransTargetName")
                },{
                    value:  gf_ip.get("elasticLimit")
                },{
                    value:  gf_ip.get("overloadCount")
                },{
                    value:  gf_ip.get("GFStatusName")
                },{
                    value:  gf_ip.get("expire")
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

        var subview;

        switch (action) {
            case 'detail':
                //subview = new AllocateIPView({el: 'body', pools: this.options.pools, model: self.model});
                if(!this.getOneSelectedID()){
                    alert("请之选择一个高仿ip!");
                    return;
                }
                var mode = null;
                for(var i=0;i<this.model.length;i++){
                    var t = this.model.models[i];
                    if(t.id == this.getOneSelectedID()){
                        mode = t;
                        break;
                    }
                }
                subview = new GFIPInfoView({el: 'body',model: mode});
                //subview = new AllocateIPView({el: 'body', pools: this.options.pools, model: self.model});
                subview.render();
                break;
            case 'editInfo':
                //subview = new AssociateIPView({el: 'body',  model: floa, instances: this.options.instances});
                //subview = new AssociateIPView({el: 'body',  model: floa, instances: this.options.instances});
                if(!this.getOneSelectedID()){
                    alert("请之选择一个高仿ip!");
                    return;
                }
                var mode = null;
                for(var i=0;i<this.model.length;i++){
                    var t = this.model.models[i];
                    if(t.id == this.getOneSelectedID()){
                        mode = t;
                        break;
                    }
                }
                subview = new EditGFIPInfoView({el: 'body',model: mode});
                subview.render();
                break;
            case 'editRule':
                if(!this.getOneSelectedID()){
                    alert("请之选择一个高仿ip!");
                    return;
                }
                var mode = null;
                for(var i=0;i<this.model.length;i++){
                    var t = this.model.models[i];
                    if(t.id == this.getOneSelectedID()){
                        mode = t;
                        break;
                    }
                }
                subview = new EditGFIPRuleView({el: 'body',  model_parent_id: mode.id});
                subview.getList(mode.id);
                //subview.render();
                break;
            case 'editWhiteList':
                if(!this.getOneSelectedID()){
                    alert("请之选择一个高仿ip!");
                    return;
                }
                var mode = null;
                for(var i=0;i<this.model.length;i++){
                    var t = this.model.models[i];
                    if(t.id == this.getOneSelectedID()){
                        mode = t;
                        break;
                    }
                }
                subview = new EditWhiteListView({el: 'body'});
                //subview.getList(mode.id);
                subview.render();
                break;

        }
    },

    renderFirst: function() {
        $(this.el).empty();
        UTILS.Render.animateRender(this.el, this._template, {models: this.model.models, pools: this.options.pools, instances: this.options.instances});
        this.tableView = new TableView({
            model: this.model,
            el: '#gfips-table',
            onAction: this.onAction,
            getDropdownButtons: this.getDropdownButtons,
            getMainButtons: this.getMainButtons,
            getHeaders: this.getHeaders,
            getEntries: this.getEntries,
            context: this
        });
        this.tableView.render();
        return this;
    },

    render: function() {
        if ($(this.el).html() !== null) {
            this.tableView.render();
        }
        return this;
    }
});

var ConsultImageDetailView = Backbone.View.extend({

    _template: _.itemplate($('#consultImageDetailFormTemplate').html()),

    events: {
        'click #launch_img': 'onLaunch'
    },

    initialize: function() {

        this.options.volumeSnapshotsModel = UTILS.GlobalModels.get("volumeSnapshotsModel");
        this.options.instancesModel = UTILS.GlobalModels.get("instancesModel");
        this.options.volumesModel = UTILS.GlobalModels.get("volumesModel");
        this.options.flavors = UTILS.GlobalModels.get("flavors");
        this.options.keypairs = UTILS.GlobalModels.get("keypairsModel");
        this.options.secGroups = UTILS.GlobalModels.get("securityGroupsModel");
        this.options.quotas = UTILS.GlobalModels.get("quotas");
        this.options.networks = UTILS.GlobalModels.get("networks");
        this.options.ports = UTILS.GlobalModels.get("ports");

        this.model.bind("change", this.render, this);
        this.model.fetch();
    },

    onLaunch: function(evt) {
        var subview = new LaunchImageView({el: 'body', images: this.options.images, flavors: this.options.flavors, keypairs: this.options.keypairs, secGroups: this.options.secGroups, quotas: this.options.quotas, instancesModel: this.options.instancesModel, networks: this.options.networks, tenant: this.options.tenant, volumes: this.options.volumesModel, volumeSnapshots: this.options.volumeSnapshotsModel, ports: this.options.ports, model: this.model});
        subview.render();
    },

    render: function () {
        if ($("#instance_details").html() == null) {
            UTILS.Render.animateRender(this.el, this._template, {model:this.model});
        } else {
            $(this.el).html(this._template({model:this.model}));
        }
        return this;
    }

});
var ImagesView = Backbone.View.extend({

    _template: _.itemplate($('#imagesTemplate').html()),

    tableView: undefined,

    initialize: function() {
        this.options.volumeSnapshotsModel = UTILS.GlobalModels.get("volumeSnapshotsModel");
        this.options.instancesModel = UTILS.GlobalModels.get("instancesModel");
        this.options.volumesModel = UTILS.GlobalModels.get("volumesModel");
        this.options.flavors = UTILS.GlobalModels.get("flavors");
        this.options.keypairs = UTILS.GlobalModels.get("keypairsModel");
        this.options.secGroups = UTILS.GlobalModels.get("securityGroupsModel");
        this.options.quotas = UTILS.GlobalModels.get("quotas");
        this.options.networks = UTILS.GlobalModels.get("networks");
        this.options.ports = UTILS.GlobalModels.get("ports");
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.renderFirst();
    },

    events: {
        'click .btn-launch': 'onLaunch'
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [];
    },

    getDropdownButtons: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        var self = this;
        var oneSelected = function(size, id) {
            if (size === 1) {
                return true;
            }
        };
        var editable = function(size, id) {
            if (oneSelected(size, id)) {
                var model = self.model.get(id);
                var owner = model.get("owner_id") || model.get("owner");
                if (owner === UTILS.Auth.getCurrentTenant().id && model.get("status") === "active") {
                    return true;
                }
            }
        };
        var groupSelected = function(size, id) {
            if (size >= 1) {
                return true;
            }
        };
        return [{
            label: "Edit Image",
            action: "edit",
            activatePattern: editable
        }, {
            label: "Delete Image",
            action: "delete",
            warn: true,
            activatePattern: editable
        }];
    },

    getHeaders: function() {
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        return [{
            name: "Name",
            tooltip: "Image's name",
            size: "26%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Type",
            tooltip: "Image's category",
            size: "15%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Status",
            tooltip: "Image's status: building, active, ...",
            size: "10%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Visibility",
            tooltip: "Check if the image is open to the public",
            size: "10%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Container Format",
            tooltip: "Image's container format",
            size: "13%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Disk Format",
            tooltip: "Image's disk format",
            size: "13%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Actions",
            tooltip: "Actions",
            size: "13%",
            hidden_phone: false,
            hidden_tablet: false,
            order: "none"
        }];
    },

    getEntries: function() {
        var entries = [];
       var i = 0;
            for (var index in this.model.models) {
            var image = this.model.models[index];
            if (image.get('server') !== undefined || image.get('container_format') === 'ari' || image.get('container_format') === 'aki') {
                continue;
            }
            var container_format = image.get('container_format') || '-';
            container_format = container_format.toUpperCase();
            var disk_format = image.get('disk_format') || '-';
            disk_format = disk_format.toUpperCase();
            i++;
            var visibility = image.get('visibility');
            if (visibility === undefined) {
                visibility = image.get('is_public') ? "public":"private";
            }
            var type = "~";
            if (image.get("type")) type = image.get("type");
            if (image.get("properties") && image.get("properties").type) type = image.get("properties").type;
            var entry = {
                id: image.get('id'),
                cells: [{
                    value: image.get("name"),
                    link: "#nova/images/" + image.id
                }, {
                    value: type
                }, {
                    value: image.get("status")
                }, {
                    value: visibility
                }, {
                    value: container_format
                }, {
                    value: disk_format
                }, {
                    value: '<button  id="images__action_launch__'+i+'" class="ajax-modal btn btn-small btn-blue btn-launch" name="action" value="' + image.id + '" type="submit" data-i18n="Launch">Launch</button>'
                }]
            };
            entries.push(entry);
        }
        return entries;
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
        this.tableView.close();
    },

    onAction: function(action, imageIds) {
        var image, img, subview;
        var self = this;
        if (imageIds.length === 1) {
            image = imageIds[0];
            img = this.model.get(image);
        }
        switch (action) {
            case 'edit':
                subview = new UpdateImageView({
                    model: img,
                    el: 'body'
                });
                subview.render();
                break;
            case 'delete':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Delete Image",
                    btn_message: "Delete Image",
                    onAccept: function() {
                        imageIds.forEach(function(image) {
                            img = self.model.get(image);
                            img.destroy(UTILS.Messages.getCallbacks("Image " + img.get("name") + " deleted", "Error deleting image " + img.get("name")));
                        });
                    }
                });
                subview.render();
                break;
        }
    },

    onLaunch: function(evt) {
        var image = evt.target.value;
        var img = this.model.get(image);
        //pendiente de metadato sdc_aware
        img.set({'properties':{}});
        var self = this;
        var subview = new LaunchImageView({el: 'body', images: this.options.images, flavors: this.options.flavors, keypairs: this.options.keypairs, secGroups: this.options.secGroups, quotas: this.options.quotas, instancesModel: this.options.instancesModel, networks: this.options.networks, tenant: this.options.tenant, volumes: this.options.volumesModel, volumeSnapshots: this.options.volumeSnapshotsModel, ports: this.options.ports, model: img});
        subview.render();
    },

    renderFirst: function() {
        UTILS.Render.animateRender(this.el, this._template, {
            models: this.model.models
        });
        this.tableView = new TableView({
            model: this.model,
            el: '#images-table',
            onAction: this.onAction,
            getDropdownButtons: this.getDropdownButtons,
            getMainButtons: this.getMainButtons,
            getHeaders: this.getHeaders,
            getEntries: this.getEntries,
            context: this
        });
        this.tableView.orderBy = {column: 1, direction: 'down'};
        this.tableView.render();
    },

    render: function() {
        if ($(this.el).html() !== null) {
            this.tableView.render();
        }
        return this;
    }

});

var EditProductAttributesView = Backbone.View.extend({

    _template: _.itemplate($('#editProductAttributesTemplate').html()),

    events: {
      'click #closeModal': 'close',
      'click #cancel': 'close',
      'click .clickOut': 'close',
      'click #accept': 'editAttributes'
    },

    initialize: function() {
        var self = this;
    },

    render: function () {
        $(this.el).append(this._template({model: this.model, productAttributes: this.options.productAttributes}));
        $('.modal:last').modal();
        $('.modal-backdrop').addClass("clickOut");
        return this;
    },

    autoRender: function () {

        $(this.el).find("#edit_product_attributes").remove();
        $(this.el).append(self._template({model: this.model, productAttributes: this.options.attributes}));
    },

    close: function(e) {
        this.onClose();
    },

    onClose: function () {
        $('#edit_product_attributes').remove();
        $('.modal-backdrop').remove();
        this.undelegateEvents();
        this.unbind();
    },

    editAttributes: function (e) {

        if (this.options.productAttributes === undefined) {
            return;
        }

        var newAttributes = this.options.productAttributes;

        for (var i in newAttributes) {
            newAttributes[i].value = $('input[name=attr_' + i + ']').val();
        }

        this.model.save(undefined, {success: function (model, resp) {
            console.log('Succ ', resp);
        }, error: function (model, e) {
            console.log('Error attr ', e);
        }});
    }

});
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

var InstanceMonitoringView = Backbone.View.extend({

    _template: _.itemplate($('#instanceMonitoringTemplate').html()),


    events: {
        'click #switch_button': 'switch_view',
        'click #refresh_button': 'refresh_stats',
        'click .graph_button': 'switch_chart'
    },

    initialize: function() {

        var self = this;

        var com_dataset = {
            fillColor : "rgba(151,187,205,0.5)",
            strokeColor : "#099EC6",
            pointColor : "#002E67",
            pointStrokeColor : "#fff"
        };

        var com_opt = {
            scaleOverlay : false,
            scaleOverride : false,
            scaleLineColorX : "transparent",
            scaleLineColorY : "#002E67",
            scaleLineWidth : 3,
            scaleFontFamily : "'comfortaa'",
            scaleFontSize : 12,
            scaleFontStyle : "normal",
            scaleFontColorY : "#099EC6",
            scaleFontColorX : "rgb(127,127,127)",
            scaleShowGridLinesX : true,
            scaleShowGridLinesY : false,
            scaleShowMiniLinesY : false,
            scaleGridLineColor : "rgba(0,0,0,.05)",
            scaleGridLineWidth : 2,
            bezierCurve : false,
            pointDot : true,
            pointDotRadius : 4,
            pointDotStrokeWidth : 2,
            datasetStroke : true,
            datasetStrokeWidth : 1,
            datasetFill : false  ,
            animation : true,
            animationSteps : 60,
            animationEasing : "easeOutQuart",
            onAnimationComplete : null
        };

        this.historic_data = undefined;

        this.cpu_dataset = {datasets: [jQuery.extend({}, com_dataset)]};
        this.cpu_opt = jQuery.extend({}, com_opt);
        this.cpu_opt.scaleSteps = null;
        this.cpu_opt.scaleStepWidth = null;
        this.cpu_opt.scaleStartValue = null;

        this.disk_dataset = {datasets: [jQuery.extend({}, com_dataset)]};
        this.disk_opt = jQuery.extend({}, com_opt);
        this.disk_opt.scaleSteps = null;
        this.disk_opt.scaleStepWidth = null;
        this.disk_opt.scaleStartValue = null;

        this.mem_dataset = {datasets: [jQuery.extend({}, com_dataset)]};
        this.mem_opt = jQuery.extend({}, com_opt);
        this.mem_opt.scaleSteps = null;
        this.mem_opt.scaleStepWidth = null;
        this.mem_opt.scaleStartValue = null;

        this.model.fetch({success: function() {
            self.flavor = new Flavor();
            self.flavor.set({id: self.model.get("flavor").id});
            
            self.flavor.fetch({success: function() {

                self.render();
                
                self.model.getMonitoringStats({callback: function(stats){
                    if (stats !== undefined) {
                        self.renderSpeedometers();
                        self.updateSpeedometers(stats);
                        $('#error_monit_info').hide();
                        $('#refresh_button').prop('disabled', false);
                    }
                }});

                self.model.getHistoricMonitoringStats({callback: function(stats){
                    if (stats !== undefined && stats.length > 0) {
                        $('#switch_button').prop('disabled', false);
                        $('#switch_button').html('Graphs');
                        self.historic_data = stats;
                        self.renderCharts('day');
                    } 
                }, error: function () {
                }});

            }});

        }});
    },

    refresh_stats: function () {
        var self = this;
        
        // para dar efecto de que se mueve
        this.cpu_speed.drawWithInputValue(0);
        //this.disk_speed.drawWithInputValue(stats[0].percDiskUsed.value);
        this.disk_speed.drawWithInputValue(0);
        this.mem_speed.drawWithInputValue(0);

        self.model.getMonitoringStats({callback: function(stats){
            if (stats !== undefined) {
                self.updateSpeedometers(stats);
            }
        }});
    },

    switch_view: function (e) {
        if($('#chart_view').hasClass('hide')) {
            $('#chart_view').removeClass('hide');
            $('#speedometer_view').addClass('hide');
            $('#refresh_button').addClass('hide');
            $('#switch_button').html('Back');
        } else {
            $('#chart_view').addClass('hide');
            $('#speedometer_view').removeClass('hide');
            $('#refresh_button').removeClass('hide');
            $('#switch_button').html('Graphs');
            this.refresh_stats();
        }
    },

    switch_chart: function (e) {
        $( ".graph_button" ).removeClass('active');
        var id = '#' + e.currentTarget.id;
        $(id).addClass('active');
        this.renderCharts(e.currentTarget.id);
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
    },

    close: function(e) {
        this.undelegateEvents();
        this.onClose();
    },

    updateSpeedometers: function (stats) {

        var cpu = Math.round(stats[0].percCPULoad.value);
        var disk = Math.round((this.flavor.get('disk') / 100) * stats[0].percDiskUsed.value);
        var mem = Math.round((this.flavor.get('ram') / 100) * stats[0].percRAMUsed.value);

        this.cpu_speed.drawWithInputValue(cpu);
        //this.disk_speed.drawWithInputValue(stats[0].percDiskUsed.value);
        this.disk_speed.drawWithInputValue(disk);
        this.mem_speed.drawWithInputValue(mem);
    },

    renderSpeedometers: function () {

        this.cpu_speed = new Speedometer({elementId: 'cpu', size: 300, maxVal: 100, name: 'CPU', units: '%'});
        this.disk_speed = new Speedometer({elementId: 'disk', size: 300, maxVal: this.flavor.get('disk'), name: 'DISK', units: 'GB'});
        //this.disk_speed = new Speedometer({elementId: 'disk', size: 300, maxVal: 100, name: 'DISK', units: '%'});
        this.mem_speed = new Speedometer({elementId: 'mem', size: 300, maxVal: this.flavor.get('ram'), name: 'RAM', units: 'MB'});
        this.cpu_speed.draw();
        this.disk_speed.draw();
        this.mem_speed.draw();
    },

    renderCharts: function (scale) {

        //console.log('RENDER ', scale, this.historic_data);

        if (this.historic_data && this.historic_data.length > 0) {

            var labels = [];
            var cpu_data = [];
            var mem_data = [];
            var disk_data = [];

            var last_hour = this.historic_data[this.historic_data.length - 1].timestamp.split('T')[1].split(':')[0];
            var last_day = this.historic_data[this.historic_data.length - 1].timestamp.split('T')[0].split('-')[2];
            var last_month = this.historic_data[this.historic_data.length - 1].timestamp.split('T')[0].split('-')[1];
            var prev_month = parseInt(last_month, 10) - 1;

            switch (scale) {
                case 'day':

                    for (var h = last_hour - 24; h <= last_hour; h = h + 3) {
                        if (h < 0) {
                            labels.push(24 + h + ':00');
                        } else {
                            labels.push(h + ':00');
                        }

                    }
                    for (var i = this.historic_data.length - 25; i <= this.historic_data.length - 1; i = i + 3) {
                        if (this.historic_data[i]) {
                            cpu_data.push(this.historic_data[i].percCPULoad.value);
                            disk_data.push((this.flavor.get('disk') / 100) * this.historic_data[i].percDiskUsed.value);
                            mem_data.push((this.flavor.get('ram') / 100) * this.historic_data[i].percRAMUsed.value);
                        } else {
                            cpu_data.push(0);
                            mem_data.push(0);
                            disk_data.push(0);
                        }
                    }

                    break;
                case 'week':
    
                    for (var d = last_day - 7; d <= last_day; d++) {
                        if (d <= 0) {
                            labels.push(30 + d + '/' + prev_month);
                        } else {
                            labels.push(d + '/' + last_month);
                        }

                    }
                    for (var j = this.historic_data.length - 169; j <= this.historic_data.length; j = j + 24) {
                        if (this.historic_data[j]) {
                            cpu_data.push(this.historic_data[j].percCPULoad.value);
                            disk_data.push((this.flavor.get('disk') / 100) * this.historic_data[j].percDiskUsed.value);
                            mem_data.push((this.flavor.get('ram') / 100) * this.historic_data[j].percRAMUsed.value);
                        } else {
                            cpu_data.push(0);
                            mem_data.push(0);
                            disk_data.push(0);
                        }
                    }
                    break;
                case 'month':
                    for (var m = last_day - 30; m <= last_day; m++) {
                        if (m <= 0) {
                            labels.push(30 + m + '/' + prev_month);
                        } else {
                            labels.push(m + '/' + last_month);
                        }

                    }
                    for (var k = this.historic_data.length - 721; k <= this.historic_data.length; k = k + 24) {
                        if (this.historic_data[k]) {
                            cpu_data.push(this.historic_data[k].percCPULoad.value);
                            disk_data.push((this.flavor.get('disk') / 100) * this.historic_data[k].percDiskUsed.value);
                            mem_data.push((this.flavor.get('ram') / 100) * this.historic_data[k].percRAMUsed.value);
                        } else {
                            cpu_data.push(0);
                            mem_data.push(0);
                            disk_data.push(0);
                        }
                    }

                    break;
            }

            this.cpu_dataset.labels = labels;
            this.cpu_dataset.datasets[0].data = cpu_data;

            this.disk_dataset.labels = labels;
            this.disk_dataset.datasets[0].data = disk_data;

            this.mem_dataset.labels = labels;
            this.mem_dataset.datasets[0].data = mem_data;

            var max = _.max(this.disk_dataset.datasets[0].data);
            var min = _.min(this.disk_dataset.datasets[0].data);
            if (max === min) {
                this.disk_opt.scaleOverride = true;
                this.disk_opt.scaleSteps = 5;
                this.disk_opt.scaleStepWidth = 1;
                this.disk_opt.scaleStartValue = max - 3;
            }
            max = _.max(this.cpu_dataset.datasets[0].data);
            min = _.min(this.cpu_dataset.datasets[0].data);
            if (max === min) {
                this.cpu_opt.scaleOverride = true;
                this.cpu_opt.scaleSteps = 5;
                this.cpu_opt.scaleStepWidth = 1;
                this.cpu_opt.scaleStartValue = max - 3;
            }
            max = _.max(this.mem_dataset.datasets[0].data);
            min = _.min(this.mem_dataset.datasets[0].data);
            if (max === min) {
                this.mem_opt.scaleOverride = true;
                this.mem_opt.scaleSteps = 5;
                this.mem_opt.scaleStepWidth = 1;
                this.mem_opt.scaleStartValue = max - 3;
            }
            
            var cpu_ctx = document.getElementById("cpu_chart").getContext("2d");
            var cpu_chart = new Chart(cpu_ctx).Line(this.cpu_dataset, this.cpu_opt);
            var disk_ctx = document.getElementById("disk_chart").getContext("2d");
            var disk_chart = new Chart(disk_ctx).Line(this.disk_dataset, this.disk_opt);
            var mem_ctx = document.getElementById("mem_chart").getContext("2d");
            var mem_chart = new Chart(mem_ctx).Line(this.mem_dataset, this.mem_opt);

        }
    },

    render: function () {
        var self = this;

        var template = self._template({});
        $(self.el).empty().html(template);

        return this;
    }

});

var InstanceLogView = Backbone.View.extend({

    _template: _.itemplate($('#instanceLogTemplate').html()),

    logResp: false,

    events: {
        'submit #set_log_form': 'setLogs'
    },

    initialize: function() {

        var self = this;
        this.options = this.options || {};

        this.model.fetch();

        var options = {};
        options.callback = function(resp) {
            self.options.logs = resp.output;
            self.logResp = true;
            self.render();
        };
        this.model.consoleoutput(options);
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
    },

    close: function(e) {
        this.undelegateEvents();
        this.onClose();
    },

    setLogs: function(e) {
        e.preventDefault();

        var options = {} || options;
        var lines = this.$('input[name=set-log]').val();

        lines = parseInt(lines, 10);
        //console.log('Set lines to display: ',lines);

        if (0 < lines <= 1000) {

            options.length = lines;

        } else {

            options.length = 35;
            var subview = new MessagesView({state: "Error", title: "he maximum number of lines displayed should be 1000."});
            subview.render();
        }

        options.callback = function(resp) {
            self.options.logs = resp.output;
            self.logResp = true;
            self.render();
        };

        this.model.consoleoutput(options);
    },

    render: function () {
        var self = this;

        var template = self._template({security_groups: self.options.security_groups, vdc: self.options.vdc, service: self.options.service, model:self.model, flavor:self.options.flavor, image:self.options.image, logs: self.options.logs, vncUrl: self.options.vncUrl, subview: self.options.subview, subsubview: self.options.subsubview});
        $(self.el).empty().html(template);

        return this;
    }
});
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

var ViewProductAttributesView = Backbone.View.extend({

    _template: _.itemplate($('#viewProductAttributesTemplate').html()),

    events: {
      'click #closeModal': 'close',
      'click #cancel': 'close',
      'click .clickOut': 'close'
    },

    initialize: function() {
        var self = this;
    },

    render: function () {
        $(this.el).append(this._template({product: this.options.product, productAttributes: this.options.productAttributes}));
        $('.modal:last').modal();
        $('.modal-backdrop').addClass("clickOut");
        return this;
    },

    autoRender: function () {

        $(this.el).find("#view_product_attributes").remove();
        $(this.el).append(self._template({product: this.options.product, productAttributes: this.options.attributes}));
    },

    close: function(e) {
        this.onClose();
    },

    onClose: function () {
        $('#view_product_attributes').remove();
        $('.modal-backdrop').remove();
        this.undelegateEvents();
        this.unbind();
    }

});
var InstanceDetailView = Backbone.View.extend({

    _template: _.itemplate($('#instanceDetailTemplate').html()),

    overviewView: undefined,
    logView: undefined,
    vncView: undefined,
    monitoringView: undefined,

    initialize: function() {

        this.options = this.options || {};

        this.options.sdcs = UTILS.GlobalModels.get("softwares");
        this.options.sdcCatalog = UTILS.GlobalModels.get("softwareCatalogs");

        this.render();

        this.overviewView = new InstanceOverviewView({el: '#instance_details__overview', model: this.model, sdcs: this.options.sdcs, sdcCatalog: this.options.sdcCatalog});
        this.logView = new InstanceLogView({el: '#instance_details__log', model: this.model});
        this.vncView = new InstanceConnectionView({el: '#instance_details__vnc', model: this.model});
        this.monitoringView = new InstanceMonitoringView({el: '#instance_details__monit', model: this.model});
    
        this.delegateEvents({
            'click #overviewBtn': "showOverview",
            'click #instance_vnc': 'showVNC',
            'click #instance_logs': 'showLogs',
            'click #instance_monitoring': 'showMonitoring'
        });

        this.model.fetch();

    },

    showOverview: function() {
        if (this.options) {
            this.options.subview = "overview";
        }
        $('#instance_details__overview').addClass('active');
        $('#instance_details__vnc').removeClass('active');
        $('#instance_details__log').removeClass('active');
        $('#instance_details__monit').removeClass('active');
        $('#overview').addClass('active');
        $('#vnc').removeClass('active');
        $('#log').removeClass('active');
        $('#monitoring').removeClass('active');
    },

    showVNC: function() {
        if (this.options) {
            this.options.subview = "vnc";
        }
        $('#instance_details__overview').removeClass('active');
        $('#instance_details__log').removeClass('active');
        $('#instance_details__vnc').addClass('active');
        $('#instance_details__monit').removeClass('active');
        $('#overview').removeClass('active');
        $('#log').removeClass('active');
        $('#vnc').addClass('active');
        $('#monitoring').removeClass('active');
    },

    showLogs: function() {
        if (this.options) {
            this.options.subview = "logs";
        }
        $('#instance_details__overview').removeClass('active');
        $('#instance_details__vnc').removeClass('active');
        $('#instance_details__log').addClass('active');
        $('#instance_details__monit').removeClass('active');
        $('#overview').removeClass('active');
        $('#vnc').removeClass('active');
        $('#log').addClass('active');
        $('#monitoring').removeClass('active');
    },

    showMonitoring: function() {
        if (this.options) {
            this.options.subview = "monitoring";
        }
        $('#instance_details__overview').removeClass('active');
        $('#instance_details__vnc').removeClass('active');
        $('#instance_details__log').removeClass('active');
        $('#instance_details__monit').addClass('active');
        $('#overview').removeClass('active');
        $('#vnc').removeClass('active');
        $('#log').removeClass('active');
        $('#monitoring').addClass('active');
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();

        this.overviewView.close();
        this.logView.close();
        this.vncView.close();
        this.monitoringView.close();
    },

    close: function(e) {
        this.undelegateEvents();
        $('#instance_details__overview').removeClass('active');
        $('#instance_details__log').removeClass('active');
        $('#instance_details__vnc').removeClass('active');
        $('#instance_details__monit').removeClass('active');
        $('#overview').removeClass('active');
        $('#log').removeClass('active');
        $('#vnc').removeClass('active');
        $('#monitoring').removeClass('active');
        this.onClose();
    },

    render: function () {
        var self = this;

        if ($("#consult_instance").html() === null) {
            UTILS.Render.animateRender(self.el, self._template, {security_groups: self.options.security_groups, vdc: self.options.vdc, service: self.options.service, model:self.model, flavor:self.options.flavor, image:self.options.image, logs: self.options.logs, vncUrl: self.options.vncUrl, subview: self.options.subview, subsubview: self.options.subsubview});
        } else {
            var template = self._template({security_groups: self.options.security_groups, vdc: self.options.vdc, service: self.options.service, model:self.model, flavor:self.options.flavor, image:self.options.image, logs: self.options.logs, vncUrl: self.options.vncUrl, subview: self.options.subview, subsubview: self.options.subsubview});
            $(self.el).empty().html(template);
        }

        if (this.options.subview == 'log') {
            this.showLogs();

        } else if (this.options.subview == 'vnc') {
            this.showVNC();

        } else if (this.options.subview == 'monitoring') {
            this.showMonitoring();
        }

        $("#instance_vnc").unbind();
        $("#instance_logs").unbind();
        $("#instance_monitoring").unbind();
        return this;
    }
});

var NovaInstancesView = Backbone.View.extend({

    _template: _.itemplate($('#novaInstancesTemplate').html()),

    tableView: undefined,
    initialize: function() {
        this.options.projects = UTILS.GlobalModels.get("projects");
        this.options.keypairs = UTILS.GlobalModels.get("keypairsModel");
        this.options.flavors = UTILS.GlobalModels.get("flavors");
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.renderFirst();
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [{
            //label: "Launch New Instance",
            label: "创建新实例",
            url: "#nova/images/"
        }];
    },

    getDropdownButtons: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        var self = this;
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
        var activeSelected = function(size, id) {
            if (size === 1) {
                var entry = self.model.get(id);
                if (entry.get("status") !== "PAUSED" && entry.get("status") !== "SUSPENDED") {
                    return true;
                }
            }
        };
        var activeGroupSelected = function(size, ids) {
            if (size >= 1) {
                for (var id in ids) {
                    var entry = self.model.get(ids[id]);
                    if (entry.get("status") === "PAUSED" || entry.get("status") === "SUSPENDED" || entry.get("status") === "SHUTOFF") {
                        return false;
                    }
                }
                return true;
            }
        };
        var pausedSelected = function(size, ids) {
            if (size >= 1) {
                for (var id in ids) {
                    var entry = self.model.get(ids[id]);
                    if (entry.get("status") !== "PAUSED") {
                        return false;
                    }
                }
                return true;
            }
        };
        var suspendedSelected = function(size, ids) {
            if (size >= 1) {
                for (var id in ids) {
                    var entry = self.model.get(ids[id]);
                    if (entry.get("status") !== "SUSPENDED") {
                        return false;
                    }
                }
                return true;
            }
        };
        var stoppedSelected = function(size, ids) {
            if (size >= 1) {
                for (var id in ids) {
                    var entry = self.model.get(ids[id]);
                    if (entry.get("status") !== "SHUTOFF") {
              //          return false;
                        return true;
                    }
                }
                return true;
            }
        };
        return [{
            //label: "Edit Instance",
            label: "编辑实例",
            action: "edit",
            activatePattern: oneSelected
        }, {
            //label: "Connect to Instance",
            label: "连接到实例",
            action: "vnc",
            activatePattern: oneSelected
        }, {
            label: "查看日志",
            action: "log",
            activatePattern: oneSelected
        }, {
            label: "创建镜像",
            action: "snapshot",
            activatePattern: oneSelected
        }, {
            label: "暂停实例",
            action: "pause",
            activatePattern: activeGroupSelected
        }, {
            label: "(暂停)恢复实例",
            action: "unpause",
            activatePattern: pausedSelected
        }, {
            label: "挂起实例",
            action: "suspend",
            activatePattern: activeGroupSelected
        }, {
            label: "(挂起)恢复实例",
            action: "resume",
            activatePattern: suspendedSelected
        }, {
            label: "关闭实例",
            action: "stop",
            activatePattern: activeGroupSelected
        }, {
            label: "启动实例",
            action: "start",
            activatePattern: stoppedSelected
        },{
            label: "更改密码",
            action: "password",
            warn: true,
            activatePattern: activeSelected
        }, {
            label: "重启实例",
            action: "reboot",
            warn: true,
            activatePattern: groupSelected
        }, {
            label: "删除实例",
            action: "terminate",
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
            name: "Instance Name",
            tooltip: "实例名称",
            size: "15%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "IP Address",
            tooltip: "IP 地址",
            size: "10%",
            hidden_phone: true,
            hidden_tablet: false
        }, {
            name: "Size",
            //tooltip: "Server's RAM, number of virtual CPUs, and user disk",
            tooltip: "实例的内存，VCPU数量以及硬盘空间",
            size: "25%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "秘钥对",
            //tooltip: "ssh credentials for the instance",
            tooltip: "实例的ssh信任凭证",
            size: "15%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Status",
            tooltip: "实例当前状态",
            size: "10%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "云服务商",
            //tooltip: "Current tasks performed on the server",
            tooltip: "提供云服务的厂商",
            size: "10%",
            hidden_phone: true,
            hidden_tablet: false
        }/*,
 {
            name: "Power State",
            tooltip: "Server's power state",
            size: "10%",
            hidden_phone: true,
            hidden_tablet: false
        }*/
      ];
    },

    getEntries: function() {
        //qcloud
/*
        var VM_STATUS = {
            1: "Error",
            2: "RUNNING",
            3: "BUILDING",
            4: "SHUTOFF",
            5: "RETURNED",
            6: "RETURNING",
            7: "REBOOTING",
            8: "STARTING",
            9: "SHUTING OFF",
           10: "PASSWD RESETING",
           11: "FORMATING",
           12: "BUILDING IMG",
           13: "SETTING BANDWIDTH",
           14: "REINSTALLING",
           15: "BINGDING DN",
           16: "UNBINGDING DN",
           17: "BINGDING LB",
           18: "UNBINGDING LB",
           19: "UPGRADING",
           20: "ISSUING KEY"
         };
*/
        var VM_STATUS = {
            1: "故障",
            2: "运行中",
            3: "创建中",
            4: "已关机",
            5: "已退还",
            6: "退还中",
            7: "重启中",
            8: "开机中",
            9: "关机中",
           10: "密码重置中",
           11: "格式化中",
           12: "镜像制作中",
           13: "宽带设置中",
           14: "重装系统中",
           15: "域名绑定中",
           16: "域名解绑中",
           17: "负载均衡绑定中",
           18: "负载均衡解绑中",
           19: "升级中",
           20: "秘钥下发中"
         };

       var entries = [];
       var entry = {};
       for (var instance_idx1 in this.model.models) {
            console.log("got it ........");     
            var instance1 = this.model.models[instance_idx1];
            console.log(instance1);
       
            entry = {
                id: instance1.id,
                cells: [{
                    value: instance1.get("id"),
                    link: "#nova/instances/" + "112233" + "/detail",
                    tooltip: "实例名称"
                }, {
                    value: instance1.get("lanIp")
                }, {
                    value: instance1.get("cpu") + " VCPU" + "|" + instance1.get("mem") + "GB RAM"   
                }, {
                    value: "空"
                }, {
                    value: VM_STATUS[instance1.get("status")]
                }, {
                    value:  instance1.get('provider')
                }
              /* , {
                    value: "powner stateaaa"
                }*/
               ]
            };
            entries.push(entry);
        }

        return entries;

        var flavorlist = {};
        for (var index in this.options.flavors.models) {
            var flavor = this.options.flavors.models[index];
            flavorlist[flavor.id] = flavor.get("ram") + " MB RAM | " + flavor.get("vcpus") + " VCPU | " + flavor.get("disk") + "GB Disk";
        }
        var POWER_STATES = {
            0: "NO STATE",
            1: "RUNNING",
            2: "BLOCKED",
            3: "PAUSED",
            4: "SHUTDOWN",
            5: "SHUTOFF",
            6: "CRASHED",
            7: "SUSPENDED",
            8: "FAILED",
            9: "BUILDING"
        };
        // entries: [{id:id, cells: [{value: value, link: link}] }]
        for (var instance_idx in this.model.models) {
             var instance = this.model.models[instance_idx];
            var addresses;
            var address = "";

            if (JSTACK.Keystone.getendpoint(UTILS.Auth.getCurrentRegion(), "network") !== undefined) {
                if (instance.get("addresses") != null) {
                    addresses = instance.get("addresses");
                    for (var i in addresses) {
                        var ips = addresses[i];
                        for (var j in ips) {
                            var ip = ips[j].addr;
                            address += ip + "<br/>";
                        }
                    }
                }
            } else {
                if ((instance.get("addresses") != null) && (instance.get("addresses")["public"] !== null || instance.get("addresses")["private"] !== null)) {
                    addresses = instance.get("addresses")["public"];
                    for (var addr_idx in addresses) {
                        address += addresses[addr_idx].addr + "<br/>";
                    }
                    addresses = instance.get("addresses")["private"];
                    for (var addr_idx2 in addresses) {
                        address += addresses[addr_idx2].addr + "<br/>";
                    }
                }
            }
            //var entry = {
             entry = {
                id: instance.get('id'),
                cells: [{
                    value: instance.get("id"),
                    link: "#nova/instances/" + instance.id + "/detail",
                    tooltip: instance.get("id")
                }, {
                    value: address
                }, {
                    value: flavorlist[instance.get("flavor").id]
                }, {
                    value: instance.get("key_name")
                }, {
                    value: instance.get("status")
                }, {
                    value: instance.get("OS-EXT-STS:task_state") ? instance.get("OS-EXT-STS:task_state") : "None"
                }, {
                    value: POWER_STATES[instance.get("OS-EXT-STS:power_state")]
                }]
            };
            entries.push(entry);
        }
        return entries;
    },

    onClose: function() {
        this.tableView.close();
        this.undelegateEvents();
        this.unbind();
        this.model.unbind("sync", this.render, this);
    },

    onAction: function(action, instanceIds) {
        console.log("action 1 ....");
        console.log(instanceIds);
        console.log(instanceIds[0]);
        console.log("action 2 ....");
        var instance, inst, subview;
        var self = this;
        if (instanceIds.length === 1) {
            instance = instanceIds[0];
            inst = this.model.get(instance);
        }
        console.log('ACTIOOOOOOOOOOOn', action, instance);
        switch (action) {
            case 'edit':
                subview = new UpdateInstanceView({
                    el: 'body',
                    model: inst
                });
                subview.render();
                break;
            case 'vnc':
                window.location.href = '#nova/instances/' + instance + '/detail?view=vnc';
                break;
            case 'log':
                window.location.href = '#nova/instances/' + instance + '/detail?view=log';
                break;
            case 'snapshot':
                subview = new CreateSnapshotView({
                    el: 'body',
                    model: this.model.get(instance)
                });
                subview.render();
                break;
            case 'password':
                subview = new ChangePasswordView({
                    el: 'body',
                    model: inst
                });
                subview.render();
                break;
            case 'pause':
                subview = new ConfirmView({
                    el: 'body',
                    //title: "Pause Instances",
                    title: "暂停实例",
                    //btn_message: "Pause Instances",
                    btn_message: "暂停实例",
                    onAccept: function() {
                        instanceIds.forEach(function(instance) {
                            inst = self.model.get(instance);
                            inst.pauseserver(UTILS.Messages.getCallbacks("Instance "+inst.get("name") + " paused.", "Error pausing instance "+inst.get("name")));
                        });
                    }
                });
                subview.render();
                break;
            case 'unpause':
                subview = new ConfirmView({
                    el: 'body',
                    title: "(暂停)恢复实例",
                    btn_message: "(暂停)恢复实例",
                    onAccept: function() {
                        instanceIds.forEach(function(instance) {
                            inst = self.model.get(instance);
                            inst.unpauseserver(UTILS.Messages.getCallbacks("Instance "+inst.get("name") + " unpaused.", "Error unpausing instance "+inst.get("name")));
                        });
                    }
                });
                subview.render();
                break;
            case 'stop':
                subview = new ConfirmView({
                    el: 'body',
                    title: "关闭实例",
                    btn_message: "关闭实例",
                    onAccept: function() {
                        instanceIds.forEach(function(instance) {
                            inst = self.model.get(instance);
                            inst.stopserver(UTILS.Messages.getCallbacks("Instance a "+inst.get("id") + " stopped.", "Error stopping instance "+inst.get("id")));

                        });
                    }
                });
                subview.render();
                break;
            case 'start':
                subview = new ConfirmView({
                    el: 'body',
                    title: "启动实例",
                    btn_message: "启动实例",
                    onAccept: function() {
                        instanceIds.forEach(function(instance) {
                            console.log("start vm ...");
                            inst = self.model.get(instance);
                            inst.startserver(UTILS.Messages.getCallbacks("Instance "+inst.get("id") + " started.", "Error starting instance "+inst.get("id")));
                        });
                    }
                });
                subview.render();
                break;
            case 'suspend':
                subview = new ConfirmView({
                    el: 'body',
                    title: "挂起实例",
                    btn_message: "挂起实例",
                    onAccept: function() {
                        instanceIds.forEach(function(instance) {
                            inst = self.model.get(instance);
                            inst.suspendserver(UTILS.Messages.getCallbacks("Instance "+inst.get("name") + " suspended.", "Error suspending instance "+inst.get("name")));
                        });
                    }
                });
                subview.render();
                break;
            case 'resume':
                subview = new ConfirmView({
                    el: 'body',
                    title: "挂起恢复实例",
                    btn_message: "挂起恢复实例",
                    onAccept: function() {
                        instanceIds.forEach(function(instance) {
                            inst = self.model.get(instance);
                            inst.resumeserver(UTILS.Messages.getCallbacks("Instance "+inst.get("name") + " resumed.", "Error resuming instance "+inst.get("name")));
                        });
                    }
                });
                subview.render();
                break;
            case 'reboot':
                subview = new ConfirmView({
                    el: 'body',
                    title: "重启实例",
                    btn_message: "重启实例",
                    onAccept: function() {
                        instanceIds.forEach(function(instance) {
                            inst = self.model.get(instance);
                            inst.reboot(true, UTILS.Messages.getCallbacks("Instance "+inst.get("id") + " rebooted.", "Error rebooting instance "+inst.get("id")));
                        });
                    }
                });
                subview.render();
                break;
            case 'terminate':
                subview = new ConfirmView({
                    el: 'body',
                    title: "删除实例",
                    btn_message: "删除实例",
                    onAccept: function() {
                        instanceIds.forEach(function(instance) {
                            inst = self.model.get(instance);
                            inst.destroy(UTILS.Messages.getCallbacks("Instance "+inst.get("name") + " terminated.", "Error terminating instance "+inst.get("name")));
                        });
                    }
                });
                subview.render();
                break;
            default:
                break;
        }
    },

    renderFirst: function() {
        UTILS.Render.animateRender(this.el, this._template, {
            models: this.model.models,
            flavors: this.options.flavors
        });
        this.tableView = new TableView({
            model: this.model,
            el: '#instances-table',
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
	console.log("renderrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
        console.log(this.model.models);
	console.log("renderrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
        if ($(this.el).html() !== null) {
            this.tableView.render();
        }
        return this;
    }

});

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
var NovaSecurityGroupsView = Backbone.View.extend({

    _template: _.itemplate($('#novaSecurityGroupsTemplate').html()),

    tableView: undefined,

    initialize: function() {
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.renderFirst();
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [{
            label: "Create Security Group",
            action: "create"
        }];
    },

    getDropdownButtons: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        var self = this;
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
        return [{
            label: "Edit Rules",
            action: "edit",
            activatePattern: oneSelected
        }, {
            label: "Delete Rules",
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
            tooltip: "Security Group's name",
            size: "45%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Description",
            tooltip: "Security Group's description",
            size: "50%",
            hidden_phone: true,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var entries = [];
        var sec_group, descr;
        for (var i in this.model.models) {
            sec_group = this.model.models[i];
            console.log(sec_group);
            descr = sec_group.get("sgRemark");
            if (descr === null || descr === undefined || descr === "null") {
                descr = "-";
            }
            var entry = {
                id: sec_group.get('id'),
                cells: [{
                    value: sec_group.get('id') + '/' + sec_group.get('sgName')
                }, {
                    value: descr
                }]
            };
            entries.push(entry);
        }

        return entries;
    },

    onAction: function(action, secGroupIds) {
        var securityGroup, sg, subview;
        var self = this;
        if (secGroupIds.length === 1) {
            securityGroup = secGroupIds[0];
            sg = this.model.get(securityGroup);
        }
        switch (action) {
            case 'create':
                subview = new CreateSecurityGroupView({el: 'body', model: this.model});
                subview.render();
                break;
            case 'edit':
                subview = new EditSecurityGroupRulesView({el: 'body', securityGroupId: securityGroup, model: this.model});
                subview.render();
            break;
            case 'delete':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Delete Security Group",
                    btn_message: "Delete Security Group",
                    onAccept: function() {
                        secGroupIds.forEach(function(securityGroup) {
                            sg = self.model.get(securityGroup);
                            sg.destroy(UTILS.Messages.getCallbacks("Security group "+ sg.get("name") + " deleted.", "Error deleting security group "+sg.get("name")));
                        });
                    }
                });
                subview.render();
            break;
        }
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
        this.tableView.close();
    },

    renderFirst: function () {
        this.undelegateEvents();
        var that = this;
        UTILS.Render.animateRender(this.el, this._template, this.model);
        this.tableView = new TableView({
            model: this.model,
            el: '#securityGroups-table',
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

var NovaInstanceSnapshotDetailView = Backbone.View.extend({

    _template: _.itemplate($('#instanceSnapshotDetailTemplate').html()),

    initialize: function() {
        this.model.bind("change", this.render, this);
        this.model.fetch();
    },

    onClose: function () {
        this.model.unbind("change", this.render, this);
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($("#instanceSnapshot_details").html() == null) {
            UTILS.Render.animateRender(this.el, this._template, {model:this.model});
        } else {
            $(this.el).html(this._template({model:this.model}));
        }
        return this;
    }

});
var NovaInstanceSnapshotsView = Backbone.View.extend({

    _template: _.itemplate($('#novaInstanceSnapshotsTemplate').html()),

    tableView: undefined,

    initialize: function() {
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.renderFirst();
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [];
    },

    getDropdownButtons: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        var self = this;
        var oneSelected = function(size, id) {
            if (size === 1) {
                return true;
            }
        };
        var editable = function(size, id) {
            if (oneSelected(size, id)) {
                var model = self.model.get(id);
                var owner = model.get("owner_id") || model.get("metadata").owner_id;
                console.log(owner, UTILS.Auth.getCurrentTenant().id);
                if (owner === UTILS.Auth.getCurrentTenant().id && model.get("status").toLowerCase() === "active") {
                    return true;
                }
            }
        };
        var groupSelected = function(size, id) {
            if (size >= 1) {
                return true;
            }
        };
        return [{
            label: "Launch Instance",
            action: "launch",
            activatePattern: oneSelected
        }, {
            label: "Edit Image",
            action: "edit",
            activatePattern: editable
        }, {
            label: "Delete Snapshots",
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
            tooltip: "Snapshot's name",
            size: "40%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Type",
            tooltip: "Snapshot's type",
            size: "10%",
            hidden_phone: true,
            hidden_tablet: false
        }, {
            name: "Status",
            tooltip: "Current status of the snapshot (active, saving, ...)",
            size: "10%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Public",
            tooltip: "Check if the Snapshot is publicly available",
            size: "10%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Container Format",
            tooltip: "Snapshot's container format (AMI, AKI, ...)",
            size: "20%",
            hidden_phone: true,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var entries = [];
        for (var index in this.model.models) {
            var image = this.model.models[index];
            var entry;
            if (image.get('image_type') === "snapshot") {
                entry = {
                    id: image.get('id'),
                    cells: [{
                        value: image.get("name"),
                        link: "#nova/snapshots/instances/" + image.get("id") + "/detail/"
                    }, {
                        value: image.get('image_type')
                    }, {
                        value: image.get('status').toLowerCase()
                    }, {
                        value: image.get('visibility') === "public" ? "Yes" : "No"
                    }, {
                        value: image.get('container_format').toUpperCase()
                    }]
                };
                entries.push(entry);
            } else if (image.get('metadata') && image.get('metadata').image_type === "snapshot") {
                if (image.get('metadata').owner_id !== JSTACK.Keystone.params.access.token.tenant.id && !image.get('is_public')) {
                    continue;
                } else {
                    entry = {
                        id: image.get('id'),
                        cells: [{
                            value: image.get("name"),
                            link: "#nova/snapshots/instances/" + image.get("id") + "/detail/"
                        }, {
                            value: image.get('metadata').image_type
                        }, {
                            value: image.get('status').toLowerCase()
                        }, {
                            value: image.get('is_public') ? "Yes" : "No"
                        }, {
                            value: (image.get('container_format') || "-").toUpperCase()
                        }]
                    };
                    entries.push(entry);
                }
            }
        }
        return entries;
    },

    onClose: function() {
        this.tableView.close();
        this.undelegateEvents();
        this.unbind();
        this.model.unbind("sync", this.render, this);
    },

    onAction: function(action, snapshotIds) {
        var snapshot, snap, subview;
        var self = this;
        if (snapshotIds.length === 1) {
            snapshot = snapshotIds[0];
            snap = this.model.get(snapshot);
        }
        switch (action) {
            case 'launch':
                subview = new LaunchImageView({
                    model: snap,
                    flavors: this.options.flavors,
                    keypairs: this.options.keypairs,
                    secGroups: this.options.secGroups,
                    quotas: this.options.quotas,
                    instancesModel: this.options.instancesModel,
                    volumes: this.options.volumes,
                    networks: this.options.networks,
                    el: 'body'
                });
                subview.render();
                break;
            case 'edit':
                subview = new UpdateImageView({
                    model: snap,
                    el: 'body'
                });
                subview.render();
                break;
            case 'delete':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Delete Snapshots",
                    btn_message: "Delete Snapshots",
                    onAccept: function() {
                        snapshotIds.forEach(function(snapshot) {
                            snap = self.model.get(snapshot);
                            snap.destroy(UTILS.Messages.getCallbacks("Snapshot " + snap.get("name") + " deleted", "Error deleting snapshot " + snap.get("name")));
                        });
                    }
                });
                subview.render();
                break;
        }
    },

    renderFirst: function() {
        UTILS.Render.animateRender(this.el, this._template, this.model);
        this.tableView = new TableView({
            model: this.model,
            el: '#instance-snapshots-table',
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
var NovaVolumeBackupDetailView = Backbone.View.extend({

    _template: _.itemplate($('#volumeBackupDetailTemplate').html()),

    initialize: function() {
        this.model.bind("change", this.render, this);
        this.model.fetch();
    },

    onClose: function () {
        this.model.unbind("change", this.render, this);
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($("#volumeBackup_details").html() == null) {
            UTILS.Render.animateRender(this.el, this._template, {model:this.model});
        } else {
            $(this.el).html(this._template({model:this.model}));
        }
        return this;
    }

});
var VolumeBackupsView = Backbone.View.extend({

    _template: _.itemplate($('#novaVolumeBackupsTemplate').html()),

    tableView: undefined,

    initialize: function() {
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.renderFirst();
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [];
    },

    getHeaders: function() {
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        return [{
            type: "checkbox",
            size: "5%"
        }, {
            name: "Name",
            tooltip: "Volume Backup's name",
            size: "100%",
            hidden_phone: false,
            hidden_tablet: false
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

        var oneSelected = function(size, id) {
            if (size === 1) {
                return true;
            }
        };
        return [{
            label: "Restore Backup",
            action: "restore",
            warn: false,
            activatePattern: oneSelected
        },{
            label: "Delete Backups",
            action: "delete",
            warn: true,
            activatePattern: groupSelected
        }
        ];
    },

    getEntries: function() {
        var entries = [];
        for (var index in this.model.models) {
            var volBackup = this.model.models[index];
            var entry = {
                id: volBackup.get('id'),
                cells: [{
                    value: volBackup.get("name"),
                    link: "#nova/backups/volumes/" + volBackup.get("id")+ "/detail/"
                }]
            };
            entries.push(entry);
        }
        return entries;
    },

    onClose: function() {
        this.tableView.close();
        this.undelegateEvents();
        this.unbind();
        this.model.unbind("sync", this.render, this);
    },

    onAction: function(action, backupIds) {
        var backup, backupModel, subview;
        var self = this;
        if (backupIds.length === 1) {
            backup = backupIds[0];
            backupModel = this.model.get(backup);
        }
        switch (action) {
            case 'restore':
                backupModel.restore(UTILS.Messages.getCallbacks("Backup " + backupModel.get("name") + " restored", "Error restoring backup " + backupModel.get("name")));
                break;
            case 'delete':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Delete Backups",
                    btn_message: "Delete Backups",
                    onAccept: function() {
                        backupIds.forEach(function(backup) {
                            backupModel = self.model.get(backup);
                            backupModel.destroy(UTILS.Messages.getCallbacks("Backup " + backupModel.get("name") + " deleted", "Error deleting backup " + backupModel.get("name")));
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
        $(this.el).html(this._template({models:this.model.models, instancesModel:this.options.instancesModel, volumesModel:this.options.volumesModel, flavors:this.options.flavors}));
        //UTILS.Render.animateRender(this.el, this._template, this.model);
        this.tableView = new TableView({
            model: this.model,
            el: '#volume-backups-table',
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
var NovaVolumeSnapshotDetailView = Backbone.View.extend({

    _template: _.itemplate($('#volumeSnapshotDetailTemplate').html()),

    initialize: function() {
        this.model.bind("change", this.render, this);
        this.model.fetch();
    },

    onClose: function () {
        this.model.unbind("change", this.render, this);
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($("#volumeSnapshot_details").html() == null) {
            UTILS.Render.animateRender(this.el, this._template, {model:this.model});
        } else {
            $(this.el).html(this._template({model:this.model}));
        }
        return this;
    }

});
var NovaVolumeSnapshotsView = Backbone.View.extend({

    _template: _.itemplate($('#novaVolumeSnapshotsTemplate').html()),

    tableView: undefined,

    initialize: function() {
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.renderFirst();
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [];
    },

    getHeaders: function() {
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        return [{
            type: "checkbox",
            size: "5%"
        }, {
            name: "Name",
            tooltip: "Volume Snapshot's name",
            size: "40%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Description",
            tooltip: "Volume Snapshot's name",
            size: "10%",
            hidden_phone: true,
            hidden_tablet: false
        }, {
            name: "Size",
            tooltip: "Size of volume snapshot",
            size: "10%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Status",
            tooltip: "Current status of the snapshot (active, none, ...)",
            size: "10%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Identifier of the corresponding volume",
            tooltip: "Snapshot's container format (AMI, AKI, ...)",
            size: "20%",
            hidden_phone: true,
            hidden_tablet: false
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
            label: "Delete Snapshots",
            action: "delete",
            warn: true,
            activatePattern: groupSelected
        }];
    },

    getEntries: function() {
        var entries = [];
        for (var index in this.model.models) {
            var volSnapshot = this.model.models[index];
            var entry = {
                id: volSnapshot.get('id'),
                cells: [{
                    value: volSnapshot.get("display_name"),
                    link: "#nova/snapshots/volumes/" + volSnapshot.get("id")+ "/detail/"
                }, {
                    value: volSnapshot.get('description')
                }, {
                    value: volSnapshot.get('size')+" GB"
                }, {
                    value: volSnapshot.get("display_description")
                }, {
                    value: volSnapshot.get('volume_id')
                }]
            };
            entries.push(entry);
        }
        return entries;
    },

    onClose: function() {
        this.tableView.close();
        this.undelegateEvents();
        this.unbind();
        this.model.unbind("sync", this.render, this);
    },

    onAction: function(action, snapshotIds) {
        var snapshot, snap, subview;
        var self = this;
        if (snapshotIds.length === 1) {
            snapshot = snapshotIds[0];
            snap = this.model.get(snapshot);
        }
        switch (action) {
            case 'edit':
                break;
            case 'delete':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Delete Snapshots",
                    btn_message: "Delete Snapshots",
                    onAccept: function() {
                        snapshotIds.forEach(function(snapshot) {
                            snap = self.model.get(snapshot);
                            snap.destroy(UTILS.Messages.getCallbacks("Snapshot " + snap.get("name") + " deleted", "Error deleting snapshot " + snap.get("name")));
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
        $(this.el).html(this._template({models:this.model.models, instancesModel:this.options.instancesModel, volumesModel:this.options.volumesModel, flavors:this.options.flavors}));
        //UTILS.Render.animateRender(this.el, this._template, this.model);
        this.tableView = new TableView({
            model: this.model,
            el: '#volume-snapshots-table',
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
var NovaSnapshotsView = Backbone.View.extend({

    _template: _.itemplate($('#novaSnapshotsTemplate').html()),

    instanceSnapshotsView: undefined,
    volumeSnapshotsView: undefined,
    volumeBackupsView: undefined,

    initialize: function() {
        this.options.instanceSnapshotsModel = UTILS.GlobalModels.get("instanceSnapshotsModel");
        this.options.volumeSnapshotsModel = UTILS.GlobalModels.get("volumeSnapshotsModel");
        this.options.volumeBackupsModel = UTILS.GlobalModels.get("volumeBackupsModel");
        this.options.instancesModel = UTILS.GlobalModels.get("instancesModel");
        this.options.volumesModel = UTILS.GlobalModels.get("volumesModel");
        this.options.flavors = UTILS.GlobalModels.get("flavors");
        this.options.keypairs = UTILS.GlobalModels.get("keypairsModel");
        this.options.secGroups = UTILS.GlobalModels.get("securityGroupsModel");
        this.options.quotas = UTILS.GlobalModels.get("quotas");
        this.options.networks = UTILS.GlobalModels.get("networks");
        this.render();
        this.instanceSnapshotsView = new NovaInstanceSnapshotsView({model: this.options.instanceSnapshotsModel, quotas:this.options.quotas, instancesModel: this.options.instancesModel, flavors: this.options.flavors, keypairs: this.options.keypairs, secGroups: this.options.secGroups, volumes: this.options.volumesModel, networks: this.options.networks, el: '#instance_snapshots'});
        this.volumeSnapshotsView = new NovaVolumeSnapshotsView({model: this.options.volumeSnapshotsModel, instancesModel: this.options.instancesModel, volumesModel: this.options.volumesModel, flavors: this.options.flavors, secGroups: this.options.secGroups, el: '#volume_snapshots'});
        this.volumeBackupsView = new VolumeBackupsView({model: this.options.volumeBackupsModel, volumesModel: this.options.volumesModel, el: '#volume_backups'});
    },

    onClose: function() {
        this.instanceSnapshotsView.onClose();
        this.volumeSnapshotsView.onClose();
        this.volumeBackupsView.onClose();
        this.undelegateEvents();
        this.unbind();
    },

    render: function() {
        var self = this;
        UTILS.Render.animateRender(this.el, this._template);
    }

});
var VolumeDetailView = Backbone.View.extend({

    _template: _.itemplate($('#volumeDetailTemplate').html()),

    initialize: function() {
        this.model.bind("change", this.render, this);
        this.model.fetch();
    },

    onClose: function () {
        this.model.unbind("change", this.render, this);
        this.undelegateEvents();
        this.unbind();
    },

    render: function () {
        if ($("#volume_details").html() == null) {
            UTILS.Render.animateRender(this.el, this._template, {model:this.model});
        } else {
            $(this.el).html(this._template({model:this.model}));
        }
        return this;
    }

});
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
var ObjectStorageContainersView = Backbone.View.extend({

    _template: _.itemplate($('#objectstorageContainersTemplate').html()),

    tableView: undefined,

    initialize: function() {
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.renderFirst();
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [{
            label: "Create Container",
            action: "create"
        }];
    },

    getDropdownButtons: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        var self = this;
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
        return [{
            label: "List Objects",
            action: "list",
            activatePattern: oneSelected
        }, {
            label: "Upload Objects",
            action: "upload",
            activatePattern: oneSelected
        }, {
            label: "Delete Containers",
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
            tooltip: "Container's name",
            size: "50%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Objects",
            tooltip: "Number of objects on the container",
            size: "15%",
            hidden_phone: true,
            hidden_tablet: false
        }, {
            name: "Size",
            tooltip: "Current size of the container",
            size: "30%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var entries = [];
        for (var index in this.model.models) {
            var container = this.model.models[index];
            var bytes = container.get("bytes");
            var kbytes, mbytes, gbytes, size;
            if (bytes >= 1024) {
                kbytes = Math.round(bytes / 1024 * 10) / 10;
                size = kbytes + " KB";
                if (kbytes >= 1024) {
                    mbytes = Math.round(kbytes / 1024 * 10) / 10;
                    size = mbytes + " MB";
                    if (mbytes >= 1024) {
                        gbytes = Math.round(mbytes / 1024 * 10) / 10;
                        size = gbytes + " GB";
                    } else {
                        size = Math.round(mbytes * 10) / 10 + " MB";
                    }
                } else {
                    size = Math.round(kbytes * 10) / 10 + " KB";
                }
            } else {
                size = Math.round(bytes * 10) / 10 + " bytes";
            }

            var entry = {
                id: container.get('name'),
                cells: [{
                    value: container.get("name"),
                    link: "#objectstorage/containers/" + container.get('name') + "/"
                }, {
                    value: container.get("count")
                }, {
                    value: size
                }]
            };
            entries.push(entry);

        }
        return entries;
    },

    onAction: function(action, containerIds) {
        var container, cont, subview;
        var self = this;
        if (containerIds.length === 1) {
            container = containerIds[0];
            cont = this.model.get(container);
        }
        switch (action) {
            case 'create':
                subview = new CreateContainerView({
                    el: 'body',
                    model: this.model
                });
                subview.render();
                break;
            case 'list':
                window.location.href = '#objectstorage/containers/' + container + '/';
                break;
            case 'upload':
                subview = new UploadObjectView({
                    el: 'body',
                    model: cont
                });
                subview.render();
                break;
            case 'delete':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Confirm Delete Container",
                    btn_message: "Delete Container",
                    onAccept: function() {
                        containerIds.forEach(function(container) {
                            cont = self.model.get(container);
                            if (cont.get("count") > 0) {
                                console.log(cont);
                                var subview2 = new MessagesView({
                                    state: "Error",
                                    title: "Unable to delete non-empty container " + cont.get("id")
                                });
                                subview2.render();
                                return;
                            } else {
                                cont.destroy();

                                var subview3 = new MessagesView({
                                    state: "Success",
                                    title: "Container " + cont.get("id") + " deleted."
                                });
                                subview3.render();
                            }
                        });
                    }
                });
                subview.render();
                break;
        }
    },


    onClose: function() {
        this.tableView.close();
        this.undelegateEvents();
        this.unbind();
        this.model.unbind("sync", this.render, this);
    },

    onDelete: function(evt) {
        var container = evt.target.value;
        var self = this;
        var cont;
        var subview = new ConfirmView({
            el: 'body',
            title: "Confirm Delete Container",
            btn_message: "Delete Container",
            onAccept: function() {
                cont = self.model.get(container);
                if (cont.get("count") > 0) {
                    console.log(cont);
                    var subview2 = new MessagesView({
                        state: "Error",
                        title: "Unable to delete non-empty container " + cont.get("id")
                    });
                    subview2.render();
                    return;
                } else {
                    cont.destroy();

                    var subview3 = new MessagesView({
                        state: "Success",
                        title: "Container " + cont.get("id") + " deleted."
                    });
                    subview3.render();
                }
            }
        });
        subview.render();
    },

    onDeleteGroup: function(evt) {
        var self = this;
        var cont;
        var subview = new ConfirmView({
            el: 'body',
            title: "Delete Containers",
            btn_message: "Delete Containers",
            onAccept: function() {
                $(".checkbox_containers:checked").each(function() {
                    var container = $(this).val();

                    cont = self.model.get(container);
                    if (cont.get("count") > 0) {
                        var subview2 = new MessagesView({
                            state: "Conflict",
                            title: "Container " + cont.get("id") + " contains objects."
                        });
                        subview2.render();
                        return;
                    } else {
                        cont.destroy();
                        var subview3 = new MessagesView({
                            state: "Success",
                            title: "Container " + cont.get("name") + " deleted."
                        });
                        subview3.render();
                    }
                });
            }
        });
        subview.render();
    },

    renderFirst: function() {
        var self = this;
        UTILS.Render.animateRender(this.el, this._template, {
            models: this.model.models
        });
        this.tableView = new TableView({
            model: this.model,
            el: '#containers-table',
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
var ObjectStorageContainerView = Backbone.View.extend({

    _template: _.itemplate($('#objectstorageContainerTemplate').html()),

    timer: undefined,

    initialize: function() {
        var self = this;
        this.options.containers = UTILS.GlobalModels.get("containers");
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.timer = setInterval(function() {
            self.model.fetch();
        }, 10000);
        this.model.fetch();
        this.renderFirst();

    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [{
            label: "Upload Object",
            action: "upload"
        }];
    },

    getDropdownButtons: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        var self = this;
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
        return [{
            label: "Download Object",
            action: "download",
            activatePattern: oneSelected
        }, {
            label: "Copy Object",
            action: "copy",
            activatePattern: oneSelected
        }, {
            label: "Delete Object",
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
            tooltip: "Object's name",
            size: "70%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Size",
            tooltip: "Object's size",
            size: "25%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var entries = [];
        var container = this.model;
        var i = 0;
        for (var index in container.get('objects')) {
            var object = container.get('objects')[index];
            var bytes = object.bytes;
            var kbytes, mbytes, gbytes, size;
            if (bytes >= 1024) {
                kbytes = Math.round(bytes / 1024 * 10) / 10;
                size = kbytes + " KB";
                if (kbytes >= 1024) {
                    mbytes = Math.round(kbytes / 1024 * 10) / 10;
                    size = mbytes + " MB";
                    if (mbytes >= 1024) {
                        gbytes = Math.round(mbytes / 1024 * 10) / 10;
                        size = gbytes + " GB";
                    } else {
                        size = Math.round(mbytes * 10) / 10 + " MB";
                    }
                } else {
                    size = Math.round(kbytes * 10) / 10 + " KB";
                }
            } else {
                size = Math.round(bytes * 10) / 10 + " bytes";
            }

            var entry = {
                id: object.name,
                cells: [{
                    value: object.name
                }, {
                    value: size
                }]
            };
            entries.push(entry);

        }
        return entries;
    },

    onAction: function(action, objectIds) {
        var object, obj, subview;
        var self = this;
        var container = this.options.model.get("name");
        if (objectIds.length === 1) {
            object = objectIds[0];
        }
        switch (action) {
            case 'upload':
                subview = new UploadObjectView({
                    el: 'body',
                    model: this.model
                });
                subview.render();
                break;
            case 'download':
                var options = {};
                var filename = object;
                var opt = UTILS.Messages.getCallbacks("File "+filename+ " downloaded.", "File " + filename + " was not downloaded.");
                options.callback = function(object) {
                    console.log('callback', object);
                    var typeMIME, blob, blobURL;
                    var obj = object;
                    // TODO Check why we obtain it as a "double" String
                    if (typeof obj === "string") {
                        obj = JSON.parse(obj);
                    }
                    
                    var byteString;
                    if (obj.valuetransferencoding === "base64") {
                        byteString = atob(obj.value);
                    } else {
                        byteString = obj.value;
                    }
                    var array = [];
                    var ab = new ArrayBuffer(byteString.length);
                    var ia = new Uint8Array(ab);
                    for (var i = 0; i < byteString.length; i++) {
                      ia[i] = byteString.charCodeAt(i);
                    }
                    array.push(ab);
                    blob = new Blob(array, {type: obj.mimetype});
                    opt.success();
                    var view = new ConfirmView({
                        el: 'body',
                        title: "File: " + filename,
                        message: "Click on the button to save the file",
                        btn_message: "Save " + filename,
                        onAccept: function() {
                            saveAs(blob, filename);
                        }
                    });
                    view.render();
                    
                };
                this.model.downloadObject(object, options);
                break;
            case 'copy':
                subview = new CopyObjectView({
                    el: 'body',
                    model: this.model,
                    title: object,
                    container: this.model.get("name"),
                    containers: this.options.containers.models
                });
                subview.render();
                break;
            case 'delete':
                subview = new ConfirmView({
                    el: 'body',
                    title: "Confirm Delete Object",
                    btn_message: "Delete Object",
                    onAccept: function() {
                        objectIds.forEach(function(object) {
                            self.model.deleteObject(object, {callback:function() {
                                var subview3 = new MessagesView({
                                    state: "Success",
                                    title: "Object " + object + " deleted."
                                });
                                subview3.render();
                            }});
                        });
                    }
                });
                subview.render();
                break;
        }
    },

    onClose: function() {
        this.tableView.close();
        this.undelegateEvents();
        this.unbind();
        this.model.unbind("change", this.render, this);
        this.model.unbind("sync", this.render, this);
        clearInterval(this.timer);
    },

    renderFirst: function() {
        var self = this;
        UTILS.Render.animateRender(this.el, this._template);
        this.tableView = new TableView({
            model: this.model,
            el: '#container-table',
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

var RootView = Backbone.View.extend({

    _roottemplate: _.itemplate($('#rootTemplate').html()),

    _authtemplate: _.itemplate($('#not_logged_in').html()),

    consoleMaximizes: false,

    events: {
        "click #message-resize-icon": "toggleMaxConsole"
    },

    initialize: function () {
        $(this.options.auth_el).empty().html(this._authtemplate(this.model)).css('display', 'None');
        $(this.options.root_el).empty().html(this._roottemplate()).css('display', 'None');
        this.model.bind('change:loggedIn', this.onLogin, this);
        this.model.bind('auth-error', this.renderAuthonerror, this);
        $("#message-resize-icon").live("click", this.toggleMaxConsole);
        this.onLogin();
    },

    toggleMaxConsole: function() {
        console.log("Maximizing");
        $('#message-resize-icon').removeClass('icon-resize-full');
        $('#message-resize-icon').removeClass('icon-resize-small');
        if (this.consoleMaximizes) {
            $('#log-messages').css('overflow', 'hidden');
            $('#logs').animate({height: '48px'}, 500);
            $('#log-messages').animate({height: '48px'}, 500);
            $('#message-resize-icon').addClass('icon-resize-full');
        } else {
            $('#log-messages').css('overflow', 'auto');
            $('#message-resize-icon').addClass('icon-resize-small');
            $('#logs').animate({height: '348px'}, 500);
            $('#log-messages').animate({height: '348px'}, 500);
        }
        $('#log-messages').animate({scrollTop: ($('.messages').length-1)*(48)+'px'}, 500);
        this.consoleMaximizes = !this.consoleMaximizes;
    },

    onCredentialsSubmit: function(e){
        e.preventDefault();
        if (UTILS.Auth.isIDM()) {
            UTILS.Auth.goAuth();
        } else {
            this.model.setCredentials(this.$('input[name=username]').val(), this.$('input[name=password]').val());
        }
    },

    onCloseErrorMsg: function(e) {
        this.model.set({"error_msg": null});
        this.renderAuthonerror();
    },

    onLogin: function() {
        if (this.model.get('loggedIn')) {
            if (this.options.next_view !== undefined) {
                window.location.href = "#" + this.options.next_view;
            } else {
                window.location.href = "#syspanel";
            }
        }
    },

    renderAuth: function () {
        var self = this;
        self.$el = $(self.options.auth_el);
        self.delegateEvents({
            'click #home_loginbtn': 'onCredentialsSubmit',
            'click .close': 'onCloseErrorMsg'
        });
        if (UTILS.Auth.isIDM()) {
            console.log(self.model.get("access_token"), self.model.get("tenant"), self.model.get("expired"));
            if (self.model.get("access_token") !== "" && self.model.get("expired") !== true) return;
            console.log("Conditions passed");

            UTILS.Auth.goAuth();
        } else {
            console.log(self.model.get("token"), self.model.get("tenant"), self.model.get("error_msg"), self.model.get("expired"));
            if ((self.model.get("token") !== "" && self.model.get("error_msg") == null) && self.model.get("expired") !== true) return;
            console.log("Conditions passed");
            if ($(self.options.root_el).css('display') !== 'None')
                $(self.options.root_el).fadeOut();
            $(self.options.auth_el).fadeIn();
        }

        return this;
    },

    renderRoot: function () {
        var self = this;
        self.$el = $(self.options.auth_el);
        self.delegateEvents({});
        if ($(self.options.auth_el).css('display') !== 'None')
            $(self.options.auth_el).fadeOut();
        $(self.options.root_el).fadeIn();
        return this;
    },

    renderAuthonerror: function() {
        if ($(this.options.auth_el).css('display') == 'none')
            $(this.options.auth_el).fadeIn();
        $(this.options.auth_el).empty().html(this._authtemplate(this.model));
        $('body').attr("id", "splash");
        return this;
    }

});
var SettingsView = Backbone.View.extend({

    _template: _.itemplate($('#settingsTemplate').html()),

    events : {
        'click #select': 'changeLang'
    },

    initialize: function() {
    },

    changeLang: function(evt) {
        $("select option:selected").each(function () {
            var lang = $(this).attr('value');
            UTILS.i18n.setlang(lang, function() {
                window.location.href="";
            });

        });
    },

    render: function () {
        $(this.el).empty().html(this._template());
    }

});
var SideBarView = Backbone.View.extend({

    _template: _.itemplate($('#sideBarTemplate').html()),

    initialize: function() {
        this.model.bind('change:actives', this.render, this);
        this.options.loginModel = UTILS.GlobalModels.get("loginModel");
        this.options.loginModel.bind('change:tenant_id', this.render, this);
      
        $('#accept_region_modal_button').on('click', function (e) {
            $('#no_sanity_modal').unbind('hidden');
            $('#no_sanity_modal').modal('hide');
            console.log("Switching to: ", val);
            window.location = $('.chosen-select').chosen().val();
        });
    },

    render: function (title, showTenants) {
        var self = this;
        var html = self._template({models: self.model.models, showTenants: showTenants, loginModel: this.options.loginModel, title: title});
        $(self.el).empty();
        $(self.el).html(html);
        $("#tenant_switcher").selectbox({
            onChange: function (val, inst) {
                window.location = val;
            }
        });


               
        $('.chosen-select' ).chosen().change(function(){
            val = $('.chosen-select').chosen().val();
            
            var region = $('.chosen-select').find(":selected").text();
            var status = UTILS.Auth.getRegionStatus(region);

            if (status === 'down') {
                $('#no_sanity_modal').on('hidden.bs.modal', function (e) {
                    $('#no_sanity_modal').unbind('hidden');
                    console.log("Returning to: ", UTILS.Auth.getCurrentRegion());
                    window.location.href = '#reg/switch/' + UTILS.Auth.getCurrentRegion() + '/';
                });
                $('#no_sanity_modal').modal();
            } else {
                console.log("Switching to: ", val);
                window.location = val;
            }
        });

        $('.btn-openrc').on('click', this.openModal);
        
        // $("#region_switcher").selectbox({
        //     onChange: function (val, inst) {
        //         window.location = val;
        //     }
        // });
    },

    openModal: function() {
        var subview = new DownloadOpenrcView({el: 'body'});
        subview.render();
    }
});
var SmalltableView = Backbone.View.extend({

    _template: _.itemplate($('#smalltableTemplate').html()),
    header: undefined,
    title: undefined,
    hasId:true,

    initialize: function() {

    },

    getHeader: function() {
        var str = "<tr>";
        for(var attr in this.header){
            if(attr=="id"&&!this.hasId){
                continue;
            }
            str = str + "<td>" + this.header[attr] + "</td>";
        }
        str = str + "</tr>";
        return str;
    },

    getEntries: function(){
        var str = "";
        for(var i = 0;i< this.model.length;i++){
            var str = str + "<tr>";
            var entry = this.model.models[i];
            for(var attr in this.header){
                //alert(attr);
                if(attr=="id"&&!this.hasId){
                    str = str + "<td style=\'display: none\'>" + entry.get(attr) + "</td>";
                }else{
                    str = str + "<td >" + entry.get(attr) + "</td>";
                }
                //str = str + "<td >" + entry.get(attr) + "</td>";
            }
            str = str + "</tr>";
        }
        return str;
    },

    close: function(){
       $("#smalltableTemplate").remove();
       this.undelegateEvents();
       this.unbind();
    },

    render: function() {
        var new_template = this._template({
            table_header:this.getHeader(),
            table_body:this.getEntries(),
            title: this.title
        });
        $(this.el).html(new_template);
        return this;
    }


});

var FlavorView = Backbone.View.extend({

    _template: _.itemplate($('#flavorsTemplate').html()),

    tableView: undefined,

    initialize: function() {
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        //this.options.isProjectTab.unbind("reset");
        //this.options.isProjectTab.bind("reset", this.render, this);
        this.renderFirst();
    },

    onClose: function() {
        this.tableView.close();
        this.undelegateEvents();
        this.unbind();
        this.model.unbind("sync", this.render, this);
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        var btns = [];
        if (!this.options.isProjectTab) {
            btns.push({
                label:  "Create Flavor",
                action:    "create"
            });
        }
        return btns;
    },

    getDropdownButtons: function() {
        var btns = [];
        var groupSelected = function(size, id) {
            if (size >= 1) {
                return true;
            }
        };
        if (!this.options.isProjectTab) {
            btns.push({
                label:"Delete Flavor",
                action:"delete",
                warn: true,
                activatePattern: groupSelected
            });
        }
        return btns;
    },

    getHeaders: function() {
        var btns = [
            {
                name: "ID",
                tooltip: "Flavor's identifier",
                size: "20%",
                hidden_phone: true,
                hidden_tablet:false
            },
            {
                name: "Name",
                tooltip: "Flavor's name",
                size: "25%",
                hidden_phone: true,
                hidden_tablet:false
            },
            {
                name: "VCPUs",
                tooltip: "Number of virtual CPUs",
                size: "5%",
                hidden_phone: false,
                hidden_tablet:false
            },
            {
                name: "Memory",
                tooltip: "RAM availability",
                size: "10%",
                hidden_phone: false,
                hidden_tablet:false
            },
            {
                name: "User Disk",
                tooltip: "User disk availability",
                size: "10%",
                hidden_phone: true,
                hidden_tablet:false
            },
            {
                name: "Ephemeral Disk",
                tooltip: "Ephemeral disk availability",
                size: "10%",
                hidden_phone: true,
                hidden_tablet:false
            }
        ];
        if (!this.options.isProjectTab) {
            btns.splice(0,0, {
                type: "checkbox",
                size: "5%"
            });
        }
        return btns;
    },

    getEntries: function() {
        var i = 0;
        var entries = [];
        for (var index in this.model.models) {
            i++;
            var flavor = this.model.models[index];

            var entry = {id: flavor.get('id'), cells: [{
                  value: flavor.get('id')
                },
                { value: flavor.get("name")
                },
                { value: flavor.get("vcpus")
                },
                { value: flavor.get("ram")
                },
                { value: flavor.get("disk")
                },
                { value: flavor.get('OS-FLV-EXT-DATA:ephemeral') || flavor.get('ephemeral')
                }
                ]};
            entries.push(entry);
        }
        return entries;
    },

    onAction: function(action, flavorIds) {
        var flavor, flav, subview;
        var self = this;
        if (flavorIds.length === 1) {
            flavor = flavorIds[0];
            flav = this.model.get(flavor);
        }
        switch (action) {
            case 'delete':
                subview = new ConfirmView({el: 'body', title: "Delete Flavor", btn_message: "Delete Flavor", onAccept: function() {
                    flavorIds.forEach(function(flavor) {
                        flav = self.model.get(flavor);
                        flav.destroy(UTILS.Messages.getCallbacks("Flavor " + flav.get("name") + " deleted", "Error deleting flavor " + flav.get("name")));
                    });
                }});
                subview.render();
                break;
            case 'create':
                view = new CreateFlavorView({model: new Flavor(), el: 'body', flavors: self.model});
                view.render();
                break;
        }
    },

    renderFirst: function() {
        UTILS.Render.animateRender(this.el, this._template, {models: this.model.models, isProjectTab:this.options.isProjectTab});
        this.tableView = new TableView({
            model: this.model,
            el: '#flavors-table',
            onAction: this.onAction,
            getDropdownButtons: this.getDropdownButtons,
            getMainButtons: this.getMainButtons,
            getHeaders: this.getHeaders,
            getEntries: this.getEntries,
            context: this
        });
        this.tableView.render();
    },

    render: function () {
        if ($(this.el).html() !== null) {
            this.tableView.render();
        }
        return this;
    }

});
var NewUsersView = Backbone.View.extend({

    _template: _.itemplate($('#newUsersTemplate').html()),

    initialize: function() {
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.renderFirst();
    },

    events: {
        'click .btn-create-project' : 'onCreate',
        'click .btn-edit' : 'onUpdate',
        'click .btn-delete':'onDelete',
        'click .btn-modify' : 'onModify',
        'click .btn-delete-group': 'onDeleteGroup',
        'change .checkbox_projects':'enableDisableDeleteButton',
        'change .checkbox_all':'checkAll'
    },

    onCreate: function() {
        var subview = new CreateProjectView({el: 'body', model:this.model});
        subview.render();
    },

    onUpdate: function() {
        var subview = new EditProjectView({el: 'body', model:this.model});
        subview.render();
    },

    onModify: function() {
        var subview = new ModifyUsersView({el: 'body', model:this.model});
        subview.render();
    },

    onDelete: function(evt) {
        var container = evt.target.value;
        var self = this;
        var subview = new ConfirmView({el: 'body', title: "Confirm Delete Project", btn_message: "Delete Project", onAccept: function() {
            cont = self.model.get(container);
            cont.destroy(UTILS.Messages.getCallbacks("Project "+cont.get("name") + " deleted.", "Error deleting project "+cont.get("name")));
        }});
        subview.render();
    },

    onDeleteGroup: function(evt) {
        var self = this;
        var cont;
        // TODO: Delete group

        var subview = new ConfirmView({el: 'body', title: "Delete Projects", btn_message: "Delete Projects", onAccept: function() {
            $(".checkbox_containers:checked").each(function () {
                    var subview = new MessagesView({state: "Success", title: "Project deleted."});
                    subview.render();

            });
        }});
        subview.render();
    },

    checkAll: function () {
        if ($(".checkbox_all:checked").size() > 0) {
            $(".checkbox_projects").attr('checked','checked');
            this.enableDisableDeleteButton();
        } else {
            $(".checkbox_projects").attr('checked',false);
            this.enableDisableDeleteButton();
        }

    },

    enableDisableDeleteButton: function () {
        if ($(".checkbox_projects:checked").size() > 0) {
            $("#projects_delete").attr("disabled", false);
        } else {
            $("#projects_delete").attr("disabled", true);
        }

    },

    onClose: function() {
        this.model.unbind("sync");
    },

    render: function () {
        this.undelegateEvents();
        UTILS.Render.animateRender(this.el, this._template, this.model);
        this.delegateEvents(this.events);

        return this;
    },

    renderFirst: function () {
        this.undelegateEvents();
        var that = this;
        UTILS.Render.animateRender(this.el, this._template, {model: this.model}, function() {
            that.enableDisableDeleteButton();
            that.delegateEvents(that.events);
        });

    }
});
var ProjectView = Backbone.View.extend({

    _template: _.itemplate($('#projectsTemplate').html()),

    tableView: undefined,

    initialize: function() {
        var self = this;
        this.model.fetch();
        this.options.quotas = UTILS.GlobalModels.get("quotas");
        this.options.quotas.fetch();
        this.renderFirst();
        this.model.bind("sync", this.render, this);
        this.options.quotas.bind("reset", this.render, this);
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        // return [{
        //     label:  "Create New Project",
        //     action:    "create"
        // }];
        return [];
    },

    getDropdownButtons: function() {
        var self = this;
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
        return [
        // {
        //     label:"Edit Project", action:"edit", activatePattern: oneSelected
        // },
        // {
        //     label: "Modify Users", action: "modify-users", activatePattern: oneSelected
        // },
        {
            label: "Modify Quotas", action: "modify-quotas", activatePattern: oneSelected
        }
        // ,
        // {
        //     label: "Delete Project", action:"delete", warn: true, activatePattern: groupSelected
        // }
        ];
    },

    getHeaders: function() {
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        return [
            {
                type: "checkbox",
                size: "5%"
            },
            {
                name: "Name",
                tooltip: "Project's name",
                size: "35%",
                hidden_phone: false,
                hidden_tablet:false
            },
            {
                name: "Project Description",
                tooltip: "Project's Description",
                size: "50%",
                hidden_phone: true,
                hidden_tablet:false
            },
            {
                name: "Enabled",
                tooltip: "Check if the project is available to be used",
                size: "10%",
                hidden_phone: false,
                hidden_tablet:false
            }
        ];
    },

    getEntries: function() {
        var entries = [];
        for (var index in this.model.models) {
            var project = this.model.models[index];
            var entry = {id: project.get('id'), cells: [{
                    value: project.get("name")
                },
                { value: project.get("description")
                },
                { value: project.get("enabled")
                }
                ]};
            entries.push(entry);
        }
        return entries;
    },

    onAction: function(action, projectIds) {
        var project, proj, subview, quotas;
        var self = this;
        if (projectIds.length === 1) {
            project = projectIds[0];
            proj = this.model.get(project);
        }
        switch (action) {
            case 'edit':
                subview = new EditProjectView({el: 'body', model:proj});
                subview.render();
                break;
            case 'modify-users':
                window.location.href = '#syspanel/projects/'+project+'/users/';
                break;
            case 'modify-quotas':
                var quota = new Quota();
                quota.set({'id': project});
                quota.fetch({success: function () {
                    subview = new ModifyQuotasView({el: 'body', model:quota, project:proj.attributes.name});
                    subview.render();
                }});                
                break;
            case 'create':
                subview = new CreateProjectView({el: 'body'});
                subview.render();
                break;
            case 'delete':
                subview = new ConfirmView({el: 'body', title: "Confirm Delete Project", btn_message: "Delete Project", onAccept: function() {
                    projectIds.forEach(function(project) {
                        proj = self.model.get(project);
                        proj.destroy(UTILS.Messages.getCallbacks("Project "+proj.get("name") + " deleted.", "Error deleting project "+proj.get("name")));
                    });
                }});
                subview.render();
                break;
        }
    },

    onClose: function() {
        this.tableView.close();
        this.options.quotas.unbind("reset");
        this.model.unbind("sync");
        this.undelegateEvents();
        this.unbind();
    },

    renderFirst: function() {
        UTILS.Render.animateRender(this.el, this._template, this.model);
        this.tableView = new TableView({
            model: this.model,
            el: '#projects-table',
            onAction: this.onAction,
            getDropdownButtons: this.getDropdownButtons,
            getMainButtons: this.getMainButtons,
            getHeaders: this.getHeaders,
            getEntries: this.getEntries,
            context: this
        });
        this.tableView.render();
    },

    render: function () {
        if ($(this.el).html() !== null) {
            this.tableView.render();
        }
        return this;
    }
});
var QuotaView = Backbone.View.extend({

    _template: _.itemplate($('#quotasTemplate').html()),

    tableView: undefined,

    initialize: function() {
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.model.fetch();
        this.renderFirst();
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [];
    },

    getDropdownButtons: function() {
        return [];
    },

    getHeaders: function() {
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        return [{
            name: "Name",
            tooltip: "Quota's name",
            size: "80%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Limit",
            tooltip: "Limits of the quota",
            size: "20%",
            hidden_phone: false,
            hidden_tablet: false
        }];
    },

    getEntries: function() {
        var entries = [];
        var attr;
        if (!this.model.models[0]) return entries;
        attr = this.model.models[0].attributes;
        entries.push({
            id: '0000',
            cells: [{
                value: "Metadata Items"
            }, {
                value: attr.metadata_items
            }]
        });
        entries.push({
            id: '0001',
            cells: [{
                value: "Injected File Content Bytes"
            }, {
                value: attr.injected_file_content_bytes
            }]
        });
        entries.push({
            id: '0002',
            cells: [{
                value: "Injected Files"
            }, {
                value: attr.injected_files
            }]
        });
        entries.push({
            id: '0003',
            cells: [{
                value: "Gigabytess"
            }, {
                value: attr.gigabytes
            }]
        });
        entries.push({
            id: '0004',
            cells: [{
                value: "Ram"
            }, {
                value: attr.ram
            }]
        });
        entries.push({
            id: '0005',
            cells: [{
                value: "Floating Ips"
            }, {
                value: attr.floating_ips
            }]
        });
        entries.push({
            id: '0006',
            cells: [{
                value: "Instances"
            }, {
                value: attr.instances
            }]
        });
        entries.push({
            id: '0007',
            cells: [{
                value: "Volumes"
            }, {
                value: attr.volumes
            }]
        });
        entries.push({
            id: '0008',
            cells: [{
                value: "Cores"
            }, {
                value: attr.cores
            }]
        });
        entries.push({
            id: '0009',
            cells: [{
                value: "Security Groups"
            }, {
                value: attr.security_groups
            }]
        });
        entries.push({
            id: '0010',
            cells: [{
                value: "Security Group Rules"
            }, {
                value: attr.security_group_rules
            }]
        });
        return entries;
    },

    onClose: function() {
        this.tableView.close();
        this.undelegateEvents();
        this.unbind();
        this.model.unbind("sync");
    },

    close: function() {
        this.onClose();
    },

    renderFirst: function() {
        UTILS.Render.animateRender(this.el, this._template, {
            models: this.model.models
        });
        this.tableView = new TableView({
            model: this.model,
            el: '#quotas-table',
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
var ServiceView = Backbone.View.extend({

    _template: _.itemplate($('#servicesTemplate').html()),

    initialize: function() {
        this.model.bind("reset", this.rerender, this);
        this.model.fetch();
    },

    render: function () {
        UTILS.Render.animateRender(this.el, this._template, this.model);
        return this;
    },

    rerender: function() {
        $(this.el).empty().html(this._template(this.model));
    }
});
var UsersForProjectView = Backbone.View.extend({

    _template: _.itemplate($('#usersForProjectTemplate').html()),
    interval: undefined,

    allTableView: undefined,
    newTableView: undefined,

    events: {
        'click #gthan': 'onRemove',
        'click #lthan': 'onAdd'
    },

    initialize: function() {
        var self = this;
        this.model.unbind("sync");
        this.model.bind("sync", this.render, this);
        this.options.tenants = UTILS.GlobalModels.get("projects");
        this.options.users.unbind("reset");
        this.options.users.bind("reset", this.render, this);
        this.renderFirst();
        this.options.roles = new Roles();
        this.options.tenants.bind("reset", this.render, this);
        this.options.users.fetch();
        self.options.roles.fetch();
        this.model.fetch();
        this.interval = setInterval(function() {
            self.model.fetch();
        }, 5000);
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [];
    },

    getNewDropdownButtons: function() {
        return [];
    },

    getNewHeaders: function() {
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        return [{
            type: "checkbox",
            size: "5%"
        }, {
            name: "Name",
            tooltip: "User's name",
            size: "50%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Email",
            tooltip: "Email address",
            size: "50%",
            hidden_phone: true,
            hidden_tablet: false
        }];
    },

    getNewEntries: function() {
        // entries: [{id:id, cells: [{value: value, link: link}] }]
        var entries = [];
        for (var index in this.model.models) {
            var user = this.model.models[index];
            var entry = {
                id: user.get('id'),
                cells: [{
                    value: user.get("name")
                }, {
                    value: user.get('email')
                }]
            };
            entries.push(entry);
        }
        return entries;
    },

    getAllDropdownButtons: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        return [];
    },

    getAllHeaders: function() {
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        return [{
            type: "checkbox",
            size: "5%"
        }, {
            name: "Name",
            tooltip: "User's name",
            size: "50%",
            hidden_phone: false,
            hidden_tablet: false
        }, {
            name: "Email",
            tooltip: "Email address",
            size: "50%",
            hidden_phone: true,
            hidden_tablet: false
        }];
    },

    getAllEntries: function() {
        // entries: [{id:id, cells: [{value: value, link: link}] }]
        var entries = [];
        for (var index in this.options.users.models) {
            var user = this.options.users.models[index];
            if (!this.model.get(user.get('id'))) {
                var entry = {
                    id: user.get('id'),
                    cells: [{
                        value: user.get("name")
                    }, {
                        value: user.get('email')
                    }]
                };
                entries.push(entry);
            }
        }
        return entries;
    },

    onRemove: function(evt) {
        var entries = this.newTableView.getSelectedEntries();
        console.log(entries);
        if (entries.length > 0) {
            this.onAction("remove", entries);
        }
    },

    onAdd: function(evt) {
        var entries = this.allTableView.getSelectedEntries();
        console.log(entries);
        if (entries.length > 0) {
            this.onAction("add", entries);
        }
    },

    onAction: function(action, userIds) {
        var user, usr, subview;
        var self = this;
        if (userIds.length === 1) {
            user = userIds[0];
            usr = this.options.users.get(user);
        }

        var onSuccess = function(usr) {
            return function(roles) {
                for (var idx in roles.roles) {
                    var role = roles.roles[idx];
                    usr.removeRole(role.id, self.options.tenant, UTILS.Messages.getCallbacks("User "+usr.get("name") + " removed.", "Error removing user "+usr.get("name")));
                }
            };
        };

        switch (action) {
            case 'remove':
                subview = new ConfirmView({el: 'body', title: "Confirm Remove User from Project", btn_message: "Remove User", onAccept: function() {
                    for (var idx in userIds) {
                        user = userIds[idx];
                        usr = self.options.users.get(user);
                        usr.getRoles(self.options.tenant, {success: onSuccess(usr)});
                    }
                }});
                subview.render();
                break;
            case 'add':
                var userEntries = [];
                for (var idx in userIds) {
                    user = userIds[idx];
                    usr = this.options.users.get(user);
                    userEntries.push(usr);
                }
                subview = new AddUserToProjectView({el: 'body', users:userEntries, tenant: this.options.tenants.get(this.options.tenant), roles:this.options.roles});
                subview.render();
                break;
        }
    },

    onClose: function() {
        this.undelegateEvents();
        this.model.unbind("sync");
        this.options.tenants.unbind('reset');
        this.options.users.unbind('reset');
        clearInterval(this.interval);
    },

    renderFirst: function () {
        var self = this;
        UTILS.Render.animateRender(this.el, this._template, {model: this.model, users: this.options.users.models, tenant: this.options.tenants.get(this.options.tenant)}, function() {
            self.delegateEvents(self.events);
        });
        this.newTableView = new TableView({
            model: this.model,
            el: '#new-users-table',
            onAction: this.onAction,
            getDropdownButtons: this.getNewDropdownButtons,
            getMainButtons: this.getMainButtons,
            getHeaders: this.getNewHeaders,
            getEntries: this.getNewEntries,
            context: this
        });
        this.newTableView.render();

        this.allTableView = new TableView({
            model: this.model,
            el: '#all-users-table',
            onAction: this.onAction,
            getDropdownButtons: this.getAllDropdownButtons,
            getMainButtons: this.getMainButtons,
            getHeaders: this.getAllHeaders,
            getEntries: this.getAllEntries,
            context: this
        });
        this.allTableView.render();
    },

    render: function () {
        if ($(this.el).html() !== null) {
            this.newTableView.render();
            this.allTableView.render();
        }
        return this;
    }


});
var UserView = Backbone.View.extend({

    _template: _.itemplate($('#usersTemplate').html()),

    timer: undefined,

    tableView: undefined,

    initialize: function() {
        var self = this;
        this.options.tenants = UTILS.GlobalModels.get("projects");
        this.model.bind("sync", this.render, this);
        this.timer = setInterval(function() {
            self.model.fetch();
        }, 10000);
        this.model.fetch();
        this.renderFirst();
    },

    getMainButtons: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        return [{
            label:  "Create User",
            action: "create"
        }];
    },

    getDropdownButtons: function() {
        // dropdown_buttons: [{label:label, action: action_name}]
        var self = this;
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
        var disabledGroupSelected = function(size, ids) {
            if (size >= 1) {
                for (var id in ids) {
                    var entry = self.model.get(ids[id]);
                    if (entry.get('enabled')) {
                        return false;
                    }
                }
                return true;
            }
        };
        var enabledGroupSelected = function(size, ids) {
            if (size >= 1) {
                for (var id in ids) {
                    var entry = self.model.get(ids[id]);
                    if (!entry.get('enabled')) {
                        return false;
                    }
                }
                return true;
            }
        };
        return [{
            label:"Edit User", action:"edit", activatePattern: oneSelected
        },
        {
            label: "Enable Users", action: "enable", activatePattern: disabledGroupSelected
        },
        {
            label:  "Disable Users", action: "disable", activatePattern: enabledGroupSelected
        },
        {
            label: "Delete Users", action: "delete", activatePattern: groupSelected, warn: true
        }
        ];
    },

    getHeaders: function() {
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        return [
            {
                type: "checkbox",
                size: "5%"
            },
            {
                name: "Name",
                tooltip: "User's name",
                size: "35%",
                hidden_phone: false,
                hidden_tablet:false
            },
            {
                name: "Email",
                tooltip: "User's email address",
                size: "35%",
                hidden_phone: true,
                hidden_tablet:false
            },
            {
                name: "Enabled",
                tooltip: "Check if user is enabled",
                size: "10%",
                hidden_phone: false,
                hidden_tablet:false
            }
        ];
    },

    getEntries: function() {
        var entries = [];
        for (var index in this.model.models) {
            var user = this.model.models[index];

            var entry = {id: user.get('id'), cells: [{
                    value: user.get("name")
                },
                { value: user.get("email")
                },
                { value: user.get("enabled")
                }
                ]};
            entries.push(entry);
        }
        return entries;
    },

    onAction: function(action, userIds) {
        var user, usr, subview;
        var self = this;
        if (userIds.length === 1) {
            user = userIds[0];
            usr = this.model.get(user);
        }
        console.log(self.options);
        switch (action) {
            case 'create':
                subview = new CreateUserView({el: 'body', model:usr, tenants: self.options.tenants});
                subview.render();
                break;
            case 'edit':
                subview = new EditUserView({el: 'body', model:usr, tenants: self.options.tenants});
                subview.render();
                break;
            case 'disable':
                subview = new ConfirmView({el: 'body', title: "Confirm Disable Users", btn_message: "Disable Users", onAccept: function() {
                    userIds.forEach(function(user) {
                        usr = self.model.get(user);
                        if (usr.get("enabled") === true) {
                            usr.set("enabled", false);
                            usr.save(undefined, UTILS.Messages.getCallbacks("User " + usr.get("name") + " disabled", "Error disabling user " + usr.get("name")));
                        }
                    });
                }});
                subview.render();
                break;
            case 'enable':
                subview = new ConfirmView({el: 'body', title: "Confirm Enable Users", btn_message: "Enable Users", onAccept: function() {
                    userIds.forEach(function(user) {
                        usr = self.model.get(user);
                        if (usr.get("enabled") === false) {
                            usr.set("enabled", true);
                            usr.save(undefined, UTILS.Messages.getCallbacks("User " + usr.get("name") + " enabled", "Error enabling user " + usr.get("name")));
                        }
                    });
                }});
                subview.render();
                break;
            case 'delete':
                subview = new ConfirmView({el: 'body', title: "Confirm Delete Users", btn_message: "Delete Users", onAccept: function() {
                    userIds.forEach(function(user) {
                        usr = self.model.get(user);
                        usr.destroy(UTILS.Messages.getCallbacks("User " + usr.get("name") + " deleted", "Error deleting user " + usr.get("name")));
                    });
                }});
                subview.render();
                break;
        }
    },

    onClose: function () {
        this.tableView.close();
        this.undelegateEvents();
        this.unbind();
        clearInterval(this.timer);
    },

    renderFirst: function () {
        UTILS.Render.animateRender(this.el, this._template, this.model);
        this.tableView = new TableView({
            model: this.model,
            el: '#users-table',
            onAction: this.onAction,
            getDropdownButtons: this.getDropdownButtons,
            getMainButtons: this.getMainButtons,
            getHeaders: this.getHeaders,
            getEntries: this.getEntries,
            context: this
        });
        this.tableView.render();
        return this;
    },

    render: function() {
        if ($(this.el).html() !== null) {
            this.tableView.render();
        }
        return this;
    }
});
var TableTiersView = Backbone.View.extend({

    _template: _.itemplate($('#tableTiersTemplate').html()),

    cid: undefined,

    initialize: function() {
        // main_buttons: [{label:label, url: #url, action: action_name}]
        // dropdown_buttons: [{label:label, action: action_name}]
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        // entries: [{id:id, cells: [{value: value, link: link}] }]
        // onAction: function() {}
        this.cid = Math.round(Math.random() * 1000000);
        var events = {};
        events['click .btn-main-' + this.cid] = 'onMainAction';
        events['click .fi-icon-actions-' + this.cid] = 'onIconAction';
        this.delegateEvents(events);
        this.options.disableContextMenu = true;
    },

    getEntries: function() {
        var self = this;
        return this.options.getEntries.call(this.options.context);
    },

    getHeaders: function() {
        return this.options.getHeaders.call(this.options.context);
    },

    getDropdownButtons: function() {
        return this.options.getDropdownButtons.call(this.options.context);
    },

    getMainButtons: function() {
        return this.options.getMainButtons.call(this.options.context);
    },

    getActionButtons: function() {
        if (this.options.getActionButtons) {
            return this.options.getActionButtons.call(this.options.context);
        } else {
            return [];
        }
    },

    onAction: function(action, entries) {
        entries.forEach(function(entry) {
            entry.id = entry.id;
        });
        return this.options.onAction.call(this.options.context, action, entries);
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
    },

    onIconAction: function(evt) {
        var btn_idx = $(evt.target)[0].id.split("_" + this.cid)[0];
        var btn = this.getActionButtons()[btn_idx];
        var entry = $(evt.target).parent().parent().parent()[0].id.split("entries__row__")[1];
        var entries = [entry];
        this.onAction(btn.action, entries);
    },

    onMainAction: function(evt) {
        var btn_idx = $(evt.target)[0].id.split("_" + this.cid)[0];
        var btn = this.getMainButtons()[btn_idx];
        var entries = [];
        this.onAction(btn.action, entries);
    },

    render: function() {
        var entries = this.getEntries();
        var new_template = this._template({
            cid: this.cid,
            main_buttons: this.getMainButtons(),
            actions: this.getActionButtons(),
            headers: this.getHeaders(),
            entries: entries,
            color: this.options.color,
            color2: this.options.color2,
            dropdown_buttons_class: this.options.dropdown_buttons_class
        });

        var scrollTo = 0;
        if ($('.scrollable_' + this.cid).data('tsb')) {
            scrollTo = $('.scrollable_' + this.cid).data('tsb').getScroll();
            $('.scrollable_' + this.cid).data('tsb').stop();
        }
        $(this.el).html(new_template);
        $(".dial").knob();
        $('.scrollable_' + this.cid).tinyscrollbar({offsetTop: 0, offsetBottom: 0, scrollTo: scrollTo});
        return this;
    }
});
var TableView = Backbone.View.extend({

    _template: _.itemplate($('#tableTemplate').html()),
    cid: undefined,
    lastEntryClicked: undefined,
    lastEntries: [],
    orderBy: {},

    initialize: function() {
        console.log("initializing TableView");
        // main_buttons: [{label:label, url: #url, action: action_name}]
        // dropdown_buttons: [{label:label, action: action_name}]
        // headers: [{name:name, tooltip: "tooltip", size:"15%", hidden_phone: true, hidden_tablet:false}]
        // entries: [{id:id, cells: [{value: value, link: link}] }]
        // onAction: function() {}
        this.orderBy = {column: 0, direction: 'down'};
        this.cid = Math.round(Math.random() * 1000000);
        var events = {};
        events['click .btn-action-' + this.cid] = 'onDropdownAction';
        events['click .btn-main-' + this.cid] = 'onMainAction';
        events['change .checkbox_entries_' + this.cid] = 'changeActionButtons';
        events['change .checkbox_all_' + this.cid] = 'onBigCheck';
        events['contextmenu .entry_' + this.cid] = 'onContextMenu';
        events['click .btn-' + this.cid] = 'onContextMenuBtn';
        events['click .entry_' + this.cid] = 'onEntryClick';
        events['click .header_entry_' + this.cid] = 'onHeaderEntryClick';
        events['mousedown .entry_' + this.cid] = 'onEntryMouseDown';

        if (this.options.draggable || this.options.sortable) {
            events['dragstart .scrollable_' + this.cid + ' .tr'] = 'onDragStart';
        }
        if (this.options.dropable || this.options.sortable) {
            events['dragover .scrollable_' + this.cid + ' .vp'] = 'onDragOver';
            events['dragover .scrollable_' + this.cid + ' .tr'] = 'onDragOver';
            events['dragleave .scrollable_' + this.cid + ' .vp'] = 'onDragLeave';
            events['dragleave .scrollable_' + this.cid + ' .tr'] = 'onDragLeave';

            events['drop .scrollable_' + this.cid + ' .tr'] = 'onDrop';
            events['drop .scrollable_' + this.cid + ' .vp'] = 'onDrop';
        }
        this.options.draggable = this.options.draggable || false;
        this.options.dropable = this.options.dropable || false;
        this.options.sortable = this.options.sortable || false;

        this.delegateEvents(events);
        this.options.disableContextMenu = this.options.disableContextMenu || false;
        if (this.getDropdownButtons().length === 0 || this.options.disableContextMenu) {
            this.options.disableContextMenu = true;
        }
    },

    onDragStart: function(evt) {
        //evt.preventDefault();
        var entryId = $(evt.originalEvent.target)[0].id;
        var entry = $(evt.originalEvent.target)[0].id.split("entries__row__")[1];
        var entries = this.getEntries();
        for (var idx in entries) {
            var e = entries[idx];
            if ((e.id + "") === entry && e.isDraggable === false) return false;
        }
        //$("#" + entryId)[0].style.opacity = '0.4';
        UTILS.DragDrop.setData("EntryId", entryId);
        UTILS.DragDrop.setData("Draggable", this.options.draggable);
        UTILS.DragDrop.setData("From", this.cid);

        var resp = this.options.onDrag.call(this.options.context, entry);
        UTILS.DragDrop.setData("Data", resp);
        event.dataTransfer.setData('hola', 'hola');
    },

    onDragOver: function(evt) {
        evt.preventDefault();

        var item = $(evt.target);
        if (item[0].tagName === "TD") {
            item = item.parent();
        }
        if (this.isDroppable()) {
            item.addClass("over");
        }
    },

    isDroppable: function() {
        if (this.options.sortable || this.options.dropable) {
            if (UTILS.DragDrop.getData("Draggable") ||
                (!UTILS.DragDrop.getData("Draggable") && 
                    this.cid === UTILS.DragDrop.getData("From"))) {
                return true;
            }
        }
        return false;
    },

    onDragLeave: function(evt) {
        evt.preventDefault();

        var item = $(evt.target);
        if (item[0].tagName === "TD") {
            item = item.parent();
        }
        item.removeClass("over");
    },

    onDrop: function(evt) {
        evt.preventDefault();
        var entryId = UTILS.DragDrop.getData("EntryId");
        var parentId = $(evt.target).parent()[0].id;
        //$("#" + entryId)[0].style.opacity = '1';
        var item = $(evt.target);
        if (item[0].tagName === "TD") {
            item = item.parent();
        }
        item.removeClass("over");
        var data = UTILS.DragDrop.getData("Data");
        var targetId = item[0].id.split("entries__row__")[1];
        if (this.isDroppable()) {
            if (this.options.sortable && this.cid === UTILS.DragDrop.getData("From")) {
                this.options.onMove.call(this.options.context, targetId, data);
            } else {
                this.options.onDrop.call(this.options.context, targetId, data);
            }
        }
        UTILS.DragDrop.clear();
    },

    getSelectedEntries: function() {
        var entries = [];
        var data_entries = $(".checkbox_entries_" + this.cid + ":checked").each(function(id, cb) {
            entries.push($(cb).val());
        });
        return entries;
    },

    getEntries: function() {
        var self = this;
        var entries = this.options.getEntries.call(this.options.context);
        if (entries === 'loading') {
            return entries;
        }
        if (this.options.order === false) {
            return entries;
        }
        var order = 1;
        if (this.orderBy.direction === 'up') {
            order = -1;
        }
        return entries.sort(function (a,b) {
            if (a.cells[self.orderBy.column].value === b.cells[self.orderBy.column].value) {
                return 0;
            }
            if (a.cells[self.orderBy.column].value > b.cells[self.orderBy.column].value) {
                return order * 1;
            }
            return order * -1;
        });
    },

    getHeaders: function() {
        return this.options.getHeaders.call(this.options.context);
    },

    getDropdownButtons: function() {
        return this.options.getDropdownButtons.call(this.options.context);
    },

    getMainButtons: function() {
        return this.options.getMainButtons.call(this.options.context);
    },

    onAction: function(action, entries) {
        entries.forEach(function(entry) {
            entry.id = entry.id;
        });
        return this.options.onAction.call(this.options.context, action, entries);
    },

    onClose: function() {
        this.undelegateEvents();
        this.unbind();
    },

    onContextMenuBtn: function(evt) {

        evt.preventDefault();
        var btn_idx = $(evt.target)[0].id.split("_" + this.cid)[0];
        var btn = this.getDropdownButtons()[btn_idx];
        var entry = $("#context-menu-" + this.cid).attr("data-id");
        var entries = [];
        var data_entries = $(".checkbox_entries_" + this.cid + ":checked").each(function(id, cb) {
            entries.push($(cb).val());
        });
        if (entries.length === 0) {
            entries.push(entry);
        }
        this.onAction(btn.action, entries);
    },

    onContextMenu: function(evt) {
        evt.preventDefault();
        var entry;
        if ($(evt.target).parent().prop("tagName") === 'TR') {
            entry = $(evt.target).parent()[0].id.split("entries__row__")[1];
        } else {
            entry = $(evt.target).parent().parent()[0].id.split("entries__row__")[1];
        }
        this.onEntryClick(evt);
        var self = this;
        $("#context-menu-" + this.cid).attr("data-id", entry);
        var entries = [];
        var data_entries = $(".checkbox_entries_" + this.cid + ":checked").each(function(id, cb) {
            entries.push($(cb).val());
        });
        if (entries.length === 0) {
            entries.push(entry);
        }
        $('.btn-' + this.cid).each(function(id, button) {
            $(button).attr("disabled", !self.getDropdownButtons()[id].activatePattern(entries.length, entries));
        });
    },

    onEntryMouseDown: function(e) {
        if (e.ctrlKey || e.shiftKey) {
            // For non-IE browsers
            e.preventDefault();

            // For IE
            if ($.browser.msie) {
                this.onselectstart = function() {
                    return false;
                };
                var me = this; // capture in a closure
                window.setTimeout(function() {
                    me.onselectstart = null;
                }, 0);
            }
        }
    },

    onHeaderEntryClick: function(evt) {
        var node = $(evt.target)[0].nodeName;
        var self = this;
        if (node === "BUTTON" || node == "DIV") {
            var column =  parseInt($(evt.target).parent()[0].id.toString().substring(10), 10);
            if (this.orderBy.column === column) {
                if (this.orderBy.direction === 'up') {
                    this.orderBy.direction = 'down';
                } else {
                    this.orderBy.direction = 'up';
                }
            } else {
                this.orderBy.column = column;
                this.orderBy.direction = 'down';
            }
            this.render();
        }
    },

    onEntryClick: function(evt) {
        var node = $(evt.target)[0].nodeName;
        var self = this;
        if (node !== "INPUT" && node !== "LABEL") {
            var parentId = $(evt.target).parent()[0].id;
            if (node !== "TD") {
                parentId = $(evt.target).parent().parent()[0].id;
            }
            var parentEntry = parentId.split("entries__row__")[1];
            var metaKey = evt.metaKey || evt.altKey;
            if (evt.shiftKey && !metaKey) {
                this.checkNone();
            }
            if (evt.shiftKey) {
                // Multiple consecutive selection
                var entries = [];
                var inside = false;
                var stopped = false;
                this.lastEntryClicked = this.lastEntryClicked || parentEntry;
                this.uncheckRange(this.lastEntries);
                this.getEntries().forEach(function(entry) {
                    if (inside) {
                        entries.push(entry.id);
                    }
                    if (entry.id === self.lastEntryClicked) {
                        inside = !inside;
                        entries.push(entry.id);
                    }
                    if (entry.id === parentEntry) {
                        entries.push(entry.id);
                        inside = !inside;
                    }
                });
                this.checkRange(entries);
                this.lastEntries = entries;
            } else if (metaKey) {
                // Multiple non-consecutive selection. Do nothing.
                var checked = $("[id='" + parentId + "'] .checkbox").attr('checked');
                if (evt.type === "contextmenu" && !checked) {
                    $("[id='" + parentId + "'] .checkbox").attr('checked', !checked);
                }
                this.lastEntries = [];
                this.lastEntryClicked = parentEntry;
            } else {
                this.checkNone();
                $("[id='" + parentId + "'] .checkbox").attr('checked', true);
                this.lastEntries = [];
                this.lastEntryClicked = parentEntry;
            }
        }
        this.changeActionButtons();
    },

    checkRange: function(entries) {
        entries.forEach(function(entry) {
            $("[id='entries__row__" + entry + "'] .checkbox").attr('checked', true);
        });
    },

    uncheckRange: function(entries) {
        entries.forEach(function(entry) {
            $("[id='entries__row__" + entry + "'] .checkbox").attr('checked', false);
        });
    },

    onBigCheck: function() {
        if ($(".checkbox_all_" + this.cid + ":checked").size() > 0) {
            this.checkAll();
        } else {
            this.checkNone();
        }
    },

    checkAll: function() {
        $(".checkbox_entries_" + this.cid).attr('checked', 'checked');
        this.changeActionButtons();
    },

    checkNone: function() {
        $(".checkbox_entries_" + this.cid).attr('checked', false);
        this.changeActionButtons();
    },

    changeActionButtons: function() {
        var self = this;
        var entries = [];
        $(".checkbox_entries_" + this.cid + ":checked").each(function(id, cb) {
            entries.push($(cb).val());

        });
        var size = $(".checkbox_entries_" + this.cid + ":checked").size();
        if (size < self.getEntries().length) {
            $(".checkbox_all_" + this.cid + ":checked").attr('checked', false);
        }

        $(".checkbox_entries_" + this.cid).parent().parent().each(function(id, tr) {
            $(tr).children().css("background-color", "");
        });


        $(".checkbox_entries_" + this.cid + ":checked").parent().parent().each(function(id, tr) {
            $(tr).children().css("background-color", "#e9e9e9");
        });

        $('.btn-action-' + this.cid).each(function(id, button) {
            $(button).attr("disabled", !self.getDropdownButtons()[id].activatePattern(size, entries));
        });
    },

    onMainAction: function(evt) {
        var btn_idx = $(evt.target)[0].id.split("_" + this.cid)[0];
        var btn = this.getMainButtons()[btn_idx];
        var entries = [];
        this.onAction(btn.action, entries);
    },

    onDropdownAction: function(evt) {
        evt.preventDefault();
        var btn_idx = $(evt.target)[0].id.split("_" + this.cid)[0];
        var btn = this.getDropdownButtons()[btn_idx];
        var entries = [];
        var data_entries = $(".checkbox_entries_" + this.cid + ":checked").each(function(id, cb) {
            entries.push($(cb).val());
        });
        this.onAction(btn.action, entries);
    },

    render: function() {
        console.log("tableview start render");
        var entries = this.getEntries();
        var new_template = this._template({
            cid: this.cid,
            actionsClass: this.options.actionsClass,
            headerClass: this.options.headerClass,
            bodyClass: this.options.bodyClass,
            footerClass: this.options.footerClass,
            main_buttons: this.getMainButtons(),
            dropdown_buttons: this.getDropdownButtons(),
            disableActionButton: this.options.disableActionButton,
            headers: this.getHeaders(),
            entries: entries,
            draggable: this.options.draggable,
            droppable: this.options.droppable || this.options.sortable,
            disableContextMenu: this.options.disableContextMenu,
            dropdown_buttons_class: this.options.dropdown_buttons_class,
            orderBy: this.orderBy
        });
        var checkboxes = [];
        var checkboxAll = false;
        var dropdowns = [];
        var index, id, check, drop, drop_actions_selected;
        for (index in entries) {
            id = entries[index].id;
            if ($("#checkbox_" + id).is(':checked')) {
                checkboxes.push(id);
            }
            if ($(".checkbox_all_" + this.cid).is(':checked')) {
                checkboxAll = true;
            }
            if ($("#dropdown_" + id).hasClass('open')) {
                dropdowns.push(id);
            }
            if ($(".dropdown_actions_" + this.cid).hasClass('open')) {
                drop_actions_selected = true;
            }
        }
        var contextMenuOpen = $("#context-menu-" + this.cid).hasClass("open");
        var contextMenuTop, contextMenuLeft, contextMenuData, attributes;
        if (contextMenuOpen) {
            contextMenuTop = $("#context-menu-" + this.cid).css('top');
            contextMenuLeft = $("#context-menu-" + this.cid).css('left');
            contextMenuData = $("#context-menu-" + this.cid).attr("data-id");
            attributes = [];
            $('.btn-' + this.cid).each(function(id, button) {
                attributes.push($(button).attr("disabled"));
            });
        }
        var scrollTo = 0;
        if ($('.scrollable_' + this.cid).data('tsb')) {
            scrollTo = $('.scrollable_' + this.cid).data('tsb').getScroll();
            $('.scrollable_' + this.cid).data('tsb').stop();
        }
        $(this.el).html(new_template);
        //$(".scrollable_" + this.cid).scrollTop(scrollTo);
        for (index in checkboxes) {
            id = checkboxes[index];
            check = $("#checkbox_" + id);
            if (check.html() != null) {
                check.prop("checked", true);
            }
        }

        if (checkboxAll) {
            check = $(".checkbox_all_" + this.cid);
            check.prop("checked", true);
        }

        for (index in dropdowns) {
            id = dropdowns[index];
            drop = $("#dropdown_" + id);
            if (drop.html() != null) {
                drop.addClass("open");
            }
        }
        if (($(".dropdown_actions_" + this.cid).html() !== null) && (drop_actions_selected)) {
            $(".dropdown_actions_" + this.cid).addClass("open");
        }
        if (contextMenuOpen) {
            $("#context-menu-" + this.cid).addClass("open");
            $("#context-menu-" + this.cid).css('position', 'fixed');
            $("#context-menu-" + this.cid).css('top', contextMenuTop);
            $("#context-menu-" + this.cid).css('left', contextMenuLeft);
            $("#context-menu-" + this.cid).attr("data-id", contextMenuData);
            attributes = attributes.reverse();
            $('.btn-' + this.cid).each(function(id, button) {
                $(button).attr("disabled", attributes.pop());
            });
        }
        this.changeActionButtons();
        $('.scrollable_' + this.cid).tinyscrollbar({offsetTop: 0, offsetBottom: 0, scrollTo: scrollTo});
        
        console.log("tableview end render");
        return this;
    }
});

var TopBarView = Backbone.View.extend({

    _template: _.itemplate($('#topBarTemplate').html()),
    _templateUser: _.itemplate($('#userTemplate').html()),

    initialize: function() {
        this.model.bind('change:title', this.renderTitle, this);
        this.model.bind('change:subtitle', this.renderTitle, this);
        this.options.loginModel = UTILS.GlobalModels.get("loginModel");
        this.options.loginModel.bind('change:username', this.render, this);
        this.options.loginModel.bind('change:gravatar', this.render, this);
    },
    
    render: function () {
        var self = this;
        this.model.set({'username': this.options.loginModel.get('username')});
        this.model.set({'gravatar': this.options.loginModel.get('gravatar')});
        $(self.el).empty().html(self._template(self.model));
        $("#userbar").html('');
        $('#oil-nav .navbar-inner').append(self._templateUser(self.model));
        return this;
    },

    renderTitle: function() {
        var html = '<h2 class="in-big-title" data-i18n="'+this.model.get('title') +'">'+this.model.get('title');
        if (this.model.has('subtitle')) {
            html += '<small>' + this.model.get('subtitle') + '</small>';
        }
        html += '</h2>';
        $('#page-title').html(html);
        return this;
    }
});