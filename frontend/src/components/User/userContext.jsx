import {createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const GymContext = createContext()

export const GymProvider = ({children}) =>{
    const [gym, setGym] = useState(null)
    const [ownerName, setOwnerName] = useState("")
    const [ownerEmail, setOwnerEmail] = useState("")
    const [ownerId, setOwnerId] = useState("")
    const [user, setUser] = useState(null);
    const [membership, setMembership] = useState([])
    // const [activeEvents, setActiveEvents] = useState([]);
    // const [inactiveEvents, setInactiveEvents] = useState([]);


    const {gymId} = useParams()

    useEffect(() => {
        const fetchGym = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/user/getSingleGym", { gymId }, { withCredentials: true });
                if (response.data.success) {
                    setGym(response.data.gym);
                    setOwnerName(response.data.ownerName)
                    setOwnerEmail(response.data.ownerEmail)
                    setOwnerId(response.data.ownerId)
                }
            } catch (error) {
                console.error("Error fetching gym details:", error);
            }
        };
        if (gymId) {
            fetchGym();
        }
    }, [gymId]);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/user/userDetails", {}, { withCredentials: true });
                if (response.data.success) {
                    setUser(response.data.user);
                }
            } catch (err) {
                console.error("Error fetching user details:", err);
            }
        };
        fetchUserDetails();
    }, []);

    useEffect(() => {
        const fetchUserMembership= async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/user/getUserMembership", {}, { withCredentials: true });
                if (response.data.success) {
                    setMembership(response.data.gyms);
                }
            } catch (err) {
                console.error("Error fetching user details:", err);
            }
        };
        fetchUserMembership();
    }, []);

    // useEffect(() => {
    //     const fetchEvent= async () => {
    //         try {
    //             const response = await axios.post("http://localhost:5000/api/user/getEvents", {gymId}, { withCredentials: true });
    //             if (response.data.success) {
    //                 setActiveEvents(response.data.Active);
    //                 setInactiveEvents(response.data.Inactive);
    //             }
    //         } catch (err) {
    //             console.error("Error fetching user details:", err);
    //             setActiveEvents([]);
    //             setInactiveEvents([]);
    //         }
    //     };
    //     fetchEvent();
    // }, []);

    return (
        <GymContext.Provider value={{gym,ownerName,ownerEmail,user,membership,ownerId }}>
            {children}
        </GymContext.Provider>
    )
}

export const useGym = ()=>useContext(GymContext)