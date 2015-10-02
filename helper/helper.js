var Helper = (function(){
	
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
})();
