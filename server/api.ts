// 
class Record {
  #__dataModel__
  #__attrsModel__
  #__meta__
  #__attributes__

  constructor(model={},data={}){
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
		this.set(data.attributes)
    console.log(this.#__meta__)
  }

  // getters
  get id()            { return this.#__meta__.id }
  get collection()    { return this.#__meta__.collection }
  get creationDate()  { return this.#__meta__.createAt }
  get lastUpdate()    { return this.#__meta__.updatedAt }
  get attributes()    { return {...this.#__attributes__} }

  /*  public methods  */
  // #set public accesses
  set(data:object)    { this.#set(this.#isValid(data) && this.#parse(data),this.#__attributes__) }
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
  #addMeta(o:object,[name,label]:string[],data:object)    { return (o[name]=data[label]), o }
  // add authorized attributes
  #check(o:object,[key,type]:[string,string],data:object) { return ((val:unknown) => this.#checkDataType(val,type) && (o[key]=val))(data[key]), o }
  //Clone data deeply
  #cloneData(data:object)                                 { return JSON.parse(JSON.stringify(data||{})) }
  // Set mutation date
  #setDate(isNew:boolean)                                 { return this.#__meta__[isNew ? 'createdAt' : 'updatedAt'] = new Date().toISOString() }
  // Reduce callback supercharger
  #reducer(fn:Function, ...datas:unknown[])               { return (acc:any, it:unknown)=>fn(acc, it, ...datas) }
  // check attribute data type
  #checkDataType(val,type)                                { return [type,typeof type].includes(typeof val) }
  // check if passed data is an object
  #isValid(data:object={})                                { return typeof data === "object" && !Array.isArray(data) }
  // Browse object and return accumulator if passed
  #browse(data:object,fn:Function,o:any)                  { return Object.entries(data)[o ? 'reduce' : 'forEach'](fn,o) }
  // Partially update attributes
  #update(data:object)                                    { return data && Object.assign(this.#__attributes__ ,this.#cloneData(data))}  

  // Set JSONable structure
  toJSON(){ return Object.values(this.#__dataModel__).reduce((acc,key) => ((acc[key]=this[key]),acc),{})  }
}

class Collection{
  #__name__
  #__meta__
  #__chars__
  #__i__

  constructor(name,data){
    this.#__name__ = name
    this.#__meta__ = new Map(data?.map(x=>[x.id,x]))
    this.#__chars__ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    this.#__i__ = 0
  }

  get name() { return this.#__name__ }

  /******************
  *     Methods     *
  ******************/

  /* public */

  // crud
  create(data:unknown)            { return ((id:string)=>this.#add(this.#createRecord(this.#__name__, id, data)) )(this.#createUID()) }
  read(id:string, filters:any)    { return id ? this.#__meta__?.get(id) : this.#filterHandler(this.#toArray(this.#__meta__?.values()), filters) }
  update(id:string,data:unknown)  { return this.#__meta__.get(id)?.set(data)}
  delete(id:string)               { return this.#__meta__.delete(id)}
  patch(id:string)                { return this.#__meta__.get(id)}
  
  /* private */

  // Create a record
  #createRecord(collection:string,id:string, attributes:unknown)  { return new Record(undefined,{id,collection, attributes})  }
  // Add recorde to collection
  #add(record:Record)                                             { return (id=>(this.#__meta__.set(id, record),id))(record.id) }
  // Partially update record
  #patchRecord(record:Record, data:unknown)                       { return record?.update(data) }
  // Generate an id
  #createUID()                                                    { return this.#loop(7,(id)=>id+this.#getRandom(this.#__chars__),this.#__i__++) }
  // Return value from random index 
  #getRandom(datas:string|[])                                     { return datas && datas[Math.floor(Math.random() * datas.length)] }
  // Convert iterable to array
  #toArray(item:Iterable)                                         { return item && [...item] };
  // Iterate on the passed method 
  #loop(n:number,fn:Function,acc:any)                             { return (new Array(n)).fill().reduce(fn,acc)}
  // Return filtered records
  #filterHandler(data:Record[], filters:{})                       { return filters ? this.#Filter(data,this.#readFilters(filters)) : data }
  // Convert filters to iterable
  #readFilters(filters:{})                                        { return Object.entries(filters) }
  // Filter collection records
  #Filter(data:{}[],filters:[][])                                 { return data.filter(record => filters.every(([key,val])=>record[key]==val)) }
}

export class Store {
  #__collections__

  constructor(data) { this.#__collections__ = this.#init(data) }

  /******************
  * Getters/Setters *
  ******************/
  // Return collection list
  get collections()     { return [...this.#__collections__.keys()] }

  // Store datas
  get data()            { return Object.fromEntries(this.collections.map((key)=>[key,this.#action(key,'read')])) }
  set data(dataObject)  { this.#__collections__ = this.#init(dataObject) }

  /******************
  *     Methods     *
  ******************/

  // Public access to #action
  action(name:string, action:string, ...args:any[])   { return this.#action(name, action, ...args) }
  // Return requested data if found 
  #action(name:string, action:string, ...args:any[])  { return this.#do(this.#get(name, action === "create"), action, args) }
  // Return collection or undefined
  #get(name:string, create:boolean)                   { return this.#addOrFind(this.#__collections__)?.get(name) }
  // Set or replace store data
  #init(data={})                                      { return new Map(Object.entries(data).map((arr)=>this.#create(...arr))) }
  // Create a collection
  #create(name:string,data:[])                        { return console(`Collection ${name} has been created`), new Collection(name,data) }
  // Find a collection or add a new one
  #addOrFind(db:Map, name:string, create:boolean)     { return this.#find(db) || create ? this.#add(db, name) : null }
  // Add a new collection to store map
  #add(db:Map, name:string)                           { return db.set(name,this.#create(name)) }
  // find a collection
  #find(db:Map)                                       { return db.has(name) && db }
  // Execute the passed action
  #do(table:Collection, action, args:any[])           { return table && table[action](...args) }
}

export class Api extends Store {
  #__from__
  #__to__
  #__fn__

  constructor({router,path=""}) {
    super()

    // check params
    "/" !== path.slice(-1) && (path+="/"); 

    // Api routes
    router.get(`/${path}export`,             async (ctx) => { ctx.response.body = await this.action('export') });  // return db to json
    router.get(`/${path}collections`,        async (ctx) => { ctx.response.body = await this.action('list') });    // Return collections list
    router.post(`/${path}:collection`,       async (ctx) => { ctx.response.body = await this.action('create',ctx.params.collection) });
    router.get(`/${path}:collection/:id?`,   async (ctx) => { ctx.response.body = await this.action('read',ctx.params.collection,ctx.params.id) });
    router.put(`/${path}:collection/:id`,    async (ctx) => { ctx.response.body = await this.action('update',ctx.params.collection,ctx.params.id) });
    router.delete(`/${path}:collection/:id`, async (ctx) => { ctx.response.body = await this.action('delete',ctx.params.collection,ctx.params.id) });
    
    // Convert data from Object to selected format
    this.#__from__={
      json(data){ return JSON.parse(data) }
    }
    
    // Convert data from Object to selected format
    this.#__to__={
      json(data){ return JSON.stringify(data) }
      // sql(){  }
    }

    this.#__fn__={
      list(){ return this.collections },
      export(){ return this.json }
    }
  }
  
  
  /******************
  * Getters/Setters *
  ******************/
  
  // Import/Export shorthand
  get json()            { return this.#export('json') }       // To JSON
  get data()            { return JSON.parse(this.json) }      // To Object
  // get sql()             { return this.#export('sql') }        // To SQL
  set json(data:string) { this.#import('json', data) }        // From JSON
  set data(data:any)    { this.json = JSON.stringify(data) }  // From Object
  // set sql(data:string)  { this.#import('sql', data) }         // From SQL

  /******************
  *     Methods     *
  ******************/
  //request handler
  action(action:string, name:string, ...args:any[])   { return this.#actionLog(this.#handler(action,name)(...args),action,...args) }
  // Return an object store data in the passed format if known
  #handler(action:string, name:string)                { return this.#apiAction(action) || this.#storeAction(action, name) }
  // return api action handler
  #apiAction(action:string)                           { return Object.keys(this.#__fn__).includes(action) && (()=>this.#__fn__[action]()) }
  // return store action handler
  #storeAction(action:string, name:string)            { return args=>super.action(name,action,...args) }
  #import(format:string, data:unknown)                { super.data = this.#convertData(this.#__from__[format], data) }
  // Return store data in the passed format if known  
  #export(format:string)                              { return this.#convertData(this.#__to__[format], super.data) }
  // Return converted data if the converter exist  
  #convertData(fn:Function, data:unknown)             { return fn?fn(data):"unknown format"  }
  // msg generator
  #actionLog(res:unknown,action:string, id:string)    { return (res ? this.#successMsg : this.#errorMsg)(action, id,res) }
  // Generate a success message
  #successMsg(action:string, id:string, res:unknown)  { return action=='read' ? res : {msg: `Item id:${id || res} has been ${action}d`} }
  // Generate an error message
  #errorMsg(action:string, id:string)                 { return {error: action=='read' ? undefined :`cannot ${action} item${id ? ' id:'+id : ''}`} }
  
}