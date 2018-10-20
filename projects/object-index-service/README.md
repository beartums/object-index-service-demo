# ObjectIndexService

  Angular Javascript Service for indexing objects by a property or collection of properties.

  Best deployed in low-infrastructure environments using low-powered mobile devices.
  We most often use this on tablets to navigate nested entities that we pull from APIs in flat collections, especially if they have to be accessed in multiple
  ways.

  e.g. the collections: SalesOrders, SalesPerson, BusinessUnit, where SalesOrders
  has foreign keys to SalesPerson and BusinessUnit.  If we create catalogs for 
  each collection, we can create indices for SalesOrders by SalesOrderId,
  SalesPersonId, and BusinessUnitId.  We can also index SalesPerson and BusinessUnit by their IDs.  Then, given a specific SalesOrder, I can retrieve the 
  BusinessUnit and the SalesPerson without having to loop through the arrays.  And 
  given a specific SalesPerson, I can retrieve all the orders without looping 
  through that array.

## Installation

  `> npm install --save object-index-service`

  In your module, include it with:

  ```javascript
  // Import the service
  import { ObjectIndexService } from "object-index-service";
  
  // Add it to the providers array for the module
  @NgModule({
    ...
    providers: [ObjectIndexService, ...]
    ...
  })
  ```

  Then import the service and either of the classes you need in the component or service where you are going to use them

  ```javascript
  // Import what you need
  import { ObjectIndexService, Catalog } from "object-index-service";
  ```

## Structure and Classes

  `ObjectIndexService`: standard angular service that should be declared in your module and manages Catalogs and keeps them loaded between controllers

  `Catalog`: This keeps track of a collection of objects that share the same interface
  (for example, Dogs) and the indices that are built on the shared properties.

  `IndexDefinition`: Defines the properties used for each index and whether the index is a collection or a single item

## Usage

  Create a Catalog (a collection of objects with the same interface)

  ```javascript
  let dogCat = objectIndexService.createCatalog("Dog");
  // For Dog objects:
  //  class Dog {
  //    dogId: number;
  //    name: string;
  //    breed: string;
  //    isAGoodBoy: boolean;
  //    age: number;
  //  }
  ```

  Define Indices for the object being catalogued

  ```javascript
  // index name, array of properties to index, isCollection
  let breedIndex = new IndexDefinition("byBreed", ["breed"], true);
  
  // also isCollection == true (because there are a lot of Fidos)
  let nameIndex = new IndexDefinition("byNameAndIsGood", ["name","isAGoodBoy"], true);

  // isCollection == false because the id is unique
  let idIndex = new IndexDefinition("byId", ["dogId"], false );
  ```

  Add the indices to the catalog

  ```javascript
  dogCat.addIndex(breedIndex).addIndex(nameIndex).addIndex(idIndex);
  // alternatively:
  // objectIndexService.addIndex("Dog",breedIndex).addIndex("Dog",nameIndex)
  //    .addIndex("Dog",idIndex)
  ```

  Add the entities, then access them by index

  ```javascript
  dogCat.addAll(dogs);
  // alternatively:
  // objectIndexService.addAll("Dog",dogs)

  let schnauzers = objectIndexService.get("Dog","byBreed",{breed: "schnauzer"});
  let dog1 = objectIndexService.get("Dog","byId",{dogId: 1});
  let goodFidos = objectIndexService.get("Dog","byNameAndIsGood", {name:"Fido",isAGoodBoy:true});
  ```

## Notes

  If an index is defined as `isCollection: false` adding a new object with the same indexed properties
  as a previous object will cause the first object no longer to be referenced in the index.

  You can add the objects before defining the indices, but you will get a little more performance if you add the indices first.

  You can add indices and objects at any time and in any order.

  When you CHANGE an object's properties, it's always best if you use the service's update function so that changes to an indexed property will properly ensure reindexing.
  
  ```javascript
  let myDog = objectIndexService.get("Dog","byId",{dogId:1});
  // myDog == { dogId: 1, name: "Mr. Snuffles", breed: "Lhasa Apso", age: 2, isAGoodBoy: true};
  
  // undefined properties in the update object are not changed in the reference object
  updateDog: { isAGoodBoy: false };

  objectIndexService.update("Dog", myDog, updateDog);
  // alternately: 
  // dogCat.update(myDog, updateDog);
  ```
