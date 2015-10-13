/**
 * sMvp Model unit tests
 * (c) 2015 mk
 */


Model_test = TestCase("Model_test");
Asynchronous_Model_Test = AsyncTestCase('Asynchronous_Model_Test');

/**
 * setUp
 */
Model_test.prototype.setUp = function(){
	SMVP.setDataGateway(new SMVP.DataGatewayMock());

	SMVP.userModel = new SMVP.Model({
		urlRoot : "/user",
		id : "",
		name : ""
	});
};

/**
 * setUp
 */
Asynchronous_Model_Test.prototype.setUp = function(){
	SMVP.setDataGateway(new SMVP.DataGatewayMock());

	SMVP.userModel = new SMVP.Model({
		urlRoot : "/user",
		id : "",
		name : ""
	});
}

/**
 * tearDown
 */
Model_test.prototype.tearDown = function(){
	SMVP.userModel = null;
};

/**
 * create
 */
Model_test.prototype.test_create = function(){
	var expected = typeof {};
	var actual = typeof SMVP.userModel;
	assertEquals(expected,actual);
};

/**
 * clone
 */
Model_test.prototype.test_clone = function(){
	var expected ="Henry";
	SMVP.userModel.setName("Henry");
	var modelClone = SMVP.userModel.clone();
	modelClone.setName("George");
	assertEquals(expected, SMVP.userModel.getName());
};

/**
 * getObjectRepresentation
 */
Model_test.prototype.test_getObjectRepresentation = function(){
	var expected = typeof {};
	var actual = typeof SMVP.userModel.getObjectRepresentation();
	assertEquals(expected, actual);
};

/**
 * setObjectRepresentation
 */
Model_test.prototype.test_setObjectRepresentation = function(){
	var expected = "Lukas";
	SMVP.userModel.setObjectRepresentation({name:"Lukas"});
	var actual = SMVP.userModel.getName();
	assertEquals(expected,actual);
};

/**
 * getJsonRepresentation
 */
Model_test.prototype.test_getJsonRepresentation = function(){
	var expected = "Betty";
	SMVP.userModel.setName("Betty");
	var object = JSON.parse(SMVP.userModel.getJsonRepresentation());
	assertEquals(expected, object.name);
};

/**
 * setJsonRepresentation
 */
Model_test.prototype.test_setJsonRepresentation = function(){
	var expected = "Monroe";
	var jsonRep = '{"name":"Monroe"}';
	SMVP.userModel.setJsonRepresentation(jsonRep);
	var actual = SMVP.userModel.getName();
	assertEquals(expected, actual);
};

/**
 * post
 */
Asynchronous_Model_Test.prototype.test_post_should_return_model_with_id = function(queue){
	var expected = "user6";
	var actual = null;
	
	callbackfunction = function(model){
		actual = model.getId();
	}
	
	queue.call("Step1: post model", function(callbacks){
		var callbackWrapper = callbacks.add(callbackfunction);
		SMVP.userModel.post(callbackWrapper);
	})
	
	queue.call("Step2: assert callback", function(){
		assertEquals(expected, actual);
	})
	
	queue.call("Step3: delete model", function(){
		SMVP.userModel.destroy();
	})
}

/**
 * fetch
 */
Asynchronous_Model_Test.prototype.test_fetch_should_return_model = function(queue){
	SMVP.userModel.setId("user3");
	
	var expected = "Abignale";
	var actual = null;
	
	callbackfunction = function(model){
		actual = SMVP.userModel.getName();
	}
	
	queue.call("Step1: fetch model", function(callbacks){
		var callbackWrapper = callbacks.add(callbackfunction);
		SMVP.userModel.fetch(callbackWrapper);
	})
	
	queue.call("Step2: assert callback", function(){
		assertEquals(expected, actual);
	})
}

/**
 * update
 */
Asynchronous_Model_Test.prototype.test_update_model_should_return_model = function(queue){
	SMVP.userModel.setId("user4")

	var expected = "Diana";
	var actual = null;
	
	callbackfunction = function(model){
		actual = model.getName();
	}
	
	queue.call("Step1: fetch model", function(callbacks){
		SMVP.userModel.fetch();
	})
	
	queue.call("Step2: update model", function(callbacks){
		SMVP.userModel.setName("Diana");
		var callbackWrapper = callbacks.add(callbackfunction);
		SMVP.userModel.update(callbackWrapper);
	})

	queue.call("Step3: assert callback", function(){
		assertEquals(expected, actual);
	})
}

