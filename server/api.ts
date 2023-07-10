// A MapObject that push it's data to all attached DataMap
class DataMap extends Map {
  #dataMaps
  constructor(parameters) {
    super(parameters)
    this.#dataMaps=new Set()
  }

  on(){}
  off(){}
  attach(dataMap:DataMap):this        { return (dataMap.isAttached(this) || dataMap === this) ? this.#error('circular reference detected') : this.#attachData(dataMap), this }
  isAttached(dataMap:DataMap):boolean { return this.#dataMaps.has(dataMap) || [...this.#dataMaps].some(deepDataMap=>deepDataMap.isAttached(dataMap)) }

  set(key:any,value:any):this         { if(this.#deepHas(key)) throw('this key is owned by a parent dataMap'); else return this.#deepSet(key,value) }
  delete(key:any):boolean             { return super.delete(key) && (this.#dataMaps.forEach(dataMap=>dataMap.delete(key)),true) }
  // check if current or parents map
  deepHas(key:any):boolean            { return super.has(key) || this.#dataMaps.size && [...this.#dataMaps].some(dataMap=>dataMap.deepHas(key)) }
  // check if only parent map
  #deepHas(key:any):boolean           { return this.#dataMaps.size && !super.has(key) && [...this.#dataMaps].some(dataMap=>dataMap.deepHas(key)) }
  // check if only parent map
  #deepSet(key:any,value:any):boolean { return this.#dataMaps.forEach(dataMap=>dataMap.set(key,value)), super.set(key,value) }
  #attachData(dataMap:DataMap):void   { if(this.#hasKeys(dataMap)) this.#error("duplicate key detected"); else this.#merge(dataMap) }
  #hasKeys(dataMap:DataMap):boolean   { return [...this.keys()].some(key => dataMap.deepHas(key))}
  #merge(dataMap:DataMap):void        { this.#dataMaps.add(dataMap), this.forEach((data,key)=>{ dataMap.set(key,data)}) }
  #error(msg:string):void             { throw new Error(msg) }
  
  toJSON():any  { return Object.fromEntries(this.entries()) }
}

// Manage record's data
class Record {
  #__dataModel__
  #__attrsModel__
  #__meta__
  #__attributes__

  constructor(model,data={}){
    this.#__attrsModel__ = model
    this.#__dataModel__ = {
      id:'id',
      collection: 'collection',
      createdAt: 'creationDate',
      updatedAt: 'lastUpdate',
      attributes: 'attributes' 
    }

    this.#__meta__ = { set attributes(val){} }
		this.#setMeta(this.#parseMeta(data))
		this.set(data.attributes||{})
    console.log("new Record => ",this)
  }

  // getters
  get id()            { return this.#__meta__.id }
  get collection()    { return this.#__meta__.collection }
  get creationDate()  { return this.#__meta__.createAt }
  get lastUpdate()    { return this.#__meta__.updatedAt }
  get attributes()    { return {...this.#__attributes__} }

  /*  public methods  */
  // #set public accesses
  set(data:object)    { return this.#set(this.#isValid(data) && this.#parse(data),!this.#__attributes__) }
  // #update public accesses
  update(data:object) { return this.#update(this.#isValid(data) && this.#parse(data)) }

  /*  private methods  */

  // set record meta data
  #setMeta(data)                                          { this.#__meta__ = this.#cloneData(data)}
  // set record attributes
  #set(data:object,isNew:boolean)                         { return data && (this.#__attributes__ = this.#cloneData(data)) && this.#setDate(isNew) }
  // Return a conform meta-data structure
  #parseMeta(data:object)                                 { return this.#browse(this.#__dataModel__,this.#reducer(this.#addMeta,data),{}) }
  // Return a conform attribute structure
  #parse(data:object)                                     { return this.#browse(this.#__attrsModel__,this.#reducer(this.#check,data),{})}
  // Add data to record meta data
  #addMeta(o:object,[name,label]:string[],data:object)    { return (o[name]=data[label]),o }
  // add authorized attributes
  #check(o:object,[key,type]:[string,string],data:object) { return ((val:unknown) => this.#checkDataType(val,type) && (o[key]=val))(data[key]),o }
  //Clone data deeply
  #cloneData(data:object)                                 { return JSON.parse(JSON.stringify(data||{})) }
  // Set mutation date
  #setDate(isNew:boolean)                                 { return this.#__meta__[isNew ? 'createdAt' : 'updatedAt'] = new Date().toISOString() }
  // Reduce callback supercharger
  #reducer(fn:Function,...datas:unknown[])                { return (acc:any,it:unknown)=>fn(acc,it,...datas) }
  // check attribute data type
  #checkDataType(val,type)                                { return [type,typeof type].includes(typeof val) }
  // check if passed data is an object
  #isValid(data:object={}): boolean                       { return typeof data === "object" && !Array.isArray(data) }
  // Browse object and return accumulator if passed
  #browse(data:object,fn:Function,o:any):any              { return Object.entries(data)[o ? 'reduce' : 'forEach'](fn,o) }
  // Partially update attributes
  #update(data:object):boolean                            { return data && !!Object.assign(this.#__attributes__ ,this.#cloneData(data))}  

  // Set JSONable structure
  toJSON():object { return Object.values(this.#__dataModel__).reduce((acc,key) => ((acc[key]=this[key]),acc),{})  }
}

// Manage records and define it's data structure 
class Collection{
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

// Store additionnal functionnalities (api routes,data import and export,etc...)
export class Api extends Store {
  #__from__
  #__to__
  #__fn__

  constructor(router:object,path?:string="") {
    super()

    // check params
    "/" !== path.slice(-1) && (path+="/"); 

    // Api routes
    router
      .get(`/${path}export`,              this.#middleware('export')) // Return db data in json string
      .get(`/${path}collections`,         this.#middleware('list'))   // Return collections list
      .post(`/${path}:collection`,        this.#middleware('create')) // Create record in a collection
      .get(`/${path}:collection/:id?`,    this.#middleware('read'))   // Return a record or a list of record (readOne || readMany)
      .put(`/${path}:collection/:id`,     this.#middleware('update')) // Replace a record data
      .patch(`/${path}:collection/:id`,   this.#middleware('patch'))  // Replace a record one or more attribute data
      .delete(`/${path}:collection/:id`,  this.#middleware('delete')) // Delete a record
    
    // Convert data from Object to selected format
    this.#__from__={
      json(data):object { return JSON.parse(data) }
    }
    
    // Convert data from Object to selected format
    this.#__to__={
      json(data):string { return JSON.stringify(data) }
      // sql(){  }
    }

    // Api functionnalities bank
    this.#__fn__= new Map
    this.#__fn__.set('list',():string[] => this.collections)
    this.#__fn__.set('export',():string => this.json)
  }
  
  
  /******************
  * Getters/Setters *
  ******************/
  
  // Export to format 
  get json()            { return this.#export('json') }       // To JSON
  get data()            { return JSON.parse(this.json) }      // To Object
  // get sql()             { return this.#export('sql') }        // To SQL
  
  // Import from format 
  set json(data:string) { this.#import('json',data) }        // From JSON
  set data(data:any)    { this.json = JSON.stringify(data) }  // From Object
  // set sql(data:string)  { this.#import('sql',data) }         // From SQL

  /******************
  *     Methods     *
  ******************/

  // Set response body
  async #setRes(res:object,action:string, params:object):Promise<unknown> { return res.body = await this.#action(action,this.#paramsHandler(action,params)) }
  async #getParams({params, request:req})                                 { return { ...params, body: this.#getBody(req) || null } }
  async #getBody({url, body, hasBody})                                    { return this.#check(url.searchParams) || hasBody && this.#check(await body()?.value) }
  
  // 
  #check(params)                                              { return (params = this.#parse(params)) && Object.keys(params).length && params }
  // 
  #parse(params)                                              { return params && Object.fromEntries(params)}
  // Change response type to 404
  #notFound(ctx:object,next:Function):void                    { (ctx.response.type = 404), next() }  
  // Return api requests handler 
  #middleware(action:string):Promise<void>                    { return async(ctx, next)=>{ (await this.#res(action,ctx)) || this.#notFound(ctx,next) } }
  // handle api response
  #res(action:string,ctx:object):Promise<unknown>             { return this.#setRes(ctx.response,action, this.#getParams(ctx)) }
  // Return an array of request parameters
  #paramsHandler(action:string,params:object):any[]           { return [params.collection,...action!="create"?[params.id]:[],...action!="read"?[params.body]:[]] }
  // Handle api actions (body response)
  #action(action:string,args:any[]):unknown                   { return this.#actionLog(this.#handler(action,args.shift())(args),action,...args) }
  // Return an object store data in the passed format if known
  #handler(action:string,name:string):unknown                 { return this.#apiAction(action) || this.#storeAction(action,name) }
  // return Api action handler
  #apiAction(action:string):unknown                           { return this.#__fn__.has(action) && this.#__fn__.get(action) }
  // return Store action handler
  #storeAction(action:string,name:string,args:any[]):unknown  { return args=>super.action(name,action,...args) }
  // Passe converter data to store
  #import(format:string,data:unknown):void                    { super.data = this.#convertData(this.#__from__[format],data) }
  // Return store data in the passed format if known  
  #export(format:string):unknown                              { return this.#convertData(this.#__to__[format],super.data) }
  // Return converted data if the converter exist  
  #convertData(fn:Function,data:unknown):unknown              { return fn?fn(data):"unknown format"  }
  // msg generator
  #actionLog(res:unknown,action:string,id:string):unknown     { return (res ? this.#successMsg : this.#errorMsg)(action,id,res) }
  // Generate a success message
  #successMsg(action:string,id:string,res:unknown):unknown    { return action=='read' ? res : {msg: `Item id:${id || res} has been ${action}d`} }
  // Generate an error message
  #errorMsg(action:string,id:string):unknown                  { return action=='read' ? null : {error: `cannot ${action} item${id ? ' id:'+id : ''}`} }
  
}