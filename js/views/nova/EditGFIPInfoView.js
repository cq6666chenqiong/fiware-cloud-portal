var EditGFIPInfoView = Backbone.View.extend({

    _template: _.itemplate($('#editGaoFangIPInfoTemplate').html()),

    events: {
        'click #cancelCreateBtn': 'close',
        'click .close': 'close',
        'submit #form_gaofangipInfo': 'updateGFIPInfo'
        //'click .modal-backdrop': 'close'
    },

    proRender:function(){
        while($('#edit_info').html()!=null||$('.modal-backdrop').html()!=null){
            $('#edit_info').remove();
            $('.modal-backdrop').remove();
        }
        this.render();
    },

    render: function () {
        $(this.el).append(this._template({ model: this.model}));
        $('.modal:last').modal();
        return this;
    },

    close: function(e) {
        $('#edit_info').remove();
        $('.modal-backdrop').remove();
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

