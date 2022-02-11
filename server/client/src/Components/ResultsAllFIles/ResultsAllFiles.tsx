import {useState} from 'react'
import {WordDataAll} from '../../Types/common'
type ResultsAllFilesProps ={
   numberOfFiles:number;
   fileNames: string[];
   totalWordCount:number;
   uniqueWordCount:number;
   tableData: WordDataAll[];
};

export const ResultsAllFiles = (props:ResultsAllFilesProps) =>{

   const [showTable, setShowTable] = useState<boolean>(false);
   return (
      <div className="resultsAllFilesContainer">
         <h2>All files</h2>
         <p>{'Files:'+ props.fileNames}</p>
         <p>{'Total word count: ' + props.totalWordCount}</p>
         <p>{'Unique word count: ' + props.uniqueWordCount}</p>
         <p className = 'resultsShowTable' onMouseUp={()=>setShowTable(!showTable)}> Show table</p>
         <ResultsAllTable data = {props.tableData}/>
      </div>
   );
}

type ResultsAllTableProps ={
   data: WordDataAll[];
};

const ResultsAllTable = ({data}: ResultsAllTableProps) =>{

   return (
      <table>
         <thead><tr><th>Word</th><th>Count</th><th>Files</th></tr></thead>
         <tbody>
            {data.map((element) =>{
               return <tr><td>{element.word}</td><td>{element.count}</td><td>{element.fileAparences}</td></tr>
            })}
         </tbody>
      </table>
   );
}