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