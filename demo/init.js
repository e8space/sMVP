/**
 * SMVP1.0 demo
 * 2015 mk
 */
 
$(document).ready(function() {
		
	SMVP.setDataGateway(new SMVP.DataGatewayMock());
	SMVP.userCollection.fetch();
	
	SMVP.headerPresenter = new SMVP.Presenter(new SMVP.View(SMVP.headerViewModel),SMVP.headerViewModel);
	SMVP.headerPresenter.renderView(undefined, SMVP.headerPresenter);

	SMVP.contentPresenter = new SMVP.Presenter(new SMVP.View(SMVP.contentViewModel),SMVP.contentViewModel);
	SMVP.contentPresenter.renderView(undefined, SMVP.contentPresenter);
	
	SMVP.contentPresenter.contentForm_event= function(e){
		this.getSubTriads().contentFormPresenter.getModel().getData().getMutable()[e.element.target.id]=e.targetValue;
	};
	
	SMVP.contentPresenter.contentStock_event = function(e){
		console.log("editButtonEvent",e.element.target.offsetParent.id);
	}
	
	SMVP.contentPresenter.submitButton_event = function(e){
		//console.log("SMVP.userCollection:", SMVP.userCollection.getCollection());
		
		this.getSubTriads().contentFormPresenter.getModel().getData().post(function(response){
			var model = SMVP.contentPresenter.getSubTriads().contentFormPresenter.getModel();
			model.setData(response);
			model.setData(model.getData().cloneClean());
			SMVP.contentPresenter.destroyView(function(){
				SMVP.contentPresenter.renderView(undefined, SMVP.contentPresenter);
			});
		});
	}
});

