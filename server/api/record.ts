// Manage record's data
export class Record {
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
    // console.log("Record => ", JSON.parse(this))
    console.log(`Record ${this.id} has been created`)
  }

  // getters
  get id()            { return this.#__meta__.id }
  get collection()    { return this.#__meta__.collection }
  get creationDate()  { return this.#__meta__.createdAt }
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
  #check(o:object,[key,type]:[string,string],data:object) { return ((val:unknown) => [type].includes(typeof val) && (o[key]=val))(data[key]),o }
  //Clone data deeply
  #cloneData(data:object)                                 { return JSON.parse(JSON.stringify(data||{})) }
  // Set mutation date
  #setDate(isNew:boolean)                                 { return this.#__meta__[isNew ? 'createdAt' : 'updatedAt'] = new Date().toISOString() }
  // Reduce callback supercharger
  #reducer(fn:Function,...datas:unknown[])                { return (acc:any,it:unknown)=>fn(acc,it,...datas) }
  // check if passed data is an object
  #isValid(data:object={}): boolean                       { return typeof data === "object" && !Array.isArray(data) }
  // Browse object and return accumulator if passed
  #browse(data:object,fn:Function,o:any):any              { return Object.entries(data)[o ? 'reduce' : 'forEach'](fn,o) }
  // Partially update attributes
  #update(data:object):boolean                            { return data && !!Object.assign(this.#__attributes__ ,this.#cloneData(data))}  

  // Set JSONable structure
  toJSON():object { return Object.values(this.#__dataModel__).reduce((acc,key) => ((acc[key]=this[key]),acc),{})  }
}