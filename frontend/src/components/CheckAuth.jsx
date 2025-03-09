import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const CheckAuth = ({children}) => {

    const [isAuthenticate,setIsAuthenticate] = useState(null)

    useEffect(()=>{
        const fetchAuth = async ()=>{
            try {
                const user = await axios.get("http://localhost:5000/api/owner/checkAuth",{
                    withCredentials:true
                })
                
                setIsAuthenticate(true)
            } catch (error) {
                setIsAuthenticate(false)
            }
        }

        fetchAuth()
    },[])

    return isAuthenticate === null ? (
        <div>Loading...</div> // Optionally show a loading spinner or message while checking auth
      ) : isAuthenticate ? (
        children  // If authenticated, render the children
      ) : (
        <Navigate to="/" />  // If not authenticated, redirect to the home page
      );
}
 
export default CheckAuth;