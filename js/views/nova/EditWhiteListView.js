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