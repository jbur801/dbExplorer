import { useEffect, useState } from 'react'
import {v4} from 'uuid';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { DocumentData, getFirestore, QuerySnapshot } from "firebase/firestore";
import { collection, addDoc, getDocs } from "firebase/firestore"; 
import { DbExplorer } from './Graphstuff/Graph';
import { EntityForm } from './EntityFormStuff/EntityForm';
import { BaseField, FieldType, makeOptsFromStrings, ValidFieldType } from './EntityFormStuff/FieldTypes';
const firebaseConfigString = import.meta.env.VITE_FIREBASE_CONFIG;
console.log(firebaseConfigString)
const firebaseConfig = JSON.parse(firebaseConfigString);
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries




const moodEnum:string[] = ['happy','sad','mad',] 
const dayReport:ValidFieldType[] = [
  {name:'wakeTime',label:'Time Awake',type:'string',default:'no',validation:undefined },
  {name:'sleepScore',label:'Sleep Score (0-10)',type:'number',default:0 },
  {name:'morningBrush',label:'Brushed Teeth this morning',type:'boolean',default:false,validation:undefined },
  {name:'quote',label:'Make up a quote',type:'string',default:'no',validation:undefined },
  {name:'eveningBrush',label:'Brushed Teeth this evening',type:'boolean',default:false,validation:undefined },
  {name:'score',label:'Day Score (0-10)',type:'number',default:0 },
  {name:'bedTime',label:'Time in Bed',type:'string',default:'no',validation:undefined },
  {name:'mood',label:'Mood',type:'enum',options:makeOptsFromStrings(moodEnum) },
]
const test:ValidFieldType[] = [
  {name:'firstName',label:'First Name',type:'string',default:'bozo',validation:undefined },
  {name:'age',label:'Age',type:'number',default:0 },
  {name:'doesDrugs',label:'Do they do drugs?',type:'boolean',default:false,validation:undefined },
  {name:'catchPhrase',label:'CatchPhrase',type:'string',default:'no',validation:undefined },
  {name:'mood',label:'Mood',type:'enum',options:makeOptsFromStrings(moodEnum) },
]

const submitInfo = async(info:any,collectionName:string='default',setState?:(data:string[])=>void)=>{
  // Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

const now = new Date();
const newUUID = v4();
try {
  const docRef = await addDoc(collection(db, collectionName), {
    timestamp:now.getTime(),
    id:newUUID,
    ...info,
  });
  console.log("Document written with ID: ", docRef.id);
} catch (e) {
  console.error("Error adding document: ", e);
}
try{
  const querySnapshot = await getDocs(collection(db, collectionName));
const strings:string[] = [];
querySnapshot.forEach((doc) => {
  strings.push(`${doc.id} => ${JSON.stringify(doc.data())}`);
});
setState?setState(strings):console.log(strings);
console.log('strings',strings)
}catch (e) {
  console.error("Error reading document: ", e);
}
}

const doAddToDb = async(setState?:(data:string[])=>void)=>{
  // Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);


try {
  const docRef = await addDoc(collection(db, "users"), {
    first: "Ada",
    last: "Lovelace",
    born: 1815
  });
  console.log("Document written with ID: ", docRef.id);
} catch (e) {
  console.error("Error adding document: ", e);
}
try{
  const querySnapshot = await getDocs(collection(db, "users"));
const strings:string[] = [];
querySnapshot.forEach((doc) => {
  strings.push(`${doc.id} => ${JSON.stringify(doc.data())}`);
});
setState?setState(strings):console.log(strings);
console.log('strings',strings)
}catch (e) {
  console.error("Error reading document: ", e);
}
}

// const analytics = getAnalytics(app);
function App() {
  const [count, setCount] = useState(0)
  const [data,setData] = useState<string[]>();
  useEffect(()=>{
    doAddToDb(setData);
    
  },[])

  const curriedSubmit =(data:any) =>{
    return(submitInfo(data,'reports'))
  }
  return (
    <>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <EntityForm fields={dayReport} onSubmit={curriedSubmit} />
        {/* {data&&data.map((v)=><div key={v}>{v}</div>)} */}
      </div>
      {/* <DbExplorer contextCustomer={{idk:'man'}}/> */}
    </>
  )
}

export default App
