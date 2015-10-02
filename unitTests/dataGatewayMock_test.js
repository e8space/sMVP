/**
 * sMvp DataGatewayMock unit tests
 * (c) 2015 mk
 */


DataGatewayMock_test = TestCase("DataGatewayMock_test");

/**
 * setUp
 */
DataGatewayMock_test.prototype.setUp = function(){
	cut = new DataGatewayMock();
	newUser = {name:"Heinrich", urlRoot:"/user"};
	user2 = {id:"user2", urlRoot: "/user"};
};

/**
 * tearDown
 */
DataGatewayMock_test.prototype.tearDown = function(){
	cut = null;
};

/**
 * post model
 */
DataGatewayMock_test.prototype.test_postModel_should_return_model = function(){
	var expected = "user6";
	var actual = cut.postModel(newUser);
	assertEquals(expected,actual.id);
	cut.deleteModel(newUser);
};


/**
 * fetch model
 */
DataGatewayMock_test.prototype.test_fetchModel_should_return_model = function(){
	var expected = "Henry";
	var actual = cut.fetchModel(user2);
	assertEquals(expected, actual.name);
};

/**
 * update model
 */
DataGatewayMock_test.prototype.test_updateModel_should_return_model = function(){
	
	var expected = "Dorothy";
	user2 = cut.fetchModel(user2);
	user2.name = "Dorothy";
	var actual = cut.updateModel(user2);
	assertEquals(expected,actual.name);
};
