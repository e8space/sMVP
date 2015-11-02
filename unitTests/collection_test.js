/**
 * sMvp Collection unit tests
 * (c) 2015 mk
 */


Collection_test = TestCase("Collection_test");
Asynchronous_Collection_Test = AsyncTestCase('Asynchronous_Collection_Test');

/**
 * setUp
 */
Collection_test.prototype.setUp = function(){
	SMVP.setDataGateway(new SMVP.DataGatewayMock());
	
	model = new SMVP.Model({id:"", name:"", urlRoot:"/user", link:""});
	falseModel = new SMVP.Model({id:"", name:"", age:"", urlRoot:"", link:""});
	user1 = model.clone().setName("Lucy").setId("001");
	user2 = model.clone().setName("Bart").setId("100");
	
	newUser1 = model.clone().setName("newUser1");
	newUser2 = model.clone().setName("newUser2");
	cut = new SMVP.Collection(model);
};

Asynchronous_Collection_Test.prototype.setUp = function(){
	SMVP.setDataGateway(new SMVP.DataGatewayMock());
	
	model = new SMVP.Model({id:"", name:"", urlRoot:"/user", link:""});
	falseModel = new SMVP.Model({id:"", name:"", age:"", urlRoot:"", link:""});
	user1 = model.clone().setName("Lucy").setId("001");
	user2 = model.clone().setName("Bart").setId("100");
	
	newUser1 = model.clone().setName("newUser1");
	newUser2 = model.clone().setName("newUser2");
	SMVP.userCollection = new SMVP.Collection(model);
}


/**
 * tearDown
 */
Collection_test.prototype.tearDown = function(){
	cut = null;
};

Asynchronous_Collection_Test.tearDown = function(){
	SMVP.userCollection = null;
}


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
 * readModel undefined
 * 
 */
Collection_test.prototype.test_readModel_should_return_undefined = function(){
	var expected = undefined;
	assertEquals(expected,cut.readModel("001"));
}

/**
 * update model
 * 
 */
Collection_test.prototype.test_updateModel_should_update_model_properties = function(){
	cut.addModel(user1);
	var expected = "Bonita";
	
	user1.setName("Bonita");
	assertEquals(expected, cut.readModel("001").getName());
}

/**
 * readModels
 */
Collection_test.prototype.test_readModels_should_return_models = function(){
	cut.addModel(user1);
	cut.addModel(user2);
	var expected = 2;
	
	assertEquals(expected, Object.keys(cut.readModels()).length);
	
}


/**
 * fetch
 */
Asynchronous_Collection_Test.prototype.test_fetch_should_return_collection = function(queue){
	var expected = {};
	var actual = null;
	
	callbackfunction = function(collection){
		actual = collection;
	}
	
	queue.call("Step1: fetch collection", function(callbacks){
		var callbackWrapper = callbacks.add(callbackfunction);
		SMVP.userCollection.fetch(callbackWrapper);
	})
	
	queue.call("Step2: assert callbacks", function(){
		assertEquals(typeof(expected), typeof(actual));
	})
};

/**
 * post
 */
Asynchronous_Collection_Test.prototype.test_post_should_return_collection = function(queue){
	var expected = "user1";
	var actual = null;

	SMVP.userCollection.addModel(newUser1);
	SMVP.userCollection.addModel(newUser2);
	
	callbackfunction = function(collection){
		actual = collection.getModels()["user1"].getId();
	}
	
	queue.call("Step1: post collection", function(callbacks){
		var callbackWrapper = callbacks.add(callbackfunction);
		SMVP.userCollection.post(callbackWrapper);
	})
	
	queue.call("Step2: assert callbacks", function(){
		assertEquals(typeof(expected), typeof(actual));
	})
}

/**
 * update
 */
Asynchronous_Collection_Test.prototype.test_update_should_return_collection = function(queue){
	var expected = "Bianca";
	var actual = null;
	
	SMVP.userCollection.addModel(newUser1);
	SMVP.userCollection.addModel(newUser2);
	
	callbackfunction = function(collection){
		actual = collection.getModels()["user1"].getName();
	}
	
	queue.call("Step1: post collection", function(callbacks){
		SMVP.userCollection.post();
	})
	
	queue.call("Step2: update collection", function(callbacks){
		newUser1.setName("Bianca");
		var callbackWrapper = callbacks.add(callbackfunction);
		SMVP.userCollection.update(callbackWrapper);
	})
	
	queue.call("Step3: assert callbacks", function(){
		assertEquals(expected, actual);
	})
}


