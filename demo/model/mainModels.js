/**
 * 
 */

var MainModels = (function(){
	
		SMVP.userModel = new SMVP.Model({
			urlRoot : "/user",
			id : "",
			mutable : {
				name : ""
			}
		});
		
		SMVP.userCollection = new SMVP.Collection(SMVP.userModel);
		
		
		SMVP.headerViewModel = new SMVP.Model({
			id:"headerView",
			template:"headerViewTemplate",
			container:"header",
			subTriads : ['headerText']
		});
		
		SMVP.headerTextModel = new SMVP.Model({
			id:"headerText",
			template : "headerTextTemplate",
			container:"headerTextContainer",
			data : "sMVP demo"
		});
		
		SMVP.contentViewModel = new SMVP.Model({
			id:"contentView",
			template : "contentViewTemplate",
			container : "content",
			subTriads : ['contentForm','submitButton','contentStock']
		});
		
		SMVP.contentFormModel = new SMVP.Model({
			id : "contentForm",
			template : "contentFormTemplate",
			container : "contentFormContainer",
			subTriads : [],
			data : SMVP.userModel
		});
		
		SMVP.contentStockModel = new SMVP.Model({
			id:"contentStock",
			template:"contentStockTemplate",
			container:"contentStockContainer",
			data:SMVP.userCollection
		})
		
		
		SMVP.submitButtonModel = new SMVP.Model({
			id:"submitButton",
			template :"submitButtonTemplate",
			container:"submitButtonContainer",
			data :"submit"
		});
	
	
	return MainModels;
})();
