import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaUserCircle, FaUser, FaIdBadge, FaRobot, FaRegCalendarAlt, FaRegEnvelope, FaPaperPlane, FaArrowLeft, FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useGym } from "../userContext";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const SingleUserChat = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useGym();
    const { userId } = useParams();
    const [userD, setUserD] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [hoveredMessage, setHoveredMessage] = useState(null);
    const chatRef = useRef(null);
    const [openImage, setOpenImage] = useState(false);

    const handleMessage = useCallback(({ sender, senderType, message, receiver, receiverType, _id }) => {
        if (receiver === user?._id) {
            setMessages((prevMessages) => {
                // Prevent duplicate messages
                return prevMessages.some((msg) => msg._id === _id)
                    ? prevMessages
                    : [...prevMessages, { _id, sender, senderType, message, receiver, receiverType }];
            });
        }
    }, [user?._id]);

    const deleteMessage = useCallback(({messageId})=>{
        setMessages((prevMessages) => {
            const updatedMessages = prevMessages.filter(msg => msg._id.toString() !== messageId.toString());
            console.log("Updated messages:", updatedMessages);
            return updatedMessages;
        });
    },[])

    useEffect(() => {
        chatRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

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

    useEffect(() => {
        const fetChUserDetails = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/user/fetchSingleUser", { userId }, { withCredentials: true });
                if (response.data.success) {
                    setUserD(response.data.user);
                }
            } catch (error) {
                toast.error("Unable to fetch this user");
            }
        };
        fetChUserDetails();
    }, [userId]);

    useEffect(() => {
        if (!user || !userId) return;

        socket.emit("join", { userId: user._id, userType: "User", receiverId: userId, receiverType: "User" });

        socket.on("chatHistory", (messages) => {
            const filteredMessages = messages.filter(msg => !msg.hiddenBy?.includes(user._id));
            setMessages(filteredMessages);
        });

        socket.on("receiveMessage", handleMessage);

        socket.on("messageDeleted", deleteMessage);

        return () => {
            socket.off("receiveMessage", handleMessage);
            socket.off("chatHistory");
            socket.off("messageDeleted",deleteMessage);
        };
    }, [user, userId, handleMessage, deleteMessage]);

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        socket.emit("sendMessage", {
            sender: user._id,
            senderType: "User",
            receiver: userId,
            receiverType: "User",
            message: newMessage
        });
        
        socket.once("messageSent", (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            setNewMessage("");
        });
       
    };

    const handleBack = () => {
        socket.emit("leave", { userId: user._id });
        navigate("/user/messages");
    };

    const handleDeleteForMe = async (messageId) => {
        try {
            const response = await axios.post('http://localhost:5000/api/user/deleteForMe', { messageId }, {
                withCredentials: true
            });

            if (response.data.success) setMessages(messages.filter(msg => msg._id !== messageId));
        } catch (error) {
            console.error("Error hiding message", error);
        }
    };

    const handleDeleteForAll = async (messageId) => {
        try {
            // Emit the "delete" event to the server
            socket.emit("delete", { messageId });
            
    
            toast.success("Message deleted for all users");
        } catch (error) {
            console.error("Error deleting message:", error);
            toast.error("Failed to delete message");
        }
    };

    return (
        <div>
            <nav className="flex flex-row px-20 py-3 items-center justify-between border-b-2 border-neutral-400 shadow-md bg-white">
                {/* Logo */}
                <div className="flex flex-row items-center hover:cursor-pointer hover:opacity-80">
                    <div className="text-2xl font-bold text-black" onClick={() => navigate('/user/home')}>
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
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex flex-row items-center" onClick={() => navigate('/user/membership')}>
                                    <FaIdBadge size={15} className="mr-2" />
                                    <div>Memberships</div>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex flex-row items-center" onClick={() => navigate('/user/ai-trainer')}>
                                    <FaRobot size={15} className="mr-2" />
                                    <div>AI Trainer</div>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex flex-row items-center" onClick={() => navigate('/user/your-events')}>
                                    <FaRegCalendarAlt size={15} className="mr-2" />
                                    <div>Your Events</div>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex flex-row items-center" onClick={() => navigate('/user/messages')}>
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
                    <FaArrowLeft size={25} className="text-gray-600 cursor-pointer" onClick={handleBack} />
                    <div className="flex items-center space-x-3 mx-4">
                        {userD.profilePic ? (
                            <img src={userD.profilePic} alt="Profile" className="w-12 h-12 rounded-full object-cover cursor-pointer" onClick={() => setOpenImage(true)} />
                        ) : (
                            <FaUserCircle size={40} className="text-gray-600" />
                        )}
                        <span className="text-lg font-semibold ">{userD.UserName || "User"}</span>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {messages.length > 0 ? (
                        messages.map((msg, index) => {
                            const messageTime = msg.createdAt
                                ? new Date(msg.createdAt).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                })
                                : new Date().toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                });

                            const messageDate = msg.createdAt
                                ? new Date(msg.createdAt).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                })
                                : null;

                            const prevMessage = index > 0 ? messages[index - 1] : null;
                            const prevMessageDate = prevMessage
                                ? new Date(prevMessage.createdAt).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                })
                                : null;

                            return (
                                <div key={msg._id}>
                                    {messageDate !== prevMessageDate && (
                                        <div className="text-center text-gray-500 text-sm my-4">
                                            {messageDate}
                                        </div>
                                    )}
                                    <div
                                        className={`relative flex ${msg.sender === user._id ? "justify-end" : "justify-start"}`}
                                        onMouseEnter={() => setHoveredMessage(msg._id)}
                                        onMouseLeave={() => setHoveredMessage(null)}
                                    >
                                        <div className={`p-3 rounded-lg text-white ${msg.sender === user._id ? "bg-blue-500" : "bg-gray-500"}`} ref={index === messages.length - 1 ? chatRef : null}>
                                            {msg.message}
                                            <div className="text-xs text-gray-300 mt-1 text-right">{messageTime}</div>
                                        </div>
                                        {hoveredMessage === msg._id && (
                                            <button
                                                className="absolute top-1 text-gray-300 hover:text-red-500 cursor-pointer"
                                                onClick={() =>
                                                    msg.sender === user._id ? handleDeleteForAll(msg._id) : handleDeleteForMe(msg._id)
                                                }
                                            >
                                                <FaTrash size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
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

            {openImage && (
                <>
                    <div className="fixed inset-0 bg-black/60 bg-opacity-50 z-40"></div>
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div>
                            <div className="text-right"><button className='text-3xl text-white cursor-pointer' onClick={() => setOpenImage(false)}>X</button></div>
                            <img src={userD.profilePic} alt="Profile" className="w-100 h-100 rounded-lg" />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SingleUserChat;