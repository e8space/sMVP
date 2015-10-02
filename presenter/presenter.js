/**
 * sMvp Presenter
 * base for all sMvp presenters
 * (c) 2014 mk
 */
var Presenter = (function(){

	/**
	 * constructor
	 * @param view
	 * @param model
	 */
    function Presenter(view, model){
        
    	//private members
    	var self    	= this;
        var _view   	= view;
        var _model      = model;
        var _subTriads 	= {};
        
        
        if (typeof model.getSubTriads ==='function') {
	        $.each(model.getSubTriads(), function(index, value){
	        	_subTriads[value+'Model']= demo[value+'Model'];
	        	_subTriads[value+'Presenter'] = Object.create(Presenter.prototype,{});
	        	Presenter.call(_subTriads[value+'Presenter'], new View(_subTriads[value+'Model']),_subTriads[value+'Model']);
	        });
        }
        
        //getters
        this.getView		= function(){ return _view; };
        this.getModel		= function(){ return _model; };
        this.getSubTriads	= function(){ return _subTriads; };
        
        //application events
        $(document).bind("modelChanged_"+self.getModel().getId(), function(o,data){
            self.renderView.call();
        });
    }
        
    Presenter.prototype = {
	
    	/**
    	 * @hint sets event handler on view-element according to data-event attribute
    	 * @param base
    	 * @return this
    	*/
    	setEventDelegate : function(base){
    		var dataId=this.getModel().model.getId();
    		var event = $('#'+dataId).attr('data-event');
    		$('#'+dataId).off(event);
    		if (typeof (event) != 'undefined') {
    			$('#'+dataId).on(event,function(element){
    				base[dataId+"_event"]({element:element,value:$('#'+dataId).val()});
         		});
         	};
      		return this;
    	},
    		
    	 /**
    	 * @hint removes event handler on view-element according to event-data attribute
    	 * @return this
    	 */
        removeEventDelegate : function(){
        	var dataId=this.getModel().getId();
        	var event = $('[data-id='+dataId+']').attr('data-event');
        	$('[data-id='+dataId+']').off(event, self.handler);
        },

    	/**
    	 * @hint renders view and subviews
    	 * @param callback
    	 * @param base
    	 * @return this
    	 */
		renderView : function(callback,base){
			var self = this;
			var basePresenter = base || self;
			
    		this.getView().render(this.getModel(), function(){
    			self.setEventDelegate(basePresenter);
        		var subTriads = self.getModel().getSubTriads();
        		var subTriadsSize = subTriads.length;
        		subTriadsSize == 0 ? callback() : false;
        		
        		for (var triad in subTriads)(function() {
        			self.getSubTriads()[subTriads[triad]+"Presenter"].renderView( function(){
        				subTriadsSize --;
        			},basePresenter);
        			subTriadsSize == 0 ? callback() : false;
        		})();
    		});
    		return this;
    	},

        /**
         *  @hint hides view without removing elements and handlers
         */
    	hideView : function(){
    		this.getView().hide();
    	},
    	
    	/**
    	 * @hint shows view
    	 */
    	showView : function(){
    		this.getView().show();
    	},
    
    	/**
    	 * @hint deletes view and related subviews and handlers
    	 */
    	destroyView : function(){
    		
    		var self = this;
    		var subTriads = self.getSubTriads();
    		for (triad in subTriads) {
    			self[subTriads[triad]+'_presenter'].destroyView();
    		};
    		self.removeEventDelegate();
    		this.getView().destroy();
    		$(document).trigger("destroyView_"+this.getModel().getId());
    	}
    };
    
    return Presenter;
})();