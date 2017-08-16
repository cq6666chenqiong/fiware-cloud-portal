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

