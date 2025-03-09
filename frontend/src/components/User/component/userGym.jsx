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

const stripePromise = loadStripe("pk_test_51QkVoyE6NniuDuLJRVQgXBm4FAlPQ6QlxY2BcqdBPKULVA1TghsESTyEF2arXJVxPYZnZ7XnJXqbwUPJETpM4HDF00brSmqCTH");


const UserGym = () => {
    const navigate = useNavigate()
    const [isOpen, setIsOpen] = useState(false) 
    const location = useLocation()
    const [page, setPage] = useState(location.state?.page || 1)
    const {gymId} = useParams()
 
    const { gym, ownerName, ownerEmail, user } = useGym();

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

    if (!gym) {
        return <div className="text-center text-xl py-10">Loading gym details...</div>;
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

            <nav className="flex flex-row justify-between mx-[20vw] font-semibold text-neutral-500 text-lg mt-2">
                <div className={`hover:text-neutral-700 cursor-pointer ${page===1?"underline text-black":"text-neutral-500"}`} onClick={()=>setPage(1)}>Gym</div>
                <div className={`hover:text-neutral-700 cursor-pointer ${page===2?"underline text-black":"text-neutral-500"}`} onClick={()=>setPage(2)}>Trainers</div>
                <div className={`hover:text-neutral-700 cursor-pointer ${page===3?"underline text-black":"text-neutral-500"}`} onClick={()=>setPage(3)}>Equipments</div>
                <div className={`hover:text-neutral-700 cursor-pointer ${page===4?"underline text-black":"text-neutral-500"}`} onClick={()=>setPage(4)}>Events</div>
                <div className={`hover:text-neutral-700 cursor-pointer ${page===5?"underline text-black":"text-neutral-500"}`} onClick={()=>setPage(5)}>Attendance</div>
           
            </nav>

        {page === 1 && (

            <div className="mx-[20vw]">

            
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
                    <button className="px-4 py-2 rounded-xl border-2 border-green-600 mt-3 text-white bg-green-600 cursor-pointer hover:bg-green-500">Message Owner</button>
                </div>
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

    </div>
    );
};

export default UserGym;
