import axios from "axios";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

const EventCard = ({ event }) => {

    const navigate = useNavigate()
    const {gymId} = useParams()
    const handleDeleteEvent = async (eventId) => {
        try {
    
            const response = await axios.post(`http://localhost:5000/api/owner/deleteEvent`,{gymId,eventId},{
                withCredentials:true
            });
    
            if (response.data.success === true) {
                toast.success("Event deleted successfully!")
                
                // Optionally, refresh the event list
                window.location.reload(); // or use state to update UI
            }
        } catch (error) {
            console.error('Error:', error.message);
            const backendMessage = error.response?.data?.message
            toast.error(backendMessage)
        }
    };
    return (
        <div className="bg-white shadow-lg rounded-lg overflow-hidden hover:cursor-pointer hover:opacity-80" onClick={()=>navigate(`/owner/gym/${gymId}/event/${event._id}`)}>
            <img src={event.displayPhoto || "/images/noPhoto.jpg"} alt={event.eventName} className="w-full h-40 object-cover" />
            <div className="p-4">
                <div className="flex flex-row items-center justify-between">
                    <h3 className="text-lg font-semibold">{event.eventName}</h3>
                    <FaTrash size={15} className="text-red-500 cursor-pointer hover:text-red-700" onClick={()=>handleDeleteEvent(event._id)}/>
                </div>

                <p className="text-gray-600 truncate">{event.description}</p>

                <div className={`mt-2 text-sm ${event.userType === 'membersOnly'? 'text-blue-400' : 'text-green-400'} font-semibold`}>{event.userType}</div>

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
            </div>
            
        </div>
    );
};

export default EventCard