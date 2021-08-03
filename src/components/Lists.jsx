import React from "react";
import { Link } from "react-router-dom";
import defaultImage from "../../static/default.svg";
import * as db from "../firestore";
import Empty from "./shared/Empty";
import Error from "./shared/Error";
import Loading from "./shared/Loading";
import useSWR from 'swr' // stale while revalidate 

//This List component will display a list(s) that a user has created at the bottom of their "profile" page

/*
function UserLists() {
// REPLACED ALL THIS CODE WITH useSWR from the 'swr' library
  const [lists, setLists] = React.useState([]) // we need this dedicated state in the form of an empty array
  // We need to add some code here to fetch the data from the database: 
  // we can use React.useEffect so that when the component mounts 
  // then - we will use a function from firestore (this export function is in index.js that let's us get the entire collection from the database
  React.useEffect(() => { 
    // db.getCollection('lists') // getCollection is the function we wrote in the firestore folder's - index.js file. 'lists' is the name of the collection from the db that we are passing into that function
    db.getUserLists('fTmWtjYUfAMX6EHXGBiFXvBUsxS2').then(lists =>{
      setLists(lists) // once lists has been updated/populated with the specific users data... we can map over it
    });
  }, []) // here ^ we use .then() to resolve the promise in the async function in index.js file
*/

  function UserLists({ user }) {
    const { data: lists, error } = useSWR(user.uid, db.getUserLists) 
    // useSWR() accepts first argument - in this case the 'str' that is the userID. 
    // And that first argument is passed to the second argument. 
    // The second argument is a function that takes care of the fetching for us - so in this case, the db.getUserLists function
    // from useSWR(user.uid, db.getUserLists) ... we get back an object {} that has a couple of values { data , error }
    // data comes back if it resolves successfully OR error comes back if there is a problem with performing the request.
    if (error) return <Error message={error.message} />;
    // If there is an error, we want to return the error component
    if (!lists) return <Loading/>;
    // If we dont have our list data yet, we want to return our Loading.jsx component
    if (lists.length === 0) return <Empty />;
    // if we are able to fetch the data and there's no error, but the list array is empty meaning lists.length === 0)
    // we can return the empty component - which just prompts the user to add a list.

    return (
    <>
      {/* display user list count */}
      <section className="text-gray-500 bg-gray-900 body-font">
        <div className="container px-5 py-5 mx-auto">
          <div className="flex flex-wrap -m-4">
            {/* display lists that user is part of  */}
            {lists.map(list => (  // as we map over each list, we can use the ListItem function from *below*
              <ListItem key={list.id} list={list}/> // provide the key as {list.id} and pass all the list data down on a prop named list={list}
            ))} 
          </div>
        </div>
      </section>
    </>
  );
}

function UserListCount() {
  return (
    <div className="container px-5 py-5 mb-6 bg-gray-800 rounded mx-auto flex justify-center text-center">
      <div className="p-4 sm:w-1/4 w-1/2">
        <svg
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="text-green-500 w-12 h-12 mb-3 inline-block"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
        <h2 className="title-font font-medium sm:text-4xl text-3xl text-white">
          count
        </h2>
        <p className="leading-relaxed">Lists</p>
      </div>
    </div>
  );
}

function ListItem() {
  return (
    <div className="lg:w-1/3 sm:w-1/2 p-4">
      {" "}
      <Link to={`/id`}>
        <div className="flex relative">
          <img
            alt="gallery"
            className="absolute inset-0 w-full h-full object-cover object-center"
            src={defaultImage}
          />
          <div className="px-8 py-10 relative z-10 w-full border-4 border-gray-800 bg-gray-900 opacity-0 hover:opacity-100">
            <ul className="list-disc">
              <li className="tracking-widest text-sm title-font font-medium text-orange-500 mb-1">
                Username + 2 others
              </li>
            </ul>
            <h1 className="title-font text-lg font-medium text-white mb-3">
              Name
            </h1>
            <p className="leading-relaxed">Description</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default UserLists;
