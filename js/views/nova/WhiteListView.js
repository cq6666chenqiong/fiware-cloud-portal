var WhiteListView = Backbone.View.extend({

    _template: _.itemplate($('#whiteListTemplate').html()),
    tableView:undefined,


    events: {
        'click #cancelCreateBtn': 'close',
        'click .close': 'close',
        'click #delWhiteList':'delWhiteList',
        'click #w_whiteList_add': 'addWhiteList'
    },

    initialize: function() {
        this.model = new WhiteListModels();
        this.model.getWhiteList(null,this);
    },

    proRender: function(){
        $('#whitelist').empty();
        this.render();
    },

    delWhiteList:function(e){
        var whiteId = $(e.target).attr("attrId");
        var url = "";
        for(var i=0;i<this.model.length;i++){
            if(this.model.models[i].id==whiteId){
                url = this.model.models[i].get("url");
            }
        }
        this.model.delWhiteList(url,this);
    },

    render: function () {
        $(this.el).append(this._template({ model: this.model}));
        var header = {"url":"url","operate":"操作"};
        this.tableView = new SmalltableView({
            el: '#w_whitelist-table',
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
        while($('#whitelist').html()!=null||$('.modal-backdrop').html()!=null){
             $('#whitelist').remove();
             $('.modal-backdrop').remove();
        }
        this.onClose();
    },

    onClose: function () {
        this.undelegateEvents();
        this.unbind();
    },

    addWhiteList: function() {
        alert("add");
        var param = $('#w_whitelist_form').serialize();
        param = param.replace(/&/g, "','" );
        param = param.replace(/=/g, "':'" );
        param = "({'" +param + "'})" ;
        param = eval(param);
        //var a = $("#abc").serialize().split("%0D%0A");
        alert(JSON.stringify(param));
        this.model.addWhiteList(param,this);
    }

});