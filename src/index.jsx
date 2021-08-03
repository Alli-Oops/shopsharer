import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import ListPage from "./pages/ListPage";
import HomePage from "./pages/HomePage";
import SignIn from "./components/SignIn";
import * as db from "./firestore";  // no longer need to execute checkAuth here because of the useAuth Hook
import Loading from "./components/shared/Loading";
import useAuth from "./hooks/useAuth";

export const UserContext = React.createContext() // This creates the user context -- then surrounding the routes in the AuthApp({ user}) we can use the Provider -- to provide the data that we want throughout the created context
// export lets us pass the user context to any component we want to use "user"

//exectue the checkAuth here (within App), using checkAuth we want to store the user here locally (within App) -- so let's modify checkAuth (in index.js) to have it accept a callback function
function App() {                                              // Here we need a way to determine if we should render the authApp or the unAuthApp (The firebase Auth module has a helpful method for giving info about the user that we can export fomr index.js)
  // Copy code within //REACT HOOK// markers to the Hooks folder in the useAuth.js file // React Hooks mean that instead of having all this code, just to get the user and loading state
  // All this into a seperate hook means we can call a single hook and get the user data we need as well as loading.
  //REACT HOOK// 
  /*
  const [user, setUser] = React.useState(null)                // Create a piece of state <<HERE>> we put the User within local State
  const [loading, setLoading] = React.useState(true)          // piece of state for loading while we wait for the asynchronous function to complete. Set the default boolean value to true - we can assume that when it's used, we will fetch the user data                                               
  
  React.useEffect(() =>{                                      // useEffect to make the state-- so it will execute just ONCE when the app mounts
    return db.checkAuth(user => {                             // write the callback function here where we get the user... but providing it here will give us accesst to it within app so we can store it locally within state. // we want to return db.checkAuth
      setLoading(false)                                       // once we checkAuth and we get our user, we want to change/update Loading to False                                          
      setUser(user)                                           // Once we get our user - this will change/update the user to whoever successfully logs in // to manage the situations when we don't have an authenticated user yet - we need a piece of state for loading]
    }); 
  }, [])                                                      // pass in an empty dependencies array
 //REACT HOOK// 
  //* ** calling useAuth() hook replaces ^^all this^^ **/
  const { user, loading } = useAuth()                         // this will get back the 2 values we need -- user and loading
  if (loading) return <Loading />                 // if we don't have the user yet - we will be loading (aka loading is set to True) - we want something to show that (which is the Loading.jsx component)
  return user ? <AuthApp user={user}/> : <UnAuthApp/>;       // with "user" and "loading" we can use a ternary to determine which App to render (AuthApp or unAuthApp)
}                         // ^ this passes user data to AuthApp
// We need a convenient way to pass the user from the AuthApp props to - 
// fortunately we can do that!! ANd pass it to whatever component we need, no matter how deeply nested it is within our pages
// USING React Context written at the top // const UserContext = React.createContext() //

function AuthApp({ user }) {     
  return (
    <BrowserRouter>
      <Switch>
        <UserContext.Provider value={user}>  {/*The value prop is set to user and this is going to make consuming our user data easy*/}
          <Route path="/:listId" component={ListPage} />
          <Route exact path="/" component={HomePage} />
        </UserContext.Provider>
      </Switch>
    </BrowserRouter>
  );
}

function UnAuthApp() {
  return <SignIn/>        //This returns the SignIn component for rendering

}

ReactDOM.render(
  <React.StrictMode>
    < App />
  </React.StrictMode>,
  document.getElementById("root")
);
