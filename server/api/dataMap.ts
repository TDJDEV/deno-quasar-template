// A MapObject that push it's data to all attached DataMap
export class DataMap extends Map {
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