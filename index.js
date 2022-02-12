// server/index.js

const path = require("path");
const express = require("express");
const multer  = require('multer')
const cookieParser = require('cookie-parser');
const { v4: uuidv4 } = require('uuid');
const PORT = process.env.PORT || 3001;

const app = express();
const MAX_SESSION_TIME = 1000*60*30; // after 30 minutes delete files from session
const MAX_FILE_SIZE = 1024*1024*5; // 5mb
const files = new Map();

app.use(express.static(path.join(__dirname, "client", "build")));
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) =>{
  res.sendFile(path.join(__dirname,  "client", "build", "index.html"));

});


app.post("/file", upload.single('file'),  (req, res, next) =>{
  let sessionId;
  if(!req.cookies.id){ 
    let newId = uuidv4();
    while(files.has(newId)){
      newId = uuidv4();
    }
    res.cookie('id', newId);
    sessionId = newId;
  }else{
    sessionId = req.cookies.id;
  }
  
  if(!req.file){
    res.send({uploadStatus:'ERROR_IN_REQUEST'});
  }else if(req.file.mimetype !== 'text/plain'){
    res.send({uploadStatus:'ERROR_FILE_TYPE'});
  }else if(req.file.size >MAX_FILE_SIZE){
    res.send({uploadStatus:'ERROR_FILE_TOO_BIG'});
  }else{
    if(files.has(sessionId)){
      files.set(sessionId, files.get(sessionId).concat(req.file));
    }else{
      files.set(sessionId, [req.file]);
      setTimeout(()=>{
        if(files.has(sessionId)){
          files.delete(sessionId);
        }
      }, MAX_SESSION_TIME);
    }
    res.send({uploadStatus:'UPLOADED'});
  }
});


app.delete("/file", (req,res)=>{
  if(req.cookies.id && files.has(req.cookies.id) && req.body && req.body.file){
    let index = files.get(req.cookies.id).findIndex(element =>element.originalname === req.body.file);
    if(index !==-1){
      files.get(req.cookies.id).splice(index,1); 
      res.send({'message':'deletedOK'});
    }else{
      res.send({'message':'notDeleted'});
    }
  }else{
    res.send({'message':'notDeleted'});
  }
});

app.get("/results", (req, res) => {
   if(!req.cookies.id || !files.has(req.cookies.id)){
     res.send({error:'No session'});
   }else{
     let results = getResults(req.cookies.id);
     files.delete(req.cookies.id);
     res.clearCookie('id');
     res.send(results);
     
   }
 });

 const getResults = (id) =>{

  let results = {};
  files.get(id).forEach((element)=>{
    let wordMap = new Map();
    let string = element.buffer.toString();
    let words = string.trim().replace(/\W/,' ').split(/\s+/).filter((element)=>{return element && element !== ' '});
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