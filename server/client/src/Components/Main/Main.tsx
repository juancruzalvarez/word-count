import React, { useRef } from 'react';
import { useState } from 'react';
import { DropBox } from '../DropBox/DropBox';
import { FileData, UploadStatus} from '../../Types/common'
import './styles.scss'
import { response } from 'express';
export const Main  = () =>{


   const [files, setFiles] = useState<FileData[]>([]);
   const [results, setResults] = useState(null);
   const [loading, setLoading] = useState<boolean>(false);
   const contentDivRef = useRef<HTMLDivElement>(null);

   const handleFiles = (filesToUpload:any) =>{
      let newFiles = [...filesToUpload];
      let tmp = [...files];  
      newFiles.forEach( (element) =>{ tmp.push({name: element.name, size: element.size, status:UploadStatus.UPLOADING}); uploadFile(element)});
      setFiles(tmp);
   }

   const handleDeleteFile = (fileName: string) =>{
      setFiles((files) =>{
         let newFiles = [...files];
         newFiles.splice(newFiles.findIndex(element =>element.name === fileName),1);
         return newFiles;
      });
      fetch('/file', {
         method: 'DELETE',
         headers: new Headers({'content-type': 'application/json'}),
         credentials: 'same-origin',
         body:JSON.stringify({file:fileName})
         })
         .then((res)=> res.json())
         .then(response=>console.log(response));
   }

   const handleGo = () =>{
      fetch('/results', {
         method: 'GET',
         credentials: 'same-origin',
         })
         .then((res)=> {console.log(res); return res.json()})
         .then((response)=>{
            if(contentDivRef.current){
               contentDivRef.current.style['height'] = '0';
               contentDivRef.current.style['transform'] ='translate-y(5px)';
            }
            setTimeout(()=>{
               if(contentDivRef.current){
                  contentDivRef.current.style['height'] = '';
                  contentDivRef.current.style['transform'] ='';
                  setResults(response);
               }
            }, 8000);
         });
         if(contentDivRef.current){
            contentDivRef.current.style['height'] = '0';
            contentDivRef.current.style['transform'] ='translate-y(5px)';
         }
         setTimeout(()=>{
            if(contentDivRef.current){
               contentDivRef.current.style['height'] = '';
               contentDivRef.current.style['transform'] ='';
               setLoading(true);
            }
         }, 800);
      
   }

   const uploadFile = (file:any) =>{
      
      let formData = new FormData()

      formData.append('file',file)

      fetch('/file', {
         method: 'POST',
         credentials: 'same-origin',
         body: formData
      }).then(response => response.json())
        .then((data) => {
            setFiles((files) =>{
               let newFiles = [...files];
               for(let i = 0; i< newFiles.length;i++){
                  if(newFiles[i].name === file.name){
                     newFiles[i].status = data.uploadStatus;
                     break;
                  }
                 
               }
               return newFiles;
            });
        });
   }
    
   const ready = () =>{
      return !(files.length === 0 || files.some(element => element.status === UploadStatus.UPLOADING));
   }

   let content;
   if(!loading && !results){
      content = [
         <h1>WORD-COUNT</h1>,
         <DropBox handleFiles = {handleFiles} files = {files} deleteFile = {handleDeleteFile}/>,
         <div className = {'goButton'+ (ready() ? ' enabled' : '')} onMouseUp = {handleGo} >Go</div>
      ];
   }else if(loading && !results){
      console.log('LOADING');
      content = [<Loading/>];
   }else if(results){
      console.log('RESULTS');
      content = [<ResultDisplay res = {results}/>];
   }

   return (
      <div className="main">
        <div className='content' ref ={contentDivRef}>
         {content}
        </div>
      </div>
    );
}

const Loading  = ()=>{
   return <h1>loading</h1>
}

const ResultDisplay = ({res}:any)=>{
   return <h1>results</h1>
}