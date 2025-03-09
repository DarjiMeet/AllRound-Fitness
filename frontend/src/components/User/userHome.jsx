import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaSearch, FaUserCircle, FaUser, FaRegEnvelope, FaIdBadge, FaRegCalendarAlt, FaStar, FaRobot  } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useGym } from "./userContext";

const UserHome = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [option, setOption] = useState("");
    const [location, setLocation] = useState("");
    const [gyms, setGyms] = useState([]);

    const { user } = useGym();

    useEffect(() => {
        const fetchGyms = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/user/getGyms", {}, { withCredentials: true });
                if (response.data.success) {
                    setGyms(response.data.gym);
                }
            } catch (err) {
                console.error("Error fetching gyms:", err);
                toast.error("Something went wrong! Try again later.");
            }
        };

        fetchGyms();
    }, []);

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

    const filteredGyms = gyms.filter((gym) => {
        const gymNameMatch = searchTerm
            ? gym.gymName.toLowerCase().includes(searchTerm.toLowerCase())
            : true;
    
        const locationMatch =
            option && location
                ? option === "City"
                    ? gym.location.city.toLowerCase().includes(location.toLowerCase())
                    : gym.location.state.toLowerCase().includes(location.toLowerCase())
                : true;
    
        return gymNameMatch && locationMatch;
    });

    return (
        <div>
            {/* Navbar */}
            <nav className="flex flex-row px-3 py-3 items-center justify-around border-b-2 border-neutral-400 shadow-md bg-white">
                {/* Logo */}
                <div className="flex flex-row items-center hover:cursor-pointer hover:opacity-80">
                    <div className="text-2xl font-bold text-black">
                        All-Round<span className="text-gray-500">Fitness</span>
                    </div>
                </div>

                {/* Search & Filter Section */}
                <div className="flex flex-row">
                    <div className="flex flex-row items-center mr-3">
                        <input
                            type="text"
                            placeholder="Search by gym name"
                            className="w-[300px] px-4 py-2 mr-2 rounded-3xl border border-gray-400 focus:outline-none text-black"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FaSearch size={20} className="text-black cursor-pointer hover:opacity-80" />
                    </div>

                    <div className="relative flex flex-row items-center ml-5">
                        <select
                            className="px-4 py-2 border border-gray-400 rounded-3xl focus:outline-none text-black mr-2"
                            value={option}
                            onChange={(e) => setOption(e.target.value)}
                        >
                            <option value="">Select option</option>
                            <option value="State">State</option>
                            <option value="City">City</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Enter state or city"
                            className="w-[200px] px-4 py-2 rounded-3xl border border-gray-400 focus:outline-none text-black"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
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
                                    <FaRobot  size={15} className="mr-2" />
                                    <div>AI Trainer</div>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex flex-row items-center" onClick={()=>navigate('/user/your-events')}>
                                    <FaRegCalendarAlt size={15} className="mr-2" />
                                    <div> Your Events</div>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex flex-row items-center" onClick={()=>navigate('/user/messages')}>
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

            {/* Gym Display Section */}
            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredGyms.map((gym) => (
                        <div key={gym._id} className="bg-white shadow-md rounded-lg overflow-hidden p-4 hover:bg-neutral-200 cursor-pointer" onClick={()=>navigate(`/user/gym/${gym._id}`)}>
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
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserHome;
