import { FaPen, FaUserCircle } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const Profile = () => {
   
    const navigate = useNavigate()
    const [user, SetgetMe] = useState([])

    useEffect(()=>{
        const details =async ()=>{
            try {
                const response = await axios.post("http://localhost:5000/api/owner/ownerDetails", {  }, { withCredentials: true });
                if (response.data.success) {
                    SetgetMe(response.data.owner); // Changed from user to owner
                }
            } catch (error) {
                toast.error("Unable to fetch this owner");
                console.error(error)
            }
        }
            details()
    },[]) 

    return (
        <div>
            <nav className="flex flex-row px-4 py-6 items-center border-b-2 border-neutral-400 shadow-md bg-white">
                <div className="flex flex-row items-center hover:cursor-pointer hover:opacity-80">
                    <div className="text-2xl font-bold text-black" onClick={()=>navigate('/owner/home')}>
                        All-Round<span className="text-gray-500">Fitness</span>
                    </div>
                </div>
            </nav>

            <div className="mx-[20vw] shadow-lg p-6 bg-white rounded-lg flex flex-col md:flex-row items-center gap-6">
                <div className="w-60 h-60 rounded-lg overflow-hidden shadow-lg flex items-center justify-center bg-gray-200">
                    {user?.profile ? (
                        <img
                            src={user.profile}
                            alt="User Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <FaUserCircle className="text-gray-500 w-32 h-32" />
                    )}
                </div>
                {/* Left Section - User Details */}
                <div className="flex flex-col items-center md:items-start flex-1">
                    <div className="flex flex-row justify-between items-center">
                        <div>
                       
                        <p className="text-gray-600">{user?.name}</p>
                        <p className="text-gray-600"><span className="font-bold">Email:</span> {user?.email}</p>
                        <p className="text-gray-600"><span className="font-bold">Mobile:</span> {user?.contactNumber}</p>
                        </div>
                        <div className="hover:opacity-80 cursor-pointer flex flex-row items-center ml-10 " > 
                            <FaPen size={12} className="text-blue-600"/> 
                            <span className="text-blue-600 text-md">Edit</span>
                        </div>
                    </div>

                </div>

                {/* Right Section - Profile Picture */}
            
            </div>
        </div>
    );
};

export default Profile;
