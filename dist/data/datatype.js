/* *****************************************************************************
 * Caleydo - Visualization for Molecular Biology - http://caleydo.org
 * Copyright (c) The Caleydo Team. All rights reserved.
 * Licensed under the new BSD license, available at http://caleydo.org/license
 **************************************************************************** */
/**
 * Created by Samuel Gratzl on 04.08.2014.
 *
 * This file defines interfaces for various data types and their metadata.
 */
import { ASelectAble } from '../idtype/ASelectAble';
import { Range } from '../range';
/**
 * dummy data type just holding the description
 */
export class ADataType extends ASelectAble {
    constructor(desc) {
        super();
        this.desc = desc;
    }
    get dim() {
        return [];
    }
    ids(range = Range.all()) {
        return Promise.resolve(Range.none());
    }
    idView(idRange) {
        return Promise.resolve(this);
    }
    get idtypes() {
        return [];
    }
    persist() {
        return this.desc.id;
    }
    restore(persisted) {
        return this;
    }
    toString() {
        return this.persist();
    }
    /**
     * since there is no instanceOf for interfaces
     * @param v
     * @return {any}
     */
    static isADataType(v) {
        if (v === null || v === undefined) {
            return false;
        }
        if (v instanceof ADataType) {
            return true;
        }
        //sounds good
        return (typeof (v.idView) === 'function' && typeof (v.persist) === 'function' && typeof (v.restore) === 'function' && v instanceof ASelectAble && ('desc' in v) && ('dim' in v));
    }
}
export class DummyDataType extends ADataType {
    constructor(desc) {
        super(desc);
    }
}
//# sourceMappingURL=datatype.js.map