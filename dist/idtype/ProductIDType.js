/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 */
import { EventHandler } from '../base/event';
import { Range, ParseRangeUtils, Range1D } from '../range';
import { SelectOperation, SelectionUtils } from './SelectionUtils';
import { IDType } from './IDType';
//function indicesCompare(a: number[], b: number[]) {
//  //assert a.length = b.length
//  for(let i = 0; i < a.length; ++i) {
//    if (a[i] !== b[i]) {
//      return a[i] - b[i];
//    }
//  }
//  return 0;
//}
//
//function compressPairs(pairs: number[][]): Range[] {
//  return pairs.map((a) => rlist(...a));
//}
function overlaps(r, withRange, ndim) {
    if (withRange.ndim === 0) {
        return true; //catch all
    }
    for (let i = 0; i < Math.min(r.ndim, ndim); ++i) {
        const ri = r.dim(i);
        const wi = withRange.dim(i);
        if (wi.isAll || ri.isAll) {
            return true;
        }
        if (!ri.isUnbound && ri.asList().every((rii) => !wi.contains(rii))) {
            //it the ids at dimension i are not overlapping can't overlap in others
            return false;
        }
        //TODO
    }
    return false;
}
function removeCells(b, without, ndim) {
    if (without.length === 0) {
        return b;
    }
    const r = [];
    b.forEach((bi) => {
        if (without.some((w) => w.eq(bi))) {
            //skip
        }
        else if (without.some((w) => overlaps(bi, w, ndim))) {
            //TODO
        }
        else {
            r.push(bi);
        }
    });
    return r;
}
/**
 * a product idtype is a product of multiple underlying ones, e.g. patient x gene.
 */
export class ProductIDType extends EventHandler {
    constructor(elems, internal = false) {
        super();
        this.elems = elems;
        this.internal = internal;
        this.sel = new Map();
        this.isOn = false;
        this.selectionListener = (event, type, act, added, removed) => {
            this.fire(`${ProductIDType.EVENT_SELECT_DIM},${ProductIDType.EVENT_SELECT_PRODUCT}`, this.elems.indexOf(event.currentTarget), type, act, added, removed);
            this.fire(`${ProductIDType.EVENT_SELECT_DIM}-${type},${ProductIDType.EVENT_SELECT_PRODUCT}-${type}`, this.elems.indexOf(event.currentTarget), act, added, removed);
        };
    }
    on(events, listener) {
        if (!this.isOn) {
            this.enable();
            this.isOn = true;
        }
        return super.on(events, listener);
    }
    get id() {
        return this.elems.map((e) => e.id).join('X');
    }
    get name() {
        return this.elems.map((e) => e.name).join(' x ');
    }
    get names() {
        return this.elems.map((e) => e.names).join(' x ');
    }
    enable() {
        this.elems.forEach((elem) => elem.on(IDType.EVENT_SELECT, this.selectionListener));
    }
    disable() {
        this.elems.forEach((elem) => elem.off(IDType.EVENT_SELECT, this.selectionListener));
    }
    persist() {
        const s = {};
        this.sel.forEach((v, type) => s[type] = v.map((r) => r.toString()));
        return {
            sel: s
        };
    }
    restore(persisted) {
        Object.keys(persisted.sel).forEach((type) => this.sel.set(type, persisted.sel[type].map(ParseRangeUtils.parseRangeLike)));
        return this;
    }
    toString() {
        return this.name;
    }
    selectionTypes() {
        return Array.from(this.sel.keys());
    }
    /**
     * return the current selections of the given type
     * @param type optional the selection type
     * @returns {Range[]}
     */
    selections(type = SelectionUtils.defaultSelectionType) {
        if (this.sel.has(type)) {
            return this.sel.get(type).slice();
        }
        this.sel.set(type, []);
        return [];
    }
    productSelections(type = SelectionUtils.defaultSelectionType /*, wildcardLookup: (idtype: IDType) => Promise<number> */) {
        const cells = this.selections(type);
        const usedCells = this.toPerDim(cells);
        this.elems.forEach((e, i) => {
            const s = e.selections(type);
            //remove all already used rows / columns as part of the cells
            const wildcard = s.without(usedCells[i]);
            if (!wildcard.isNone) {
                //create wildcard cells, e.g., the remaining ones are row/column selections
                cells.push(Range.list(this.elems.map((e2) => e === e2 ? wildcard.dim(0) : Range1D.all())));
            }
        });
        return cells;
        /* TODO no duplicates
         if (cells.every((c) => !c.isUnbound)) {
         //all cells are bound, just cells
         return Promise.resolve(cells);
         }
         //we need to resolve some wildcards
         return Promise.all(this.elems.map((elem, i) => {
         if (cells.some((c) => c.dim(i).isUnbound)) {
         return wildcardLookup(elem);
         } else {
         return Promise.resolve(0);
         }
         })).then((size: number[]) => {
         const fullCells : any = {};
         cells.forEach((cell) => {
         cell.product((indices: number[]) => {
         const id = indices.join('_');
         fullCells[id] = indices;
         });
         }, size);
         //fullCells contains all cells that we have to take care of
         const pairs = Object.keys(fullCells).map((k) => fullCells[k]).sort(indicesCompare);
         return compressPairs(pairs);
         });
         */
    }
    select() {
        const a = Array.from(arguments);
        const type = (typeof a[0] === 'string') ? a.shift() : SelectionUtils.defaultSelectionType, range = a[0].map(ParseRangeUtils.parseRangeLike), op = SelectionUtils.asSelectOperation(a[1]);
        return this.selectImpl(range, op, type);
    }
    selectImpl(cells, op = SelectOperation.SET, type = SelectionUtils.defaultSelectionType) {
        const rcells = cells.map(ParseRangeUtils.parseRangeLike);
        const b = this.selections(type);
        let newRange = [];
        switch (op) {
            case SelectOperation.SET:
                newRange = rcells;
                break;
            case SelectOperation.ADD:
                newRange = b.concat(rcells);
                break;
            case SelectOperation.REMOVE:
                newRange = removeCells(b, rcells, this.elems.length);
                break;
        }
        //if (b.eq(new_)) {
        //  return b;
        //}
        this.sel.set(type, newRange);
        //individual selection per dimension
        const perDimSelections = this.toPerDim(newRange);
        this.disable();
        this.elems.forEach((e, i) => e.select(type, perDimSelections[i]));
        this.enable();
        const added = op !== SelectOperation.REMOVE ? rcells : [];
        const removed = (op === SelectOperation.ADD ? [] : (op === SelectOperation.SET ? b : rcells));
        this.fire(IDType.EVENT_SELECT, type, newRange, added, removed, b);
        this.fire(ProductIDType.EVENT_SELECT_PRODUCT, -1, type, newRange, added, removed, b);
        this.fire(`${IDType.EVENT_SELECT}-${type}`, newRange, added, removed, b);
        this.fire(`${ProductIDType.EVENT_SELECT_PRODUCT}-${type}`, -1, newRange, added, removed, b);
        return b;
    }
    toPerDim(sel) {
        return this.elems.map((elem, i) => {
            if (sel.length === 0) {
                return Range.none();
            }
            const dimselections = sel.map((r) => r.dim(i));
            const selection = dimselections.reduce((p, a) => p ? p.union(a) : a, null);
            return Range.list(selection);
        });
    }
    clear(type = SelectionUtils.defaultSelectionType) {
        return this.selectImpl([], SelectOperation.SET, type);
    }
}
ProductIDType.EVENT_SELECT_DIM = 'selectDim';
ProductIDType.EVENT_SELECT_PRODUCT = 'selectProduct';
//# sourceMappingURL=ProductIDType.js.map