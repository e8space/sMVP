/**
 * sMvp Collection
 * (c) 2014 kuema
 */

var Collection = (function(){
	
	function Collection(model){
	
		var _urlRoot = model.getUrlRoot().split('/')[1];
		var _collection = {};
		var _keys = Object.keys(model.getObjectRepresentation()).sort();
		
		/**
		 * @hint add model
		 * @param model
		 * @returns Boolean
		 */
		this.addModel = function(model){
			if (JSON.stringify(_keys) == JSON.stringify(Object.keys(model.getObjectRepresentation()))) {
				_collection[model.getObjectRepresentation().id] = model.getObjectRepresentation();
				return true;
			}
			return false;	
		};
				
		/**
		 * @hint read model
		 * @param id
		 * @returns model
		 */
		this.readModel = function(id){
			return new Model(_collection[id]);
			
		};
		
		/**
		 * @hint read models
		 * @returns models
		 */
		this.readModels = function(){
			var models = {};
			$.each(_collection, function(key,value){
				models[key] = new Model(value);
			});
			
			return models;
		};
		
		/**
		 * @hint read collection
		 * @returns collection
		 */
		this.getCollection = function(){
			return _collection;
		};
		
		/**
		 * @hint set collection 
		 * @param collection
		 */
		this.setCollection = function(collection){
			_collection = collection;
		};
		
		/**
		 * @hint get Url root
		 * @return urlRoot
		 */
		this.getUrlRoot = function(){
			return _urlRoot;
		};
	}
	
	/**
	 * @hint fetch collection
	 * @returns collection
	 */
	Collection.prototype.fetch = function(){
		var collection = {};
		var data = smvp.dataGateway.fetchCollection(this);
		$.each(data,function(key,value){
			collection[key]= value;
		});
		this.setCollection (collection);
		return this.getCollection();
	};
		
	/**
	 * @hint post collection
	 */
	Collection.prototype.post = function(){
		smvp.dataGateway.postCollection(this);
	};
		
	return Collection;
})();