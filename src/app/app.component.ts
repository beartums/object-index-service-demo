import { Component } from '@angular/core';
import { IndexDefinition, ObjectIndexService } from "object-index-service";


@Component({
  selector: 'oisd-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],

})
export class AppComponent {
  title: string = 'object-index-service-demo';
  dogs: any[] = [
    { dogId: 1, name: "Fido", breed: "Africanus", isAGoodBoy: true },
    { dogId: 2, name: "Fido", breed: "Schnauzer", isAGoodBoy: true },
    { dogId: 3, name: "Mr. Snuffles", breed: "Lhasa Apso", isAGoodBoy: true },
    { dogId: 4, name: "Bruiser", breed: "Africanus", isAGoodBoy: false },
    { dogId: 5, name: "Cap'n Fuzzy", breed: "German Shepherd", isAGoodBoy: true },
    { dogId: 6, name: "Mr. Fido", breed: "Poodle", isAGoodBoy: true },
    { dogId: 7, name: "Boogerhead", breed: "Poodle", isAGoodBoy: true },
    { dogId: 8, name: "Cap'n Fuzzy", breed: "Siamese", isAGoodBoy: false },
    { dogId: 9, name: "Fido", breed: "Chihuahua", isAGoodBoy: true },
    { dogId: 10, name: "Fido", breed: "Africanus", isAGoodBoy: true },
  ];

  indices: IndexDefinition[] = [
    new IndexDefinition("byBreed", ["breed"], true),
    new IndexDefinition("byNameAndIsGood", ["name","isAGoodBoy"], true),
    new IndexDefinition("byId", ["dogId"], false ),
  ];

  chosenIndex: IndexDefinition = null;
  props = {};

  foundDogs = null;
  foundDog = null;

  constructor(private ois: ObjectIndexService) {
    let dogCat = this.ois.createCatalog("Dog");
    dogCat.addIndex(this.indices[0]).addIndex(this.indices[1]).addIndex(this.indices[2]);
    dogCat.addAll(this.dogs);
  }
  getDogs(idx: IndexDefinition, props: any ): void {
    this.foundDogs = null; this.foundDog = null
    if (idx.isCollection) {
      this.foundDogs = this.ois.get("Dog", idx.indexName, props);
    } else {
      this.foundDog = this.ois.get("Dog", idx.indexName, props);
    }
  }


}
