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
               contentDivRef.current.style['overflow'] = 'hidden';
            }
            setTimeout(()=>{
               if(contentDivRef.current){
                  contentDivRef.current.style['height'] = '';
                  contentDivRef.current.style['transform'] ='';
                  contentDivRef.current.style['overflow'] = '';
                  setResults(response);
               }
            }, 8000);
         });
         if(contentDivRef.current){
            contentDivRef.current.style['height'] = '0';
            contentDivRef.current.style['transform'] ='translate-y(5px)';
            contentDivRef.current.style['overflow'] = 'hidden';
         }
         setTimeout(()=>{
            if(contentDivRef.current){
               contentDivRef.current.style['height'] = '';
               contentDivRef.current.style['transform'] ='';
               contentDivRef.current.style['overflow'] = '';
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
      fileDataDisplays.push(<ResultsFile fileName={file} totalWordCount={fileWordCount} uniqueWordCount={Object.keys(fileData).length} tableData = {fileWordData} mostUsedWord={'f'}/>);

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