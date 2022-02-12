import { useState, VoidFunctionComponent } from 'react';
import { FileData, UploadStatus } from '../../Types/common';
import {UploadStatusImages, TrashIconImage} from '../../resourcesIndex';
import './styles.scss'
//ye
type DropBoxProps = {
   files: FileData[];
   handleFiles: (files: any)=>void;
   deleteFile: (fileName:string)=>void;
};

export const DropBox = ({files, handleFiles, deleteFile} : DropBoxProps) =>{

   const [draggingOver, setDraggingOver] = useState<boolean>(false);


   const handleDrop = (e: any) => {
      setDraggingOver(false);
      e.preventDefault();
      e.stopPropagation();
      handleFiles(e.dataTransfer.files);
   };

   const handleDragOver = (e: any) => {
      e.preventDefault();
      e.stopPropagation();
   };

   const handleDragEnter = (e: any) => {
      setDraggingOver(true);
      e.preventDefault();
      e.stopPropagation();
   };

   const handleDragLeave = (e: any) => {
      setDraggingOver(false);
      e.preventDefault();
      e.stopPropagation();
   };

      return (
         <div className= {'dropBoxContainer'+ (draggingOver ? ' draggingOver' : '')}
              onDragOver = {handleDragOver}
              onDragEnter = {handleDragEnter}
              onDragLeave = {handleDragLeave}
              onDrop = {handleDrop}>

            <form className='dropBoxForm'>
               <input type="file" id="fileElem" multiple accept="*" onChange = {(e:any) => handleFiles(e.target.files)} />
               {files.length !== 0 && <FileTable files = {files} onDeleteFile = {deleteFile}/>}
               <p className={files.length !== 0 ? 'floatDown' : ''}>
                  <label className="button" htmlFor="fileElem">Select files</label> or drop them {files.length !== 0 ? ' to add more files' : ' here.'}
               </p>
            </form>

         </div>
      );
   
   
};

type FileTableProps = {
   files: FileData[];
   onDeleteFile: (fileName: string)=>void;
};

const FileTable = ({files, onDeleteFile} : FileTableProps) =>{
   return( 
      <table>
         <thead>
            <tr>
               <th>File name</th>
               <th>File size</th>
               <th>Status</th>
            </tr>
         </thead>
         <tbody>
         {
            files.map((element, key)=>{
               return (
                  <tr key = {key}>
                     <td>{element.name}</td>
                     <td>{GetFileSizeFormatted(element.size)}</td>
                     <td><UploadStatusIcon status = {element.status}/></td>
                     <td><Icon img = {TrashIconImage} description='Remove File.' onClick={()=>onDeleteFile(element.name)}/></td>
                  </tr>
               );
            })
         }
         </tbody>
      </table>
   );
};

const FileSizeUnits = [' B', ' KB', ' MB', ' GB', ' TB'];

const GetFileSizeFormatted = (bytes: number): string =>{
   let unitIndex = 0;
   let aux = bytes;
   while(aux>1024 && unitIndex < 5){
      aux /=1024;
      unitIndex++;
   }
   aux = Math.round(aux*100) /100;  //round to two decimals
   return unitIndex <5 ? aux + FileSizeUnits[unitIndex] : 'The file is too big';
}

type UploadStatusIconProps ={
   status: UploadStatus;
};
const UploadStatusIcon = ({status}:UploadStatusIconProps) =>{
   let icon;
   let description;
   switch(status){
      case UploadStatus.ERROR_FILE_TOO_BIG:{
         icon = UploadStatusImages['error'];
         description = 'The file uploaded is too big.'
         break;
      }

      case UploadStatus.ERROR_IN_REQUEST:{
         icon = UploadStatusImages['error'];
         description = 'There was an error uploading the file.'
         break;
      }

      case UploadStatus.ERROR_FILE_TYPE:{
         icon = UploadStatusImages['error'];
         description = 'Only text files are supported.'
         break;
      }

      case UploadStatus.UPLOADING:{
         icon = UploadStatusImages['uploading'];
         description = 'Uploading...'
         break;
      }

      case UploadStatus.UPLOADED:{
         icon = UploadStatusImages['uploaded'];
         description = 'Success.'
         break;
      }
   }
   return <Icon img={icon} description={description}/>
}

type IconProps = {
   img:any;
   description:string;
   onClick?:()=>void;
}

const Icon = ({img, description, onClick}: IconProps)=>{
   return ( 
      <div className = 'icon' onMouseUp = {onClick}>
         <img src = {img} className = 'iconImage' alt={description}/>
         <div className  = 'iconDescription'>{description}</div>
      </div>
   );
}