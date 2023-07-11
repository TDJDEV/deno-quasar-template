import { DataMap } from './dataMap.ts'
import { Collection } from './collection.ts'

// Manage collections
export class Store {
  #__collections__
  #__records__

  constructor(data) { this.#__collections__ = this.#init(data) }

  /******************
  * Getters/Setters *
  ******************/
  // Return collection list
  get collections()     { return [...this.#__collections__.keys()] }

  // Store datas*
  get data()            { return Object.fromEntries(this.collections.map((key)=>[key,this.#action(key,'read')])) }
  set data(dataObject)  { this.#__collections__ = this.#init(dataObject) }

  /******************
  *     Methods     *
  ******************/

  /* public */
  
  // Public access to #action
  action(name:string,action:string,...args:any[]):unknown               { return this.#action(name,action,...args) }
  // // Public access to #get
  getCollection(name:string):Collection|null                            { return this.#get(name) }
  // Public access to #add
  setCollection(name:string,collection:Collection):Map<string,unknown>  { return this.#add(this.#__collections__,name,collection) }

  /* private */

  // Return requested data if found 
  #action(name:string,action:string,...args:any[]):unknown  { return this.#do(this.#get(name,action === "create"),action,args) }
  // Return collection or undefined
  #get(name:string,create:boolean):Collection|null          { return this.#addOrFind(this.#__collections__,name,create)?.get(name) }
  // Set or replace store data
  #init(data={}):Map                                        { return this.#setRecords() && this.#setCollections(data) }
  // Set or replace store collections map
  #setCollections(data={}):Map                              { return new Map(Object.entries(data).map((arr)=>this.#create(...arr))) }
  // Set or replace store record map
  #setRecords():void                                        { return this.#__records__ = new DataMap }
  // Create a collection
  #create(name:string,data?:[]):Collection                  { return new Collection(this.#__records__,name,{data}) }
  // Find a collection or add a new one
  #addOrFind(db:Map,name:string,create:boolean):Map|null    { return this.#find(db,name) || (create ? this.#add(db,name) : null) }
  // Add a new collection to store map
  #add(db:Map,name:string,collection?:Collection):Map       { return db.set(name,collection||this.#create(name)) }
  // find a collection
  #find(db:Map, name:string):Map|false                      { return db.has(name) && db }
  // Execute the passed action*
  #do(table:Collection,action,args:any[]):unknown           { return table && table[action] && table[action](...args) }
}