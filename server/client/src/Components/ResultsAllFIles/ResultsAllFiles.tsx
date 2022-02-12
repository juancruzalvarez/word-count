import {useState} from 'react'
import {WordDataAll} from '../../Types/common'
import './styles.scss'
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
         {showTable && <ResultsAllTable data = {props.tableData}/>}
      </div>
   );
}

type ResultsAllTableProps ={
   data: WordDataAll[];
};

const ResultsAllTable = ({data}: ResultsAllTableProps) =>{
   const [sortBy, setSortBy] = useState<keyof(WordDataAll)>('count');
   const [sortInversed, setSortInversed] = useState(false);

   const handleOnClickColumn = (key:keyof(WordDataAll))=>{
      if(sortBy === key){
         setSortInversed(!sortInversed);
      }else{
         setSortBy(key);
      }
   }
   data.sort((a,b) =>{let res = a[sortBy]>=b[sortBy] ? -1 : 1; return sortInversed? res :-res});
   return (
      <div className = 'tableDiv'>
      <table>
         <thead>
            <tr>
               <th onMouseDown={()=>handleOnClickColumn('word')}>Word</th>
               <th onMouseDown={()=>handleOnClickColumn('count')}>Count</th>
               <th onMouseDown={()=>handleOnClickColumn('fileAparences')}>Files</th>
            </tr>
         </thead>
         <tbody>
            {data.map((element) =>{
               return <tr><td>{element.word}</td><td>{element.count}</td><td>{element.fileAparences}</td></tr>
            })}
         </tbody>
      </table>
      </div>
   );
}