import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useGym } from "./userContext";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaUser, FaIdBadge, FaRegCalendarAlt, FaRegEnvelope, FaSearch } from "react-icons/fa";
import Events from "./component/events";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const UserEvents = () => {
    const [myEvents, setMyEvents] = useState([]);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useGym();
    const [search, setSearch] = useState("");  
    const [startDate, setStartDate] = useState("");  
    const [newUserMessages, setNewUserMessages] = useState(new Set());
    const [newOwnerMessages, setNewOwnerMessages] = useState(new Set());

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleDateChange = (e) => {
        setStartDate(e.target.value);
    };

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
        const fetchMyEvents = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/user/myEvents", {}, { withCredentials: true });
                if (response.data.success) {
                    setMyEvents(response.data.events);
                } else {
                    toast.error("Failed to fetch events");
                }
            } catch (error) {
                console.error("Error fetching events:", error);
                toast.error("Something went wrong!");
            }
        };

        fetchMyEvents();
    }, []);

    const fetchNewMessages = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/user/newMessages", {}, {
                withCredentials: true
            });
            if (response.data.success) {
                const users = response.data.users.filter(user => user.senderType === "User");
                const owners = response.data.users.filter(user => user.senderType === "Owner");
    
                // Update states with new message IDs
                setNewUserMessages(new Set(users.map(user => user._id)));
                setNewOwnerMessages(new Set(owners.map(owner => owner._id)));
            }
        } catch (error) {
            console.log(error)
            toast.error("Failed to fetch new messages");
        }
    };

    useEffect(() => {
        fetchNewMessages();
    }, []);

    useEffect(() => {
        socket.on("newMessage", () => {
            console.log("New message received! Updating chat...");
            fetchNewMessages();
        });

        return () => {
            socket.off("newMessage");
        };
    }, []);


    // Filtered events based on event name and/or start date
    const filteredEvents = myEvents.filter((event) => {
        const nameMatch = event.eventName.toLowerCase().includes(search.toLowerCase());
        const dateMatch = startDate ? new Date(event.startDate).toISOString().split("T")[0] === startDate : true;
        return nameMatch && dateMatch;
    });

    return ( 
        <div>
            <nav className="flex flex-row px-20 py-3 items-center justify-between border-b-2 border-neutral-400 shadow-md bg-white">
                <div className="flex flex-row items-center hover:cursor-pointer hover:opacity-80">
                    <div className="text-2xl font-bold text-black" onClick={() => navigate('/user/home')}>
                        All-Round<span className="text-gray-500">Fitness</span>
                    </div>
                </div>

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
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex flex-row items-center" onClick={()=>navigate('/user/ai-trainer')}>
                                    <FaRegCalendarAlt size={15} className="mr-2" />
                                    <div>AI Trainer</div>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex flex-row items-center" onClick={() => navigate('/user/your-events')}>
                                    <FaRegCalendarAlt size={15} className="mr-2" />
                                    <div> Your Events</div>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex flex-row items-center" onClick={() => navigate('/user/messages')}>
                                    <FaRegEnvelope size={15} className="mr-2" />
                                    <div>Messages</div>
                                    {(newUserMessages.size > 0 || newOwnerMessages.size > 0) && ( // Render red dot if there are new messages
                                        <span className=" bg-red-500 rounded-full ml-2 px-[4px] p text-sm text-white">{newUserMessages.size + newOwnerMessages.size}</span>
                                    )}
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={handleLogout}>
                                    Logout
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </nav>

            <div className="mx-[20vw] my-7">
                <h1 className="text-2xl font-semibold">Events Participated</h1>
                <div className="flex flex-row items-center mt-3 ">
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder="Search Event Name"
                        className="w-[250px] px-2 py-2 rounded-lg text-sm border border-gray-400 focus:outline-none text-black"
                    />
                     <FaSearch size={18} className="text-black cursor-pointer hover:opacity-80 ml-2" />

                    <label htmlFor="startDate" className="ml-5">
                        Start Date:
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={handleDateChange}
                        className="px-2 py-2 rounded-lg text-sm border border-gray-400 focus:outline-none text-black ml-1"
                        placeholder="Start Date"
                    />
                   
                </div>

                <div className="container mx-auto px-4 py-6">
                    <section>
                        {filteredEvents.length === 0 ? (
                            <p className="text-gray-600 flex items-center">No events found.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                                {filteredEvents.map((event) => (
                                    <Events key={event._id} event={event} />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default UserEvents;
