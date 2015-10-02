/**
 * sMvp View
 * base for all sMvp views
 * (c) 2014 kuema
 */
var View = (function(){
   
//constructor
    function View(model){
    	
//private members
        var _template = $('#'+model.getTemplate()).html();
        var _container = model.getContainer();
      
//getter / setter
        this.getTemplate = function (){ return _template; };
        this.setTemplate = function (template){ _template = template; return this;};
        
        this.getContainer = function(){ return _container; };
		this.setContainer = function(container){_container = container; return this;};
        
		 $(_container).empty();
    }
    
//public 
    View.prototype  = {

        /**
         * @hint render view
         * @param data
         * @param callback
         */
        render	: function(data,callback){
        	$("[id^="+this.getContainer()+"]")
        	    .html(_.template(this.getTemplate())(data));
        	try {
        		$("#"+this.getContainer()).find('select').select2({placeholder: data.getSelect2Placeholder()});
        	} catch(e) {}

			typeof(callback) !='undefined' ? callback() : false;
        },
        
        /**
         * @hint hide view
         */
        hide : function(){
        	$("#"+this.getContainer()).hide();
        },

        /**
         * @hint show view
         */
        show : function(){
        	$("#"+this.getContainer()).show();
        },

        /**
         * @hint destroy view
         */
        destroy : function(){
            $("#"+this.getContainer()).off().empty();
        	$.publish("viewDestroyed_"+this.getContainer());
        }
    };

    return View;
})();
