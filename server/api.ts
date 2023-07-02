class Record {
  #__dataModel__
  #__data__
  #__attributes__

  constructor(id,model={},data={}){
    this.#__dataModel__ = model
    this.#__data__ = {
      id,
      updatedAt: 'never' || new Date().toISOString(),
    }
    // for(const [key, val] of Object.entries(model)) this.#__data__[key] = val;
    this.set(data)
  }

  // getters
  get id()          { return this.#__data__.id }
  get creation()    { return this.#__data__.createAt }
  get lastUpdate()  { return this.#__data__.updatedAt }
  get attributes()  { return {...this.#__attributes__} }

  // public methods
  set(data:object)    { this.#setDate(this.#__attributes__ ? 'updatedAt': 'createdAt'), this.#__attributes__ = this.#cloneData(data) }
  update(data:object) { ((attrs)=>Object.entries(this.#cloneData(data)).forEach(([key,val])=>attrs[key]=val))(this.#__attributes__) }

  // private methods
  #cloneData(data:object)       { return JSON.parse(JSON.stringify(data||{})) }
  #setDate(key:string)          { this.#__data__[key] = new Date().toISOString() }
  #checkAttributes(data:object)  { return Object.entries(this.#__dataModel__).reduce((o,[key,type])=>((val)=>this.#checkDataType(val,type) ? (o[key]=val) : o)(data[key]),{}) }
  #checkDataType(val,type)      { return [type,typeof type].includes(typeof val) }
}

class Collection{
  #__name__
  #__data__
  #__chars__
  #__i__

  constructor(name,data){
    this.#__name__ = name
    this.#__data__ = new Map
    this.#__chars__ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    this.#__i__ = 0
  }

  get name() { return this.#__name__ }
  create(){ return this.#createRecord(this.#__data__, this.#__name__, this.#createUID()) }
  read(id:string, filters:any)   { return id ? this.#__data__?.get(id) : this.#filter(this.#toArray(this.#__data__?.values()), filters) }
  update(id:string) { return this.#patchRecord(this.#__data__.get(id)) ? `item id:${id} has been updated`: `error: cannot update item id:${id}`}
  delete(id:string) { return this.#__data__.delete(id) ? `item id:${id} has been removed`: `error: cannot remove item id:${id}`}
  patch(id:string)  { return this.#__data__.get(id) ? `item id:${id} has been patched`: `error: cannot patch item id:${id}` }
  
  #createRecord(table,collection,id){ return table.set(id,{ id, collection, createAt:new Date().toISOString()}) ? `new item has been created with id:${id}`:`error: cannot create new item` }
  #patchRecord(record){ return record && (record.updatedAt = new Date().toISOString()) };
  #createUID(){ return ((char,charLen)=>(new Array(7)).fill().reduce((id)=>id+char.charAt(Math.floor(Math.random() * charLen)),this.#__i__++))(this.#__chars__,this.#__chars__.length) }
  #toArray(item){ return item && [...item] };
  #filter(data, filters){ return filters ? ((filters)=>data.filter(record => filters.every(([key,val])=>record[key]==val)))(Object.entries(filters)) : data }
}

export class Store {
  #__collections__

  constructor() { this.#__collections__ = new Map }

  get collections(){ return [...this.#__collections__.keys()] }

  action(name:string, action:string, ...args:any[]){ return ((collection:Collection) => collection && collection[action](...args))(this.#getCollection(name, action === "create")) }
  #getCollection(name:string, create:boolean){ return this.#__collections__.get(name)||(create ? this.#__collections__.set(name,new Collection(name)): null) }
}

export class Api extends Store {
  #__store__
  #__collections__

  constructor({router,path:string=""}) {
    super()

    // check params
    "/" !== path.slice(-1) && (path+="/"); 

    // Api routes
    router.get(`/${path}collections`,        async (ctx) => { ctx.response.body = await store.collections});
    router.post(`/${path}:collection`,       async (ctx) => { ctx.response.body = await api.create(ctx.params.collection) });
    router.get(`/${path}:collection/:id?`,   async (ctx) => { ctx.response.body = await api.read(ctx.params.collection,ctx.params.id) });
    router.put(`/${path}:collection/:id`,    async (ctx) => { ctx.response.body = await api.update(ctx.params.collection,ctx.params.id) });
    router.delete(`/${path}:collection/:id`, async (ctx) => { ctx.response.body = await api.delete(ctx.params.collection,ctx.params.id) });
  }
  
  get json(){ return JSON.stringify(Object.fromEntries(this.#__collections__.entries().map(([key,val])=>[key,val.read()]))) }
  
}