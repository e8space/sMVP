/**
 * sMVP 1.1
 * JS MVP framework
 * lightweight Model View Presenter framework
 * © 2018 marcokueng
 */

var SMVP = (function(){
	
	var _dataGateway = null;
	var _namespace = null;
	
	var API = {
			setDataGateway : function(dataGateway){
				_dataGateway = dataGateway;
			},
			setNameSpace : function(namespace){
				_namespace = namespace;
			},
			
/**
 * Model
 */
			Model : (function(){
				
				/**
				 * @constructor
				 * @param properties
				 */
				function Model(properties){
				
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
					 * @hint clone instance
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
					 * @hint get model properties as plain object
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
					 * @hint set model properties from plain object
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
						//try {
							var self = this;
							_dataGateway.postModel(this, function(data,status,request){
								if (status == 'success') {
									self.updatePropertiesAndAccessors(data.fields);
									if (typeof _namespace[self.getRoot()+"Collection"] != 'undefined') { 
										_namespace[self.getRoot()+"Collection"].addModel(self);
									}
									typeof callback!= 'undefined' ? callback (self,status) : false;
								} else {
									typeof callback!= 'undefined' ? callback (false,status) : false;
								}
								$(document).trigger("dataGatewayInfo", {statusCode:status, status:status , text:self.getRoot()+" model posted "+status});
								
							});
						//} catch (e){
			              //  console.log(e);
						//}
					},

			        /**
			         * @hint fetch model
			         * @returns {Model}
			         */
			        fetch : function(callback){
			        	//try {
			        		var self = this;
			        		_dataGateway.fetchModel(this, function(data,status,request){
			        			if (status == 'success') {
			        				if (typeof data.fields != 'undefined') {
			        					self.updatePropertiesAndAccessors(data.fields);
			        				}
			        				
			        			} else {
			        		
			        				$(document).trigger("dataGatewayInfo", {statusCode:status, status:status , text:self.getRoot()+" model update "+status});
			        			}
			        			typeof callback!= 'undefined' ? callback (self,status) : false;
			        		});
			        	//} catch (e){
			        		//console.log(e);
			        	//}
					},

			        /**
			         * @hint update model
			         * @returns {Model}
			         */
					update : function(callback){
			            //try {
			            	var self = this;
			            	_dataGateway.updateModel(this,function(data,status,response){
			            		//console.log("responseData: ", data);
			            		if (status == 'success' && typeof _namespace[self.getRoot()+"Collection"] != 'undefined'){
			            			_namespace[self.getRoot()+"Collection"].updateModel(self);
			            		} 
			            		
								$(document).trigger("dataGatewayInfo", {statusCode:status, status:status , text:self.getRoot()+" model update "+status});
			            		typeof callback!= 'undefined' ? callback (self,data) : false;
			            	});
			            //} catch (e){
			                //console.log(e);
			            //}
					},

			        /**
			         * @hint destroy model
			         */
					destroy : function(callback){
						//try {
							var self = this;
							_dataGateway.deleteModel(this,function(data,status,request){
								if (status == 'success' && typeof _namespace[self.getRoot()+"Collection"] != 'undefined' ) {
									_namespace[self.getRoot()+"Collection"].removeModel(self.getId());
								} 
								$(document).trigger("dataGatewayInfo", {statusCode:status, status:status , text:self.getRoot()+" model delete "+status});
								typeof callback!= 'undefined' ? callback (self) : false;
							});
						//} catch (e) {
			             //   console.log(e); 
						//}
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
				function Collection(root){
				
					var _root = root
					var _collection = {};
					var _sortedCollection = [];
					var _models = {};
					var _keys = {};
					
					this.collection = _collection;
					this.sortedCollection = _sortedCollection;
					
					this.setKeys=function(modelRepresentation){
						_keys = Object.keys(modelRepresentation).sort();
					}
					
					/**
					 * @hint add model to collection
					 * @param model
					 * @returns Boolean
					 */
					this.addModel = function(model){
						//if (JSON.stringify(_keys) == JSON.stringify(Object.keys(model.getObjectRepresentation()).sort())) {
							if (model.getObjectRepresentation().id != "") {
								_collection[model.getObjectRepresentation().id] = model.getObjectRepresentation();
								_models[model.getObjectRepresentation().id] = model;
							} else {
								model.setId(_helper.uuid());
								_collection[model.getId()] = model.getObjectRepresentation();
								_models[model.getId()] = model;
							};
							$(document).trigger("collectionChanged_"+root, {});
							return this;
						//}
						return false;	
					};
					
					/**
					 * @hint remove model from collection
					 * @param model
					 */
					this.removeModel = function(id){
						delete _collection[id];
						delete _models[id];
						$(document).trigger("collectionChanged_"+root, {});
					}
					
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
					 * @hint update model
					 * @param model
					 */
					this.updateModel = function(model){
						_models[model.getId()] = model;
						_collection[model.getId()] = model.getObjectRepresentation();
						$(document).trigger("collectionChanged_"+root, {});
					}
					
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
					 * @hint read sorted collection
					 * @returns sorted collection
					 */
					this.getSortedCollection = function(){
						return _sortedCollection;
					}
					
					/**
					 * @hint set collection 
					 * @param collection
					 */
					this.setCollection = function(collection){
						this.collection = collection;
						_collection = collection;
					};
					
					/**
					 * @hint set collection 
					 * @param collection
					 */
					this.setSortedCollection = function(sortedCollection){
						this.sortedCollection = sortedCollection;
						_sortedCollection = sortedCollection;
					};
					
					/**
					 * @hint get Url root
					 * @return urlRoot
					 */
					this.getRoot = function(){
						return _root;
					};
					
					return this;
				}
				
				/**
				 * @hint post collection
				 */
				Collection.prototype.post = function(callback){
					var self = this;
					_dataGateway.postCollection(this, function(response){
						if (typeof callback != 'undefined') {
							callback(self,response);
						}
					});
					return this;
				};
				
				/**
				 * @hint fetch collection
				 * @returns collection
				 */
				Collection.prototype.fetch = function(callback){
					
					var self = this;
					_dataGateway.fetchCollection(this, function(response){
						if (response.status == 'success') {
							var collection = {};
							try {
								$.each(response.data.fields[self.getRoot()+'s'], function(){
									collection[this.id] = this;
								})
							} catch(e){};
							self.setCollection(collection);
						}
						$(document).trigger("dataGatewayInfo", {statusCode:response.status, status:response.status , text:self.getRoot()+" collection fetch "+response.status});
						typeof callback != 'undefined' ? callback(self) : false;
					});
				};
					
				/**
				 * @hint fetch collection
				 * @returns collection
				 */
				Collection.prototype.fetchSorted = function(callback){
					var self = this;
					_dataGateway.fetchCollection(this, function(response){
						if (response.status == 'success') {
							var collection = [];
							try {
								$.each(response.data.fields[self.getRoot()+"s"], function(){
									collection.push(this);
								})
							} catch(e){};
							self.setSortedCollection(collection);
						}
						$(document).trigger("dataGatewayInfo", {statusCode:response.status, status:response.status , text:self.getRoot()+" collection fetch "+response.status});
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
				function View(){
					
			        var _template = null;
			        var _container = null; 
			   
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
			        	$('#'+this.getContainer()).html(_.template(this.getTemplate())(data));
			        	//$("[data-container="+this.getContainer()+"]").html(_.template(this.getTemplate())(data));
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
			         * @hint refresh view
			         */
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
			        },
			        
			        /**
			         * @hint animate view
			         */
			        animate : function(event, container, offset){
			            $(container).animate({
			                scrollTop: $(event.element.target).offset().top - container.offset().top + container.scrollTop()-offset
			            });
			        },

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
			    function Presenter(model, view){
			    	
			    	//private members
			    	var self    	= this;
			        var _view   	= view || new SMVP.View();
			        var _model      = model || new SMVP.Model({id:_util.uuid()});
			        var _subTriads 	= {};
			        
			        typeof _model.getTemplate === 'function' ? _view.setTemplate(_model.getTemplate()) : false;
			        typeof _model.getContainer === 'function' ? _view.setContainer(_model.getContainer()) :false;
			        
			        if (typeof _model.getSubTriads ==='function') {
				        $.each( _model.getSubTriads(), function(index, value){
				        	_subTriads[value+'Presenter'] = Object.create(Presenter.prototype,{});
				        	Presenter.call(_subTriads[value+'Presenter'], _namespace[value+'Model']);
				        });
			        }
			        
			        //getters
			        this.getView = function(){ return _view; };
			        this.getModel = function(){ return _model; };
			        this.setModel = function(model) {_model = model};
			        this.getSubTriads = function(){ return _subTriads; };
			        
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
			    		var dataId=this.getModel().getId();
			    		var that = this;
			    		var dataEvents = $("[data-event]");
			    	
			    		$.each(dataEvents, function(){
			    			var event = $(this).attr('data-event');
			    			$('#'+this.id).off(event);
			    			$('#'+this.id).on(event, function(element){
			    				var elementValue = element.target.value;
			    				//try {
			    					if (event=='change') {
			    						try {
			    							that.getModel().getData()["set"+element.target.id.ucfirst()](elementValue);
			    						} catch(e){console.log(e)}
			    					}
			    					base[dataId+"Event"]({element:element,value:$('[data-id='+dataId+']').val(),eventType:event, id:this.id, targetId: element.target.id, targetValue:element.target.value});
			    				//} catch(e) {};
			    			})
			    			
			    		})
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
			    	 * @hint render view and sub-view(s)
			    	 * @param callback
			    	 * @param base
			    	 * @return this
			    	 */
					renderView : function(callback, base){
						var self = this;		
						var base = base || this;
						
			    		this.getView().render(self.getModel(), function(){
			    			
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
			         *  @hint hide view without removing elements and handlers
			         */
			    	hideView : function(){
			    		this.getView().hide();
			    	},
			    	
			    	/**
			    	 * @hint show view
			    	 */
			    	showView : function(){
			    		this.getView().show();
			    	},
			    
			    	/**
			    	 * @hint deletes view and related subviews and handlers
			    	 */
			    	destroyView : function(callback){
			    		this.removeEventDelegate();
			    		this.getView().destroy();
			    		typeof(callback) !='undefined' ? callback() : false;
			    	}, 
			    	
			    	/**
			    	 * @hint refresh view
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
			    	},
			    	
			    	/**
			    	 * @hint animate view
			    	 */
			        animateView : function(event, container, offset){
			            this.getView().animate(event, container, offset);
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
					var self = this;
					
					var baseUrl = 'earthsounds/api/';
					
					this.createResponseObject = function(responseCode,data){
						return  {
							"status" : responseCode,
							"data" : data
						};
					};
					
					this.postModel = function(model,callback){
						ajaxHandler.post(baseUrl+model.getRoot(),model.getObjectRepresentation(),function(data,status,request){
							typeof callback != 'undefined' ? callback(data, status, request) : false;
							
						});
					};
					
					this.fetchModel = function(model,callback){
						var delimiter = "";
						if (typeof model.getEndpoint === 'function' && model.getEndpoint() != "") {
							if (model.getId() != "") delimiter = "/"; 
							ajaxHandler.get(baseUrl+model.getRoot()+delimiter+model.getId()+model.getEndpoint(),null, function(data, status, request){
								typeof callback != 'undefined' ? callback(data, status,request) : false;
							});
						} else {
							ajaxHandler.get(baseUrl+model.getRoot()+"/"+model.getId(),null, function(data, status, request){
								typeof callback != 'undefined' ? callback(data, status,request) : false;
							});
						}
					};
					
					this.updateModel = function(model, callback){
						
						ajaxHandler.put(baseUrl+model.getRoot()+"/"+model.getId()+model.getEndpoint(),model.getObjectRepresentation(),function(data, status, request){
							typeof callback != 'undefined' ? callback(data, status,request) : false;
						});
					};
					
					this.deleteModel = function(model,callback){
						var delimiter = "";
						if (typeof model.getEndpoint === 'function' && model.getEndpoint() != "") {
							if (model.getId() != "") delimiter = "/"; 
							ajaxHandler.destroy(baseUrl+model.getRoot()+delimiter+model.getId()+model.getEndpoint(),null, function(data, status, request){
								typeof callback != 'undefined' ? callback(data, status,request) : false;
							});
						} else {
							ajaxHandler.destroy(baseUrl+model.getRoot()+"/"+model.getId(),null, function(data, status, request){
								typeof callback != 'undefined' ? callback(data, status,request) : false;
							});
						}
					};
					
					this.postCollection = function(collection, callback){
						ajaxHandler.post(baseUrl+collection.getRoot(), collection.getCollection(), function(response){
							typeof callback != 'undefined' ? callback(response) : false;
						});
					};
					
					this.fetchCollection = function(collection, callback) {
						ajaxHandler.get(baseUrl+collection.getRoot(),null, function(data, status, request){
							typeof callback != 'undefined' ? callback(self.createResponseObject(status,data)) : false;
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
 * Util
 */
			Util : (function(){
				
				/**
				 * @constructor
				 */
				function Util(){
					String.prototype.ucfirst = function(){
						return this.charAt(0).toUpperCase() + this.substr(1);
					};	
				};
				
				Util.prototype.uuid = function() {
					var d = new Date().getTime();
				    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				        var r = (d + Math.random()*16)%16 | 0;
				        d = Math.floor(d/16);
				        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
				    });
				    return uuid;
				};
				
				return Util;
			})(),

/**
 * AjaxHandler
 */
			AjaxHandler : (function(){
				
				/**
				 * @constructor
				 */
				function AjaxHandler(){
					
					this.executeRequest = function(type,url,data,callback){
						var json = null;
						if(typeof data !='undefined' && data != null){
							json = JSON.stringify(data);
						}
						var cookieValue = "";
						var nameEQ = "tokenString" + "=";
					    var ca = document.cookie.split(';');
					    for(var i=0;i < ca.length;i++) {
					        var c = ca[i];
					        while (c.charAt(0)==' ') c = c.substring(1,c.length);
					        if (c.indexOf(nameEQ) == 0) cookieValue =  c.substring(nameEQ.length,c.length);
					    }
					    
						$.ajax({
							type 		: type,
							dataType 	: "json",
							contentType : 'application/json',
							data 		: json,
							url 		: url,
							beforeSend: function(xhr){xhr.setRequestHeader('token', cookieValue);},
							success 	: function(data, status,request) {
								callback(data,status,request);
							},
							error 		: function(data,status,request){
								callback(data,status,request);
							},
							complete : function(data) {	
							}
						});
					};
				}
				
				AjaxHandler.prototype.post = function(url,data,callback){
					this.executeRequest("POST", url, data, function(data,status,request){
						callback(data,status,request);
					});
				};
				
				AjaxHandler.prototype.get = function(url,data,callback){
					this.executeRequest("GET", url, data, function(data,status,request){
						callback(data,status,request);
					});
				};
				AjaxHandler.prototype.put = function(url,data,callback){
					this.executeRequest("PUT",  url, data, function(data,status,request){
						callback(data,status,request);
					});
				};
				AjaxHandler.prototype.destroy = function(url,data,callback){
					
					var cookieValue = "";
					var nameEQ = "tokenString" + "=";
				    var ca = document.cookie.split(';');
				    for(var i=0;i < ca.length;i++) {
				        var c = ca[i];
				        while (c.charAt(0)==' ') c = c.substring(1,c.length);
				        if (c.indexOf(nameEQ) == 0) cookieValue =  c.substring(nameEQ.length,c.length);
				    }
					
					$.ajax({
						type 		: "DELETE",
						url 		: url,
						beforeSend: function(xhr){xhr.setRequestHeader('token', cookieValue);},
						success 	: function(data, status,request) {
							callback(data,status,request);
						},
						error 		: function(data,status,request){
					        //alert('Request Status: ' + xhr.status + ' Status Text: ' + xhr.statusText + ' ' + xhr.responseText);
							callback(data,status,request);
						},
						complete : function(data) {	
						}
					});
				};
				
				return AjaxHandler;
			})()
	}
	
	var _util = new API.Util();
	
	return API;
})();