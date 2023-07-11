import { Store } from './store'

// Store additionnal functionnalities (api routes,data import and export,etc...)
export class Api extends Store {
  #__from__
  #__to__
  #__fn__

  constructor(router:object,path?:string="") {
    super(),

    // check params
    (path && typeof path === 'string') ? "/" !== path.slice(-1) && (path+="/") : (path=""); 

    // Api routes
    router
      .all(`/${path}:collection?/:id?`,   this.#parseRequest()) // Return db data in json string
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
  // Return actions required data
  async #getParams({params, request:req})                                 { return { ...params, body: await this.#getBody(req) || null } }
  // Return query or body parameters
  async #getBody(req)                                                     { return this.#check(req.hasBody ? await req.body().value : req.url.searchParams) }
  
  
  // Fech request parameters
  #parseRequest(ctx,next)                                     { return async(ctx,next)=>((ctx.apiParams = await this.#getParams(ctx)), next()) }
  // 
  #check(params)                                              { return (params = this.#parse(params)) && Object.keys(params).length ? params : null }
  // Convert request parameters to object
  #parse(params)                                              { return params && Object.fromEntries(params)}
  // Change response type to 404
  #notFound(ctx:object,next:Function):void                    { (ctx.response.type = 404), next() }  
  // Return api requests handler 
  #middleware(action:string):Promise<void>                    { return async(ctx, next)=>{ (await this.#res(action,ctx)) || this.#notFound(ctx,next) } }
  // handle api response
  #res(action:string,ctx:object):Promise<unknown>             { return this.#setRes(ctx.response,action, ctx.apiParams) }
  // Convert action required data to an array parameters
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
  #actionLog(res:unknown,action:string,id:string):unknown     { return (res ? this.#successMsg : this.#errorMsg)(action,action!=="create"&&id,res) }
  // Generate a success message
  #successMsg(action:string,id:string,res:unknown):unknown    { return action=='read' ? res : {msg: `Item id:${id || res} has been ${action}d`} }
  // Generate an error message
  #errorMsg(action:string,id:string):unknown                  { return action=='read' ? null : {error: `cannot ${action} item${id ? ' id:'+id : ''}`} }
  
}