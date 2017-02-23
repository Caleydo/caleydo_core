/**
 * Created by Holger Stitz on 23.02.2017.
 */

import {murmurhash2} from '../internal/MurmurHash2';


export class TokenNode {

  public value:string = '';
  public weight:number = 1;

  private _children: Map<string, TokenNode> = new Map();

  constructor(public name: string, public parent: TokenNode) {
    if (parent) {
      parent.addChild(name, this);
    }
  }

  /**
   * Appends a child node to the current node
   * @param name
   * @param child
   */
  addChild(name:string, child:TokenNode) {
    this._children.set(name, child);
  }

  /**
   * Returns a list of children
   * @returns {Set<TokenNode>}
   */
  children():TokenNode[] {
    return Array.from(this._children.values());
  }

  /**
   * Checks if this node has a given node as immediate child
   * @param name
   * @returns {boolean}
   */
  has(name:string) {
    return this._children.has(name);
  }

  /**
   * Returns the full-qualified name in DNS style
   * @returns {string}
   */
  get fqname() {
    if(!this.parent) {
      return this.name;
    }
    // dns style
    return  this.name + '.' + this.parent.fqname;
  }

  /**
   * Returns a hash based on the value
   * @returns {string}
   */
  toHash():string {
    return murmurhash2(this.value, 0);
  }
}

export class TokenRootNode extends TokenNode {

  constructor(public name: string) {
    super(name, null);
  }

}
