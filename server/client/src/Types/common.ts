export enum UploadStatus{
   ERROR_IN_REQUEST = 'ERROR_IN_REQUEST',
   ERROR_FILE_TOO_BIG = 'ERROR_FILE_TOO_BIG',
   ERROR_FILE_TYPE = 'ERROR_FILE_TYPE',
   UPLOADING = 'UPLOADING',
   UPLOADED = 'UPLOADED'
};

export type FileData = {
   name:string;
   size:number;
   status:UploadStatus;
};