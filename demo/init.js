/**
 * SMVP1.0 demo
 * 2015 mk
 */
 
$(document).ready(function() {
	
	//init
	SMVP.setDataGateway(new SMVP.DataGatewayMock());
	SMVP.userCollection.fetch();
	
	SMVP.headerPresenter = new SMVP.Presenter(new SMVP.View(SMVP.headerViewModel),SMVP.headerViewModel);
	SMVP.headerPresenter.renderView(SMVP.headerPresenter);

	SMVP.contentPresenter = new SMVP.Presenter(new SMVP.View(SMVP.contentViewModel),SMVP.contentViewModel);
	SMVP.contentPresenter.renderView(SMVP.contentPresenter);
	
	SMVP.contentEditPresenter = new SMVP.Presenter(new SMVP.View(SMVP.contentEditViewModel),SMVP.contentEditViewModel);
	
	//contentForm_event
	SMVP.contentPresenter.contentForm_event= function(e){
		this.getSubTriads().contentFormPresenter.getModel().getData().getMutable()[e.element.target.id]=e.targetValue;
	};
	
	//contentStock_event
	SMVP.contentPresenter.contentStock_event = function(e){
		var splitAction = e.element.target.offsetParent.id.split('_');
		var model = this.getSubTriads().contentStockPresenter.getModel().getData().readModel(splitAction[1]);
	
		switch (splitAction[0]) {
		
			case "deleteButtonContainer" : {
				model.destroy(function(){
					SMVP.contentPresenter.destroyView(function(){
						SMVP.contentPresenter.renderView(SMVP.contentPresenter);
					});
				});
				break;
			}
			
			case "editButtonContainer" : {
				SMVP.contentEditPresenter.getModel().setData(model);
				SMVP.contentEditPresenter.renderView(SMVP.contentEditPresenter);
				break;
			}
		}	
	}
	
	//contentEditView_event
	SMVP.contentEditPresenter.contentEditView_event = function(e){
		$.each(SMVP.contentEditPresenter.getModel().getData().getMutable(), function(key, value){
			SMVP.contentEditPresenter.getModel().getData().getMutable()[key]=$('#'+key).val();
		});
		
		SMVP.contentEditPresenter.getModel().getData().update(function(){
			SMVP.contentEditPresenter.destroyView();
			SMVP.contentPresenter.destroyView(function(){
				SMVP.contentPresenter.renderView(SMVP.contentPresenter);
			});
		});
	}
	
	//submitButton_event
	SMVP.contentPresenter.submitButton_event = function(e){
	
		this.getSubTriads().contentFormPresenter.getModel().getData().post(function(response){
			var model = SMVP.contentPresenter.getSubTriads().contentFormPresenter.getModel();
			model.setData(response);
			model.setData(model.getData().cloneClean());
			
			SMVP.contentPresenter.destroyView(function(){
				SMVP.contentPresenter.renderView(SMVP.contentPresenter);
			});
		});
	}
});

