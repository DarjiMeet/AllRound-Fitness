import { useEffect, useState } from "react";
import axios from "axios";
import EventCard from "./EventCard";
import { FaSearch } from "react-icons/fa";
import AddEventForm from "./EventForm";

const EventsList = ({ gymId }) => {
    const [activeEvents, setActiveEvents] = useState([]);
    const [inactiveEvents, setInactiveEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openEvent, setOpenEvent] = useState(false);
    const [search, setSearch] = useState("");  // State for search query

    useEffect(() => {
        setLoading(true);
        setError(null);
        const fetchEvents = async () => {
            try {
                const response = await axios.post(
                    "http://localhost:5000/api/owner/getEvents",
                    { gymId },
                    { withCredentials: true }
                );
                setActiveEvents(response.data.Active);
                setInactiveEvents(response.data.Inactive);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch events");
                setActiveEvents([]);
                setInactiveEvents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [gymId]);

    // Handle search input change
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
        <>
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

                    <button
                        className="text-neutral-800 mt-2 mx-2 px-3 py-1 bg-neutral-300 rounded-lg hover:bg-neutral-200 cursor-pointer"
                        onClick={() => setOpenEvent(!openEvent)}
                    >
                        Create Event
                    </button>
                </div>

                <div className="container mx-auto px-4 py-6">
                    {loading && <p className="text-center text-lg font-semibold">Loading...</p>}
                    {error && <p className="text-center text-gray-600">{error}</p>}

                    {!loading && !error && (
                        <>
                            {/* Active Events Section */}
                            <section>
                                <h2 className="text-2xl font-bold mb-4">Active Events</h2>
                                {filteredActiveEvents?.length === 0 ? (
                                    <p className="text-gray-600">No active events found.</p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                                        {filteredActiveEvents?.map((event) => (
                                            <EventCard key={event._id} event={event} />
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
                                            <EventCard key={event._id} event={event} />
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>

            {openEvent && (
                <AddEventForm open={openEvent} setOpen={setOpenEvent} gymId={gymId} setActiveEvents={setActiveEvents} />
            )}
        </>
    );
};

export default EventsList;
