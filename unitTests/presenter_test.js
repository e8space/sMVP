/**
 * sMvp Presenter unit tests
 * (c) 2015 mk
 */

Presenter_test = TestCase("Presenter_test");

/**
 * setUp
 */
Presenter_test.prototype.setUp = function(){
	viewModel = new SMVP.Model({
		template : "viewTemplate",
		container : "container"
	});
	presenter = new SMVP.Presenter(new SMVP.View(viewModel), new SMVP.Model({id:"testModel"}));
};

/**
 * tearDown
 */
Presenter_test.prototype.tearDown = function(){
	presenter = null;
};

/**
 * create
 */
Presenter_test.prototype.test_create = function(){
	var expected = typeof {};
	var actual = typeof presenter;
	assertEquals(expected,actual);
};