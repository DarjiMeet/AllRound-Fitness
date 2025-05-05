import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaIdBadge, FaRegCalendarAlt, FaRegEnvelope, FaRobot, FaTrash, FaUser, FaUserCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import { useGym } from "../userContext";
import UserTrainer from "./userTrianer";
import UserEquip from "./userEquipment";
import GymEvents from "./gymEvents";
import Attendance from "./attendance";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const stripePromise = loadStripe("pk_test_51QkVoyE6NniuDuLJRVQgXBm4FAlPQ6QlxY2BcqdBPKULVA1TghsESTyEF2arXJVxPYZnZ7XnJXqbwUPJETpM4HDF00brSmqCTH");


const UserGym = () => {
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false) 
    const location = useLocation()
    const [page, setPage] = useState(location.state?.page || 1)
    const {gymId} = useParams()
    const [newUserMessages, setNewUserMessages] = useState(new Set());
    const [newOwnerMessages, setNewOwnerMessages] = useState(new Set());
    const [reviews,setReviews] = useState([])
    const [avgStar, setAvgStar] = useState(0)
    const [error, setError] = useState(null);
    const [Addreview, setAddReview] = useState(false)
    const [comment, setComment] = useState('')
    const [star, setStar] = useState(null)
 
    const { gym, ownerName, ownerEmail, user, ownerId } = useGym();

    useEffect(()=>{
        if(location.state?.page) setPage(location.state?.page)  
    },[location.state])

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

    const handleCheckout = async (plan) => {
        try {
            const stripe = await stripePromise

            const response = await axios.post("http://localhost:5000/api/user/checkout", 
                {
                    planId: plan._id, 
                    planName: plan.planName, 
                    priceInINR : plan.price,
                    duration:plan.duration,
                    gymId
                },{
                    withCredentials:true
                });

                if (response.data.url) {
                    window.location.href = response.data.url;
                }
        } catch (error) {
            console.error('Error:', error.message);
            const backendMessage = error.response?.data?.message
            toast.error(backendMessage)
        }
    }

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
            toast.error("Failed to fetch new messages");
        }
    };

    useEffect(()=>{

        const fetchGyms = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/user/getReview", {gymId}, {
                    withCredentials: true,
                });

                if (response.data.success) {
                    setReviews(response.data.reviews)
                    setAvgStar(response.data.averageRating)
                }
            } catch (error) {
                setError(error.response?.data?.message || "Failed to fetch events");
                console.error(error);
            }
        };
      
        fetchGyms();
   
    },[gymId])

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


    if (!gym) {
        return <div className="text-center text-xl py-10">Loading gym details...</div>;
    }

    const onReview = async () => {
   
        try {
           const response = await axios.post("http://localhost:5000/api/user/addReview", {gymId,userName: user.UserName,star,comment}, { withCredentials: true });
            
           if(response.data.success){
                setReviews(...star,response.data.review)
                toast.success('Review added successfully')
           }
        } catch (error) {
            console.error(error);
            
        }
    }
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

            <nav className="flex flex-row justify-between mx-[20vw] font-semibold text-neutral-500 text-lg mt-2">
                <div className={`hover:text-neutral-700 cursor-pointer ${page===1?"underline text-black":"text-neutral-500"}`} onClick={()=>setPage(1)}>Gym</div>
                <div className={`hover:text-neutral-700 cursor-pointer ${page===2?"underline text-black":"text-neutral-500"}`} onClick={()=>setPage(2)}>Trainers</div>
                <div className={`hover:text-neutral-700 cursor-pointer ${page===3?"underline text-black":"text-neutral-500"}`} onClick={()=>setPage(3)}>Equipments</div>
                <div className={`hover:text-neutral-700 cursor-pointer ${page===4?"underline text-black":"text-neutral-500"}`} onClick={()=>setPage(4)}>Events</div>
                <div className={`hover:text-neutral-700 cursor-pointer ${page===5?"underline text-black":"text-neutral-500"}`} onClick={()=>setPage(5)}>Attendance</div>
           
            </nav>

        {page === 1 && (

            <div className="mx-[20vw] mb-8">

            
                {/* Gym Profile Image */}
                <div className="flex justify-center mb-5 mt-5">
                    <img src={gym.profileImage || '/images/noPhoto.jpg'} alt={gym.gymName} className="w-full h-[60vh]  object-cover rounded-xl shadow-md" />
                </div>

                <h1 className="text-3xl font-bold mb-5">{gym.gymName}</h1>
                <p className="text-gray-700 mt-3">{gym.description}</p>

                {/* Address, State, City */}
                <h2 className="text-xl font-semibold mb-2 mt-5">Address</h2>
                <p className=" text-lg text-neutral-700">{gym.location.address}</p>
                <p className=" text-lg text-neutral-700"> {gym.location.city}, {gym.location.state}</p>
                <p className=" text-lg text-neutral-700"> {gym.location.zipCode}</p>

                <div className="mt-6">
                    <h2 className="text-black font-semibold text-lg">Gym Timings</h2>
                    {gym?.gymTimings?.length > 0 ? (
                            <div className="mt-2">
                                {gym?.gymTimings.map((timings,index)=>(
                                    <div className="grid grid-cols-3 items-center max-w-[50vw] mt-1 " key={index}>
                                        <div className=" text-neutral-700">
                                            {timings.days.length === 7 ? "Everyday" : timings.days.length === 1 ? timings.days[0] : timings.days[0] + "-" + timings.days[timings.days.length-1]}
                                        </div>
                                        <div className=" text-neutral-500">{timings.startTime} - {timings.endTime}</div>
                                        
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-neutral-500 mt-2">No gym timings available.</p>
                        )}

                </div>

                {/* Amenities */}
                <div className="mt-5">
                    <h2 className="text-xl font-semibold mb-2">Amenities</h2>
                    <ul className="list-disc pl-5">
                        {gym.aminities.map((amenity, index) => (
                            <li key={index}>{amenity}</li>
                        ))}
                    </ul>
                </div>

                {/* Activities */}
                <div className="mt-5">
                    <h2 className="text-xl font-semibold mb-2">Activities</h2>
                    <ul className="list-disc pl-5">
                        {gym.activities.map((activity, index) => (
                            <li key={index}>{activity}</li>
                        ))}
                    </ul>
                </div>

                <div className="mt-6">
                    <h2 className="text-2xl font-bold text-gray-800">Membership Plans</h2>
                    <div className="overflow-x-auto mt-3">
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="border border-gray-300 px-4 py-2 text-left">Plan Name</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Price (₹)</th>
                                    <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {gym?.membershipPlans?.length > 0 ? (
                                    gym.membershipPlans.map((plan) => {

                                    // Find if the user has an active membership for this plan
                                    const userMembership = gym.members?.find(
                                        (member) =>
                                        member.memberId.toString() === user._id.toString() &&
                                        member.planName.trim().toLowerCase() === plan.planName.trim().toLowerCase() &&
                                        member.membershipStatus === "Active"
                                    );

                                    return (
                                        <tr key={plan._id} className="border border-gray-300">
                                        <td className="border border-gray-300 px-4 py-2">{plan.planName}</td>
                                        <td className="border border-gray-300 px-4 py-2">₹{plan.price}</td>
                                        <td className="border border-gray-300 px-4 py-2">{plan.duration}</td>
                                        <td className="px-2 py-2">
                                            {userMembership ? (
                                            <span className="px-4 py-1 rounded-xl border-2 border-green-600 mt-3 text-white bg-green-600">
                                                Active
                                            </span>
                                            ) : (
                                            <button
                                                className="px-4 py-2 rounded-xl border-2 border-blue-600 mt-3 text-white bg-blue-600 cursor-pointer hover:bg-blue-500"
                                                onClick={() => handleCheckout(plan)}
                                            >
                                                Buy
                                            </button>
                                            )}
                                        </td>
                                        </tr>
                                    );
                                    })
                                ) : (
                                    <tr>
                                    <td colSpan="4" className="text-center py-4">
                                        No membership plans available.
                                    </td>
                                    </tr>
                                )}
                            </tbody>

                        </table>
                    </div>
                </div>

                {/* Gym Photos */}
                <div className="mt-5">
                    <h2 className="text-xl font-semibold mb-2">Gallery</h2>
                    <div className="grid grid-cols-3 gap-5">
                        {gym.photos.map((photo, index) => (
                            <div className="flex flex-col items-center" key={index}>
                                <img key={index} src={photo.photo} alt={`Gym Photo ${index + 1}`} className="w-full h-40 object-cover rounded-lg" />
                                <div>{photo.name}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Details */}
                <div className="mt-5 p-4 border rounded-lg shadow-md mb-5">
                    <h2 className="text-xl font-semibold">Contact Details</h2>
                    <p><strong>Gym Email:</strong> {gym.gymEmail}</p>
                    <p><strong>Owner:</strong> {ownerName}</p>
                    <p><strong>Owner Contact:</strong> {ownerEmail}</p>
                    <button className="px-4 py-2 rounded-xl border-2 border-green-600 mt-3 text-white bg-green-600 cursor-pointer hover:bg-green-500" onClick={()=>navigate(`/user/owner/messages/${ownerId}`)}>Message Owner</button>
                </div>

                <div className="flex flex-row justify-between items-center">

                    <div className="text-lg font-semibold mt-8 flex flex-row justify-between items-center">
                            <h2>Reviews <span className="text-sm text-neutral-700">⭐{avgStar}</span></h2>
                    </div>

                    <button
                        className="text-neutral-800 mt-2 mx-2 px-3 py-1 bg-neutral-300 rounded-lg hover:bg-neutral-200 cursor-pointer"
                        onClick={() => setAddReview(true)}
                    >
                        Add Review
                    </button>
                </div>
                    
                    {/* {error && <p className="text-center text-gray-600 mt-2">{error}</p>} */}

                    {reviews.length > 0 ? (
                        <div className="mt-4">
                            <div className="space-y-4">
                            {reviews.map((review, index) => (
                                <div key={index} className="border p-4 rounded-lg shadow-md">
                                <div className="flex items-center space-x-2 mb-2">
                                    <p className="font-semibold">{review.userName}</p>
                                </div>
                                <p className="text-gray-700">{review.comment}</p>
                                <div className="flex items-center mt-2">
                                    <span className="text-yellow-500">⭐ {review.star}</span>
                                </div>
                                </div>
                            ))}
                            </div>
                        </div>
                        ) : (
                            <p className="text-neutral-500 mt-2 text-center">No reviews yet.</p>
                    )}
            </div>
        )}

        {page === 2 && (
            <UserTrainer/>
        )}

        {page === 3 && (
            <UserEquip/>
        )}

        {page === 4 && (
            <GymEvents/>
        )}
        {page === 5 && (
            <Attendance/>
        )}

        {Addreview && (
        <form onSubmit={onReview}>
           <div className="fixed inset-0 bg-black/60 bg-opacity-50 z-40"></div>
         
           <div className="fixed inset-0 flex items-center justify-center z-50">
             <div className="bg-white shadow-lg rounded-2xl p-6 w-[30vw] border border-gray-200">
               <div className="flex flex-row justify-between items-center">
                 <h2 className="text-2xl font-medium text-black">Add Review</h2>
                 <button
                   onClick={() => setAddReview(!Addreview)}
                   className="text-gray-400 hover:text-gray-600 focus:outline-none hover:cursor-pointer"
                 >
                   ✕
                 </button>
               </div>
         
               <hr className="mt-2 mb-4" />
         
               {/* Dropdown for Rating */}
               <div className="mb-4">
                 <div className="block text-sm font-medium text-gray-700">UserName: </div>
                 <div className="text-xl font-semibold">{user.UserName}</div>
               </div>
         
               <div className="mb-4">
                 <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                   Rating
                 </label>
                 <select
                   id="rating"
                   name="rating"
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:border-blue-300"
                   value={star}
                   onChange={(e)=>setStar(e.target.value)}
                 >
                   {[0,1, 2, 3, 4, 5].map((num) => (
                     <option key={num} value={num}>
                       {num}
                     </option>
                   ))}
                 </select>
               </div>
         
               {/* Comment Textarea */}
               <div className="mb-4">
                 <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                   Comment
                 </label>
                 <textarea
                   id="comment"
                   name="comment"
                   value={comment}
                   onChange={(e)=>setComment(e.target.value)}
                   rows="4"
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:outline-none focus:ring focus:border-blue-300 resize-none"
                   placeholder="Write your review here..."
                 ></textarea>
               </div>
         
               {/* Submit Button */}
               <div className="flex justify-end">
                 <button
                   type="submit"
                   className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                 >
                   Submit Review
                 </button>
               </div>
             </div>
           </div>
        </form>
         
        )}

    </div>
    );
};

export default UserGym;
