import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { DocumentData, getFirestore, QuerySnapshot } from "firebase/firestore";
import { collection, addDoc, getDocs } from "firebase/firestore"; 
const firebaseConfigString = import.meta.env.VITE_FIREBASE_CONFIG;
console.log(firebaseConfigString)
const firebaseConfig = JSON.parse(firebaseConfigString);
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


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
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        {data&&data.map((v)=><div key={v}>{v}</div>)}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
