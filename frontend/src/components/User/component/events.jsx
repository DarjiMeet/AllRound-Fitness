
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("pk_test_51QkVoyE6NniuDuLJRVQgXBm4FAlPQ6QlxY2BcqdBPKULVA1TghsESTyEF2arXJVxPYZnZ7XnJXqbwUPJETpM4HDF00brSmqCTH");

const Events = ({ event}) => {

    const {gymId} = useParams()
    const [user,setUser] = useState(null)

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/user/userDetails", {}, { withCredentials: true });
                if (response.data.success) {
                    setUser(response.data.user);
                }
            } catch (err) {
                console.error("Error fetching user details:", err);
            }
        };
        fetchUserDetails();
    }, []);

    const handleJoin = async (e, price) => {
        e.preventDefault();
        const stripe = await stripePromise;
    
        try {
            const response = await axios.post("http://localhost:5000/api/user/payment-event", { gymId, eventId:event._id, price },{
                withCredentials:true
            });

            if (response.data.url) {
                window.location.href = response.data.url;
            }else {
                // ✅ Free Event Handling
                toast.success("Successfully joined the event!");
    
                // 🟢 Update user state with the new event participation
                setUser((prevUser) => ({
                    ...prevUser,
                    EventParticipated: [...prevUser.EventParticipated, event._id], // Add the event ID
                }));
            }
 
        } catch (error) {
            console.error("Stripe payment error:", error);
            toast.error("Payment failed. Please try again.");
        }
    };


  
    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden " >
            <img src={event.displayPhoto || "/images/noPhoto.jpg"} alt={event.eventName} className="w-full h-40 object-cover" />
            <div className="p-4">
                <div className="flex flex-row items-center justify-between">
                    <h3 className="text-lg font-semibold">{event.eventName}</h3>
                </div>

                <p className="text-gray-600 ">{event.description}</p>

                <div className="text-gray-800 mt-2">Location</div>

                <p className="text-gray-600 ">{event.location.address}</p>
                <p className="text-gray-600 ">{event.location.city}, {event.location.state}</p>
                <p className="text-gray-600 ">{event.location.zipCode}</p>

                <p className="text-gray-800 mt-2">Contact: <span className="text-gray-600">{event.contactInfoQuery}</span></p>

                <p className="text-gray-600  mt-2">Participants: {event.totalParticipants}</p>

                <div className={`mt-2 text-sm ${event.userType === 'membersOnly'? 'text-blue-400' : 'text-green-400'} font-semibold`}>{event.userType}</div>

                <p className={`${event.status==='Active'?'text-green-700':'text-red-700'}  mt-1 font-semibold`}>{event.status}</p>

                <div className="flex flex-row justify-between items-center mt-2">
                    <div className="text-gray-600 font-semibold flex flex-col">
                        <div className="text-gray-600 font-semibold">
                            Dates
                        </div>
                        <div className="text-sm text-gray-600">{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</div>
                    </div>

                    <div className="text-gray-600 font-semibold flex flex-col">
                        <div className="text-gray-600 font-semibold">
                            Timing
                        </div>
                        <div className="text-sm text-gray-600">{event.startTime}-{event.endTime}</div>
                    </div>
                </div>

                {!user?.EventParticipated?.includes(event._id)?
                <>
                {event.status === 'Active' && (
                    <div className="flex justify-center mt-2">
                        <button 
                            className={`w-full py-2 bg-green-500 text-white hover:bg-green-700 text-center rounded-2xl cursor-pointer
                            ${event.totalParticipants >= event.MaxUser || new Date(event.registrationEnd) < new Date() ? "hidden" : ""}`}
                            onClick={(e) => {
                                if (event.totalParticipants >= event.MaxUser) return toast.error("Max number of user reached"); // Prevent clicks if max users reached
                        
                                const price = event.userType === "everyOne"
                                    ? (user?.GymMember?.includes(gymId) ? event.priceMember : event.priceNon_member)
                                    : event.userType === "membersOnly"
                                        ? (user?.GymMember?.includes(gymId) ? event.priceMember : null)
                                        : null;
                                
                                if (price !== null) {
                                    handleJoin(e,price); // Call function with price
                                }
                                else {
                                    toast.error("Only for members");
                                }
                            }}
                        >
                            {event.totalParticipants >= event.maxUser ? (
                                    "Max Users Reached"
                                ) : (
                                    `${
                                        event.userType === "everyOne" 
                                            ? user?.GymMember?.includes(gymId) 
                                                ? `Join ₹${event.priceMember}`
                                                : `Join ₹${event.priceNon_member}`
                                            : event.userType === "membersOnly" 
                                                ? (user?.GymMember?.includes(gymId) ? `Join ₹${event.priceMember}` : "Only For Members") 
                                                : ""
                                    }`
                                )}
                        </button>
                    </div>
                )}
                </>
                :<div className="w-full flex flex-row justify-center items-center rounded-2xl bg-blue-700 py-2 mt-2 text-white font-semibold">Joined</div>}
            </div>
            
        </div>
    );
};

export default Events