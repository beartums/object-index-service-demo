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

/**
 * Catalog class
 *
 * A Catalog is a collection of a single type of entity,
 * indices for that entity, and index definitions.  This is used to lookup specific
 * entities (or arrays of entities) by specific values
 */
export class Catalog {

	indices: any = {};						// Keyed by index name
	indexDefinitions: any = {};		// Definitions of the indices being used
	entities: any[] = [];					// Entity store -- all entities indexed in this catalog

	catalogs: any = {}			// collection of catalogs from the index service

	entityName: string;						// Name of the entity being cataloged
	delimiter: string;						// Delimiter to use for multipart keys

	/**
	 * Create a catalog (collection of indices for a single entity)
	 * @param     	 entityName Name of the entity being catalogued
	 * @param      delimiter Delimiter for the keys that will create the index
	 * @return       this
	 */
	constructor(entityName: string, delimiter: string = '|~|', catalogs?: any ) {
		this.entityName = entityName;
		this.delimiter = delimiter;
		this.catalogs = catalogs;
	}

	/**
	 * Add a new index to this catalogs
	 * @param   indexDef Definition of the new indexDef
	 * @param  	force	Force the rebuilding of this index if it already exists
	 * @return           the current catalog for chaining
	 */
	addIndex(indexDef: IndexDefinition, force: boolean = false): any {
		// TODO: What if it exists (same fields, different order)?
		// TODO: What if it exists (same fields, same order)?
		if (this.indexDefinitions[indexDef.indexName] && !force)
			throw new Error(`Index named "${indexDef.indexName}" already exists for ${this.entityName}`);
		this.indexDefinitions[indexDef.indexName] = indexDef;
		this.indices[indexDef.indexName] = this._createIndex(indexDef);
		return this; // return catalog for chaining
	}

	/**
	 * Remove an existing index from the catalog
	 * @param   indexName Name of the index to removeIndex
	 * @return            removed index
	 */
	removeIndex(indexName: string): any {
		// TODO: if index does not exist?
		let index = this.indices[indexName]
		if (!index) throw new Error((`Index named "${indexName}" does not exist for (cannot be removed from) ${this.entityName}`));
		delete this.indices[indexName];
		delete this.indexDefinitions[indexName];
		return this; // return catalog for chaining
	}

	// MANAGE INDEXED ITEMS
	//

	/**
	 * Get an indexed entity (or array of entities)
	 * @param   indexName       Name of the index to used
	 * @param   indexPropertiesObject Object with property names/values for lookup
	 * @return             entity (array of entities) referenced
	 */
	get(indexName: string, indexPropertiesObject: any): any {
		if (!indexPropertiesObject) throw `Cannot lookup within index '${indexName}' because there are no defined index properties on the passed key object`
		let indexDef = this.indexDefinitions[indexName];
		if (!indexDef) throw `Index '${indexName}' does not exist for catalog '${this.entityName}'`
		let indexProps = indexDef.indexedProperties;
		let key = this._createKey(indexDef,indexPropertiesObject);
		let value = this.indices[indexName][key];
		if (!value) value = indexDef.isCollection ? [] : null;
		return value;
	}

	getAll(): any[] {
		return this.entities;
	}

	/**
	 * Get all the unique keys for an index
	 * @param   indexName Name of the index to get the keys from
	 * @return             Keys in the form of objects with the values as properties
	 */
	getKeys(indexName: string): any[] {
		let indexDef = this.indexDefinitions[indexName];
		if (!indexDef)
			throw new Error(`Index '${indexName}' does not exist for catalog '${this.entityName}'`);
		let indexProps = indexDef.indexedProperties;
		let index = this.indices[indexName];
		let indexKeys = Object.keys(index);
		let keyObjects = [];
		// for each unique key, build a key object using the values from the concatenated
		//  string and the indexed properties for the index
		for (let i = 0; i < indexKeys.length; i++) {
			let key = indexKeys[i];
			let values = key.split(this._getDelim(indexDef));
			let keyObject = new Object();
			for (let j = 0; j < indexProps.length; j++) {
				keyObject[indexProps[j]] = values[j];
			}
			keyObjects.push(keyObject);
		}
		return keyObjects;
	}
	/**
	 * Add an entity to all predifined indeces and to the entity array
	 * @param   entity            entity to add
	 * @param   onlyUpdateIndices Don't add it to the entity array
	 * @return                    the entity added
	 */
	add(entity: any, onlyUpdateIndices: boolean = false): any {
		// Add the entity to each index
		for (let prop in this.indexDefinitions) {
			let def = this.indexDefinitions[prop];
			this._addToIndex(def,entity);
		}
		// update the entity store
		if (!onlyUpdateIndices) {
			if (this.entities.indexOf(entity) === -1)	this.entities.push(entity);
		}
		return entity;
	}

	/**
	 * Add all entities to the catalog from an array of entities
	 * @param        entities entities to addAll
	 * @param     onlyUpdateIndices False to add the entity to the store
	 * @return                Array of added entities
	 */
	addAll(entities: any[], onlyUpdateIndices: boolean = false): any[] {
		let newEntities: any[] = [];
		for (let i = 0; i < entities.length; i++) {
			newEntities.push(this.add(entities[i],onlyUpdateIndices));
		}
		return newEntities;
	}

	/**
	 * Remove the entity from all indices
	 * @param   entity            entity to remove
	 * @param   onlyUpdateIndices false to also remove from entities store
	 * @return                    entity removed
	 */
	remove(entity: any, onlyUpdateIndices: boolean = false): any {
		for (let prop in this.indexDefinitions) {
			let def = this.indexDefinitions[prop];
			let key = this._createKey(def,entity);
			let value = this.indices[def.indexName][key];
			if (def.isCollection) {
				let idx = value.indexOf(entity);
				if (idx > -1) value.splice(idx,1);
			} else {
				delete this.indices[def.indexName][key];
			}
		}

		if (!onlyUpdateIndices) {
			let idx = this.entities.indexOf(entity);
			this.entities.splice(idx,1);
		}
		return entity;
	}

	/**
	 * Update the properties on a previously saved entity (remove, change, add)
	 * @param   entity             The entity to be changed
	 * @param   propertiesToUpdate An object with the properties to be updated
	 * @return                     The changed entity
	 */
	update(entity: any, propertiesToUpdate: any): any {
		// TODO: Make sure the entity is one in the entity store or throw
		let isChangingIndex = this._willChangeIndex(entity, propertiesToUpdate);
		if (this.entities.indexOf(entity)===-1) throw new Error ('Specified entity cannot be updated because it has not been added to the catlog yet');
		if (isChangingIndex) this.remove(entity,true);
		for (let prop in propertiesToUpdate) {
			entity[prop] = propertiesToUpdate[prop];
		}
		if (isChangingIndex) this.add(entity,true);
		return entity;
	}

	// HELPER FUNCTIONS
	//
	/**
	 * Create the lookup key from an object with the appropriate Key/values
	 * @param   indexDef  The index we are creating the key for
	 * @param               object    The object with the needed Key/Value pairs
	 * @param            delimiter Optional key delimiter (for multipart keys)
	 * @return                     The needed key
	 */
	private _createKey(indexDef: IndexDefinition, object: any, delimiter?: string): string {
		let properties = indexDef.indexedProperties;
		delimiter = delimiter || this._getDelim(indexDef);
		let key = '';
		for (let i = 0; i < properties.length; i++) {
			let prop = properties[i]
			if (!object || !object[prop]) {
				//console.log(this.entityName,object,prop);
				let x = 1;
			}
			key += (key.length == 0 ? '' : delimiter) + object[prop];
		}
		return key;
	}

	/**
	 * Get the delimiter using: Override, index Delim, catalog delimiter
	 * @param   indexDef Index referenced
	 * @return                    Delimiter to use
	 */
	private _getDelim(indexDef: IndexDefinition): string {
		return indexDef.delimiter || this.delimiter;
	}

	/**
	 * Get an array of all the properties that are indexed for this catalog
	 * @return  Array of properties indexed
	 */
	private _getAllIndexProperties(): string[] {
		let props = [];
		for (let prop in this.indexDefinitions) {
			props = props.concat(this.indexDefinitions[prop].indexedProperties);
		}
		return Array.from(new Set(props));
	}

	/**
	 * Add the index, index definition to the catalog; index the existing entities
	 * @param   indexDef IndexDefinition to be added
	 * @return                       the index, once built
	 */
	private _createIndex(indexDef: IndexDefinition): any {
		this.indexDefinitions[indexDef.indexName] = indexDef;
		this.indices[indexDef.indexName] = {};
		for (let i = 0; i < this.entities.length; i++) {
			let entity = this.entities[i];
			this._addToIndex(indexDef, entity);
		}
		return this.indices[indexDef.indexName];
	}

	/**
	 * Add a spcific entity to a specific indexDef
	 * @param   indexDef Definition objec for index being added to
	 * @param               entity   The entity to be added to the index
	 * @return                       The entity that was added
	 */
	private _addToIndex(indexDef: IndexDefinition, entity: any): any {
		if (!this.indices[indexDef.indexName]) this.indices[indexDef.indexName] = {}
		let index = this.indices[indexDef.indexName];
		let key = this._createKey(indexDef,entity);
		// toDo handle updates/overwrites
		if (!indexDef.isCollection) {
			index[key] = entity;
		} else {
			if (!index[key]) index[key] = [];
			if (index[key].indexOf(entity) === -1) index[key].push(entity);
		}
		return entity;
	}

	/**
	 * Will updating the entity with this object change any indexed value?
	 * @param       entity       Entity being changed
	 * @param       updateEntity Object holding the key/value pairs to updateEntity
	 * @return               True if any of the values being updated will affect any index
	 */
	private _willChangeIndex(entity: any, updateEntity: any): boolean {
		let props = this._getAllIndexProperties();
		return props.some(prop => {
			return (updateEntity.hasOwnProperty(prop) &&
							updateEntity[prop] != entity[prop]);
			}
		);

	}
}
