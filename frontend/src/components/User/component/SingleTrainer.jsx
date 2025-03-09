import axios from "axios";
import { useEffect, useState } from "react";
import { FaUserCircle, FaUser, FaIdBadge, FaRegCalendarAlt, FaRegEnvelope, FaRobot } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useGym } from "../userContext";
import { LuArrowLeft, LuPencil } from "react-icons/lu";
import toast from "react-hot-toast";

const SingleTrainer = () => {
    const { gymId, trainerId } = useParams();
    const navigate = useNavigate();
    const [trainer, setTrainer] = useState(null);
    const [isOpen, setIsOpen] = useState(false) 
    const {user,gym} = useGym()

    
    useEffect(() => {
        const fetchTrainer = async () => {
          try {
            const response = await axios.post("http://localhost:5000/api/user/getSingleTrainer", { gymId, trainerId }, { withCredentials: true });
            if (response.data.success) {
              setTrainer(response.data.trainer);
            }
          } catch (error) {
            toast.error("Unable to fetch trainer");
          }
        };

        fetchTrainer()
    },[gymId, trainerId])

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:5000/api/user/logout", {}, { withCredentials: true });
            toast.success("Logout successfully");
            navigate("/");
        } catch (error) {
            console.error(error);
            toast.error("Failed to log out");
        }
    };
    
    return ( 
        <div>
            <nav className="flex flex-row px-20 py-3 items-center justify-between border-b-2 border-neutral-400 shadow-md bg-white">
                {/* Logo */}
                <div className="flex flex-row items-center hover:cursor-pointer hover:opacity-80">
                    <div className="text-2xl font-bold text-black" onClick={()=>navigate('/user/home')}>
                        All-Round<span className="text-gray-500">Fitness</span>
                    </div>
                </div>

                {/* User Profile Dropdown */}
                <div className="relative">
                    <div className="flex flex-row px-3 py-2 items-center rounded-3xl hover:cursor-pointer hover:opacity-80" onClick={() => setIsOpen(!isOpen)}>
                        {user?.profilePic ? (
                            <img src={user.profilePic} alt="Profile" className="w-[60px] h-[60px] rounded-full object-cover" />
                        ) : (
                            <FaUserCircle size={50} className="text-black ml-5" />
                        )}
                    </div>

                    {isOpen && (
                        <div className="absolute bg-black text-white rounded-lg shadow-lg right-0 w-48">
                            <ul>
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex flex-row items-center">
                                    <FaUser size={15} className="mr-2" />
                                    <div>My Profile</div>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex flex-row items-center" onClick={()=>navigate('/user/membership')}>
                                    <FaIdBadge size={15} className="mr-2" />
                                    <div>Memberships</div>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex flex-row items-center" onClick={()=>navigate('/user/ai-trainer')}>
                                    <FaRobot size={15} className="mr-2" />
                                    <div>AI Trainer</div>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex flex-row items-center" onClick={()=>navigate('/user/your-events')}>
                                    <FaRegCalendarAlt size={15} className="mr-2"/>
                                    <div>Your Events</div>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex flex-row items-center">
                                    <FaRegEnvelope size={15} className="mr-2" />
                                    <div>Messages</div>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={handleLogout}>
                                    Logout
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </nav>

            <div className="flex justify-center h-auto p-4">
                <div className="bg-gray-100 shadow-xl rounded-lg p-6 max-w-md w-full">
                <div className="flex flex-row justify-between items-center">
                    <button className="flex items-center text-black hover:text-neutral-800 cursor-pointer" onClick={() => navigate(`/user/gym/${gymId}`,{state:{page:2}})}>
                    <LuArrowLeft size={24} /> Back
                    </button>
                </div>
                {trainer ? (
                    <>
                    <div className="flex flex-col justify-center items-center mt-2">
                        <img src={trainer.profilePicture || "/images/noPhoto.jpg"} alt={trainer.name} className="w-60 h-60 object-cover rounded-lg mx-auto border-4 border-gray-300" />
                        <h2 className="text-2xl font-semibold">{trainer.name}</h2>
                        <p className="text-gray-600">{trainer.role}</p>
                    </div>
                    <div className="mt-4 text-gray-700 flex flex-col justify-center">
                        <p><strong>Email:</strong> {trainer.email}</p>
                        <p><strong>Experience:</strong> {trainer.experience || "-"}</p>
                        <p><strong>Achievements:</strong> {trainer.achievements || "-"}</p>
                    </div>
                    </>
                ) : (
                    <p className="text-gray-500">Loading trainer details...</p>
                )}
                </div>
            </div>

        </div>
     );
}
 
export default SingleTrainer;