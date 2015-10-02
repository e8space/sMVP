/**
 * sMvp DataGateway
 * (c) 2014 kuema
 */

var DataGateway = (function(){
	
	function DataGateway(ajaxHandler){
		
		this.postModel = function(model){
			ajaxHandler.post(model.link,model,function(data){
				return data;
			});
		};
		
		this.fetchModel = function(model){
			ajaxHandler.get(model.link, function(data){
				return data;
			});
		};
		
		this.updateModel = function(model){
			ajaxHandler.put(model.link,model,function(data){
				return data;
			});
		};
		
		this.deleteModel = function(model){
			ajaxHandler.destroy(model.link, function(data){
				return data;
			});
		};
		
		this.postCollection = function(collection){
			ajaxHandler.post(collection.getUrlRoot(), collection, function(data){
				return data;
			});
		};
		
		this.fetchCollection = function(collection) {
			ajaxHandler.get(collection.getUrlRoot(), function(data){
				return data;
			});
		};
		
		this.deleteCollection = function(collection){
			ajaxHandler.destroy(collection.getUrlRoot(), function(data){
				return data;
			});
		};
	}
	
	return DataGateway;
})();