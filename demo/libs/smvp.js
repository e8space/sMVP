/**
 * SMVP 1.0
 * MVP framework
 * 2014 mk
 */

var SMVP = (function(){
	
	var _dataGateway = null;
	String.prototype.ucfirst = function(){
		return this.charAt(0).toUpperCase() + this.substr(1);
	};
	//new Helper();
	
	var API = {
			/**
			 * Model
			 */
			
			setDataGateway : function(dataGateway){
				_dataGateway = dataGateway;
			},
			
			Model : (function(){
				
				/**
				 * @constructor
				 * @param properties
				 */
				function Model (properties){
				
					var self =this;
			        this.properties	= properties || {};

					//define getter and setter according to properties
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
							var extendedProperties= _dataGateway.postModel(this.getData().getObjectRepresentation());
							jQuery.extend(self.properties, extendedProperties);
							$.each(extendedProperties, function(key,value){
								if(typeof self["get"+key.ucfirst()] == 'undefined') {
									var obj = {};
									obj[key] = value;
									self.setGettersSetters(obj);
								}
							});
							$(document).trigger({"modelChanged",this})
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
			        		this.setGettersSetters(SMVP.dataGateway.fetchModel(this.getObjectRepresentation()));
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
			            	SMVP.dataGateway.updateModel(this.getObjectRepresentation());
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
							return SMVP.dataGateway.deleteModel(this.getObjectRepresentation());
						} catch (e) {
			                console.log(e); 
						}
					}
				};
				
				return Model;
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
			        var _template = $('#'+model.getTemplate()).html();
			        var _container = model.getContainer();
			        var _model = model;
				      
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
				        	
				        	//_subTriads[value+'Model']= SMVP.namespace[value+'Model'];
				        	
				        	_subTriads[value+'Presenter'] = Object.create(Presenter.prototype,{});
				        	
				        	Presenter.call(_subTriads[value+'Presenter'], new SMVP.View(SMVP[value+'Model']),SMVP[value+'Model']);
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
			    		var dataId=this.getModel().getId();
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
			        		var subTriads = self.getSubTriads();
			        	
			        		var subTriadsSize = Object.keys(subTriads).length;
			        		if (subTriadsSize == 0 && typeof callback != 'undefined') {
			        			callback();
			        		}
			        		
			        		for (var triad in subTriads)(function() {
			        			
			        			subTriads[triad].renderView( function(){
			        				subTriadsSize --;
			        			},basePresenter);
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
			})(),

			/**
			 * Collection
			 */
			Collection : (function(){
				
				/**
				 * @constructor
				 * @param model
				 */
				function Collection(model){
				
					var _urlRoot = model.getUrlRoot().split('/')[1];
					var _collection = {};
					var _models = {};
					var _keys = Object.keys(model.getObjectRepresentation()).sort();
					
					/**
					 * @hint add model
					 * @param model
					 * @returns Boolean
					 */
					this.addModel = function(model){
						if (JSON.stringify(_keys) == JSON.stringify(Object.keys(model.getObjectRepresentation()))) {
							_collection[model.getObjectRepresentation().id] = model.getObjectRepresentation();
							_models[model.getObjectRepresentation().id] = new SMVP.Model(model.getJsonRepresentation())
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
				 * @hint fetch collection
				 * @returns collection
				 */
				Collection.prototype.fetch = function(){
					var collection = {};
					var data = _dataGateway.fetchCollection(this);
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
			})(),
			
			/**
			 * Helper
			 */
			Helper : (function(){
				
				function Helper(){
					
					/**
					 * first char to upper case
					 */
					String.prototype.ucfirst = function(){
						return this.charAt(0).toUpperCase() + this.substr(1);
					};
					
					guid = (function() {
						  function s4() {
						    return Math.floor((1 + Math.random()) * 0x10000)
						               .toString(16)
						               .substring(1);
						  }
						  return function() {
						    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
						           s4() + '-' + s4() + s4() + s4();
						  };
					})();
				
					
					uuid = function() {
						var d = new Date().getTime();
					    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
					        var r = (d + Math.random()*16)%16 | 0;
					        d = Math.floor(d/16);
					        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
					    });
					    return uuid;
					};
				}
					
				return Helper;
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
	
	return API;
})();