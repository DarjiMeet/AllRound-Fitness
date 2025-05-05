import { useState, useRef, useEffect } from "react";
import { FaUserCircle, FaUser, FaIdBadge, FaRegCalendarAlt, FaRegEnvelope,FaRobot  } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useGym } from "./userContext";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const AIchat = () => {
    const [message, setMessage] = useState("");
    const [chats, setChats] = useState([]); // Stores all messages
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false) 
    const {user} = useGym()
    const [newUserMessages, setNewUserMessages] = useState(new Set());
    const [newOwnerMessages, setNewOwnerMessages] = useState(new Set());

    useEffect(() => {
        const fetchChatHistory = async () => {
            try {
                const res = await axios.post(`http://localhost:5000/api/user/getChat`,{},{
                    withCredentials:true
                });
                if (res.data.length > 0) {
                    setChats(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch chat history:", error);
            }
        };
    
        if (user?._id) {
            fetchChatHistory();
        }
    }, [user]);

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


    // // List of fitness-related keywords
    // const fitnessKeywords = [
    //     "workout", "exercise", "diet", "nutrition", "fitness", "calories", "protein", "weight loss",
    //     "muscle gain", "gym", "cardio", "strength training", "meal plan", "fat loss", "bodybuilding",
    //     "running", "HIIT", "yoga", "macros", "recovery", "stretching", "hydration", "supplements",
    //     "fatigue", "metabolism", "caloric intake", "keto", "vegan diet", "bulking", "cutting","deadlift"
    // ];

    const SYSTEM_PROMPT = (
        "You are a professional fitness trainer and bodybuilding expert. ",
        "You provide advice strictly on fitness, workouts, nutrition, weight loss, muscle building, and health. ",
        "If a question is unrelated to fitness, politely inform the user that you can only answer fitness-related queries, and do not ans that questions which are not related to fitness."
    )

    // Function to check if input is fitness-related
    // const isFitnessRelated = (text) => {
    //     return fitnessKeywords.some(keyword => text.toLowerCase().includes(keyword));
    // };

    // Scroll to the bottom of chat when new message is added
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chats]);

    const saveChatHistory = async (newChats) => {
        try {
           await axios.post("http://localhost:5000/api/user/save-chat", {
                messages: newChats,
            },{
                withCredentials:true
            });
        } catch (error) {
            console.error("Failed to save chat history:", error);
        }
    };

    const sendMessage = async () => {
        // if (!isFitnessRelated(message)) {
        //     setChats([...chats, { sender: "AI", text: "Please ask only fitness-related questions!" }]);
        //     return;
        // }
    
        setLoading(true);
        const newChats = [...chats, { sender: "User", text: message }, { sender: "AI", text: "Thinking..." }];
        setChats(newChats);
    
        try {
            const res = await fetch("http://127.0.0.1:11434/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "llama3.2",
                    messages: [
                        {"role": "system", "content": SYSTEM_PROMPT}, 
                        { role: "user", content: message }
                    ],
                }),
            });
    
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let fullResponse = "";
    
            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    fullResponse += decoder.decode(value, { stream: true });
                }
            }
    
            console.log("Full Response:", fullResponse);
    
            // Parsing the last complete JSON object
            const responseArray = fullResponse.trim().split("\n").map(JSON.parse);
            const finalMessage = responseArray.map((res) => res.message?.content).join("");
    
            console.log("Final Message:", finalMessage);
    
            // Format the response to be more readable
            const formattedResponse = finalMessage
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Convert Markdown bold to HTML bold
                .replace(/\n/g, "<br />") // Convert new lines to HTML breaks
                .replace(/\d+\.\s/g, "<li class='ml-4'>" ) // Add indentation for lists
                .replace(/(^|\n)([A-Za-z0-9\s]+):/g, "$1**$2:**")
                .replace(/(Here are some tips:|Here are additional tips:)/g, "<br /><strong>$1</strong>"); // Bold important sections
    

            const updatedChats = [
                ...newChats.slice(0, -1), // Remove "Thinking..."
                { sender: "AI", text: formattedResponse },
            ];

            setChats(updatedChats);
            await saveChatHistory(updatedChats)
            console.log(chats)
        } catch (error) {
            console.error("Error:", error);
            setChats((prevChats) => [
                ...prevChats.slice(0, -1), // Remove "Thinking..."
                { sender: "AI", text: "Error fetching response. Please try again." },
            ]);
        } finally {
            setLoading(false);
            setMessage(""); // Clear input field
        }
    };

    const deleteChatHistory = async () => {
        try {
            const response = await axios.delete("http://localhost:5000/api/user/deleteChat", {
                withCredentials: true
            });
    
            if (response.data.success) {
                setChats([]); // Clear chat history on frontend
            }
        } catch (error) {
            console.error("Failed to delete chat history:", error);
        }
    };

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
            console.error(error)
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
                                    <FaRobot  size={15} className="mr-2" />
                                    <div>AI Trainer</div>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex flex-row items-center" onClick={()=>navigate('/user/your-events')}>
                                    <FaRegCalendarAlt size={15} className="mr-2"/>
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
            
            <div className="flex flex-col h-[85vh]  mx-auto p-4 w-full">
                

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 p-2 border rounded shadow-md bg-gray-100 ">
                    {chats?.map((chat, index) => (
                        <div
                        key={index}
                        className={`p-3 rounded-lg w-[60%] whitespace-pre-line leading-relaxed ${
                            chat.sender === "User" ? "bg-blue-500 text-white self-end ml-auto" : "bg-white text-black self-start"
                        }`}
                    >
                            <strong>{chat.sender}:</strong>
                            {chat.sender === "AI" ? (
                                <div dangerouslySetInnerHTML={{ __html: chat.text }} />
                            ) : (
                                chat.text
                            )}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Field - Stays at the Bottom */}
                <div className="flex flex-row  justify-between items-center">
                
                    <div className="flex items-center border rounded shadow-md p-2 mt-3 w-[90vw]">
                        <input
                            type="text"
                            className="flex-grow p-2 outline-none"
                            placeholder="Ask AI about workouts, diet, supplements..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button
                            className={`ml-2 px-4 py-2 text-white rounded ${loading ? "bg-gray-500" : "bg-blue-600"}`}
                            onClick={sendMessage}
                            disabled={loading}
                        >
                            Send
                        </button>
                    </div>

                    <div>
                    <button className="bg-red-700 text-white px-2 py-4 mt-3 rounded-lg cursor-pointer hover:bg-red-600" onClick={deleteChatHistory}>Delete Chat</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIchat;
