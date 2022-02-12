import React, { useRef } from 'react';
import { useState } from 'react';
import { DropBox } from '../DropBox/DropBox';
import { FileData, UploadStatus, WordDataAll, WordDataFile} from '../../Types/common'
import './styles.scss'
import { ResultsAllFiles } from '../ResultsAllFIles/ResultsAllFiles';
import { ResultsFile } from '../ResultsFile/ResultsFile';

export const Main  = () =>{


   const [files, setFiles] = useState<FileData[]>([]);
   const [results, setResults] = useState(null);
   const contentDivRef = useRef<HTMLDivElement>(null);

   const handleFiles =  (filesToUpload:any) =>{
      let newFiles = [...filesToUpload];
      let tmp = [...files];  
      console.log('Start handle files');
      for(let i = 0; i< newFiles.length; i++){
         let file = newFiles[i];
         tmp.push({name: file.name, size: file.size, status:UploadStatus.UPLOADING});
      }
      setFiles(tmp);
      uploadFiles(filesToUpload);
   }
   const uploadFiles = async (files:any) =>{
      let filesToUpload = [...files]; 
      console.log('Start handle files');
      for(let i = 0; i< filesToUpload.length; i++){
         let file = filesToUpload[i];
         console.log('start upload file.'+file.name);
         await uploadFile(file);
         console.log('done upload file:'+file.name);
      }
   }
   const uploadFile = async (file:any) =>{
      let formData = new FormData()
      formData.append('file',file)
      await fetch('/file', {
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
                     console.log('newfiles[i] :');
                     console.log(newFiles[i]);
                     break;
                  }
               }
               console.log('recived response from file:'+file.name);
               console.log('response:'+data.uploadStatus);
               return newFiles;
            });
        });
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
      contentDivRef.current!.style['height'] = '0';
      contentDivRef.current!.style['overflow'] = 'hidden';
      fetch('/results', {
         method: 'GET',
         credentials: 'same-origin',
         })
         .then((res)=> {console.log(res); return res.json()})
         .then((response)=>{
            setTimeout(()=>{
               contentDivRef.current!.style['height'] = '';
               contentDivRef.current!.style['overflow'] = '';
               setResults(response);
            }, 800);
         });
   }

   
    
   const ready = () =>{
      return !(files.length === 0 || files.some(element => element.status === UploadStatus.UPLOADING));
   }

   let content;
   if(!results){
      content = [
         <h1>WORD-<span>COUNT</span></h1>,
         <DropBox handleFiles = {handleFiles} files = {files} deleteFile = {handleDeleteFile}/>,
         <div className = {'goButton'+ (ready() ? ' enabled' : '')} onMouseUp = { ready() ? handleGo : undefined} >Go</div>
      ];
   }else {
      content = [<h1>WORD-COUNT</h1>, <ResultDisplay res = {results}/>];
   }
   return (
      <div className="main">
        <div className='content' ref ={contentDivRef}>
         {content}
        </div>
      </div>
    );
}

const ResultDisplay = ({res}:any)=>{
   let fileDataDisplays =[];
   let totalWordCount: number = 0;
   let fileNames: string[] = [];
   let allFilesWordData: WordDataAll[] = [];
   let wordMap = new Map<string,{count: number, fileAparences:string[]}>();
   console.log('res:');
   console.log(res);
   for(let file in res){
      fileNames.push(file);
      let fileData = res[file];
      let fileWordCount = 0;
      let fileWordData: WordDataFile[] = [];
      for(let word in fileData){
         totalWordCount += fileData[word];
         fileWordCount += fileData[word];
         fileWordData.push({word:word,count:fileData[word]});
         if(wordMap.has(word)){
            let tmp = wordMap.get(word)!;
            tmp.count+=fileData[word];
            if(!tmp.fileAparences.includes(file)){
               tmp.fileAparences.push(file);
            } 
            wordMap.set(word, tmp);
         }else{
            wordMap.set(word, {count: fileData[word], fileAparences:[file]});
         }
      }
      fileWordData.sort((a,b)=>{return a.count>b.count? -1:1});
      fileDataDisplays.push(<ResultsFile fileName={file} totalWordCount={fileWordCount} uniqueWordCount={Object.keys(fileData).length} tableData = {fileWordData} mostUsedWord={fileWordData[0].word}/>);

   }
   wordMap.forEach((value, key) =>{
      allFilesWordData.push({word:key, fileAparences:value.fileAparences, count:value.count});
   });

   fileDataDisplays.push(<ResultsAllFiles numberOfFiles={fileNames.length}
      fileNames={fileNames}
      totalWordCount={totalWordCount}
      uniqueWordCount={wordMap.size}
      tableData={allFilesWordData}/>);
   return <>{fileDataDisplays}</>;          
}