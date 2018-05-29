import { Catalog } from './catalog.class';
import { IndexDefinition } from './index-definition.class'

// HACK ALERT:
// 	to avoid typescript errors from bombing tests when testing private members,
// 	the following techniques are employed:
//
// 	1) when spying on private functions: spyOn<any>(object,"privateFunction")
// 	2) when directly calling private function: object["privateFunction"](params);
//
// 	you have been duly notified
//
describe ('Class: Catalog', () => {

	let catalog: Catalog;

	beforeEach(() => {
		catalog = new Catalog('Test');
	});

	afterEach(() => {
		catalog = null;
	});

	describe('.addIndex', () => {
		let indexName, def, cat;
		beforeEach(() => {
			indexName = 'test'
			def = new IndexDefinition(indexName,[]);
			cat = catalog.addIndex(def);
		});
		afterEach(() => {
			indexName = null;
			def = null;
			cat = null;
		});
		it('.addIndex should add indexDefinition and Indices', () => {
			expect(cat.indexDefinitions[indexName]).toBeTruthy();
			expect(cat.indices[indexName]).toBeTruthy();
		});
		it('.addIndex should throw error when indexName is duplicated', () => {
			expect( function() {
				catalog.addIndex(def);
			}).toThrow(new Error('Index named "test" already exists for Test'));
		});
		it('.addIndex (force) should overwrite when indexName is duplicated', () => {
			expect( function() {
				cat = catalog.addIndex(def, true);
			}).not.toThrow();
		});
		it('.addIndex should return a catalog', () => {
			expect(cat.entityName).toBeTruthy();
		});
	});

	describe('.removeIndex', () =>{
		let indexName = 'test';
		let def;
		beforeEach(() => {
			def = new IndexDefinition(indexName,[]);
			catalog.addIndex(def);
		});
		afterEach(() => {
			def = null;
		})

		it('should return a catalog', () => {
			let cat = catalog.removeIndex(indexName)
			expect(cat.entityName).toBeTruthy();
		});
		it('should remove the index', () => {
			let cat = catalog.removeIndex(indexName)
			expect(cat.indexDefinitions[indexName]).toBeFalsy();
			expect(cat.indices[indexName]).toBeFalsy();
		});
		it('should throw error is indexName is not found', () => {
			expect( function() {
				catalog.removeIndex('notTest');
			}).toThrow();
		});
	});

	describe('.add (and ._addToIndex)', () => {
		let def, obj, obj2;
		beforeEach(() => {
			def = new IndexDefinition('ByNameHair',['name','hair'],true,'~');
			obj = { name: 'bob', age: 25, hair: 'yes'}
			obj2 = { name: 'bob', age: 41, hair: 'yes'}
		});
		afterEach(() => {
			def = null;
			obj = null;
		});
		it('should add an entity to collection index', () => {
			catalog.addIndex(def);
			catalog.add(obj);
			expect(catalog.indices['ByNameHair']['bob~yes'].length).toEqual(1);
			expect(catalog.indices['ByNameHair']['bob~yes'][0].age).toEqual(25);
		});
		it('should add an entity to object index', () => {
			def.isCollection = false;
			catalog.addIndex(def);
			catalog.add(obj);
			expect(catalog.indices['ByNameHair']['bob~yes'].length).toBeFalsy();
			expect(catalog.indices['ByNameHair']['bob~yes'].age).toEqual(25);
		});
		it('should overwrite when adding to an object index using same properties',() => {
			def.isCollection = false;
			catalog.addIndex(def);
			catalog.add(obj);
			catalog.add(obj2);
			expect(catalog.indices['ByNameHair']['bob~yes'].length).toBeFalsy();
			expect(catalog.indices['ByNameHair']['bob~yes'].age).toEqual(41);
		});
		it("should add multiple objects to collection index", () => {
			catalog.addIndex(def);
			catalog.add(obj);
			catalog.add(obj2);
			expect(catalog.indices['ByNameHair']['bob~yes'].length).toEqual(2);
			expect(catalog.indices['ByNameHair']['bob~yes'][0].age).toEqual(25);
			expect(catalog.indices['ByNameHair']['bob~yes'][1].age).toEqual(41);
		})
		it("should NOT add same object to collection index mutiple times", () => {
			catalog.addIndex(def);
			catalog.add(obj);
			catalog.add(obj2);
			catalog.add(obj);
			expect(catalog.indices['ByNameHair']['bob~yes'].length).toEqual(2);
			expect(catalog.indices['ByNameHair']['bob~yes'][0].age).toEqual(25);
			expect(catalog.indices['ByNameHair']['bob~yes'][1].age).toEqual(41);
		})
		it("should NOT add same object to catalog.entities mutiple times", () => {
			catalog.addIndex(def);
			catalog.add(obj);
			catalog.add(obj2);
			catalog.add(obj);
			expect(catalog.entities.length).toEqual(2);
		})
	});

	describe('.get', () => {
		let def, objs, indexName;
		beforeEach(() => {
			indexName = 'ByNameHair';
			def = new IndexDefinition(indexName,['name','hair'],true,'~');
			objs = [
				{ name: 'bob', age: 25, hair: 'yes'},
				{ name: 'bob', age: 13, hair: 'blue'},
			];
		});

		it('should get a collection from a collection index', () => {
			catalog.addIndex(def).addAll(objs);
			let arr = catalog.get(indexName, {name: 'bob', hair: 'yes'});
			expect(arr.length).toEqual(1); // is collection and has 1 element;
			expect(arr[0].age).toEqual(25); // is the object we expect;
		});
		it('should get an object from an object index', () => {
			def.isCollection = false;
			catalog.addIndex(def).addAll(objs);
			let obj = catalog.get(indexName, {name: 'bob', hair: 'yes'});
			expect(obj.length).toBeFalsy(); // is collection and has 1 element;
			expect(obj.age).toEqual(25); // is the object we expect;
		});
		it('should throw if the index does not exist', () => {
			catalog.addIndex(def).addAll(objs);
			expect(() => {
				catalog.get('baboo', {name: 'bob', hair: 'yes'});
			}).toThrow();
		});
		it('should throw if there is no lookup object', () => {
			catalog.addIndex(def).addAll(objs);
			expect(() => {
				catalog.get(indexName, null);
			}).toThrow();
		});
		//it("should throw if lookup properties don't match the indexed properties", () => {
			// INVALID TEST -- Allow undefined properties to be indexed as undefined
			// catalog.addIndex(def).addAll(objs);
			// expect(() => {
			// 	catalog.get(indexName, {name: 'bob', shoes: 'ungodly'});
			// }).toThrow();
		//});
		it("should return empty array if collection index properties not found", () => {
			catalog.addIndex(def).addAll(objs);
			let arr = catalog.get(indexName, {name: 'bob', hair: 'ungodly'});
			expect(arr.length).toEqual(0); // is collection and has no element;
		});
		it("should return null if object index properties not found", () => {
			def.isCollection = false;
			catalog.addIndex(def).addAll(objs);
			let obj = catalog.get(indexName, {name: 'bob', hair: 'ungodly'});
			expect(obj).toBe(null);
		});
	});

	describe('.getAll', () => {
		let def, obj, obj2;
		beforeEach(() => {
			def = new IndexDefinition('ByNameHair',['name','hair'],true,'~');
			obj = { name: 'bob', age: 25, hair: 'yes'}
			obj2 = { name: 'bob', age: 41, hair: 'yes'}
			catalog.addIndex(def).add(obj);
			catalog.add(obj2);
		});
		afterEach(() => {
			def = null;
			obj = null;
			obj2 = null;
		});
		it("should get all the entities, no matter how they are indexed", () => {
			expect(catalog.getAll().length).toEqual(2);
		});
	});

	describe('.addAll', () => {
		let def, def2, objs;
		beforeEach(() => {
			def = new IndexDefinition('ByNameHair',['name','hair'],true,'~');
			def2 = new IndexDefinition('ByName',['name'],true,'~');
			objs = [
				{ name: 'bob', age: 25, hair: 'yes'},
				{ name: 'bob', age: 41, hair: 'yes'}
			]
		});
		afterEach(() => {
			def = null;
			def2 = null;
			objs = null;
		});
		it("should add multiple entities to an index", () => {
			catalog.addIndex(def).addAll(objs);
			expect(catalog.entities.length).toEqual(2);
			let collection = catalog.get('ByNameHair',{name: 'bob', hair: 'yes'});
			expect(collection.length).toEqual(2)
		});
		it("should add multiple entities to multiple indices", () => {
			objs.push({name: 'bob', age: '0', hair: 'no'});
			catalog.addIndex(def).addIndex(def2).addAll(objs);
			expect(catalog.entities.length).toEqual(3);
			let collection = catalog.get('ByNameHair',{name: 'bob', hair: 'yes'});
			expect(collection.length).toEqual(2)
			collection = catalog.get('ByName',{name: 'bob'});
			expect(collection.length).toEqual(3)
		});
		it("should add multiple entities to multiple indices if entities are loaded before index definitions", () => {
			objs.push({name: 'bob', age: '0', hair: 'no'});
			catalog.addAll(objs);
			catalog.addIndex(def).addIndex(def2);
			expect(catalog.entities.length).toEqual(3);
			let collection = catalog.get('ByNameHair',{name: 'bob', hair: 'yes'});
			expect(collection.length).toEqual(2)
			collection = catalog.get('ByName',{name: 'bob'});
			expect(collection.length).toEqual(3)
		});
		it("should add multiple entities to multiple indices if entities are loaded before index definitions", () => {
			objs.push({name: 'bob', age: '0', hair: 'no'});
			catalog.addAll(objs);
			catalog.addIndex(def).addIndex(def2);
			expect(catalog.entities.length).toEqual(3);
			let collection = catalog.get('ByNameHair',{name: 'bob', hair: 'yes'});
			expect(collection.length).toEqual(2)
			collection = catalog.get('ByName',{name: 'bob'});
			expect(collection.length).toEqual(3)
		});
		it("should add multiple entities to multiple indices if entities are loaded between index definitions", () => {
			objs.push({name: 'bob', age: '0', hair: 'no'});
			catalog.addIndex(def).addAll(objs);
			catalog.addIndex(def2);
			expect(catalog.entities.length).toEqual(3);
			let collection = catalog.get('ByNameHair',{name: 'bob', hair: 'yes'});
			expect(collection.length).toEqual(2)
			collection = catalog.get('ByName',{name: 'bob'});
			expect(collection.length).toEqual(3)
		});

	});

	describe('.getKeys', () => {
		let def, objs;
		beforeEach(() => {
			def = new IndexDefinition('ByNameHair',['name','hair'],true,'~');
			objs = [
				{ name: 'bob', age: 25, hair: 'yes'},
				{ name: 'bob', age: 18, hair: 'blue'},
				{ name: 'bob', age: 41, hair: 'yes'}
			];
		});
		afterEach(() => {
			def = null;
			objs = null;
		});
		it("should throw if the specified index does not exist", () => {
			expect(() => {
				catalog.getKeys('baboo');
			}).toThrow();
		});
		it("should return an array of key objects for the specified index", () => {
			catalog.addIndex(def).addAll(objs);
			let keyObjs = catalog.getKeys(def.indexName);
			expect(keyObjs.length).toEqual(2);
			expect(keyObjs[0]).toEqual({name:'bob',hair:'yes'});
			expect(keyObjs[1]).toEqual({name:'bob',hair:'blue'});
		});
	});

	describe('.remove', () => {
		let defs, objs;
		beforeEach(() => {
			defs = [
				new IndexDefinition('byName',['name'],true,'~'),
				new IndexDefinition('byNameHair',['name','hair'],false,'~'),
			]
			objs = [
				 { name: 'bob', age: 25, hair: 'yes'},
				 { name: 'bob', age: 41, hair: 'blue'}
			 ];
			catalog.addIndex(defs[0]).addIndex(defs[1]).addAll(objs);
			catalog.remove(objs[0]);
		});

		it("should remove the object from the catalog.entities array", () => {
			expect(catalog.entities.length).toEqual(1);
		});
		it("should remove the object from a collection index", () => {
			let byName = catalog.get(defs[0].indexName,objs[0]);
			expect(byName.length).toEqual(1);
			expect(byName[0].age).toEqual(41);
		});
		it("should remove the object from an object index", () => {
			expect(catalog.get(defs[1].indexName,objs[0])).toBe(null);
			expect(catalog.get(defs[1].indexName,objs[1]).age).toEqual(41);
		});
	});

	describe('.update', () => {
		let def, def2, objs;
		beforeEach(() => {
			def = new IndexDefinition('ByNameHair',['name','hair'],false);
			def2 = new IndexDefinition('ByName',['name'],true);
			objs = [
				{ name: 'bob', age: 25, hair: 'yes'},
				{ name: 'bob', age: 18, hair: 'blue'},
				{ name: 'bob', age: 41, hair: 'unkempt'}
			];
			catalog.addIndex(def).addIndex(def2).addAll(objs);
		});
		afterEach(() => {
			def = null;
			def2 = null;
			objs = null;
		});
		it("should change unindexed properties without altering indices", () => {
			let change = { age: 85 };
			let obj = objs[1];
			catalog.update(obj,change);
			expect(catalog.getKeys('ByName').length).toEqual(1);
			expect(catalog.get('ByNameHair',{name:'bob', hair:'blue'}).age).toEqual(85);
		});
		it("should add properties to an object(???)", () => {
			let change = { eyes: 'yes' };
			let obj = objs[1];
			catalog.update(obj,change);
			expect(catalog.get('ByNameHair',{name:'bob', hair:'blue'}).eyes).toEqual('yes');
		});
		it("should work properly for an object with an undefined indexed property", () => {
			let obj = {name: 'jon', age:2 };
			catalog.add(obj);
			let change = { hair: 'unspectacular' };
			catalog.update(obj,change);
			expect(catalog.get('ByNameHair',{name:'jon', hair:'unspectacular'}).age).toEqual(2);
			expect(catalog.get('ByName',{name:'jon'}).length).toEqual(1);
		});
		it("should reindex in an object index", () => {
			let change = { hair: 'curly' };
			let obj = objs[1];
			catalog.update(obj,change);
			expect(catalog.get('ByNameHair',{name:'bob', hair:'blue'})).toBe(null);
			expect(catalog.get('ByNameHair',{name:'bob', hair:'curly'})).toBeTruthy();
			expect(catalog.get('ByNameHair',{name:'bob', hair:'curly'}).age).toEqual(18);
		});
		it("should reindex in a collection index", () => {
			let change = { name: 'curly' };
			let obj = objs[1];
			catalog.update(obj,change);
			expect(catalog.get('ByName',{name:'bob'}).length).toEqual(2);
			expect(catalog.get('ByName',{name:'curly'}).length).toEqual(1);
		});
		it("should throw if object is not indexed", () => {
			let change = { name: 'curly' };
			let obj = {name:'bob',age:432,hair:'no'};
			expect(() => {
				catalog.update(obj,change);
			}).toThrow();
		});
	});

	describe('._getDelim', () => {
		it('should return the default delimiter if none was defined', () => {
			let def = new IndexDefinition('index',['name','hair'],true);
			catalog.addIndex(def);
			// we expect typescript compilation error (private member being accessed)
			expect(catalog["_getDelim"](def)).toEqual('|~|');
		})
		it('should return the defined delimiter if specified', () => {
			let def = new IndexDefinition('index',['name','hair'],true,'~');
			catalog.addIndex(def);
			// we expect typescript compilation error (private member being accessed)
			expect(catalog["_getDelim"](def)).toEqual('~');
		})
	});
	//
	describe('._createKey', () => {
		it('should return a single-property key', () => {
			let def = new IndexDefinition('index',['name']);
			let obj = { name: 'Jon', age: 25};
			// spyOn<any> to avoid the typescript error on private function
			spyOn<any>(catalog,"_getDelim").and.returnValue('~');
			// private function can be accessed using this syntax without triggering
			// typescript errors
			expect(catalog["_createKey"](def,obj)).toEqual('Jon');
		});
		it('should return a multiple-property key', () => {
			let def = new IndexDefinition('index',['name','age']);
			let obj = { name: 'Jon', age: 25};
			spyOn<any>(catalog,"_getDelim").and.returnValue('~');
			expect(catalog["_createKey"](def,obj)).toEqual('Jon~25');
		});
		it("should work with undefined properties", () => {
			let def = new IndexDefinition('index',['sigil']);
			let def2 = new IndexDefinition('index2',['name','shoeSize']);
			let obj = { name: 'Jon', age: 25};
			spyOn<any>(catalog,"_getDelim").and.returnValue('~');
			expect(catalog["_createKey"](def,obj)).toEqual('undefined');
			expect(catalog["_createKey"](def2,obj)).toEqual('Jon~undefined');
		})
		it("should work with passed delimiters", () => {
			let def2 = new IndexDefinition('index2',['name','age']);
			let obj = { name: 'Jon', age: 25};
			spyOn<any>(catalog,"_getDelim").and.returnValue('~');
			expect(catalog["_createKey"](def2,obj,'///')).toEqual('Jon///25');
			expect(catalog["_getDelim"]).not.toHaveBeenCalled();
		})
	});
	//
	describe('._getAllIndexProperties', () => {
		it('should return the indexed properties for a single index', () => {
			let def = new IndexDefinition('index',['name','hair'],true);
			catalog.addIndex(def);
			// we expect typescript compilation error (private member being accessed)
			let props = catalog["_getAllIndexProperties"]();
			expect(props.length).toEqual(2);
			expect(props[0]).toEqual('name');
			expect(props[1]).toEqual('hair');
		})
		it('should return indexed properties for all indexes', () => {
			let def = new IndexDefinition('index',['name','hair'],true);
			let def2 = new IndexDefinition('index2',['shoe','age','height'],true);
			catalog.addIndex(def).addIndex(def2);
			let props = catalog["_getAllIndexProperties"]();
			expect(props.length).toEqual(5);
			expect(props[0]).toEqual('name');
			expect(props[4]).toEqual('height');
		})
		it('should reference each property only once', () => {
			let def = new IndexDefinition('index',['name','hair'],true);
			let def2 = new IndexDefinition('index2',['name','age','height'],true);
			catalog.addIndex(def).addIndex(def2);
			let props = catalog["_getAllIndexProperties"]();
			expect(props.length).toEqual(4);
			expect(props[0]).toEqual('name');
			expect(props[2]).toEqual('age');
		})
	});

	describe('._createIndex', () => {
		it('should call _addToIndex for each entity loaded', () => {
			let def = new IndexDefinition('index',['name','hair'],true,'~');
			let objs = [
				{ name: 'bob', age: 25, hair: 'yes'},
				{ name: 'bob', age: 18, hair: 'yes'},
				{ name: 'bob', age: 41, hair: 'unkempt'}
			];
			catalog.addAll(objs);
			spyOn<any>(catalog,"_addToIndex");
			catalog["_createIndex"](def);
			expect((catalog as any)["_addToIndex"].calls.count()).toEqual(3);
		})
		it('should set all the properties on catalog', () => {
			let def = new IndexDefinition('index',['name','hair'],true);
			let def2 = new IndexDefinition('index2',['shoe','age','height'],true);
			catalog.addIndex(def);
			catalog["_createIndex"](def2);
			expect(catalog.indices[def2.indexName]).toEqual({});
			expect(catalog.indexDefinitions[def2.indexName]).toBe(def2);
		})
	});

	describe('._willChangeIndex', () => {
		it('should return false if no indexed properties are updated', () => {
			let def = new IndexDefinition('index',['name','hair'],true,'~');
			let obj = { name: 'bob', age: 25, hair: 'yes'};
			let change = { age: 35 }
			catalog.addIndex(def).add(obj);
			expect(catalog["_willChangeIndex"](obj,change)).toBe(false);
		})
		it('should return true if one or more indexed properties are updated', () => {
			let def = new IndexDefinition('index',['name','hair'],true,'~');
			let obj = { name: 'bob', age: 25, hair: 'yes'};
			let change = <any>{ name: 'Jon' }
			catalog.addIndex(def).add(obj);
			expect(catalog["_willChangeIndex"](obj,change)).toBe(true);
			change.hair='nunyabidness';
			expect(catalog["_willChangeIndex"](obj,change)).toBe(true);
		})
	});

});
