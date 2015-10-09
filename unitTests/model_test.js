/**
 * sMvp Model unit tests
 * (c) 2015 mk
 */


Model_test = TestCase("Model_test");

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
Model_test.prototype.test_post_should_return_model_with_id = function(){
	var expected = "user6";
	var actual = SMVP.userModel.post();
	assertEquals(expected,actual);
};


