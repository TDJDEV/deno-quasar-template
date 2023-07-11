import { Record } from './record.ts'
import { DataMap } from './dataMap.ts'
import { ContentType } from './contentType.ts'

// Manage records and define it's data structure 
export class Collection{
    #__name__
    #__dataModel__
    #__data__
    #__chars__
    #__i__
  
    constructor(Records:DataMap,name:string,{model,data}:{data:[],model?:{}}){
      this.#__name__ = name
      this.#__dataModel__ = model || (Array.isArray(data)?data:[]).reduce(()=>"",{})
      this.#__data__ = new DataMap(data?.map(x=>[x.id,new Record(x)])).attach(Records)
      this.#__chars__ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      this.#__i__ = 0
      console.log(`Collection ${name} has been created`)
    }
  
    get name() { return this.#__name__ }
  
    /******************
    *     Methods     *
    ******************/
  
    /* public */
  
    // crud
    create(data:unknown)            { return ((id:string)=>this.#add(this.#createRecord(this.#__name__,id,data)) )(crypto.randomUUID()) }
    read(id:string,filters:any)     { return id ? this.#__data__?.get(id) : this.#filterHandler(this.#toArray(this.#__data__?.values()),filters) }
    update(id:string,data:unknown)  { return this.#__data__.get(id)?.set(data)}
    delete(id:string)               { return this.#__data__.delete(id)}
    patch(id:string,data:unknown)   { return this.#__data__.get(id)?.update(data)}
    
    /* private */
  
    // Define collection records data model
    #setDataModel(collection:string,id:string,attributes:unknown)  { return new Record(this.#__dataModel__,{id,collection,attributes})  }
    // Create a record
    #createRecord(collection:string,id:string,attributes:unknown)  { return new Record(this.#__dataModel__,{id,collection,attributes})  }
    // Add recorde to collection
    #add(record:Record)                                             { return (id=>(this.#__data__.set(id,record),id))(record.id) }
    // Partially update record
    #patchRecord(record:Record,data:unknown)                       { return record?.update(data) }
    // Convert iterable to array
    #toArray(item:Iterable)                                         { return item && [...item] };
    // Return filtered records
    #filterHandler(data:Record[],filters:{})                       { return filters ? this.#Filter(data,this.#readFilters(filters)) : data }
    // Convert filters to iterable
    #readFilters(filters:{})                                        { return Object.entries(filters) }
    // Filter collection records
    #Filter(data:{}[],filters:[][])                                 { return data.filter(record => filters.every(([key,val])=>record[key]==val)) }
  }