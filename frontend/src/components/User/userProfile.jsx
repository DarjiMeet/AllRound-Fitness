import { FaPen, FaUserCircle } from "react-icons/fa";
import { useGym } from "./userContext";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
    const { user } = useGym();
    const navigate = useNavigate()

    return (
        <div>
            <nav className="flex flex-row px-4 py-6 items-center border-b-2 border-neutral-400 shadow-md bg-white">
                <div className="flex flex-row items-center hover:cursor-pointer hover:opacity-80">
                    <div className="text-2xl font-bold text-black" onClick={()=>navigate('/user/home')}>
                        All-Round<span className="text-gray-500">Fitness</span>
                    </div>
                </div>
            </nav>

            <div className="mx-[20vw] shadow-lg p-6 bg-white rounded-lg flex flex-col md:flex-row items-center gap-6">
                <div className="w-60 h-60 rounded-lg overflow-hidden shadow-lg flex items-center justify-center bg-gray-200">
                    {user?.profilePic ? (
                        <img
                            src={user.profilePic}
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
                        <h2 className="text-2xl font-bold">{user?.UserName}</h2>
                        <p className="text-gray-600">{user?.Fullname}</p>
                        <p className="text-gray-600"><span className="font-bold">Email:</span> {user?.Email}</p>
                        <p className="text-gray-600"><span className="font-bold">Mobile:</span> {user?.Mobile}</p>
                        </div>
                        <div className="hover:opacity-80 cursor-pointer flex flex-row items-center mr-3 " > 
                            <FaPen size={12} className="text-blue-600"/> 
                            <span className="text-blue-600 text-md">Edit</span>
                        </div>
                    </div>

                    {/* Buttons Section */}
                    <div className="mt-4 flex flex-col gap-1 w-full">
                        <button className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 cursor-pointer" onClick={()=>navigate('/user/membership')}>
                            Your Memberships
                        </button>
                        <button className="w-full py-2 px-4 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 cursor-pointer" onClick={()=>navigate('/user/your-events')}>
                            Participated Events
                        </button>
                    </div>
                </div>

                {/* Right Section - Profile Picture */}
            
            </div>
        </div>
    );
};

export default UserProfile;
