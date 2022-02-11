import {useState} from 'react'
import {WordDataFile} from '../../Types/common'
type ResultsFileProps ={
   fileName:string;
   totalWordCount:number;
   uniqueWordCount:number;
   mostUsedWord:string;
   tableData:WordDataFile[];
};
export const ResultsFile = (props: ResultsFileProps) =>{

   const [showTable, setShowTable] = useState(false);
   return( 
      <div className="resultsFileContainer">
         <h2>{props.fileName}</h2>
         <p>{'word count: '+ props.totalWordCount}</p>
         <p>{'unique words: '+ props.uniqueWordCount}</p>
         <p>{'most used word: '+ props.mostUsedWord}</p>
         <p className='resultsShowTable' onMouseUp={()=>setShowTable(!showTable)}>Show table</p>
         {showTable && <ResultsFileTable data = {props.tableData}/>}
      </div>
   );
}

type ResultsFileTableProps ={
   data: WordDataFile[];
};
const ResultsFileTable = ({data}:ResultsFileTableProps) =>{
   return <h5>table!</h5>
}