/**
 * sMVP_1.0 demo
 * 2015 mk
 */
 
$(document).ready(function() {
	
	//init
	SMVP.setDataGateway(new SMVP.DataGatewayMock());
	SMVP.setNameSpace(demo);
	demo.userCollection.fetch();
	
	demo.headerPresenter = new SMVP.Presenter(new SMVP.View(demo.headerViewModel)).renderView();
	demo.contentPresenter = new SMVP.Presenter(new SMVP.View(demo.contentViewModel)).renderView();
	demo.contentEditPresenter = new SMVP.Presenter(new SMVP.View(demo.contentEditViewModel));
	
	//contentForm_event
	demo.contentPresenter.contentFormEvent= function(e){
		this.getSubTriads().contentFormPresenter.getModel().getData().getMutable()[e.element.target.id]=e.targetValue;
	};
	
	//contentStock_event
	demo.contentPresenter.contentStockEvent = function(e){
		var splitAction = e.element.target.offsetParent.id.split('_');
		var model = this.getSubTriads().contentStockPresenter.getModel().getData().readModel(splitAction[1]);
	
		switch (splitAction[0]) {
		
			case "deleteButtonContainer" : {
				model.destroy(function(){
					demo.contentPresenter.destroyView(function(){
						demo.contentPresenter.renderView();
					});
				});
				break;
			}
			
			case "editButtonContainer" : {
				demo.contentEditPresenter.getModel().setData(model);
				demo.contentEditPresenter.renderView();
				break;
			}
		}	
	}
	
	//contentEditView_event
	demo.contentEditPresenter.contentEditViewEvent = function(e){
		console.log("e:", e);
		$.each(demo.contentEditPresenter.getModel().getData().getMutable(), function(key, value){
			demo.contentEditPresenter.getModel().getData().getMutable()[key]=$('#'+key).val();
		});
		
		demo.contentEditPresenter.getModel().getData().update(function(){
			demo.contentEditPresenter.destroyView();
			demo.contentPresenter.destroyView(function(){
				demo.contentPresenter.renderView(demo.contentPresenter);
			});
		});
	}
	
	//submitButton_event
	demo.contentPresenter.submitButtonEvent = function(e){
		this.getSubTriads().contentFormPresenter.getModel().getData().post(function(response){
			var model = demo.contentPresenter.getSubTriads().contentFormPresenter.getModel();
			model.setData(response);
			model.setData(model.getData().cloneClean());
			
			demo.contentPresenter.destroyView(function(){
				demo.contentPresenter.renderView();
			});
		});
	}
});

