/**
 * sMVP Models
 * (c) 2015 mk
 */

var models = (function(){
		
		demo = {};
	
		demo.userModel = new SMVP.Model({
			id : "",
			urlRoot : "/user",
			link : "",
			mutable : {
				name : "",
				gender :""
			}
		});
		
		demo.userCollection = new SMVP.Collection(demo.userModel,"contentStock");
		
		demo.headerViewModel = new SMVP.Model({
			id:"headerView",
			template:"headerViewTemplate",
			container:"header",
			data : null,
			subTriads : ['headerText']
		});
		
		demo.headerTextModel = new SMVP.Model({
			id:"headerText",
			template : "headerTextTemplate",
			container:"headerTextContainer",
			data : ""
		});
		
		demo.contentViewModel = new SMVP.Model({
			id:"contentView",
			template : "contentViewTemplate",
			container : "content",
			data : null,
			subTriads : ['contentStock','contentForm']
		});
		
		demo.contentStockModel = new SMVP.Model({
			id:"contentStock",
			template:"contentStockTemplate",
			container:"contentStockContainer",
			data:demo.userCollection,
			subTriads : ['editButton','deleteButton']
		});
		
		demo.contentFormModel = new SMVP.Model({
			id : "contentForm",
			template : "contentFormTemplate",
			container : "contentFormContainer",
			subTriads : ['submitButton'],
			data : demo.userModel
		});
		
		demo.contentEditViewModel = new SMVP.Model({
			id:"contentEditView",
			template:"contentEditViewTemplate",
			container:"editContentContainer",
			subTriads:[],
			data : null
		})
		
		demo.editButtonModel = new SMVP.Model({
			id:"editButton",
			template:"editButtonTemplate",
			container:"editButtonContainer",
			data:"edit"
		});
		
		demo.deleteButtonModel = new SMVP.Model({
			id:"deleteButton",
			template:"deleteButtonTemplate",
			container:"deleteButtonContainer",
			data:"delete"
		});
		
		demo.submitButtonModel = new SMVP.Model({
			id:"submitButton",
			template :"submitButtonTemplate",
			container:"submitButtonContainer",
			data :"submit"
		});
		
	return models;
})();
