import { FaUserCircle, FaUser, FaIdBadge, FaRobot, FaRegCalendarAlt, FaRegEnvelope, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import Nav from "./component/Navbar";

const socket = io("http://localhost:5000");

const MessagesOwner = () => {
    const navigate = useNavigate();
    const [toggle, setToggle] = useState(false);
    const [search, setSearch] = useState("");
    const [searchOwner, setSearchOwner] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [allOwners, setAllOwners] = useState([]);
    const [recentChat, setRecentChat] = useState([]);
    const [recentOwnerChats, setRecentOwnerChats] = useState([]);
    const [rc, setRc] = useState(true);
    const [newUserMessages, setNewUserMessages] = useState(new Set());
    const [newOwnerMessages, setNewOwnerMessages] = useState(new Set());
    const [getGyms,setGetGyms] = useState([])
    // const [owner, setOwner] = useState([])

    // useEffect(() => {
    //     const fetchUserDetails = async () => {
    //         try {
    //             const response = await axios.post("http://localhost:5000/api/owner/ownerDetails", {}, { withCredentials: true });
    //             if (response.data.success) {
    //                 setOwner(response.data.owner);
    //             }
    //         } catch (err) {
    //             console.error("Error fetching user details:", err);
    //         }
    //     };
    //     fetchUserDetails();
    // }, []);

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
               
                console.error(error);
            }
        };

        fetchGyms();
        
    },[])


    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    useEffect(() => {
        if (search.length > 0) {
            setRc(false);
        } else {
            setRc(true);
        }
    }, [search]);

    const handleSearchOwner = (e) => {
        setSearchOwner(e.target.value);
    };

    useEffect(() => {
        if (searchOwner.length > 0) {
            setRc(false);
        } else {
            setRc(true);
        }
    }, [searchOwner]);

    const fetchAllUsers = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/owner/getAllUsers", {}, {
                withCredentials: true
            });
            if (response.data.success) {
                setAllUsers(response.data.users);
            }
        } catch (error) {
            toast.error("Failed to fetch users");
            console.error(error)
        }
    };

    const fetchAllOwners = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/owner/getAllOwners", {}, {
                withCredentials: true
            });
            if (response.data.success) {
                setAllOwners(response.data.owners);
            }
        } catch (error) {
            toast.error("Failed to fetch owners");
            console.error(error)
        }
    };

    const fetchRecentChats = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/owner/getRecentChat", {  }, {
                withCredentials: true
            });
            if (response.data.success) {
                setRecentChat(response.data.userToOwnerChats); // Set only user-related chats
                setRecentOwnerChats(response.data.ownerToownerChats);
                console.log("User-to-User Chats:", response.data.ownerToownerChats);
                console.log("User-to-Owner Chats:", response.data.userToOwnerChats);
            }
        } catch (error) {
           
            console.error(error)
        }
    };

    useEffect(() => {
        console.log("Recent Chats (User-to-User):", recentChat);
        console.log("Recent Chats (User-to-Owner):", recentOwnerChats);
    }, [recentChat, recentOwnerChats]);

    const fetchNewMessages = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/owner/newMessages", {}, {
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
            toast.error("Failed to fetch new messages");
            console.error(error)
        }
    };

    useEffect(() => {
        fetchAllUsers();
        fetchAllOwners();
        fetchRecentChats();
       
        fetchNewMessages();
    }, []);

    useEffect(() => {
        socket.on("newMessage", () => {
            console.log("New message received! Updating chat...");
            fetchRecentChats();
            fetchNewMessages();
        });

        return () => {
            socket.off("newMessage");
        };
    }, []);

    const filteredUsers = allUsers?.filter((u) =>
        u.UserName.toLowerCase().includes(search.toLowerCase())
    );

    const filteredOwners = allOwners?.filter((owner) =>
        owner.email.toLowerCase().includes(searchOwner.toLowerCase())
    );

    return (
        <div>
           <Nav getGyms={getGyms}/>

           <div className="flex flex-row justify-evenly mt-2">
                <h2 className={`${toggle === false ? 'text-black border-b-2 border-black' : 'text-gray-700'} text-xl px-2 py-2 cursor-pointer`} onClick={() => setToggle(false)}>
                    User
                    {newUserMessages.size > 0 && ( // Render red dot if there are new user messages
                        <span className=" bg-red-500 rounded-full ml-2 px-2 py-1 text-sm text-white">{newUserMessages.size}</span>
                    )}
                </h2>
                <h2 className={`${toggle === true ? 'text-black border-b-2 border-black' : 'text-gray-700'} text-xl px-2 py-2 cursor-pointer`} onClick={() => setToggle(true)}>
                    Owner
                    {newOwnerMessages.size > 0 && ( // Render red dot if there are new owner messages
                        <span className=" bg-red-500 rounded-full ml-2 px-2 py-1 text-sm text-white">{newOwnerMessages.size}</span>
                    )}
                </h2>
               
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
                        <FaSearch size={18} className="text-black mx-3 cursor-pointer hover:opacity-80" />
                    </div>

                    {rc && (
                        <div className="mt-5 mx-[20vw]">
                            <h2 className="text-lg my-3 font-semibold">Recent Chats</h2>
                            {recentChat.length > 0 ? (
                                recentChat.map((user) => (
                                    <div key={user._id} className={`flex items-center space-x-3 p-3 rounded-lg mt-2 cursor-pointer
                                        ${newUserMessages.has(user.chatPartner._id) ? "bg-neutral-200 font-bold hover:bg-neutral-300" : "hover:bg-neutral-200"}`} onClick={() => navigate(`/owner/messages/${user.chatPartner._id}`)}>
                                        {user.chatPartner.profilePic ? (
                                            <img src={user.chatPartner.profilePic} alt="Profile" className="w-12 h-12 rounded-full object-cover cursor-pointer" />
                                        ) : (
                                            <FaUserCircle size={48} className="text-gray-500" />
                                        )}
                                        <div className="text-lg font-medium text-black flex justify-between items-center w-full">
                                            {user.chatPartner.UserName}
                                            {newUserMessages.has(user.chatPartner._id) && (
                                                <div className="mr text-sm text-green-800 "> New</div>
                                            )}
                                        </div>
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
                                    <div key={user._id} className="flex items-center space-x-3 p-3 rounded-lg mt-2 hover:bg-neutral-200 cursor-pointer" onClick={() => navigate(`/owner/messages/${user._id}`)}>
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
                        <FaSearch size={18} className="text-black mx-3 cursor-pointer hover:opacity-80" />
                    </div>

                    {rc && (
                        <div className="mt-5 mx-[20vw]">
                            <h2 className="text-lg my-3 font-semibold">Recent Chats</h2>
                            {recentOwnerChats.length > 0 ? (
                                recentOwnerChats.map((owner) => (
                                    <div key={owner._id} className={`flex items-center space-x-3 p-3 rounded-lg mt-2 cursor-pointer
                                        ${newOwnerMessages.has(owner.chatPartner._id) ? "bg-neutral-200 font-bold hover:bg-neutral-300" : "hover:bg-neutral-200"}`} onClick={() => navigate(`/owner/user/messages/${owner.chatPartner._id}`)}>
                                        {owner.chatPartner.profile ? (
                                            <img src={owner.chatPartner.profile} alt="Profile" className="w-12 h-12 rounded-full object-cover cursor-pointer" />
                                        ) : (
                                            <FaUserCircle size={48} className="text-gray-500" />
                                        )}
                                        <div className="text-lg font-medium text-black flex justify-between items-center w-full">
                                            <div className="flex flex-col">
                                                <div className="text-lg font-medium text-black">{owner.chatPartner.email}</div>
                                                <div className="text-sm font-medium text-neutral-600">{owner.chatPartner.name}</div>
                                            </div>
                                            {newOwnerMessages.has(owner.chatPartner._id) && (
                                                <div className="mr text-sm text-green-800"> New</div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600 mt-2">No Recent Chat Found.</p>
                            )}
                        </div>
                    )}

                    {searchOwner && (
                        <div className="mt-5 mx-[20vw]">
                            {filteredOwners.length > 0 ? (
                                filteredOwners.map((owner) => (
                                    <div key={owner._id} className="flex items-center space-x-3 p-3 rounded-lg mt-2 hover:bg-neutral-200 cursor-pointer" onClick={() => navigate(`/owner/user/messages/${owner._id}`)}>
                                        {owner.profilePic ? (
                                            <img src={owner.profilePic} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                                        ) : (
                                            <FaUserCircle size={48} className="text-gray-500" />
                                        )}
                                        <div className="flex flex-col">
                                            <div className="text-lg font-medium text-black">{owner.email}</div>
                                            <div className="text-sm font-medium text-neutral-600">{owner.name}</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-600 mt-2">No owners found.</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MessagesOwner;