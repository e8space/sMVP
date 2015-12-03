/**
 * SMVP 1.2
 * javascript MVP framework
 * 2015 mk
 */

var SMVP = (function(){
	
	var _dataGateway = null;
	String.prototype.ucfirst = function(){
		return this.charAt(0).toUpperCase() + this.substr(1);
	};	
	
	
	var API = {
			
			setDataGateway : function(dataGateway){
				_dataGateway = dataGateway;
			},
			
			/**
			 * Model
			 */
			Model : (function(){
				
				/**
				 * @constructor
				 * @param properties
				 */
				function Model (properties){
				
					var self =this;
			        this.properties	= properties || {};
			        this.cleanProperties = $.extend(true,{},properties);

					//define accessors according to properties
					this.setGettersSetters = function(data){
					
						jQuery.extend(true, self.properties, data);
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
					
					//update properties and accessors according to json
					this.updatePropertiesAndAccessors = function(json){
						jQuery.extend(true,self.properties, json);
	        			$.each(json, function(key,value){
							if(typeof self["get"+key.ucfirst()] == 'undefined') {
								var obj = {};
								obj[key] = value;
								self.setGettersSetters(obj);
							}
							self["set"+key.ucfirst()](value);
						});
					}
					
			        this.setGettersSetters(self.properties);
				};
				
				Model.prototype = {
						
					/**
					 * @hint create new instance by cloning
					 * @returns {Model}
					 */
					clone : function(){
						return new SMVP.Model(this.getObjectRepresentation());
					},
					
					/**
					 * @hint create new instance without values
					 * @return {Model}
					 */
					cloneClean : function(){
						return new SMVP.Model(this.cleanProperties);
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
			        post: function(callback){
						try {
							var self = this;
							_dataGateway.postModel(this.getObjectRepresentation(), function(response){
								response.status == 201 
									? self.updatePropertiesAndAccessors(response.data) 
									: $(document).trigger("dataGatewayError", {statusCode:response.status, message:response.data});
								typeof callback!= 'undefined' ? callback (self) : false;
							});
						} catch (e){
			                console.log(e);
						}
					},

			        /**
			         * @hint fetch model
			         * @returns {Model}
			         */
			        fetch : function(callback){
			        	try {
			        		var self = this;
			        		_dataGateway.fetchModel(this.getObjectRepresentation(), function(response){
			        			response.status == 200
			        				? self.updatePropertiesAndAccessors(response.data)
			        				:  $(document).trigger("dataGatewayError", {statusCode:response.status, message:response.data});
				        		typeof callback!= 'undefined' ? callback (self) : false;
			        		});
			        	} catch (e){
			        		console.log(e);
			        	}
					},

			        /**
			         * @hint update model
			         * @returns {Model}
			         */
					update : function(callback){
			            try {
			            	var self = this;
			            	_dataGateway.updateModel(this.getObjectRepresentation(),function(response){
			            		response.status == 200
			            			? true
			            			: $(document).trigger("dataGatewayError", {statusCode:response.status, message:response.data});
			            		typeof callback!= 'undefined' ? callback (self) : false;
			            	});
			            } catch (e){
			                console.log(e);
			            }
					},

			        /**
			         * @hint destroy model
			         */
					destroy : function(callback){
						try {
							var self = this;
							_dataGateway.deleteModel(this.getObjectRepresentation(),function(response){
								response.status == 200
								? self = null
								: $(document).trigger("dataGatewayError", {statusCode:response.status, message:response.data});
								typeof callback!= 'undefined' ? callback (self) : false;
							});
						} catch (e) {
			                console.log(e); 
						}
					}
				};
				
				return Model;
			})(),
			
			/**
			 * Collection
			 */
			Collection : (function(){
				
				/**
				 * @constructor
				 * @param model
				 */
				function Collection(model,name){
				
					var _urlRoot = model.getUrlRoot().split('/')[1];
					var _name = name;
					var _collection = {};
					var _models = {};
					var _keys = Object.keys(model.getObjectRepresentation()).sort();
					
					/**
					 * @hint add model
					 * @param model
					 * @returns Boolean
					 */
					this.addModel = function(model){
						if (JSON.stringify(_keys) == JSON.stringify(Object.keys(model.getObjectRepresentation()).sort())) {
							if (model.getObjectRepresentation().id != "") {
								_collection[model.getObjectRepresentation().id] = model.getObjectRepresentation();
								_models[model.getObjectRepresentation().id] = model;
							} else {
								model.setId(_helper.uuid());
								_collection[model.getId()] = model.getObjectRepresentation();
								_models[model.getId()] = model;
							}
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
						if (typeof _models[id] == 'undefined') {
							typeof _collection[id] != 'undefined' ? _models[id] = new SMVP.Model(_collection[id]) : false;
						}
						return _models[id];
					};
					
					/**
					 * @hint get models
					 * @return models
					 */
					this.getModels = function(){
						return _models;
					}
					
					/**
					 * @hint read models
					 * @returns models
					 */
					this.readModels = function(){
						if ($.isEmptyObject(_models)) {
							$.each(_collection, function(key,value){
								_models[key] = new SMVP.Model(value);
							});
						}
						return _models;
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
				 * @hint post collection
				 */
				Collection.prototype.post = function(callback){
					var self = this;
					_dataGateway.postCollection(this, function(response){
						response.status == 200
							? self.setCollection(response.data)	
							: $(document).trigger("dataGatewayError", {statusCode:response.status, message:"post collection failed"});
						typeof callback !='undefined' ? callback(self) : false;
					});
				};
				
				/**
				 * @hint fetch collection
				 * @returns collection
				 */
				Collection.prototype.fetch = function(callback){
					var self = this;
					_dataGateway.fetchCollection(this, function(response){
						response.status == 200
							? self.setCollection(response.data)
							: $(document).trigger("dataGatewayError", {statusCode:response.status, message:"fetch collection failed"});
						typeof callback != 'undefined' ? callback(self) : false;
					});
				};
					
				/**
				 * @hint update collection
				 * @returns collection
				 */
				Collection.prototype.update = function(callback){
					var self = this;
					_dataGateway.updateCollection(this, function(response){
						response.status == 200
							? self.setCollection(response.data)
							: $(document).trigger("dataGatewayError", {statusCode:response.status, message:"update collection failed"});
						typeof callback !='undefined' ? callback(self) : false;
					});
				}
				
				/**
				 * @hint delete collection
				 * @return response code
				 */
				Collection.prototype.destroy = function(callback){
					_dataGateway.deleteCollection(this, function(){
						typeof callback !='undefined' ? callback(self) : false;
					});
				}
					
				return Collection;
			})(),
			
			/**
			 * View
			 */
			View : (function(){
				   
				/**
				 * @constructor
				 * @param model
				 */
				function View(model){
					//private members
					var _model = $.extend(true,{}, model);
			        var _template = $('#'+_model.getTemplate()).html();
			        var _container = _model.getContainer();
			        
				      
			        //getter/setter
			        this.getTemplate = function (){ return _template; };
			        this.setTemplate = function (template){ _template = template; return this;};
			        
			        this.getContainer = function(){ return _container; };
					this.setContainer = function(container){_container = container; return this;};
			        
					this.getModel = function(){
						return _model;
					}; 
				
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
			        	$("[data-container="+this.getContainer()+"]").html(_.template(this.getTemplate())(data));
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
			        
			        refresh : function(data,callback){
			        	$("[id^="+this.getContainer()+"]").find("input").val("");
			        	typeof(callback) !='undefined' ? callback() : false;
			        },

			        /**
			         * @hint destroy view
			         */
			        destroy : function(callback){
			            $("#"+this.getContainer()).off().empty();
			        	typeof(callback) !='undefined' ? callback() : false;
			        }
			    };

			    return View;
			})(),

			/**
			 * Presenter
			 */
			Presenter : (function(){
				
				/**
				 * @constructor
				 * @param view
				 * @param model
				 */
			    function Presenter(view, model){
			   
			    	//private members
			    	var self    	= this;
			        var _view   	= view;
			        var _model      = model;
			        var _subTriads 	= {};
			        
			        if (typeof _view.getModel().getSubTriads ==='function') {
				        $.each( _view.getModel().getSubTriads(), function(index, value){
				        	_subTriads[value+'Presenter'] = Object.create(Presenter.prototype,{});
				        	Presenter.call(_subTriads[value+'Presenter'], new SMVP.View(SMVP[value+'Model']),SMVP[value+'Model']);
				        });
			        }
			        
			        //getters
			        this.getView = function(){ return _view; };
			        this.getModel = function(){ return _model; };
			        this.getSubTriads = function(){ return _subTriads; };
			        
			        //application events
			        $(document).bind("modelChanged_"+self.getModel().getId(), function(o,data){
			            self.renderView.call();
			        });
			        
			        $(document).bind("collectionChanged_"+self.getModel().getId(), function(o,data){
			        	self.renderView();
			        });
			    	
			    }
			        
			    Presenter.prototype = {
				
			    	/**
			    	 * @hint sets event handler on view-element according to data-event attribute
			    	 * @param base
			    	 * @return this
			    	*/
			    	setEventDelegate : function(base){
			    		var dataId=this.getModel().getId();
			    		var event = $('#'+dataId).attr('data-event');
			    		$('#'+dataId).off(event);
			    		if (typeof (event) != 'undefined') {
			    			$('#'+dataId).on(event,function(element){
			    				base[dataId+"_event"]({element:element,value:$('#'+dataId).val(), targetValue:element.target.value});
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
			        	$('#'+dataId).off(event);
			        },

			    	/**
			    	 * @hint renders view and subviews
			    	 * @param callback
			    	 * @param base
			    	 * @return this
			    	 */
					renderView : function(base, callback){
						var self = this;
						
			    		this.getView().render(this.getModel(), function(){
			    			self.setEventDelegate(base);
			        		var subTriads = self.getSubTriads();
			        		var subTriadsSize = Object.keys(subTriads).length;
			        		
			        		if (subTriadsSize == 0 && typeof callback != 'undefined') {
			        			callback();
			        		}
			        		
			        		for (var triad in subTriads)(function() {
			        			subTriads[triad].renderView(base, function(){
			        				subTriadsSize --;
			        			});
			        			if (subTriadsSize == 0 && typeof callback != 'undefined') {
				        			callback();
				        		}
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
			    	destroyView : function(callback){
			    		var self = this;
			    		var subTriads = self.getSubTriads();
			    		/*for (triad in subTriads) {
			    			subTriads[triad].destroyView();
			    		};*/
			    		self.removeEventDelegate();
			    		this.getView().destroy();
			    		typeof(callback) !='undefined' ? callback() : false;
			    	}, 
			    	
			    	/**
			    	 * @hint refreshs view
			    	 */
			    	refreshView : function(callback){
			    		var self = this;	
			    		this.getView().refresh(this.getModel(), function(){
			    			var subTriads = self.getSubTriads();
			    			var subTriadsSize = Object.keys(subTriads).length;
			        		if (subTriadsSize == 0 && typeof callback != 'undefined') {
			        			callback();
			        		}
			    			for (var triad in subTriads)(function() {
			    				subTriads[triad].refreshView( function(){
			        				subTriadsSize --;		
			        			});
			        			if (subTriadsSize == 0 && typeof callback != 'undefined') {
				        			callback();
				        		}
			    			})();
			    		})
			    	}
			    };
			    
			    return Presenter;
			})(),
			
			/**
			 * DataGateway
			 */
			DataGateway : (function(){
				
				/**
				 * @constructor
				 * @param ajaxHandler
				 */
				function DataGateway(ajaxHandler){
					
					this.postModel = function(model){
						ajaxHandler.post(model.link,model,function(response){
							return response;
						});
					};
					
					this.fetchModel = function(model){
						ajaxHandler.get(model.link, function(response){
							return response;
						});
					};
					
					this.updateModel = function(model){
						ajaxHandler.put(model.link,model,function(response){
							return response;
						});
					};
					
					this.deleteModel = function(model){
						ajaxHandler.destroy(model.link, function(response){
							return response;
						});
					};
					
					this.postCollection = function(collection){
						ajaxHandler.post(collection.getUrlRoot(), collection, function(response){
							return response;
						});
					};
					
					this.fetchCollection = function(collection) {
						ajaxHandler.get(collection.getUrlRoot(), function(response){
							return response;
						});
					};
					
					this.deleteCollection = function(collection){
						ajaxHandler.destroy(collection.getUrlRoot(), function(response){
							return response;
						});
					};
				}
				
				return DataGateway;
			})(),
			
			/**
			 * DataGatewayMock
			 */
			DataGatewayMock : (function(){
				
				/**
				 * @constructor
				 * @param ajaxHandler
				 */
				function DataGatewayMock(ajaxHandler){
					
					var referenceId = Object.keys(mockData['user']).length;
					
					this.createResponseObject = function(responseCode,data){
						return  {
							"status" : responseCode,
							"data" : data
						};
					};
					
					/**
					 * @hint post model
					 * @param model
					 */
					this.postModel = function(model,callback){
						try {
							var resource = model.urlRoot.split('/')[1];
							var id = resource+(++referenceId);
							model.id = id;
							model.link = model.urlRoot+"/"+id;
							mockData[resource][id]=model;
								
							typeof callback != 'undefined' ? callback(this.createResponseObject(201,mockData[resource][id])) : false;
						} catch(e){
							console.log(e);
							typeof callback != 'undefined' ? callback(this.createResponseObject(400,null)) : false;
						}
					};
					
					/**
					 * @fetch model
					 * @param model
					 */
					this.fetchModel = function(model,callback){
						try {
							var resource = model.urlRoot.split('/')[1];
							typeof callback != 'undefined' ? callback(this.createResponseObject(200,mockData[resource][model.id])) : false;
						} catch (e){
							console.log(e);
							typeof callback != 'undefined' ? callback(this.createResponseObject(400,null)) : false;
						}
					};
					
					/**
					 * @hint update model
					 * @param model
					 */
					this.updateModel = function(model,callback){
						try {
							var resource = model.urlRoot.split('/')[1];
							mockData[resource][model.id] = model;
							typeof callback != 'undefined' ? callback(this.createResponseObject(200,mockData[resource][model.id])) : false;
						} catch(e){
							console.log(e);
							typeof callback != 'undefined' ? callback(this.createResponseObject(400,null)) : false;
						}
					};
					
					/**
					 * @hint delete model
					 * @param model
					 */
					this.deleteModel = function(model,callback){
						try {
							var resource = model.urlRoot.split('/')[1];
							var id = model.id;
							delete mockData[resource][id];
							typeof callback != 'undefined' ? callback(this.createResponseObject(200,null)) : false;
						} catch (e) {
							console.log(e);
							typeof callback != 'undefined' ? callback(this.createResponseObject(400,null)) : false;
						}
					};
					
					/**
					 * @hint post collection
					 * @param collection
					 */
					this.postCollection = function(collection, callback){
						try {
							var resource = collection.getUrlRoot();
							mockData[resource] = {};
							var models = collection.getModels();
							$.each(collection.getModels(), function(key,model){
								model.setId(resource+(Object.keys(mockData[resource]).length+1));
								model.setLink(resource+"/"+model.getId());
								delete models[key];
								models[model.getId()]= model;
								mockData[resource][model.getId()]= model;
							});
							typeof callback != 'undefined' ? callback(this.createResponseObject(200,mockData[resource])) : false;
						} catch(e){
							console.log(e);
							typeof callback != 'undefined' ? callback(this.createResponseObject(400,'post collection failed')) : false;
						}
					};
					
					/**
					 * @hint fetch collection
					 * @param collection
					 */
					this.fetchCollection = function(collection, callback) {
						try {
							typeof callback != 'undefined' ? callback(this.createResponseObject(200,mockData[collection.getUrlRoot()])) : false;
						} catch(e){
							console.log(e);
							typeof callback != 'undefined' ? callback (this.createResponseObject(400,'fetch collection failed')) : false;
						}
					
					};
					
					/**
					 * @update collection
					 * @param collection
					 */
					this.updateCollection = function(collection, callback){
						try {
							var resource = collection.getUrlRoot();
							mockData[resource] = {};
							$.each(collection.getModels, function(key,model){
								mockData[resource][key]= model;
							});
							typeof callback != 'undefined' ? callback(this.createResponseObject(200,mockData[resource])) : false;
						} catch(e){
							typeof callback != 'undefined' ? callback(this.createResponseObject(400,'update collection failed')) : false;
						}
					}
					
					/**
					 * @hint delete collection
					 * @param collection
					 */
					this.deleteCollection = function(collection, callback){
						try {
							delete mockData[collection.getUrlRoot()];
							typeof callback != 'undefined' ? callback(this.createResponseObject(200,true)) : false;
						} catch(e) {
							console.log(e); 
							typeof callback != 'undefined' ? callback(this.createResponseObject(400,false)) : false;
						}
					};
				}
				
				return DataGatewayMock;
			})(),

			
			
			/**
			 * Helper
			 */
			Helper : (function(){
				
				function Helper(){};
				
				Helper.prototype.uuid = function() {
					var d = new Date().getTime();
				    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				        var r = (d + Math.random()*16)%16 | 0;
				        d = Math.floor(d/16);
				        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
				    });
				    return uuid;
				};
				
				return Helper;
			})(),

			/**
			 * AjaxHandler
			 */
			AjaxHandler : (function(){
				
				/**
				 * @constructor
				 */
				function AjaxHandler(){
					
					this.executeRequest = function(type,url,callback,data){
						var json = null;
						if(typeof data !='undefined'){
							json = JSON.stringify(data);
						}
						
						$.ajax({
							type 		: type,
							dataType 	: "json",
							contentType : 'application/json',
							data 		: json,
							url 		: url,
							success 	: function(data) {
								callback(data);
							},
							error 		: function(xhr){
						        alert('Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
							},
							complete : function(data) {	
							}
						});
					};
				}
				
				AjaxHandler.prototype.post = function(url,data,callback){
					this.executeRequest("POST", url,callback,data);
				};
				
				AjaxHandler.prototype.get = function(url,callback){
					this.executeRequest("GET", url,callback);
				};
				AjaxHandler.prototype.put = function(url,data,callback){
					this.executeRequest("PUT", url,callback,data);
				};
				AjaxHandler.prototype.destroy = function(url,callback){
					this.executeRequest("DELETE", url, callback);
				};
				
				return AjaxHandler;
			})()
	}
	
	var _helper = new API.Helper();
	
	return API;
})();