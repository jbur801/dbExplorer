import { v4 } from 'uuid';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { addDoc, collection, getDocs, getFirestore } from "firebase/firestore";
import { ButtonSpec } from './EntityFormStuff/ButtonList';
import { EntityForm } from './EntityFormStuff/EntityForm';
import { Field, fieldChildrenMap, FieldTypes } from './EntityFormStuff/FieldTypes';
const firebaseConfigString = import.meta.env.VITE_FIREBASE_CONFIG;
console.log(firebaseConfigString)
const firebaseConfig = JSON.parse(firebaseConfigString);
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries




const test: Field[] = [
  { name: 'name', label: 'Name', type: 'string', validation: undefined, required: true },
  { name: 'label', label: 'Label', type: 'string', required: false },
  { name: 'required', label: 'required', type: 'boolean', default: false, validation: undefined, required: false },
  {
    name: 'type', label: 'Type', type: 'conditionalComposite', required: true,
    options: FieldTypes.map(typeName => { return { label: typeName, value: typeName, children: fieldChildrenMap[typeName] } })
  },
]

const submitInfo = async (info: any, collectionName: string = 'default', setState?: (data: string[]) => void) => {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);

  // Initialize Cloud Firestore and get a reference to the service
  const db = getFirestore(app);

  const now = new Date();
  const newUUID = v4();
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      timestamp: now.getTime(),
      id: newUUID,
      ...info,
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const strings: string[] = [];
    querySnapshot.forEach((doc) => {
      strings.push(`${doc.id} => ${JSON.stringify(doc.data())}`);
    });
    setState ? setState(strings) : console.log(strings);
    console.log('strings', strings)
  } catch (e) {
    console.error("Error reading document: ", e);
  }
}

// const doAddToDb = async (setState?: (data: string[]) => void) => {
//   // Initialize Firebase
//   const app = initializeApp(firebaseConfig);
//
//   // Initialize Cloud Firestore and get a reference to the service
//   const db = getFirestore(app);
//
//
//   try {
//     const docRef = await addDoc(collection(db, "users"), {
//       first: "Ada",
//       last: "Lovelace",
//       born: 1815
//     });
//     console.log("Document written with ID: ", docRef.id);
//   } catch (e) {
//     console.error("Error adding document: ", e);
//   }
//   try {
//     const querySnapshot = await getDocs(collection(db, "users"));
//     const strings: string[] = [];
//     querySnapshot.forEach((doc) => {
//       strings.push(`${doc.id} => ${JSON.stringify(doc.data())}`);
//     });
//     setState ? setState(strings) : console.log(strings);
//     console.log('strings', strings)
//   } catch (e) {
//     console.error("Error reading document: ", e);
//   }
// }

// const analytics = getAnalytics(app);
function App() {
  const curriedSubmit = (data: any) => {
    return (submitInfo(data, 'reports'))
  }
  const buttonSpecs: ButtonSpec[] = [{ fields: test, label: 'Day Report', auto: 'maybe', onSubmit: curriedSubmit },
  { fields: test, label: 'Something else', auto: 'maybe', onSubmit: curriedSubmit }, { fields: test, label: 'A third Thing', auto: 'maybe', onSubmit: curriedSubmit },]
  // <EntityForm fields={dayReport} onSubmit={curriedSubmit} />
  // <ButtonList specs={buttonSpecs} />
  return (
    <>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* {data&&data.map((v)=><div key={v}>{v}</div>)} */}

        <EntityForm fields={test} onSubmit={curriedSubmit} />
      </div>
      {/* <DbExplorer contextCustomer={{idk:'man'}}/> */}
    </>
  )
}

export default App
