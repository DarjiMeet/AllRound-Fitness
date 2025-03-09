import { FaSearch } from "react-icons/fa";
import { useGym } from "../userContext";
import Events from "./events";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const GymEvents = () => {
    const {gym, user} = useGym()
    const {gymId} = useParams()
    const [search, setSearch] = useState("");  // State for search query
    const [activeEvents, setActiveEvents] = useState([]);
    const [inactiveEvents, setInactiveEvents] = useState([]);
    const [Loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEvent= async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/user/getEvents", {gymId}, { withCredentials: true });
                if (response.data.success) {
                    setActiveEvents(response.data.Active);
                    setInactiveEvents(response.data.Inactive);
                    setLoading(false)
                }
            } catch (err) {
                console.error("Error fetching user details:", err);
                setActiveEvents([]);
                setInactiveEvents([]);
            }finally{
                setLoading(false)
            }
        };
        fetchEvent();
    }, []);
    
    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    // Filtered active events based on search query
    const filteredActiveEvents = activeEvents.filter((event) =>
        event.eventName.toLowerCase().includes(search.toLowerCase())
    );

    // Filtered inactive events based on search query
    const filteredInactiveEvents = inactiveEvents.filter((event) =>
        event.eventName.toLowerCase().includes(search.toLowerCase())
    );

    return ( 
        <div className="mx-[20vw] my-7">
        <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center">
                <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}  // Update search query on input change
                    placeholder="Search Event Name"
                    className="w-[250px] px-2 py-2 rounded-lg text-sm border border-gray-400 focus:outline-none text-black"
                />
                <FaSearch size={18} className="text-black mx-3 cursor-pointer hover:opacity-80" />
            </div>

        </div>

        <div className="container mx-auto px-4 py-6">
                <>
                    {/* Active Events Section */}
                    {Loading?
                    <p className="text-gray-600">...Loading</p>
                    :( 
                    <>
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Active Events</h2>
                        {filteredActiveEvents?.length === 0 ? (
                            <p className="text-gray-600">No active events found.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                                {filteredActiveEvents?.map((event) => (
                                    <Events key={event._id} event={event}/>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Previous Events Section */}
                    <section className="mt-8">
                        <h2 className="text-2xl font-bold mb-4">Previous Events</h2>
                        {filteredInactiveEvents?.length === 0 ? (
                            <p className="text-gray-600">No past events found.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                                {filteredInactiveEvents?.map((event) => (
                                    <Events key={event._id} event={event}/>
                                ))}
                            </div>
                        )}
                    </section>
                    </>  
                    )}
                </>
        </div>
    </div>
     );
}
 
export default GymEvents;