describe("scaffold", function() {
	var provider;

	beforeEach(module("ur.scaffold.mocks"));

	beforeEach(module("ur.scaffold", function(scaffoldProvder) {
		provider = scaffoldProvder;
	}));

	beforeEach(module("ur.scaffold", function(modelProvider) {
		modelProvider
			.model("Dogs", { url: "http://api/dogs" })
			.model("Cats", { url: "http://api/cats" });
	}));

	describe("provider", function() {

		describe("configuration", function() {

			it("should accept scaffold definitions", function() {
				expect(provider.scaffold("Dogs", {})).toBe(provider);
			});

			it("should infer the model to use", inject(function(model) {
				var dogs = model("Dogs");
				provider.scaffold("Dogs", {});

				expect(scaffold("Dogs").model()).toEqual(dogs);
			}));

			it("should use a given model", inject(function(model) {
				var dogs = model("Dogs");
				provider.scaffold("Canines", {
					model: dogs
				});

				expect(scaffold("Canines").model()).toEqual(dogs);
			}));
		});
	});

	describe("service", function() {
		var http, mocks;

		beforeEach(inject(function($httpBackend, mocks) {
			http = $httpBackend;
			mocks = mocks;
		}));

		describe("fetch all", function() {

			it("should GET and store", function() {
				var s = scaffold("Dogs");

				http.expectGET("http://api/dogs").respond(mocks.all);
				http.flush();

				expect(s.items).toEqual(mocks.all);
			});

			it("should GET and store with default query", function() {
				var s = scaffold("Dogs", {
					query: { breed: "boxer" }
				});

				http.expectGET("http://api/dogs?breed=boxer").respond(mocks.boxers);
				http.flush();

				expect(s.items).toEqual(mocks.boxers);
			});

			it("should apply a given query on refresh", function() {
				var s = scaffold("Dogs");

				http.whenGET("http://api/dogs").respond(mocks.all);
				http.flush();

				expect(s.items).toEqual(mocks.all);

				s.query = { breed: "boxer" };
				s.refresh();

				http.expectGET("http://api/dogs?breed=boxer").respond(mocks.boxers);
				http.flush();

				expect(s.items).toEqual(mocks.boxers);
			});

			it("should set the loading ui state", function() {
				var s = scaffold("Dogs");
				expect(s.$ui.loading).toBe(true);

				http.whenGET("http://api/dogs").respond(mocks.all);
				http.flush();

				expect(s.$ui.loading).toBe(false);
			});
		});

		describe('pagination', function() {

			it("should GET the first page", function() {
				var s = scaffold("Dogs", {
					paginate: true
				});

				http.expectGET("http://api/dogs?page=1").respond(mocks.all);
				http.flush();
			});

			it("should merge the page and query", function() {
				var s = scaffold("Dogs", {
					paginate: true,
					query: {
						breed: 'boxer'
					}
				});

				http.expectGET("http://api/dogs?breed=boxer&page=1").respond(mocks.boxers);
			});

			it("should return an array of pages", function() {
				var s = scaffold("Dogs", {
					paginate: true
				});

				// @todo: discuss approaches to API yielding total pages
				http.whenGET("http://api/dogs?page=1").respond(mocks.boxers);
				http.flush();

				expect(s.pages).toEqual([1, 2, 3, 4]);
			});

			it("should GET a given page", function() {
				var s = scaffold("Dogs", {
					paginate: true
				});

				http.whenGET("http://api/dogs?page=1").respond(mocks.boxers);
				http.flush();

				s.page(4);
				http.expectGET("http://api/dogs?page=4").respond(mocks.boxers);
			});

			it("should allow custom page sizes", function() {
				var s = scaffold("Dogs", {
					paginate: {
						limit: 5
					}
				});

				http.expectGET("http://api/dogs?limit=5&page=1").respond(mocks.all);
				http.flush();
			});
		});

		// @todo: discuss user interaction promises
		describe("create", function() {
			var s;

			beforeEach(function() {
				s = scaffold("Dogs");
			});

			it("should return a deferred", function() {
				var deferred = s.create();

				expect(angular.isFunction(deferred.resolve)).toBe(true);
				expect(angular.isFunction(deferred.reject)).toBe(true);
				expect(angular.isFunction(deferred.notify)).toBe(true);
			});

			it("should create a new object when the deferred is resolved", function() {
				var deferred = s.create();

				deferred.resolve(mocks.one);

				http.expectPOST("http://api/dogs", mocks.one).respond(mocks.one);
				http.flush();
			});

			it("should set the saving ui state", function() {
				expect(s.$ui.saving).toBe(false);

				s.create().resolve(mocks.one);

				expect(s.$ui.saving).toBe(true);

				http.whenPOST("http://api/dogs", mocks.one).respond(mocks.one);
				http.flush();

				expect(s.$ui.saving).toBe(false);
			});
		});
	});
});
