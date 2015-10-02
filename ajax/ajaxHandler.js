/**
 * sMvp AjaxHandler
 * (c) 2014 kuema
 */

var AjaxHandler = (function(){
	
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
})();


