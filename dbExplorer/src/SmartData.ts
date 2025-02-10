type DatastoreObjectType = {
    id: string;
}

export type SkMappedItems<T extends DatastoreObjectType = DatastoreObjectType> = { [ childId: string ]: { [ parentId: string ]: T | undefined } };
export type PKMappedItems<T extends DatastoreObjectType = DatastoreObjectType> = { [ parentId: string ]: { [ childId: string ]: T | undefined } };

export interface IEdgeMappedItems<T extends DatastoreObjectType> {
    skMapped: SkMappedItems<T>
    pkMapped: PKMappedItems<T>
}

export type node = {
    id:string,
    type:string
}

export type relation = {
    id:string,
    childId:string,
    parentId:string,
    type?:string
}

// type DataObjectLike<T extends DatastoreObjectType> = {
//     nodeCount: number;
//     edgeCount: number;
//     // queryHashes?: string[];
//     axisNode: T | undefined;
// } & IEdgeMappedItems<T>

// export class SmartData<T extends DatastoreObjectType = DatastoreObjectType> implements DataObjectLike<T> {
//     nodeCount: number;
//     edgeCount: number;
//     axisNode: T | undefined;
//     skMapped: SkMappedItems<T>;
//     pkMapped: PKMappedItems<T>;

// }