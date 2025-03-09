import { FaUserCircle, FaUser, FaIdBadge, FaRobot, FaRegCalendarAlt, FaRegEnvelope, FaSearch } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useGym } from "./userContext";
import { useEffect, useState } from "react";

const Messages = () => {
    const navigate = useNavigate()
    const {user} = useGym()
    const [isOpen, setIsOpen] = useState(false)
    const [toggle, setToggle] = useState(false)
    const [search, setSearch] = useState("");
    const [searchOwner, setSearchOwner] = useState("");
    const [allUsers, setAllUsers] = useState([])
    const [recentChat, setRecentChat] = useState([])
    const [rc, setRc] = useState(true)

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

    const handleSearch = (e) => {
        setSearch(e.target.value);       
    };

    useEffect(()=>{
        if(search.length > 0){
            setRc(false)
        }
        else{
            setRc(true)
        }
    },[search])

    const handleSearchOwner = (e) => {
        setSearchOwner(e.target.value);
    };

    useEffect(()=>{
        const fetchAllUsers = async() =>{    
            try {
                const response = await axios.post("http://localhost:5000/api/user/getAllUsers", {},{
                    withCredentials:true
                })
                if(response.data.success){
                    setAllUsers(response.data.users)
                }
            } catch (error) {
                toast.error("Failed to fetch users")
            }

        }
        fetchAllUsers()
    },[])

    useEffect(()=>{
        const fetchAllUsers = async() =>{    
            try {
                const response = await axios.post("http://localhost:5000/api/user/getRecentChat", {},{
                    withCredentials:true
                })
                if(response.data.success){
                   
                    setRecentChat(response.data.users)
                }
            } catch (error) {
                toast.error("Failed to fetch recent chats")
            }

        }
        fetchAllUsers()
    },[])

    const filteredUsers = allUsers?.filter((u) =>
        u.UserName.toLowerCase().includes(search.toLowerCase())
    );
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

            <div className="flex flex-row justify-evenly mt-2">
                    <h2 className={`${toggle === false ? 'text-black border-b-2 border-black': 'text-gray-700'} text-xl px-2 py-2 cursor-pointer`} onClick={()=>setToggle(false)}>User</h2>
                    <h2 className={`${toggle === true ? 'text-black border-b-2 border-black': 'text-gray-700'} text-xl px-2 py-2 cursor-pointer`} onClick={()=>setToggle(true)}>Owner</h2>
            </div>

            {!toggle && (
                <div>
                    <div className="flex flex-row items-center mx-[20vw] mt-10">
                        <input
                            type="text"
                            placeholder="Search User by username"
                            value={search}
                            onChange={handleSearch}
                            className="w-[250px] px-2 py-2 rounded-lg text-sm border border-gray-400 focus:outline-none text-black"
                        />
                        <FaSearch size={18} className="text-black mx-3 cursor-pointer hover:opacity-80"/>

                    </div>

                    {rc && (
                        <div className="mt-5 mx-[20vw]">
                        {recentChat.length > 0 ? (
                            recentChat.map((user) => (
                                <div key={user._id} className="flex items-center space-x-3 p-3 rounded-lg mt-2 hover:bg-neutral-200 cursor-pointer">
                                    {user.profilePic ? (
                                        <img src={user.profilePic} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        <FaUserCircle size={48} className="text-gray-500" />
                                    )}
                                    <div className="text-lg font-medium text-black">{user.UserName}</div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600 mt-2">No Recent Chat Found.</p>
                        )}
                    </div>
                    )}

                    {search && (
                        <div className="mt-5 mx-[20vw]">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <div key={user._id} className="flex items-center space-x-3 p-3 rounded-lg mt-2 hover:bg-neutral-200 cursor-pointer" onClick={()=>navigate(`/user/messages/${user._id}`)}>
                                        {user.profilePic ? (
                                            <img src={user.profilePic} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            <FaUserCircle size={48} className="text-gray-500" />
                                        )}
                                        <div className="text-lg font-medium text-black">{user.UserName}</div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600 mt-2">No users found.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
            {toggle && (
                <div>
                    <div className="flex flex-row items-center mx-[20vw] mt-10">
                        <input
                            type="text"
                            placeholder="Search Owner by email"
                            value={searchOwner}
                            onChange={handleSearchOwner}
                            className="w-[250px] px-2 py-2 rounded-lg text-sm border border-gray-400 focus:outline-none text-black"
                        />
                        <FaSearch size={18} className="text-black mx-3 cursor-pointer hover:opacity-80"/>
                    </div>
                </div>
            )}
        </div>
     );
}
 
export default Messages;