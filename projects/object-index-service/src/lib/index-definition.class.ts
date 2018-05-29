export class IndexDefinition {

	indexName: string;
	indexedProperties: string[];
	isCollection: boolean;
	delimiter: string;

	constructor(indexName: string, indexedProperties: string[], isCollection: boolean = false, delimiter?: string) {
			this.indexName = indexName;
			this.indexedProperties = indexedProperties;
			this.isCollection = isCollection || false;
			this.delimiter = delimiter;
	}
}