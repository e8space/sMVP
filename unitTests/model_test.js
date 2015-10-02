/**
 * sMv Model unit tests
 * (c) 2015 mk
 */


Model_test = TestCase("Model_test");

/**
 * setUp
 */
Model_test.prototype.setUp = function(){
	model = new Model({
		id:"",
		name:"",
		value:""
	});	
	
	user3 = new Model({id:"user3", urlRoot:"/user"});
	user4 = new Model({id:"user4", urlRoot:"/user"});
	newUser = new Model({name:"Brian", urlRoot:"/user"});
};

/**
 * tearDown
 */
Model_test.prototype.tearDown = function(){
	model = null;
	user = null;
};

/**
 * create
 */
Model_test.prototype.test_create = function(){
	var expected = typeof {};
	var actual = typeof model;
	assertEquals(expected,actual);
};

/**
 * clone
 */
Model_test.prototype.test_clone = function(){
	var expected ="Henry";
	model.setName("Henry");
	var modelClone = model.clone();
	modelClone.setName("George");
	assertEquals(expected, model.getName());
};

/**
 * getObjectRepresentation
 */
Model_test.prototype.test_getObjectRepresentation = function(){
	var expected = typeof {};
	var actual = typeof model.getObjectRepresentation();
	assertEquals(expected, actual);
};

/**
 * setObjectRepresentation
 */
Model_test.prototype.test_setObjectRepresentation = function(){
	var expected = "Lukas";
	model.setObjectRepresentation({name:"Lukas"});
	var actual = model.getName();
	assertEquals(expected,actual);
};

/**
 * getJsonRepresentation
 */
Model_test.prototype.test_getJsonRepresentation = function(){
	var expected = "Betty";
	model.setName("Betty");
	var object = JSON.parse(model.getJsonRepresentation());
	assertEquals(expected, object.name);
};

/**
 * setJsonRepresentation
 */
Model_test.prototype.test_setJsonRepresentation = function(){
	var expected = "Monroe";
	var jsonRep = '{"name":"Monroe"}';
	model.setJsonRepresentation(jsonRep);
	var actual = model.getName();
	assertEquals(expected, actual);
};

/**
 * post
 */
Model_test.prototype.test_post_should_return_model_with_id = function(){
	var expected = "user6";
	var actual = newUser.post().getId();
	assertEquals(expected,actual);
};

/**
 * fetch
 */
Model_test.prototype.test_fetch_should_return_model = function(){
	var expected = "Dana";
	var actual = user4.fetch().getName();
	assertEquals(expected,actual);	
};

/**
 * update
 */
Model_test.prototype.test_update_should_return_model = function(){
	var expected ="Obi van";
	var actual = user4.fetch().setName("Obi van").update().fetch().getName();
	assertEquals(expected,actual);
	
};

/**
 * delete
 */
Model_test.prototype.test_delete_should_return_model = function(){
	assertTrue(user4.destroy());
};
