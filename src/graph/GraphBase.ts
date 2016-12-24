/**
 * Created by sam on 12.02.2015.
 */
/**
 * Created by Samuel Gratzl on 22.10.2014.
 */
import {SelectOperation, resolve as idtypes_resolve} from '../idtype';
import {IDataDescription} from '../datatype';
import {all, Range, list} from '../range';
import {GraphNode, GraphEdge, AGraph} from './graph';

export interface IGraphFactory {
  makeNode(p: any): GraphNode;
  makeEdge(p: any, lookup: (id: number) => GraphNode): GraphEdge;
}

export const defaultGraphFactory: IGraphFactory = {
  makeNode: (p: any) => ((new GraphNode()).restore(p)),
  makeEdge: (p: any, lookup) => ((new GraphEdge()).restore(p, lookup))
};

export interface IGraphDataDescription extends IDataDescription {
  /**
   * size: [number of nodes, number of edges]
   */
  size: [number, number];

  /**
   * where to store: memory, remote, local, session, given (requires instance)
   */
  storage?: string;

  graph?: AGraph;
}

export default class GraphBase extends AGraph {
  constructor(public desc: IGraphDataDescription, private _nodes: GraphNode[] = [], private _edges: GraphEdge[] = []) {
    super();
  }

  get nodes() {
    return this._nodes;
  }

  get edges() {
    return this._edges;
  }

  addNode(n: GraphNode): any {
    this._nodes.push(n);
    this.fire('add_node', n);
    return this;
  }

  updateNode(n: GraphNode): any {
    //since we store a reference we don't need to do anything
    this.fire('update_node', n);
    return this;
  }

  updateEdge(e: GraphEdge): any {
    //since we store a reference we don't need to do anything
    this.fire('update_edge', e);
    return this;
  }

  removeNode(n: GraphNode): any {
    const i = this._nodes.indexOf(n);
    if (i < 0) {
      return null;
    }
    this._nodes.splice(i, 1);
    this.fire('remove_node', n);
    return this;
  }

  addEdge(e: GraphEdge): any;
  addEdge(s: GraphNode, type: string, t: GraphNode): any;
  addEdge(e_or_s: GraphEdge | GraphNode, type?: string, t?: GraphNode): any {
    if (e_or_s instanceof GraphEdge) {
      let e = <GraphEdge>e_or_s;
      this._edges.push(e);
      this.fire('add_edge', e, e.type, e.source, e.target);
      return;
    }
    return this.addEdge(new GraphEdge(type, <GraphNode>e_or_s, t));
  }

  removeEdge(e: GraphEdge): any {
    const i = this._edges.indexOf(e);
    if (i < 0) {
      return null;
    }
    e.takeDown();
    this._edges.splice(i, 1);
    this.fire('remove_edge', e);
    return this;
  }

  get dim() {
    return [this._nodes.length, this._edges.length];
  }

  ids(range: Range = all()) {
    return Promise.resolve(list(this._nodes.map((n) => n.id), this._edges.map((n) => n.id)));
  }

  selectNode(node: GraphNode, op = SelectOperation.SET) {
    this.select(0, [this._nodes.indexOf(node)], op);
  }

  selectedNodes(): Promise<GraphNode[]> {
    return this.selections().then((r) => {
      let nodes = [];
      r.dim(0).forEach((index) => nodes.push(this._nodes[index]));
      return nodes;
    });
  }

  selectEdge(edge: GraphEdge, op = SelectOperation.SET) {
    this.select(1, [this._edges.indexOf(edge)], op);
  }

  selectedEdges(): Promise<GraphEdge[]> {
    return this.selections().then((r) => {
      let edges = [];
      r.dim(1).forEach((index) => edges.push(this._edges[index]));
      return edges;
    });
  }

  get idtypes() {
    return ['_nodes', '_edges'].map(idtypes_resolve);
  }

  clear(): any {
    this._nodes = [];
    this._edges = [];
    return this;
  }

  persist() {
    let r: any = {
      root: this.desc.id
    };
    r.nodes = this.nodes.map((s) => s.persist());
    r.edges = this.edges.map((l) => l.persist());
    return r;
  }

}
