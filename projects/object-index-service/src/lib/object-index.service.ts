import { Injectable, Inject } from '@angular/core';

import { Catalog } from './catalog.class';
import { IndexDefinition } from './index-definition.class';

@Injectable({
  providedIn: 'root'
})
export class ObjectIndexService {

	catalogs: any = {};

	/**
	 * Create a new catalog (collection of indices for a specific entity)
	 * @param   entityName name of entity for which catalog is to be created
	 * @param   delimiter  delimiter, used for concatenated keys
	 * @return           the newly-created catalog
	 */
	createCatalog(entityName: string, delimiter?: string): Catalog {
		let catalog = new Catalog(entityName, delimiter, this.catalogs);
		this.catalogs[entityName] = catalog;
		return catalog;
	}

	deleteCatalog(entityName: string): boolean {
		try {
			delete this.catalogs[entityName];
		} catch (e) {
			return false
		}
		return true;
	}

	/**
	 * Find a catalog by named entity
	 * @param   entityName Name of the entity
	 * @return             catalog requested
	 */
	getCatalog(entityName: string): Catalog {
		return this.catalogs[entityName];
	}

	/**
	 * Create a new index for the catalogs
	 * @param   entityName Name of the entity-catalog to update
	 * @param   indexDef   Definition of the index to be created
	 * @return             this service for chaining
	 */
	addIndex(entityName: string, indexDef: IndexDefinition): ObjectIndexService {
		this.getCatalog(entityName).addIndex(indexDef);
		return this;
	}

	/**
	 * Remove an index from the specified catalog
	 * @param   entityName Name of catalog to update
	 * @param   indexName  Name of Index to remove
	 * @return             this service, for chaining
	 */
	removeIndex(entityName: string, indexName: string): ObjectIndexService {
		this.getCatalog(entityName).removeIndex(indexName);
		return this;
	}

	/**
	 * Create an indexDefinition object, so the class dependency is
	 *  not in the calling module
	 * @param            indexName         Name of the indexName
	 * @param          propertiesToIndex Properties to be indexed
	 * @param           isCollection      Will this return an array of entities
	 * @param            delimiter         optional delimiter
	 * @return                    The index definition
	 */
	createDefinition(indexName: string, propertiesToIndex: string[], isCollection: boolean, delimiter?: string): IndexDefinition {
		let indexDef = new IndexDefinition(indexName, propertiesToIndex,
																				isCollection, delimiter);
		return indexDef;
	}

	/**
	 * Add an entity to a catalog
	 * @param  entityName Name of the catalogued entity
	 * @param  entity     entity to add
	 * @return  			added entity
	 */
	add<T>(entityName: string, entity: T): T {
		return this.getCatalog(entityName).add(entity);
	}

	/**
	 * Add a collection of entities to a catalog
	 * @param  entityName Name of the entity being added
	 * @param  entities to add
	 * @return  added entities
	 */
	addAll<T>(entityName: string, entities: Array<T>): Array<T> {
		return this.getCatalog(entityName).addAll(entities);
	}

	/**
	 * Get an entity (or entity collection) using entity name, index name,
	 * and an object containing the necessary keysO
	 * @param   entityName Name of the entitiy to Find
	 * @param   indexName  Name of the index to used
	 * @param    keysObject An object that has the right key-value pairs for the
	 *                             index
	 * @return   The entity found
	 */
	get<T>(entityName: string, indexName?: string, keysObject?: T): T | Array<T> {
		if (!indexName && !keysObject) return this.getAll(entityName);
		return this.getCatalog(entityName).get(indexName, keysObject);
	}

  /**
   * For a specified index, return an array of objects with the unique key values as properties
   * @param entityName Name of the entity Catalog
   * @param indexName Name of the index for which to retrieve keys
   * @return Array of objects with the property names matching the indexed properties
   *            from the index and the values matching one of unique keys for the index
   */
	getKeys(entityName: string, indexName: string): any[] {
		return this.getCatalog(entityName).getKeys(indexName);
	}
/**
 * Get all named entities
 * @param   entityName Name of the entity to get
 * @return              Collection of entities
 */
	getAll<T>(entityName: string): Array<T> {
		return this.getCatalog(entityName).getAll();
	}
	/**
	 * remove an entity from all indices
	 * @param   entityName Name of the entity to remove
	 * @param      entity     Entity to remove
	 * @return                entity removed
	 */
	remove<T>(entityName: string, entity: T): T {
		return this.getCatalog(entityName).remove(entity);
	}

	/**
	 * Update an entity where indices might have changed
	 * @param   entityName   Name (type of) entity to updateObject
	 * @param      entity       Entity to update
	 * @param      updateObject Object with the updated properties
	 * @return               Entity after updating
	 */
	update<T>(entityName: string, entity: T, updateObject: any): T {
		return this.getCatalog(entityName).update(entity, updateObject);
	}
}
