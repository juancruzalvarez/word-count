import {useState} from 'react'
import {WordDataFile} from '../../Types/common'
import './styles.scss'
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
         <p>{'Word count: '+ props.totalWordCount}</p>
         <p>{'Unique words: '+ props.uniqueWordCount}</p>
         <p>{'Most used word: '+ props.mostUsedWord}</p>
         <p className='resultsShowTable' onMouseUp={()=>setShowTable(!showTable)}>Show table</p>
         {showTable && <ResultsFileTable data = {props.tableData}/>}
      </div>
   );
}

type ResultsFileTableProps ={
   data: WordDataFile[];
};

const ResultsFileTable = ({data}:ResultsFileTableProps) =>{
   const [sortBy, setSortBy] = useState<keyof(WordDataFile)>('count');
   const [sortInversed, setSortInversed] = useState(false);

   const handleOnClickColumn = (key:keyof(WordDataFile))=>{
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
            </tr>
         </thead>
         <tbody>
            {data.map((element) =>{
               return <tr><td>{element.word}</td><td>{element.count}</td></tr>
            })}
         </tbody>
      </table>
      </div>
   );
}