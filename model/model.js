/**
 * sMvp Model
 * (c) 2014 kuema
 */

var Model = (function(){
	
	function Model (properties){
	
		var self =this;
        this.properties	= properties || {};

		//define getter and setter according to _jsonRep
		this.setGettersSetters = function(data){
		
			jQuery.extend(self.properties, data);
			for (var obj in data){ (function(){
				var cObj = obj;
				
				self["set"+obj.ucfirst()] = function(value){
					self.properties[cObj] = value;
					return this;
				};
				
				self["get"+obj.ucfirst()] = function(extensionNumber){
					return self.properties[cObj];
				};
				
			})();}
		};
        this.setGettersSetters(self.properties);
	};
	
	Model.prototype = {
			
		/**
		 * @hint create new instance by cloning
		 * @returns {Model}
		 */
		clone : function(){
			return new Model(this.getObjectRepresentation());
		},	
		
		/**
		 * @hint get model properties as object
		 * @returns {Object}
		 */
		getObjectRepresentation : function(){
			var objRepresentation = {};
            for (obj in this.properties){
                objRepresentation[obj]=this["get"+obj.ucfirst()]();
            }
            return objRepresentation;
		},
		
		/**
		 * @hint set model properties from object
		 * @param objRepresentation
		 */
		setObjectRepresentation : function(objRepresentation){
			for (obj in objRepresentation){
				this["set"+obj.ucfirst()](objRepresentation[obj]);
			}
		},
		
		/**
		 * @hint get model properties as JSON 
		 * @returns string
		 */
		getJsonRepresentation : function(){
			return JSON.stringify(this.properties);
		},
		
		/**
		 * @hint set model properties from JSON
		 * @param jsonRep
		 */
		setJsonRepresentation : function(jsonRepresentation){
			var objectRepresentation = JSON.parse(jsonRepresentation);
			for(obj in objectRepresentation){
				this["set"+obj.ucfirst()](objectRepresentation[obj]);
			}
		},	
		
        /**
         * @hint post model
         * @returns {Model}
         */
        post: function(){
			try {
				var self = this;
				var extendedProperties= smvp.dataGateway.postModel(this.getObjectRepresentation());
				jQuery.extend(self.properties, extendedProperties);
				$.each(extendedProperties, function(key,value){
					if(typeof self["get"+key.ucfirst()] == 'undefined') {
						var obj = {};
						obj[key] = value;
						self.setGettersSetters(obj);
					}
				});
				return this;
			} catch (e){
                console.log(e);
			}
		},

        /**
         * @hint fetch model
         * @returns {Model}
         */
        fetch : function(){
        	try {
        		this.setGettersSetters(smvp.dataGateway.fetchModel(this.getObjectRepresentation()));
        		return this;
        	} catch (e){
        		console.log(e);
        	}
		},

        /**
         * @hint update model
         * @returns {Model}
         */
		update : function(){
            try {
            	smvp.dataGateway.updateModel(this.getObjectRepresentation());
                return this;
            } catch (e){
                console.log(e);
            }
		},

        /**
         * @hint destroy model
         * @returns true or undefined
         */
		destroy : function(){
			try {
				return smvp.dataGateway.deleteModel(this.getObjectRepresentation());
			} catch (e) {
                console.log(e); 
			}
		}
	};
	
	return Model;
})();