// server/index.js

const path = require("path");
const express = require("express");
const multer  = require('multer')
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const PORT = process.env.PORT || 3001;

const app = express();
const map = new Map();



app.use(express.static(path.join(__dirname, "client", "build")));
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) =>{
  res.sendFile(path.join(__dirname,  "client", "build", "index.html"));

});

const MAX_FILE_SIZE = 2048*2048;
app.post("/file", upload.single('file'),  (req, res, next) =>{
  let sessionId = null;
  if(!req.cookies.id){ 
    let newId = uuidv4();
    while(map.has(newId)){
      newId = uuidv4();
    }
    res.cookie('id', newId);
    sessionId = newId;
  }else{
    sessionId = req.cookies.id;
  }
  
  if(!req.file){
    console.log('no file');
    res.send({uploadStatus:'ERROR_IN_REQUEST'});
  }else if(req.file.mimetype !== 'text/plain'){
    console.log('not text');
    res.send({uploadStatus:'ERROR_FILE_TYPE'});
  }else if(req.file.size >MAX_FILE_SIZE){
    console.log('too big');
    res.send({uploadStatus:'ERROR_FILE_TOO_BIG'});
  }else{
    console.log('okey');
    if(map.has(req.cookies['id'])){
      map.set(req.cookies['id'], map.get(req.cookies['id']).concat(req.file));
    }else{
      map.set(req.cookies['id'], [req.file]);
    }
    res.send({uploadStatus:'UPLOADED'});
    console.log("Map:");
    console.log(map);
  }
});


app.delete("/file", (req,res)=>{
  if(req.cookies.id && map.has(req.cookies.id)&& req.body && req.body.file){
    map.get(req.cookies.id).splice(map.get(req.cookies.id).findIndex(element =>element.name === req.body.file),1); 
    res.send({'message':'deletedOK'});
  }else{
    res.send({'message':'notDeleted'});
  }
});

app.get("/results", (req, res) => {
  console.log('results');
   //res.json({ message: "Hello from server!" });
   if(req.cookies && req.cookies.id && map.has(req.cookies.id)){
     let results = getResults(req.cookies.id);
     console.log(results);
      res.send(results);
   }else{
   res.send({'error':'userNotRecognized'})
   }
   
 });

 const getResults = (id) =>{

  let results = {};
  map.get(id).forEach((element)=>{
    let wordMap = new Map();
    let string = element.buffer.toString();
    let words = string.trim().replace(/[.,"]gi/,' ').split(/\s+/).filter((element)=>{return element && element !== ' '});  //remove punctuation and then split by whitespace, linebreak and such
    words.forEach((word) =>{
      let wordlc = word.toLowerCase();
      if(wordMap.has(wordlc)){
        wordMap.set(wordlc,wordMap.get(wordlc)+1);
      }else{
        wordMap.set(wordlc, 1);
      }
    });
    results[element.originalname] = Object.fromEntries(wordMap);
  });
  //console.log(results);
  return results;
 }


app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});