/**
 * 
 */

var MainModels = (function(){
	
		SMVP.userModel = new SMVP.Model({
			id : "",
			urlRoot : "/user",
			link : "",
			mutable : {
				name : "",
				gender :""
			}
		});
		
		SMVP.userCollection = new SMVP.Collection(SMVP.userModel,"contentStock");
		
		SMVP.headerViewModel = new SMVP.Model({
			id:"headerView",
			template:"headerViewTemplate",
			container:"header",
			data : null,
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
			data : null,
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
			data:SMVP.userCollection,
			subTriads : ['editButton','deleteButton']
		})
		
		SMVP.contentEditViewModel = new SMVP.Model({
			id:"contentEdit",
			template:"contentEditTemplate",
			container:"content",
			subTriads:[],
			data : SMVP.userModel
		})
		
		SMVP.editButtonModel = new SMVP.Model({
			id:"editButton",
			template:"editButtonTemplate",
			container:"editButtonContainer",
			data:"edit"
		});
		
		SMVP.deleteButtonModel = new SMVP.Model({
			id:"deleteButton",
			template:"deleteButtonTemplate",
			container:"deleteButtonContainer",
			data:"delete"
		});
		
		
		SMVP.submitButtonModel = new SMVP.Model({
			id:"submitButton",
			template :"submitButtonTemplate",
			container:"submitButtonContainer",
			data :"submit"
		});
	
	
	return MainModels;
})();
