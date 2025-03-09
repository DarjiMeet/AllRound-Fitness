import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "./component/Navbar";
import { LuArrowLeft } from "react-icons/lu";
import { FaPen, FaSearch, FaTrash, FaUserCircle } from "react-icons/fa";
import DatePicker from "react-datepicker";

const GymEvent = () => {
    const navigate = useNavigate()
    const { gymId, eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [gyms, setGyms] = useState([]);
    const [page, setPage] = useState(1);
    const [eventPage, setEventPage] = useState(1)
    const [openEdit, setOpenEdit] = useState(false)
    const [formData, setFormData] = useState({
        name: "", description: "", userType: "",
        address: "", city: "", state: "", zipCode: "",
        startDate: null, startTime: "", endDate: null, endTime: "",
        contactForQuery: "", organizedBy: "", registrationEnds: null, MaxUser: "",
        priceMember: 0, priceNon_member: 0, displayPhoto: ""
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);
    const [addPart, setAddPart] = useState(false)
    const [participants, setParticipants] = useState([])
    const [email ,setEamil] = useState("")
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchGyms = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/owner/getGyms", {}, {
                    withCredentials: true,
                });

                if (response.data.success) {
                    setGyms(response.data.data);
                }
            } catch (error) {
                toast.error("Unable to fetch your gyms");
                console.error(error);
            }
        };

        fetchGyms();
    }, []);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/owner/getSingleEvent", { gymId, eventId }, {
                    withCredentials: true,
                });

                if (response.data.success) {
                    setEvent(response.data.event);
                }
            } catch (error) {
                toast.error("Unable to fetch event details");
                console.error(error);
            }
        };

        fetchEvent();
    }, [gymId, eventId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    
    const handleFileChange = (event) => {
        event.preventDefault()
        const file = event.target.files[0];
        if (file) {
            setProfilePicture(file);
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);
          }
    };
    
    const handleDeleteImage = (e)=>{
        e.preventDefault()
        setProfilePicture(null)
        setPreviewUrl(null)
    }

    useEffect(() => {
        if (event) {
            setFormData({
                name: event.eventName || "",
                description: event.description || "",
                userType: event.userType || "",
                address: event.location?.address || "",
                city: event.location?.city || "",
                state: event.location?.state || "",
                zipCode: event.location?.zipCode || "",
                startDate: event.startDate ? new Date(event.startDate).toISOString().split("T")[0] : null,
                startTime: event.startTime || "",
                endDate: event.endDate ? new Date(event.endDate).toISOString().split("T")[0] : null,
                endTime: event.endTime || "",
                contactForQuery: event.contactInfoQuery || "",
                organizedBy: event.organizedBy || "",
                registrationEnds: event.registraionEnd ? new Date(event.registraionEnd).toISOString().split("T")[0] : null,
                MaxUser: event.MaxUser || 0,
                priceMember: event.priceMember || 0,
                priceNon_member: event.priceNon_member || 0,
                displayPhoto: event.displayPhoto || "",
            });
        }
    }, [event]);
    
    
    const handleSubmit = async(e) => {
        e.preventDefault(); // Prevent form submission refresh

        if(formData.userType === ""){
            return toast.error("user type not selected")
        }

        let uploadedImageUrl = formData.displayPhoto; 

        if(profilePicture){
            const formdata = new FormData()
            formdata.append("file",profilePicture)
            formdata.append("upload_preset","a5amtbnt")

            try {
                const response = await axios.post(
                    "https://api.cloudinary.com/v1_1/ddwfq06lp/image/upload",
                    formdata
                )

                uploadedImageUrl = response.data.secure_url
            } catch (error) {
                console.error("Error uploading image:", error);
                toast.error("Unable to upload image")
            }
        }

        try {
            const res = await axios.put("http://localhost:5000/api/owner/updateEvent",{...formData,displayPhoto:uploadedImageUrl,gymId,eventId},{
                withCredentials:true
            })

            if(res.data.success === true){               
                setFormData((prev)=>({
                    ...prev,
                    name: "", description: "", userType: "",
                    address: "", city: "", state: "", zipCode: "",
                    startDate: null, startTime: "", endDate: null, endTime: "",
                    contactForQuery: "", organizedBy: "", registrationEnds: null, MaxUser: "",
                    priceMember: "", priceNon_member: "", displayPhoto: null
                }))
                setOpenEdit(!openEdit)
                setEvent(res.data.event)
                toast.success(res.data.message)

            }
        } catch (error) {
            console.error('Error:', error.message);
            const backendMessage = error.response?.data?.message
            toast.error(backendMessage)
        }
    };

    useEffect(()=>{
        const fetchEvent = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/owner/getParticipants", { gymId, eventId }, {
                    withCredentials: true,
                });

                if (response.data.success) {
                    setParticipants(response.data.participants);
                  
                }
            } catch (error) {
                toast.error("Unable to fetch event details");
                console.error(error);
            }
        };

        fetchEvent();
    },[gymId,eventId])

    const handlePart = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post("http://localhost:5000/api/owner/addParticipants", { gymId, eventId, email }, {
                withCredentials: true,
            });

            if (response.data.success) {
                setEamil("")
                setAddPart(false)
                setParticipants(response.data.participants);
                setEvent(response.data.event)
                toast.success('Participant added')
            }
        } catch (error) {
            console.error('Error:', error.message);
            const backendMessage = error.response?.data?.message
            toast.error(backendMessage)
        }
    }

    const handleDeleteParticipants = async(email) =>{
     
        try {
            const response = await axios.post("http://localhost:5000/api/owner/deleteParticipants", { gymId, eventId, email }, {
                withCredentials: true,
            });
        
            if (response.data.success) {
                setParticipants((prevParticipants) =>
                    prevParticipants.filter((participant) => participant.Email !== email)
                );
                setEvent(response.data.event)
                
                toast.success('Participant removed successfully');
                
            }
        } catch (error) {
            console.error('Error:', error.message);
            const backendMessage = error.response?.data?.message
            toast.error(backendMessage)
        }
    }


    const filteredParticipants = participants.filter((participant) =>
        participant.Email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <Nav getGyms={gyms} />

            <nav className="flex flex-row justify-between mx-[20vw] font-semibold text-neutral-500 text-lg mt-2">
                
                <button className="flex items-center text-black hover:text-neutral-800 cursor-pointer" onClick={() => navigate(`/owner/gym/${gymId}`,{state:{page:5}})}>
                    <LuArrowLeft size={24} /> Back
                </button>

                <div 
                    className={`hover:text-neutral-700 cursor-pointer ${page === 1 ? "underline text-black" : "text-neutral-500"} mx-8`} 
                    onClick={() => setPage(1)}
                >
                    Event Details
                </div>
                <div 
                    className={`hover:text-neutral-700 cursor-pointer ${page === 2 ? "underline text-black" : "text-neutral-500"} mx-8`} 
                    onClick={() => setPage(2)}
                >
                    Participants
                </div>
         
            </nav>

            <div>
                {page === 1 && event ? (
                    <div className="mx-[20vw] my-6">
                        
                        <div className="flex flex-row justify-between items-center">
                            <h2 className="text-2xl font-bold">{event.eventName}</h2>

                            {event.status === 'Active' && (
                                <div className="hover:opacity-80 cursor-pointer flex flex-row items-center mr-3" onClick={()=>setOpenEdit(!openEdit)}> 
                                    <FaPen size={15} className="text-blue-600"/> 
                                    <span className="text-blue-600 text-lg">Edit</span>
                                </div>
                            )}
                            
                        </div>
                        
                        <div className="mt-2 w-full flex justify-center">
                            <img src={event.displayPhoto || "/images/noPhoto.jpg"} alt="gymImage"  className="w-[90%] h-[70vh]   rounded-xl "/>
                        </div>
                   

                        <div className=" mt-3 ">
                            <h2 className="text-black font-semibold text-lg">Description</h2>
                            <div className="text-lg font-light">{event?.description}</div>
                        </div>
                       
                        <div>

                            <h2 className="text-black font-semibold text-lg mt-3">Address</h2>
                            <div className=" text-gray-600  text-lg">{event?.location?.address}</div>
                            <div className=" text-gray-600 text-lg">{event?.location?.city}, {event?.location?.state}</div>
                            <div className=" text-gray-600 text-lg">{event?.location?.zipCode}</div>
                        
                        </div>

                        <div className={`mt-3 text-md ${event.userType === 'membersOnly'? 'text-blue-400' : 'text-green-400'} font-semibold`}> <span className="text-gray-600">UserType:</span> {event.userType}</div>

                        <div className="flex flex-row justify-startitems-center mt-3">
                            <div className="flex flex-col mr-6">
                                <div className="text-gray-600">Date: </div>
                                <div>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</div>
                            </div>

                            <div className="flex flex-col mx-6">
                                <div className="text-gray-600">Timing: </div>
                                <div>{event.startTime} - {event.endTime}</div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col mt-3">
                                <div className="text-gray-600">Registration Ends: </div>
                                <div>{new Date(event.registraionEnd).toLocaleDateString()}</div>
                        </div>

                        <div className="flex flex-row justify-startitems-center mt-3">
                            <div className="flex flex-col mr-6">
                                <div className="text-gray-600">Price (Member): </div>
                                <div>₹{event.priceMember}</div>
                            </div>

                            <div className="flex flex-col mx-6">
                                <div className="text-gray-600">Price (Non-member): </div>
                                <div>{ event.userType === 'membersOnly' ? <div>-</div>:<div>₹{event.priceNon_member}</div>}</div>
                            </div>
                        </div>

                        <p className="mt-3"><span className="text-gray-600">Max Participants: </span> {event.MaxUser}</p>
                        <p className="mt-3"><span className="text-gray-600">Total Participants: </span> {event.totalParticipants}</p>
                        <p className="mt-3"><span className="text-gray-600">Total Revenue: </span> ₹{event.totalRevenue}</p>
                        <p className="mt-3"><strong>Organized By:</strong> {event.organizedBy}</p>
                        <p><strong>Contact:</strong> {event.contactInfoQuery}</p>
                        <p className={`${event.status === 'Active'?'text-green-600':'text-red-600'} font-semibold`}><strong className="text-black">Status:</strong> {event.status}</p>
                        
                    </div>
                ) : null}

                {page === 2 && (
                    <>
                    <div className="mt-5 flex flex-row justify-between items-center mx-[20vw]">
                        <div className="flex flex-row items-center">
                            <input
                                type="text"
                                placeholder="Search participants by email"
                                className="w-[250px] px-2 py-2 rounded-lg text-sm border border-gray-400 focus:outline-none text-black"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <FaSearch size={18} className="text-black mx-3 cursor-pointer hover:opacity-80" />
                        </div>
                        <button
                            className="text-neutral-800 mt-2 mx-2 px-3 py-1 bg-neutral-300 rounded-lg hover:bg-neutral-200 cursor-pointer" onClick={()=>setAddPart(true)}
                            
                        >
                            Add Participants
                        </button>
                    </div>
               
                    {filteredParticipants  && filteredParticipants .length > 0 ? (
                        <div className=" p-4 mx-[20vw]">
                        

                            <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] gap-10 items-center text-center font-semibold text-lg">
                                <div>Profile</div>
                                <div>Email</div>
                                <div>Full Name</div>
                                <div>Member</div>
                            </div>
                
                            <ul>
                                {filteredParticipants .map((participant, index) => (
                                    <div className="flex justify-center mt-4" key={index} >
                                        <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] gap-10 items-center text-center w-full max-w-5xl hover:bg-neutral-100 hover:opacity-80">
                                            {/* Profile Picture */}
                                            <div>
                                                {participant?.profilePic ? (
                                                    <img
                                                    src={participant.profilePic}
                                                    alt={participant.Fullname}
                                                    className="w-[50px] h-[50px] rounded-full object-cover mx-auto"
                                                    />
                                                ) : (
                                                    <FaUserCircle size={50} className="text-black mx-auto" />
                                                )}
                                            </div>
                                           
                                            <div className="text-gray-700 font-medium text-sm w-full truncate overflow-hidden">
                                                {participant.Email}
                                            </div>

                                            <div className="text-gray-700 font-medium text-sm w-full truncate overflow-hidden">
                                                {participant.Fullname}
                                            </div>

                                            <div className={`${participant.Member==='Yes'?'text-green-600':'text-red-600'} font-medium text-sm w-full truncate overflow-hidden`}>
                                                {participant.Member}
                                            </div>

                                            <div>
                                                <FaTrash
                                                    size={18}
                                                    className="text-red-500 cursor-pointer hover:text-red-700"
                                                    onClick={() => handleDeleteParticipants(participant.Email)}
                                                />
                                            </div>
                                                            
                                        </div>
                                    </div>
                                ))}
                            </ul>
                        </div>
                    ) :(
                        <p className=" flex justify-center mt-10 text-gray-600">No participants registered yet.</p>
                    )}
                    </>
                )}
            </div>

            {openEdit && (
                <form onSubmit={handleSubmit}>
                    <div className="fixed inset-0 bg-black/60 bg-opacity-50 z-40"></div>
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="bg-white shadow-lg rounded-2xl p-6 w-[40vw] border border-gray-200">
                            <div className="flex flex-row justify-between items-center">
                                <h2 className="text-2xl font-medium text-black">Update Event</h2>
                                <button onClick={() => setOpenEdit(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <hr className="mt-2" />
                            {eventPage === 1 && (
                                <>
                                    <div className="mb-4 mt-4">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Event Name</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                                        <textarea name="description" value={formData.description} onChange={handleChange} required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3"></textarea>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">User Type</label>
                                        <select 
                                            name="userType" 
                                            value={formData.userType} 
                                            onChange={handleChange} 
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        >
                                            <option value="">Select Value</option>
                                            <option value="everyone">Everyone</option>
                                            <option value="membersOnly">Only for Members</option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Price (Member)</label>
                                        <input type="number" name="priceMember" value={formData.priceMember} onChange={handleChange} required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter 0 if it is free"/>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Price (Non-Member)</label>
                                        <input type="number" name="priceNon_member" value={formData.priceNon_member} onChange={handleChange} required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Enter 0 if only for member"/>
                                    </div>
                                    <button className="px-9 py-4 border-2 border-black rounded-2xl bg-black text-white" onClick={() => setEventPage(2)}>
                                        Next
                                    </button>
                                </>
                            )}
                            {eventPage === 2 && (
                                <>
                                    <h2 className="text-xl font-bold text-gray-700 mb-4">Upload Event Image</h2>
                                    <div className="mb-4 flex flex-row items-center justify-between">
                                        <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm border border-gray-300 rounded-lg cursor-pointer px-2 py-1 mr-3" />
                                        <FaTrash size={15} className="text-red-500 cursor-pointer hover:text-red-700" onClick={handleDeleteImage} />
                                    </div>
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="rounded-lg w-full h-50 object-cover mx-auto" />
                                    ) : (
                                        <img src="/images/noPhoto.jpg" alt="No Image" className="rounded-lg w-full h-50 object-cover mx-auto" />
                                    )}
                                    <div className="flex justify-between mt-4">
                                        <button className="px-9 py-4 border-2 border-black rounded-2xl" onClick={() => setEventPage(1)}>
                                            Back
                                        </button>
                                        <button className="px-9 py-4 border-2 border-black rounded-2xl bg-black text-white" onClick={() => setEventPage(3)}>
                                            Next
                                        </button>
                                    </div>
                                </>
                            )}

                            {eventPage === 3 && (
                                <>
                                    <div className="mb-4 mt-4">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                                        <input type="text" name="address" value={formData.address} onChange={handleChange} required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                                        <input type="text" name="city" value={formData.city} onChange={handleChange} required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
                                        <input type="text" name="state" value={formData.state} onChange={handleChange} required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Zip Code</label>
                                        <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                                    </div>
                                    <div className="flex justify-between mt-4">
                                        <button className="px-9 py-4 border-2 border-black rounded-2xl" onClick={() => setEventPage(2)}>
                                            Back
                                        </button>
                                        <button className="px-9 py-4 border-2 border-black rounded-2xl bg-black text-white" onClick={() => setEventPage(4)}>
                                            Next
                                        </button>
                                    </div>
                                </>
                            )}

                            {eventPage === 4 && (
                                <>
                                    <h2 className="text-xl font-bold text-gray-700 mb-4">Event Timing</h2>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Start Date</label>
                                        <DatePicker 
                                            selected={formData.startDate} 
                                            onChange={(date) => setFormData({ ...formData, startDate: date })} 
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                                            dateFormat="yyyy-MM-dd" 
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Start Time</label>
                                        <input 
                                            type="time" 
                                            name="startTime" 
                                            value={formData.startTime} 
                                            onChange={handleChange} 
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                                            
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">End Date</label>
                                        <DatePicker 
                                            selected={formData.endDate} 
                                            onChange={(date) => setFormData({ ...formData, endDate: date })} 
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                                            dateFormat="yyyy-MM-dd" 
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">End Time</label>
                                        <input 
                                            type="time" 
                                            name="endTime" 
                                            value={formData.endTime} 
                                            onChange={handleChange} 
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg cursor-pointer"
                                            
                                        />
                                    </div>

                                    <div className="flex justify-between mt-4">
                                        <button className="px-9 py-4 border-2 border-black rounded-2xl" onClick={() => setEventPage(3)}>
                                            Back
                                        </button>
                                        <button className="px-9 py-4 border-2 border-black rounded-2xl bg-black text-white" onClick={() => setEventPage(5)}>
                                            Next
                                        </button>
                                    </div>
                                </>
                            )}

                            {eventPage === 5 && (
                                <>
                                    <h2 className="text-xl font-bold text-gray-700 mb-4">Additional Details</h2>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Contact for Queries</label>
                                        <input 
                                            type="text" 
                                            name="contactForQuery" 
                                            value={formData.contactForQuery} 
                                            onChange={handleChange} 
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                                            placeholder="Enter email or phone number"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Organized By</label>
                                        <input 
                                            type="text" 
                                            name="organizedBy" 
                                            value={formData.organizedBy} 
                                            onChange={handleChange} 
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                                            placeholder="Enter organizer name"
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Registration Ends</label>
                                        <DatePicker 
                                            selected={formData.registrationEnds} 
                                            onChange={(date) => setFormData({ ...formData, registrationEnds: date })} 
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" 
                                            dateFormat="yyyy-MM-dd" 
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-600 mb-1">Max Users</label>
                                        <input 
                                            type="number" 
                                            name="MaxUser" 
                                            value={formData.MaxUser} 
                                            onChange={handleChange} 
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                            placeholder="Enter max number of user will participate" 
                                        />
                                    </div>

                                    <div className="flex justify-between mt-4">
                                        <button className="px-9 py-4 border-2 border-black rounded-2xl" onClick={() => setEventPage(4)}>
                                            Back
                                        </button>
                                        <button className="px-7 py-4 border-2 border-green-900 rounded-2xl text-white bg-green-900" type="submit">
                                            Submit
                                        </button>
                                    </div>
                                </>
                            )}

                        </div>
                    </div>
                </form>
            )}

            {addPart && (
                <form onSubmit={handlePart}>
                    <div className="fixed inset-0 bg-black/60 bg-opacity-50 z-40"></div>
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="bg-white shadow-lg rounded-2xl p-6 w-[40vw] border border-gray-200">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
                                Email
                            </label>
                            <input type="email" name="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Enter Email" value={email} onChange={(e)=>setEamil(e.target.value)}/>

                            <div className="flex justify-between mt-4">
                                <button className="px-9 py-4 border-2 border-black rounded-2xl" onClick={() => setAddPart(false)}>
                                    Cancel
                                </button>
                                <button className="px-7 py-4 border-2 border-green-900 rounded-2xl text-white bg-green-900" type="submit">
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
};

export default GymEvent;
