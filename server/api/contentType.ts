// Manage Records properties types and validation
export class ContentType {
  constructor(data) {
    this.properties = this.#setDataModel(data)
  }

  // Define collection records data model
  #setDataModel(arr)                                              { return this.#getDataModel(arr).reduce((acc, [key,val])=>(acc[key]=typeof val, acc),{}) }
  // Define collection records data model
  #getDataModel(arr)                                              { return Object.entries(arr.reduce((acc, item)=>Object.assign(acc,item.attributes),{})) }
}