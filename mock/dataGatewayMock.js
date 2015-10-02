/**
 * sMvp DataGatewayMock
 * (c) 2014 kuema
 */

var DataGatewayMock = (function(){
	
	function DataGatewayMock(ajaxHandler){
		
		/**
		 * @hint post model
		 * @param model
		 */
		this.postModel = function(model){
			var resource = model.urlRoot.split('/')[1];
			var id = resource+(Object.keys(mockData[resource]).length+1);
			
			model.id = id;
			model.link = model.urlRoot+"/"+id;
			mockData[resource][id]=model;
			return mockData[resource][id];
		};
		
		/**
		 * @fetch model
		 * @param model
		 */
		this.fetchModel = function(model){
			var resource = model.urlRoot.split('/')[1];
			return mockData[resource][model.id];
		};
		
		/**
		 * @hint update model
		 * @param model
		 */
		this.updateModel = function(model){
			var resource = model.urlRoot.split('/')[1];
			var id = model.id;
			mockData[resource][id] = model;
			return mockData[resource][id];
		};
		
		/**
		 * @hint delete model
		 * @param model
		 */
		this.deleteModel = function(model){
			var resource = model.urlRoot.split('/')[1];
			var id = model.id;
			delete mockData[resource][id];
			return true;
		};
		
		/**
		 * @hint post collection
		 * @param collection
		 */
		this.postCollection = function(collection){
			$.each(collection.getCollection(), function(key,value){
				mockData[collection.getUrlRoot()][key]= value;
			});
		};
		
		/**
		 * @hint fetch collection
		 * @param collection
		 */
		this.fetchCollection = function(collection) {
			return mockData[collection.getUrlRoot()];
		};
		
		/**
		 * @hint delete collection
		 * @param collection
		 */
		this.deleteCollection = function(collection){
			delete mockData[collection.getUrlRoot()];
		};
	}
	
	return DataGatewayMock;
})();