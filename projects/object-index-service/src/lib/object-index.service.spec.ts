import { TestBed, inject } from '@angular/core/testing';

import { ObjectIndexService } from './object-index.service';

import { IndexDefinition } from './index-definition.class';

// HACK ALERT:
//
// Typescript doesn't always play nice with Karma.  There's probably a package out There
// to fix it.  But in this file there are several SpyOn functions that throw compile
// errors because according to typescript, the spyOn functions (.calls,etc) aren't on the
// original type.  To avoid this, always cast the spied-on object as <any>
//
// you have been warned
//

describe('ObjectIndexService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ObjectIndexService]
    });
  });

  it('should be created', inject([ObjectIndexService], (service: ObjectIndexService) => {
    expect(service).toBeTruthy();
  }));

	describe('.createCatalog', () =>{
		it('should return a catalog', inject([ObjectIndexService], (service: ObjectIndexService) => {
	    let catalog = service.createCatalog('testCatalog');
			expect(catalog.entityName).toEqual('testCatalog');
	  }));
		it('should store the catalog in service.catalogs', inject([ObjectIndexService], (service: ObjectIndexService) => {
			let catalog = service.createCatalog('testCatalog');
			expect(service.catalogs['testCatalog']).toEqual(catalog);
	  }));
	});

	describe('.deleteCatalog', () =>{
		it('should return true when successfully removed', inject([ObjectIndexService], (service: ObjectIndexService) => {
			let name = 'testCatalog';
	    service.createCatalog(name);
			expect(service.deleteCatalog(name)).toBe(true);
	  }));
		it('should remove the catalog from service.catalogs', inject([ObjectIndexService], (service: ObjectIndexService) => {
			let name = 'testCatalog';
			service.createCatalog(name);
			service.deleteCatalog(name)
			expect(service.catalogs[name]).toBeFalsy();
			expect(Object.keys(service.catalogs).length).toEqual(0);
	  }));
	});

	describe('.getCatalog', () =>{
		it('should return an existing catalog', inject([ObjectIndexService], (service: ObjectIndexService) => {
			let name = 'testCatalog';
	    let catalog = service.createCatalog(name);
			expect(service.getCatalog(name)).toBe(catalog);
	  }));
		it('should return undefined if catalog not found', inject([ObjectIndexService], (service: ObjectIndexService) => {
			let name = 'testCatalog';
			expect(service.getCatalog(name)).toBeFalsy();
	  }));
	});

	describe('.addIndex', () =>{
		it('should return service for chaining', inject([ObjectIndexService], (service: ObjectIndexService) => {
			let name = 'testCatalog';
	    let catalog = service.createCatalog(name);
			let def = new IndexDefinition('test',['name']);
			let s = service.addIndex(name,def);
			expect(s).toBeTruthy();
			expect(s.createCatalog).toBeTruthy();
	  }));
		it('should get catalog and update with new index', inject([ObjectIndexService], (service: ObjectIndexService) => {
			let name = 'testCatalog';
	    let catalog = service.createCatalog(name);
			let def = new IndexDefinition('test',['name']);
			service.addIndex(name,def);
			expect(catalog.indices[def.indexName]).toEqual({});
			expect(catalog.indexDefinitions[def.indexName]).toEqual(def);
	  }));
		it('should call .getCatalog and catalog.addIndex once each', inject([ObjectIndexService], (service: ObjectIndexService) => {
			let name = 'testCatalog';
			let catalog = { addIndex() {console.log('hi')}};
			let def = new IndexDefinition('test',['name']);
			catalog.addIndex();
			let srvSpy = spyOn(service,"getCatalog").and.returnValue(catalog);
			let catSpy = spyOn(catalog, "addIndex");
			service.addIndex(name,def);
			expect(srvSpy.calls.count()).toEqual(1);
			expect(srvSpy.calls.argsFor(0)).toEqual([name]);
			expect(catSpy.calls.count()).toEqual(1);
			expect(catSpy.calls.argsFor(0)).toEqual([def]);
		}));
	});

	describe('.removeIndex', () =>{
		it('should return service for chaining', inject([ObjectIndexService], (service: ObjectIndexService) => {
			let name = 'testCatalog';
	    let catalog = service.createCatalog(name);
			let def = new IndexDefinition('test',['name']);
			service.addIndex(name,def);
			let s = service.removeIndex(name,def.indexName);
			expect(s).toBeTruthy();
			expect(s.createCatalog).toBeTruthy();
	  }));
		it('should get catalog and delete the index', inject([ObjectIndexService], (service: ObjectIndexService) => {
			let name = 'testCatalog';
	    let catalog = service.createCatalog(name);
			let def = new IndexDefinition('test',['name']);
			service.addIndex(name,def);
			service.removeIndex(name,def.indexName);
			expect(catalog.indices[def.indexName]).toBeFalsy();
			expect(catalog.indexDefinitions[def.indexName]).toBeFalsy;
	  }));
	});

	describe('.add (entity)', () =>{
		it('should return the added entity', inject([ObjectIndexService], (service: ObjectIndexService) => {
			let name = 'testCatalog';
	    let catalog = service.createCatalog(name);
			let obj = { name: 'jon', game: 'checkers'};
			let s = service.add(name,obj);
			expect(s).toBeTruthy();
			expect(s).toBe(obj);
	  }));
		it('should call .getCatalog and catalog.add once each', inject([ObjectIndexService], (service: ObjectIndexService) => {
			let name = 'testCatalog';
			let mockCat = { add() {}};
			let obj = { name: 'jon', game: 'checkers'};
			let srvSpy = spyOn(service,"getCatalog").and.returnValue(mockCat);
			let catSpy = spyOn(mockCat, "add");
			service.add(name,obj);
			expect(srvSpy.calls.count()).toEqual(1);
			expect(srvSpy.calls.argsFor(0)).toEqual([name]);
			expect(catSpy.calls.count()).toEqual(1);
			expect(catSpy.calls.argsFor(0)).toEqual([obj]);
		}));
	});

	describe('.addAll (entities)', () =>{
		it('should return the added entity array', inject([ObjectIndexService], (service: ObjectIndexService) => {
			let name = 'testCatalog';
	    let catalog = service.createCatalog(name);
			let objs = [{ name: 'jon', game: 'checkers'},{ name: 'cersei', game: 'chess'}];
			let s = service.addAll(name,objs);
			expect(s).toBeTruthy();
			expect(s).toEqual(objs);
	  }));
		it('should call .getCatalog and catalog.addAll once each', inject([ObjectIndexService], (service: ObjectIndexService) => {
			let name = 'testCatalog';
			let mockCat = { addAll() {}};
			let objs = [{ name: 'jon', game: 'checkers'},{ name: 'cersei', game: 'chess'}];
			let srvSpy = spyOn(service,"getCatalog").and.returnValue(mockCat);
			let catSpy = spyOn(mockCat, "addAll");
			service.addAll(name,objs);
			expect(srvSpy.calls.count()).toEqual(1);
			expect(srvSpy.calls.argsFor(0)).toEqual([name]);
			expect(catSpy.calls.count()).toEqual(1);
			expect(catSpy.calls.argsFor(0)).toEqual([objs]);
		}));
	});

	describe('.get', () =>{
		it('should call .getAll if only entityName is passed', inject([ObjectIndexService], (service: ObjectIndexService) => {
			let name = 'testCatalog';
	    let catalog = service.createCatalog(name);
			let obj = { name: 'jon', game: 'checkers'};
			let def = new IndexDefinition('test',['name'])
			service.add(name,obj);
			let allSpy = spyOn(service, "getAll");
			let catSpy = spyOn(service, "getCatalog");
			service.get(name)
			expect(allSpy.calls.count()).toEqual(1);
			expect(allSpy.calls.argsFor(0)).toEqual([name]);
			expect(catSpy.calls.count()).toEqual(0);
	  }));
		it('should call .getCatalog and catalog.get once otherwise', inject([ObjectIndexService], (service: ObjectIndexService) => {
			let name = 'testCatalog';
			let mockCat = { get() {}};
			let def = new IndexDefinition('testDef',['name'])
			let obj = { name: 'jon', game: 'checkers'};
			let lookupObj = {name:'jon'};
			let srvSpy = spyOn(service,"getCatalog").and.returnValue(mockCat);
			let catSpy = spyOn(mockCat, "get");
			service.get(name,def.indexName,lookupObj)
			expect(srvSpy.calls.count()).toEqual(1);
			expect(srvSpy.calls.argsFor(0)).toEqual([name]);
			expect(catSpy.calls.count()).toEqual(1);
			expect(catSpy.calls.argsFor(0)).toEqual([def.indexName,lookupObj]);
		}));
	});
});
