/**
 * Created by Samuel Gratzl on 14.02.2017.
 */
import { Range } from '../range';
import { IIDType, IDTypeLike } from '../idtype';
import { IDataType, IValueTypeDesc, IDataDescription, INumberValueTypeDesc, ICategoricalValueTypeDesc, IStringValueTypeDesc } from '../data';
export interface IAtomValue<T> {
    name: string;
    id: number;
    value: T;
}
export interface IAtomDataDescription<D extends IValueTypeDesc> extends IDataDescription {
    readonly value: D;
    readonly idtype: IDTypeLike;
}
export interface IInlinedAtomDataDescription<T, D extends IValueTypeDesc> extends IAtomDataDescription<D> {
    readonly data: IAtomValue<T>;
}
export interface IAtom<T, D extends IValueTypeDesc> extends IDataType {
    readonly desc: IAtomDataDescription<D>;
    /**
     * id type
     */
    readonly idtype: IIDType;
    readonly valuetype: D;
    name(): Promise<string>;
    id(): Promise<Range>;
    data(): Promise<T>;
}
export declare type INumericalAtom = IAtom<number, INumberValueTypeDesc>;
export declare type ICategoricalAtom = IAtom<string, ICategoricalValueTypeDesc>;
export declare type IStringAtom = IAtom<string, IStringValueTypeDesc>;
export declare type IAnyAtom = IAtom<any, IValueTypeDesc>;
export declare class AtomUtils {
    static createDefaultAtomDesc(): IAtomDataDescription<IValueTypeDesc>;
}
