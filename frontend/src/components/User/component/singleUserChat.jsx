import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaUserCircle, FaUser, FaIdBadge, FaRobot, FaRegCalendarAlt, FaRegEnvelope, FaPaperPlane, FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useGym } from "../userContext";

const SingleUserChat = () => {
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false)
    const {user} = useGym()
    const {userId} = useParams()
    const [userD,setUserD] = useState([])
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
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

    useEffect(()=>{
        const fetChUserDetails = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/user/fetchSingleUser", {userId}, { withCredentials: true });
                if(response.data.success){
                    setUserD(response.data.user)
                }
            } catch (error) {
                toast.error("Unable to fetch this user")
            }
        }
        fetChUserDetails()
    },[userId])

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;
        try {
            const response = await axios.post("http://localhost:5000/api/chat/sendMessage", {
                sender: user._id,
                receiver: userId,
                message: newMessage
            }, { withCredentials: true });

            if (response.data.success) {
                setMessages([...messages, response.data.message]);
                setNewMessage("");
            }
        } catch (error) {
            toast.error("Message not sent!");
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

            <div className="flex flex-col h-[85vh] bg-gray-100">
                {/* Header */}
                <div className="flex items-center justify-start p-4 bg-white shadow-md">
                    <FaArrowLeft size={25} className="text-gray-600 cursor-pointer" onClick={() => navigate(-1)} />
                    <div className="flex items-center space-x-3 mx-4">
                        {userD.profilePic ? (
                            <img src={userD.profilePic} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                            <FaUserCircle size={40} className="text-gray-600" />
                        )}
                        <span className="text-lg font-semibold ">{userD.username || "User"}</span>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 ">
                    {messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === user._id ? "justify-end" : "justify-start"}`}>
                                <div className={`p-3 rounded-lg text-white ${msg.sender === user._id ? "bg-blue-500" : "bg-gray-500"}`}>
                                    {msg.message}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center mt-5">Start a conversation</p>
                    )}
                </div>

                {/* Input Box */}
                <div className="p-4 bg-white flex items-center border-t">
                    <input
                        type="text"
                        className="flex-1 px-4 py-2 border rounded-lg outline-none"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button
                        className="ml-3 bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600"
                        onClick={handleSendMessage}
                    >
                        <FaPaperPlane size={18} className="mr-1" /> Send
                    </button>
                </div>
            </div>

        </div>
     );
}
 
export default SingleUserChat;