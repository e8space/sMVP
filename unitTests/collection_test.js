/**
 * sMvp Collection unit tests
 * (c) 2015 mk
 */


Collection_test = TestCase("Collection_test");


Collection_test.prototype.setUp = function(){
	model = new Model({id:"", name:"", urlRoot:"/user"});
	falseModel = new Model({id:"", name:"", age:"", urlRoot:""});
	user1 = model.clone().setName("Lucy").setId("001");
	user2 = model.clone().setName("Bart").setId("100");
	
	cut = new Collection(model);
	
};

Collection_test.prototype.tearDown = function(){
	cut = null;
};

/**
 * addModel true
 */
Collection_test.prototype.test_addModel_should_return_true = function(){
	assertTrue(cut.addModel(user1));
};

/**
 * addModel false
 */
Collection_test.prototype.test_addModel_should_return_false = function(){
	assertFalse(cut.addModel(falseModel));
};

/**
 * readModel
 */
Collection_test.prototype.test_readModel_should_return_model = function(){
	cut.addModel(user1);
	cut.addModel(user2);
	var expected = "Lucy";
	assertEquals(expected,cut.readModel("001").getName());
};

/**
 * readModels
 */
Collection_test.prototype.test_readModels_should_return_models = function(){
	cut.addModel(user1);
	cut.addModel(user2);
	var expected = "Bart";
	var models = cut.readModels();
	
	assertEquals(expected,models["100"].getName());
};

/**
 * fetch
 */
Collection_test.prototype.test_fetch_should_return_collection = function(){
	var expected = typeof {};
	var actual = typeof cut.fetch(model);
	assertEquals(expected,actual);
};

/**
 * post
 */
Collection_test.prototype.test_post_should_return_true = function(){
	cut.post();
};

