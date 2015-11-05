/**
 * SMVP1.0 demo
 * 2015 mk
 */
 
$(document).ready(function() {
		
	SMVP.setDataGateway(new SMVP.DataGatewayMock());//set data gateway
	SMVP.userCollection.fetch();
	
	var headerPresenter = new SMVP.Presenter(new SMVP.View(SMVP.headerViewModel),SMVP.headerViewModel)
		.renderView(undefined, headerPresenter);

	var contentPresenter = 
		new SMVP.Presenter(new SMVP.View(SMVP.contentViewModel),SMVP.contentViewModel)
		.renderView(undefined, contentPresenter);
	
	contentPresenter.contentForm_event= function(e){
		console.log("contentForm_event:", e);
		this.getSubTriads().contentFormPresenter.getModel().getData().getMutable()[e.element.target.id]=e.element.target.value;
	};
	
	contentPresenter.submitButton_event = function(e){
		this.getSubTriads().contentFormPresenter.getModel().post();
		console.log(this.getSubTriads().contentFormPresenter.getModel().getMutable());
	}
});

