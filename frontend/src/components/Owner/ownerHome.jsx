import axios from "axios"
// import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

import { useEffect, useState } from "react";

import Nav from "./component/Navbar";
import { FaStar } from "react-icons/fa";


const OwnerHome = () => {

    const navigate = useNavigate()

    const [getGyms,setGetGyms] = useState([])


    useEffect(()=>{

        const fetchGyms = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/owner/getGyms", {}, {
                    withCredentials: true,
                });

                if (response.data.success) {
                    setGetGyms(response.data.data); // Update to match your backend response structure
                }
            } catch (error) {
                // toast.error("Unable to fetch your gyms");
                console.error(error);
            }
        };

        fetchGyms();
        
    },[])


    
    return ( 
        <>
        <Nav getGyms={getGyms}/>
            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {getGyms.length <= 0 ? 
                
                <div className="text-center mt-6 text-xl text-neutral-800">No Gym found</div>
                :
                    getGyms.map((gym) => (
                        <div key={gym._id} className="bg-white shadow-md rounded-lg overflow-hidden p-4 hover:bg-neutral-200 cursor-pointer" onClick={()=>navigate(`/owner/gym/${gym.gymUniqueId}`)}>
                            <img src={gym.profileImage|| "/images/noPhoto.jpg"} alt={gym.gymName} className="w-full h-40 object-cover rounded-md mb-3" />

                            <div className="flex flex-row items-center">
 
                                <h3 className="text-lg font-semibold text-black">{gym.gymName}</h3>
                                <div className="flex items-center ml-3">
                                    <FaStar className="text-yellow-500 mr-1" />
                                    <span className="text-gray-700">{gym.avgReview || "No reviews yet"}</span>
                                </div>
                                
                            </div>
                            <p className="text-gray-600 mt-2">{gym.location.address}</p>
                            <p className="text-gray-500">{gym.location.city}, {gym.location.state}</p>
                            <p className="text-gray-500">{gym.location.zipCode}</p>
                        </div>
                    ))
                }
                </div>
            </div>   
       
        </> 
       

     );
}
 
export default OwnerHome;





