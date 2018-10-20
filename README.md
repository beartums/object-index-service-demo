# ObjectIndexServiceDemo

Demonstration of a Javascript Service library for indexing objects by a property or collection of properties

## Installation

There are 2 projects in this repository -- the Object Index Service library (under /projects) and the Demo.  The library needs to be built before the demo can use it.  

Clone and install:
```
> git clone https://github.com/beartums/object-index-service-demo.git
> cd object-index-service-demo
> npm install
```
Build the library and serve:
```
> ng build --prod object-index-service
> ng serve
```

## Running Tests

Likewise, tests can be run for the library or the demo, but not both.  When running tests, you have to name the target of the tests being run.  

```
> ng test object-index-service --watch
```
or
```
> ng test object-index-service-demo --watch
```

## Using the Demo

The demo loads an array of Dog objects into indices based on the object properties.  

```typescript
class Dog {
  dogId: number;
  name: string;
  isAGoodBoy: boolean = true;
  breed: string;
}
```

The demo let's you choose an index to search using and then let's you specify the search value for each property in the index.  For example, if you choose the index 'byNameAndIsGood', you can enter 'Fido' and 'true', which will return 4 dogs with the name Fido.  

The search values are exact matches only (including case-sensitivity).  Check the code for values to search for.
