import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

var firebaseConfig = {
    apiKey: "AIzaSyAmEyrO-a9gIRJNXkj-LHSXA_EqUxNcvV4",
    authDomain: "firestore-shopshare.firebaseapp.com",
    projectId: "firestore-shopshare",
    storageBucket: "firestore-shopshare.appspot.com",
    messagingSenderId: "644683268995",
    appId: "1:644683268995:web:44803516ad87094a2c2cb6"
    };


const firebaseApp = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();
const db = firebaseApp.firestore(); // reference to the firestore database
const auth = firebaseApp.auth(); // reference to the auth module
const storage = firebaseApp.storage(); // reference to the storage module

// export some functions
export async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider()         // "firebase.auth" is not referencing this as a method but rather, as a property and then we want to access the GoogleAuthProvider() // we store our reference to that in our "provider" variable
    await auth.signInWithPopup(provider)                            // we want to await it because this method returns a promise **Not going to resolve immeditaely but after the user completes the signup flow
    window.location.reload()                                        // after signing in with the popup, we can reload the page with window.location.reload()   -- this lets us redirect away from the "Splash" Page and actually show the authenticated content.
}                                                       

export function checkAuth(cb) {
  return auth.onAuthStateChanged(cb);                // < Here within a callback function, we can get access to the user.  
}                                                    // modify checkAuth to have it accept a callback function *parameter* to enable the user to be stored localling in the App (in index.jsx)
// we return an auth.onAuthStateChanged <<HERE>> because it returns a function which we can use to unsubscribe/stop listening for the current use
// ^^ important because we don't want to keep listening for the user if our app component is unmounted -- if that happened we might be trying to update a piece of state that no longer exists. 
// **So within useEffect in the index.jsx file, we return that "unsubscribe" function so we can stop listening for the user
// HOWEVER - This can be accomplished with hooks (see hooks folder for more about that**)

export async function logOut() {
  await auth.signOut(); // this returns a promise and then after doing so, will reload the page
  window.location.reload();  // we want to use this function when we hit the logout button in the NavBar component
}

export async function getCollection(id) { // we pass in the collection with "id" which is going to be lists
  const snapshot = await db.collection(id).get() // to get all the data we need to reference the collection and use the get()
  // it will be in the form of a promise, so we need to make the function async and await the response
  // we will get back a questy "snapshot" so we'll call the variable holding this "snapshot"
  // then all of the data- will be provided on snapshot.docs
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data()})) 
  // then we use the map() function to map over it and for each document, we want to create a new array where we return an object
  // so an array of objects where we set the id to the document id, and then use the method data() and ... spread in all the fields we're getting from the database into this object
  console.log(data)
}

// This is where we query collection data from our lists collection from our firestore database... specifically 
// function that's specific for getting a specific user's lists 
// how we use the data (once it's fetched) is in the Lists.jsx component
export async function getUserLists(userId) { // we pass in the user id with "userId" 
  const snapshot = await db
  .collection('lists')
  .where('author', '==', userId)
  .get();
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data()})) ;
  // ^ reference the collection called lists then use the where() to say lists where the author is equal to the 'userID'
  // console.log(data)
  return data
}

// The uploadCoverImage function lets us upload the image tot he database/ It accepts the user's file
// And to use storage, we have a reference to that ^^ towards the top of this file -- const storage = firebaseApp.storage();
function uploadCoverImage(file) {
  const uploadTask = storage
    .ref(`images/${file.name}-${file.lastModified}`) 
              // this `images/${file.name}` images/ creates a folder called images, that we put in the ${} location - giving the file a name with "file.name" (note: there is a name property for the image when the user uploads it)
    .put(file) // then we pass the file to the put method
  return new Promise((resolve, reject) => { // for each promise, we get the resolve and reject functions.. and pass all the code for uploadTask.on() into the promise
    uploadTask.on(
      // ^ we can listen to the progress of this task with uploadTask.on() and give it the first argument as the string "state_changed"
      'state_changed',  // As the state changes (aka as the file is being uploaded) we can get data with the help of some callback functions:
      (snapshot) => console.log("image uploading", snapshot),
      // First, ^^ we can get access to the snapshot of the uploaded file with: (snapshot) => console.log("image uploading", snapshot)
      // (error) => console.error(error), ///////// replace error callback with *reject*
      // Then, ^^ we can get the error callback with the error data with: (error) => console.error(error))
      reject, // and then we can resolve the promise in the *.then() 
      () => {
        // storage.ref('images').child(`${file.name}-${file.lastModified}`).getDownloadURL().then(url => console.log(url))
        // THen, ^^ the callback where we can get the URL and the URL comes from: storage.ref() where we pass in images. We need to resolve this as a promise with .then()
        storage.ref('images').child(`${file.name}-${file.lastModified}`).getDownloadURL().then(resolve)  
      }
    );
  // Since we need to pass the URL to the creatList() function *below* we need to promisify the uploadCoverImage() function..
  // by returning a promise, the createList() function can easily resolve it with the *async* *await* syntax.
  // We promisify the the uploadCoverImage(file) function with the line new Promise()
  })
}

export async function createList(list, user) { // pass in 2 arguments, list and user
  const { name, description, image } = list
// we can ^^destructure the list to get back name, description, and image.
  await db.collection('lists').add({ // to put data on our collection use: db.collection, then reference the *lists* collection
// then, add the fields -- name, description, and image (is either going to be am image OR null):
    name,
    description,
    image: image ? await uploadCoverImage(image) : null, 

    created: firebase.firestore.FieldValue.serverTimestamp(), // This timestamps the date the data was created with the server method serverTimestamp()
    author: user.uid, // The author field is the user's id
    userIds: [user.uid], // then we store the userIds in an array
    users: [ // but we also store the users in array that gives us more information about each user 
      {
        id: user.uid,
        name: user.displayName
      }
    ]
  })



}
