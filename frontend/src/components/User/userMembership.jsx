import { FaUserCircle, FaUser, FaIdBadge, FaRegCalendarAlt, FaRegEnvelope, FaRobot } from "react-icons/fa";
import { useGym } from "./userContext";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const UserMembership = () => {
    const navigate = useNavigate()
    const {membership, user} = useGym()
    const[isOpen, setIsOpen] = useState(false)

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
                                    <FaRegCalendarAlt size={15} className="mr-2" />
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

            <div className="mt-10 px-4">
                {membership && membership.length > 0 ? (
                    <>
                        {/* Header */}
                        <div className="grid grid-cols-6 gap-6 text-center font-semibold text-xl py-2 border-b border-gray-300 px-4">
                            <div>Gym Name</div>
                            <div>Plan Name</div>
                            <div>Amount Paid</div>
                            <div>Duration</div>
                            <div>Location</div>
                            <div>Status</div>
                        </div>

                        {/* Membership Cards */}
                        <div className="space-y-4 mt-4">
                            {membership.map((mp, index) => (
                                <div 
                                    key={index} 
                                    className="grid grid-cols-6 gap-6 text-center items-center bg-white shadow-md rounded-lg p-4 border border-gray-200 cursor-pointer hover:bg-neutral-200"
                                    onClick={()=>navigate(`/user/gym/${mp._id}`)}
                                >
                                    <div className="font-medium text-lg">{mp.name}</div>
                                    <div className="text-blue-600 font-semibold">{mp.planName}</div>
                                    <div className="text-gray-700 font-medium">₹{mp.amountPaid}</div>
                                    <div className="text-gray-600">
                                        {new Date(mp.startDate).toLocaleDateString("en-GB")} - {new Date(mp.endDate).toLocaleDateString("en-GB")}
                                    </div>
                                    <div className="text-gray-500">{mp.location.city}, {mp.location.state}</div>
                                    <div className={`${mp.membershipStatus === "Active" ? "text-green-500" : "text-red-500"} font-semibold`}>
                                        {mp.membershipStatus}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex justify-center items-center mt-10 text-gray-500 text-lg">
                        No active memberships
                    </div>
                )}
            </div>

        </div>
     );
}
 
export default UserMembership;