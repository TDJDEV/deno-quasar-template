class Record {
  #__dataModel__
  #__data__
  #__attributes__
  #__map__

  constructor(model={},data={}){
    this.#__dataModel__ = model
    this.#__map__ = {
      id:'id',
      collection: 'collection',
      createdAt: 'creationDate',
      updatedAt: 'lastUpdate',
      attributes: 'attributes' 
    }

    this.#__data__ = { set attributes(val){} }
		this.#setMeta(data)
		this.set(data.attributes)
  }

  // getters
  get id()            { return this.#__data__.id }
  get collection()    { return this.#__data__.collection }
  get creationDate()  { return this.#__data__.createAt }
  get lastUpdate()    { return this.#__data__.updatedAt }
  get attributes()    { return {...this.#__attributes__} }

  // public methods
  set(data:object)    { return (str=>this.#isValid(data) && (this.#__attributes__ = this.#cloneData(data)) && this.#setDate(str))(this.#__attributes__ ? 'updatedAt': 'createdAt') }
  update(data:object) { return ((attrs)=>Object.entries(this.#cloneData(data)).forEach(([key,val])=>attrs[key]=val))(this.#__attributes__), true }

  // private methods
  #setMeta(data)                { Object.entries(this.#__map__).map(([name,label]) => this.#__data__[name]=(data[label])?.toString()) }
  #cloneData(data:object)       { return JSON.parse(JSON.stringify(data||{})) }
  #setDate(key:string)          { return this.#__data__[key] = new Date().toISOString() }
  #checkAttributes(data:object) { return Object.entries(this.#__dataModel__).reduce((o,[key,type])=>((val)=>this.#checkDataType(val,type) ? (o[key]=val) : o)(data[key]),{}) }
  #checkDataType(val,type)      { return [type,typeof type].includes(typeof val) }
  #isValid(data:object={})      { return typeof data === "object" && !Array.isArray(data) }

  toJSON(){ return Object.values(this.#__map__).reduce((acc,key) => ((acc[key]=this[key]),acc),{})  }
}

class Collection{
  #__name__
  #__data__
  #__chars__
  #__i__

  constructor(name,data){
    this.#__name__ = name
    this.#__data__ = new Map(data?.map(x=>[x.id,x]))
    this.#__chars__ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    this.#__i__ = 0
  }

  get name() { return this.#__name__ }
  create(data:unknown){ return ((id:string)=>this.#add(this.#createRecord(this.#__name__, id, data)) )(this.#createUID()) }
  read(id:string, filters:any)   { return id ? this.#__data__?.get(id) : this.#filter(this.#toArray(this.#__data__?.values()), filters) }
  update(id:string) { return this.#__data__.get(id)?.set(data)}
  delete(id:string) { return this.#__data__.delete(id)}
  patch(id:string)  { return this.#__data__.get(id)}
  
  #createRecord(collection:string,id:string, attributes:unknown){ return new Record(undefined,{id,collection, attributes})  }
  #add(record){ return this.#__data__.set(record.id, record) }
  #patchRecord(record){ return record && (record.updatedAt = new Date().toISOString()) };
  #createUID(){ return ((char,charLen)=>(new Array(7)).fill().reduce((id)=>id+char.charAt(Math.floor(Math.random() * charLen)),this.#__i__++))(this.#__chars__,this.#__chars__.length) }
  #toArray(item){ return item && [...item] };
  #filter(data, filters){ return filters ? ((filters)=>data.filter(record => filters.every(([key,val])=>record[key]==val)))(Object.entries(filters)) : data }
}

export class Store {
  #__collections__

  constructor() { this.#__collections__ = new Map }

  // Return collection list
  get collections(){ return [...this.#__collections__.keys()] }

  // Store datas
  get data() { return Object.fromEntries(this.collections.map((key)=>[key,this.action(key,'read')])) }
  set data(dataObject:string){ this.#__collections__ = new Map(Object.entries(dataObject).map((collectionData)=>new Collection(...collectionData))) }

  action(name:string, action:string, ...args:any[]){ return ((table:Collection) => table && table[action](...args))(this.#getCollection(name, action === "create")) }
  #getCollection(name:string, create:boolean){ return ((db:Map)=> (db.has(name)) && db || (create ? db.set(name,new Collection(name)): null) )(this.#__collections__)?.get(name) }
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
  action(action:string, name:string, ...args:any[]) { return Object.keys(this.#__fn__).includes(action) ? this.#__fn__[action] : this.#actionLog(super.action(name,action,...args),action,...args) }
  // Return an object store data in the passed format if known
  #import(format:string, data:unknown)     { super.data = this.#convertData(this.#__from__[format], data) }
  // Return store data in the passed format if known  
  #export(format:string)                  { return this.#convertData(this.#__to__[format], super.data) }
  // Return converted data if the converter exist  
  #convertData(fn:Function, data:unknown) { return fn?fn(data):"unknown format"  }
  // msg generator
  #actionLog(res:unknown,action:string, id:string){ return (res ? this.#successMsg : this.#errorMsg)(action, id,res) }
  #successMsg(action:string, id:string, res:unknown) { return action=='read' ? res : {msg: `Item id:${id} has been ${action}d`} }
  #errorMsg(action:string, id:string) { return {error: action=='read' ? undefined :`cannot ${action} item${id ? ' id:'+id : ''}`} }
  
}