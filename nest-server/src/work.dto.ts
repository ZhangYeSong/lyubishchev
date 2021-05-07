export class CreateWorkDto {
    userId: number;
    insertTime: number;
    content: string;
    startTime: number;
    endTime: number;
}

export class SyncWorksDto {
    userId: number;
    works: CreateWorkDto[];
    deletes: number[];
}