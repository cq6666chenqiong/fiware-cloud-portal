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