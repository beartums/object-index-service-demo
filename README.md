# ObjectIndexServiceDemo

Javascript Service for indexing objects by a property or collection of properties

## Installation

  $ npm install object-index-service

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

  You can add the objects before defining the indices, but you will get a little more performance if you 
  add the indices first.

  You can add indeces and objects at any time and in any order.

  if you CHANGE and object's properties, it's always best if you use the service's update function so that if 
  and indexed property is changed the indices will change appropeiately.

  ```javascript
  let myDog = objectIndexService.get("Dog","byId",{dogId:1});
  // myDog == { dogId: 1, name: "Mr. Snuffles", breed: "Lhasa Apso", age: 2, isAGoodBoy: true};
  updateDog: { isAGoodBoy: false };
  objectIndexService.update("Dog", myDog, updateDog);
  ```
