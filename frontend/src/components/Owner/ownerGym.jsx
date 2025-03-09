import toast from "react-hot-toast";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaChevronDown, FaPen, FaTrash } from "react-icons/fa";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "axios";
import Nav from "./component/Navbar";
import UploadPhoto from "./component/UploadPhoto";
import MemberPage from "./component/memberPage";
import TrainerPage from "./component/trainerPage";
import Equipment from "./component/equipment";
import EventsList from "./component/Events";

const OwnerGym = () => {

    const {gymId} = useParams()
    const navigate = useNavigate()
    const [getGyms,setGetGyms] = useState({})
    const [reviews,setReviews] = useState([])
    const [isOpen, setIsOpen] = useState(true);
    const [isOpens, setIsOpens] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [openMembership, setOpenMembership] = useState(true)
    const location = useLocation()
    const [page,setPage] = useState(location.state?.page || 1)
    const [openActivity, setOpenActivitiy] = useState(false)
    const [openAmenity, setOpenAmenity] = useState(false)
    const [amenities, setAmenities] = useState([]);
    const [activities, setActivities] = useState([]);
    const [selectedAmenity, setSelectedAmenity] = useState("");
    const [selectedActivity, setSelectedActivity] = useState("");
    const [customAmenity, setCustomAmenity] = useState("");
    const [customActivity, setCustomActivity] = useState("");
    const [addMembership, setAddMembership] = useState(false)
    const [plan, setPlan] = useState({
        planName:"",
        price:"",
        duration:"",
    })
    const [openEdit, setOpenEdit] = useState(false)
    const [formData, setFormData] = useState({
        gymName: "",
        gymNumber: "",
        gymEmail: "",
        description: "",
        gymAddress: "",
        gymCity: "",
        gymState: "",
        gymZipcode: "",
        profileUrl:"",
        totalRevenue:"",
        gymTiming: [
            {
                days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                startTime: "",
                endTime: "",
                openDropdown: false, // Unique dropdown state for each timing slot
            }
        ]
    });
    const [editPage, setEditPage] = useState(1)
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [avgStar, setAvgStar] = useState(0)
    const [error, setError] = useState(null);
    const [Gyms,setGyms] = useState([])
    const [List,setList] = useState(false)
    const [timings, setTimings] = useState(false)

    const predefinedAmenities = ["WiFi", "Parking", "Swimming Pool", "Gym"];
    const predefinedActivities = ["Yoga", "Zumba", "Personal Training", "Cycling"];
    
    useEffect(()=>{
        if(location.state?.page) setPage(location.state?.page)  
    },[location.state])

    useEffect(()=>{

        const fetchGyms = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/owner/getGyms", {}, {
                    withCredentials: true,
                });

                if (response.data.success) {
                    setGyms(response.data.data); // Update to match your backend response structure
                }
            } catch (error) {
                toast.error("Unable to fetch your gyms");
                console.error(error);
            }
        };

        fetchGyms();
        
    },[])



    useEffect(() => {
        if (getGyms) {
            setFormData((prev) => ({
                ...prev,
                gymName: getGyms?.gymName || "",
                gymNumber: getGyms?.gymcontactNumber || "",
                gymEmail: getGyms?.gymEmail || "",
                description: getGyms?.description || "",
                gymAddress: getGyms?.location?.address|| "",
                gymCity: getGyms?.location?.city || "",
                gymState: getGyms?.location?.state || "",
                gymZipcode: getGyms?.location?.zipCode || "",
                profileUrl: getGyms?.profileImage || "",
                totalRevenue: getGyms?.totalRevenue || ""
            }));
        }
    }, [getGyms]);

 
    useEffect(()=>{
        setGetGyms(null)
        const fetchGyms = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/owner/getSingleGym", {gymId}, {
                    withCredentials: true,
                });

                if (response.data.success) {
                    setGetGyms(response.data.gyms);
                    setList(response.data.gyms.List)
                }
            } catch (error) {
                toast.error("Unable to fetch your gyms");
                console.error(error);
            }
        };
      
        fetchGyms();
        
    },[gymId])

    useEffect(()=>{

        const fetchGyms = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/owner/getReview", {gymId}, {
                    withCredentials: true,
                });

                if (response.data.success) {
                    setReviews(response.data.reviews)
                    setAvgStar(response.data.averageRating)
                }
            } catch (error) {
                setError(err.response?.data?.message || "Failed to fetch events");
                console.error(error);
            }
        };
      
        fetchGyms();
   
    },[gymId])


    const handleAddAmenity = (e) => {
        e.preventDefault()
        if (selectedAmenity && !amenities.includes(selectedAmenity)) {
          setAmenities([...amenities, selectedAmenity]);
          setSelectedAmenity("");
          
        }
      };
    
      // Add selected activity to the list
    const handleAddActivity = (e) => {
        e.preventDefault()
        if (selectedActivity && !activities.includes(selectedActivity)) {
          setActivities([...activities, selectedActivity]);
          setSelectedActivity("");
        }
      };
    
      // Handle custom amenity submission
    const addCustomAmenity = (e) => {
        e.preventDefault()
        if (customAmenity.trim() && !amenities.includes(customAmenity)) {
          setAmenities([...amenities, customAmenity.trim()]);
          setCustomAmenity("");
        }
      };
    
      // Handle custom activity submission
    const addCustomActivity = (e) => {
        e.preventDefault()
        if (customActivity.trim() && !activities.includes(customActivity)) {
          setActivities([...activities, customActivity.trim()]);
          setCustomActivity("");
        }
      };


    const handleDelete = (activityToDelete) => {
        setActivities((prevActivities) =>
          prevActivities.filter((activity) => activity !== activityToDelete)
        );
      };

    const handleDeleteAmenity = (amenityToDelete) => {
        setAmenities((prevAmenities) =>
            prevAmenities.filter((amenity) => amenity !== amenityToDelete)
        );
      };

    const handleActivitySubmit = async (e) => {
        e.preventDefault()

        if(activities.length === 0){
            return toast.error("Activity is empty")
        }
        try {
            const response = await axios.post("http://localhost:5000/api/owner/addActivity",{activities:activities,gymId},{
                withCredentials:true
            })

            if(response.data.success){
                toast.success("Activities added successfully")
                setActivities([])
                setSelectedActivity("")
                setOpenActivitiy(false)
                setGetGyms((prev)=> ({
                    ...prev,
                    activities:response.data.activity
                }))
            }
        } catch (error) {
            toast.error('Error adding activities')
        }
    }
    const handleAmenitySubmit = async (e) => {
        e.preventDefault()

        if(amenities.length === 0){
            return toast.error("Amenities is empty")
        }
        try {
            const response = await axios.post("http://localhost:5000/api/owner/addAmenity",{amenities:amenities,gymId},{
                withCredentials:true
            })

            if(response.data.success){
                toast.success("Activities added successfully")
                setAmenities([])
                setSelectedAmenity("")
                setOpenAmenity(false)
                setGetGyms((prev)=> ({
                    ...prev,
                    aminities:response.data.amenities
                }))
            
            }
        } catch (error) {
            toast.error('Error adding amenities')
        }
    }

    const handlePlans = (e)=>{
        const {name,value} = e.target
        setPlan({...plan, [name]:value})
    }
   
    const handleMemberships = async (e) => {
        e.preventDefault()

        if(plan.planName === "" || plan.price==="" || plan.duration===""){
            return toast.error("All fields are required")
        }

        

        try {
            const response = await axios.post("http://localhost:5000/api/owner/addMemberPlan",{planName:plan.planName, price:plan.price,duration:plan.duration,gymId},{
                withCredentials:true
            })

            if(response.data.success){
                toast.success('Membership added successfully')
                setPlan({
                    planName:"",
                    price:"",
                    duration:""
                })
                setGetGyms((prev)=> ({
                    ...prev,
                    membershipPlans:response.data.membership
                }))
                setAddMembership(!addMembership)
                
            }
        } catch (error) {
            toast.error('Error adding membership')
        }
    }

    const handleDeleteMembership = async (planName) => {
        try {
            const response = await axios.post("http://localhost:5000/api/owner/deleteMembership",{planName,gymId},{
                withCredentials:true
            })

            if(response.data.success){
                setGetGyms((prev)=>({
                    ...prev,
                    membershipPlans:prev.membershipPlans.filter((item)=>item.planName!==planName)
                }))
                toast.success('Membership plan deleted successfully')
  
            }
        } catch (error) {
            toast.error('Error deleting membership')
        }
    }

    const handleDeleteActivity = async (activity) => {
        try {
            const response = await axios.post("http://localhost:5000/api/owner/deleteActivity",{activity,gymId},{
                withCredentials:true
            })

            if(response.data.success){
                setGetGyms((prev) => ({
                    ...prev,
                    activities: prev.activities.filter((item) => item !== activity),
                }));
                toast.success('Activity deleted successfully')
  
            }
        } catch (error) {
            toast.error('Error deleting activity')
        }
    }

    const handleDeleteAmenities = async (amenity) => {
        try {
            const response = await axios.post("http://localhost:5000/api/owner/deleteAmenity",{amenity,gymId},{
                withCredentials:true
            })

            if(response.data.success){
                setGetGyms((prev) => ({
                    ...prev,
                    aminities: prev.aminities.filter((item) => item !== amenity),
                }));
                toast.success('Amenity deleted successfully')
                
            }
        } catch (error) {
            toast.error('Error deleting amenity')
        }
    }

    const handleDeletePhoto = async (photoId) => {
        try {
            const response = await axios.post("http://localhost:5000/api/owner/deletePhoto",{photoId,gymId},{
                withCredentials:true
            })

            if(response.data.success){
                setGetGyms((prev) => ({
                    ...prev,
                    photos: prev.photos.filter((item) => item.photoId !== photoId),
                }));
                toast.success('Photo deleted successfully')
                
            }
        } catch (error) {
            toast.error('Error deleting Photo')
        }
    }

    const handleChange = (e) => {
        e.preventDefault()
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

    const Next = (e)=>{
        e.preventDefault()
        setEditPage(prevPage => prevPage + 1)
    }
    const Back = (e)=>{
        e.preventDefault()
        setEditPage(prevPage => prevPage - 1)
    }

    const handleEditGym = async (e) => {
        e.preventDefault()

        if (formData?.gymTiming?.every(timing => timing.startTime === "" && timing.endTime === "")) {
            delete formData.gymTiming;  
        }  

        let uploadedImageUrl = formData.profileUrl; 
 
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
            const response = await axios.put("http://localhost:5000/api/owner/editGym", 
                { ...formData,profileUrl:uploadedImageUrl, gymId }, 
                { withCredentials: true }
            );
    
            if (response.data.success) {
                toast.success("Gym details updated successfully!");
                setOpenEdit(!openEdit)
                setGetGyms(response.data.gym)
            }
        } catch (error) {
            toast.error("Error updating gym details");
            console.error(error);
        }
    };

    const handleDeleteImage = (e)=>{
        e.preventDefault()
        setProfilePicture(null)
        setPreviewUrl(null)
    }

    const handleList = async (List) => {
        setList(List)
        try {
            
            const response = await axios.post("http://localhost:5000/api/owner/setList", 
                { List, gymId }, 
                { withCredentials: true }
            );
    
            if (response.data.success) {
                toast.success(response.data.message);
                
            }
        } catch (error) {
            toast.error("Error updating listing");
            console.error(error);
        }
    }

    const toggleDropdown = (index) => {
        setFormData((prev) => {
            const updatedTimings = prev.gymTiming.map((timing, i) =>
                i === index ? { ...timing, openDropdown: !timing.openDropdown } : timing
            );
            return { ...prev, gymTiming: updatedTimings };
        });
    };

    // Handle selection/deselection of days
    const handleDayChange = (index, day) => {
        setFormData((prev) => {
            const updatedTimings = prev.gymTiming.map((timing, i) =>
                i === index
                    ? {
                        ...timing,
                        days: timing.days.includes(day)
                            ? timing.days.filter((d) => d !== day) // Remove if exists
                            : [...timing.days, day] // Add if not exists
                    }
                    : timing
            );
            return { ...prev, gymTiming: updatedTimings };
        });
    };

    // Handle time and meridian changes
    const handleTimingChange = (index, field, value) => {
        setFormData((prev) => {
            const updatedTimings = prev.gymTiming.map((timing, i) =>
                i === index ? { ...timing, [field]: value } : timing
            );
            return { ...prev, gymTiming: updatedTimings };
        });
    };

    // Add new timing slot
    const addTimingSlot = () => {
        setFormData((prev) => ({
            gymTiming: [
                ...prev.gymTiming,
                {
                    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    startTime: "",
                    endTime: "",
                    openDropdown: false,
                }
            ]
        }));
    };

    // Remove a timing slot
    const removeTimingSlot = (index) => {
        setFormData((prev) => ({
            gymTiming: prev.gymTiming.filter((_, i) => i !== index)
        }));
    };

    const handleDeleteTiming = async (timingId) => {
        try {
            const response = await axios.post("http://localhost:5000/api/owner/deleteTiming", {
                gymId: gymId,
                timingId,
            },{
                withCredentials:true
            });
    
            if (response.data.success) {
                // Update UI after deleting timing
                setGetGyms((prev) => ({
                    ...prev,
                    gymTimings: prev.gymTimings.filter((t) => t._id !== timingId),
                }));
            }
        } catch (error) {
            console.error("Error deleting gym timing:", error);
        }
    };

    return ( 
        <>
        <div>
            <Nav getGyms={Gyms}/>

            <nav className="flex flex-row justify-between mx-[20vw] font-semibold text-neutral-500 text-lg mt-2">
                <div className={`hover:text-neutral-700 cursor-pointer ${page===1?"underline text-black":"text-neutral-500"}`} onClick={()=>setPage(1)}>Your Gym</div>
                <div className={`hover:text-neutral-700 cursor-pointer ${page===2?"underline text-black":"text-neutral-500"}`} onClick={()=>setPage(2)}>Members</div>
                <div className={`hover:text-neutral-700 cursor-pointer ${page===3?"underline text-black":"text-neutral-500"}`} onClick={()=>setPage(3)}>Trainers</div>
                <div className={`hover:text-neutral-700 cursor-pointer ${page===4?"underline text-black":"text-neutral-500"}`} onClick={()=>setPage(4)}>Equipments</div>
                <div className={`hover:text-neutral-700 cursor-pointer ${page===5?"underline text-black":"text-neutral-500"}`} onClick={()=>setPage(5)}>Events</div>
           
            </nav>

            {page === 1 && (

                <div className="mx-[20vw] my-6">

                    <div className="flex flex-row justify-between items-center">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold">{getGyms?.gymName || "Gym Name Not Available"}</h1>
                            <h3 className="font-light text-neutral-500 mt-2">
                            {getGyms?.location?.city || "City Not Available"}, {getGyms?.location?.state || "State Not Available"}
                            </h3>
                        </div>
                        <div className="hover:opacity-80 cursor-pointer flex flex-row items-center mr-3" onClick={()=>setOpenEdit(!openEdit)}> 
                            <FaPen size={15} className="text-blue-600"/> 
                            <span className="text-blue-600 text-lg">Edit</span>
                        </div>
                    </div>
                    <div className="mt-2 w-full flex justify-center">
                        <img src={getGyms?.profileImage || "/images/noPhoto.jpg"} alt="gymImage"  className="w-[90%] h-[60vh]   rounded-xl "/>
                    </div>
                    

                    <div>
                        <h2 className="text-black font-semibold text-lg mt-6">Address</h2>
                        <div className=" font-light mt-1 text-lg">{getGyms?.location?.address}</div>
                        <div className=" font-light text-lg">{getGyms?.location?.city}, {getGyms?.location?.state}</div>
                        <div className=" font-light text-lg">{getGyms?.location?.zipCode}</div>
                    </div>

                  

                    <div className=" mt-6 ">
                        <h2 className="text-black font-semibold text-lg">Description</h2>
                        <div className="text-lg font-light">{getGyms?.description}</div>
                    </div>

                    <div className=" mt-6 ">
                        <h2 className="text-black font-semibold text-lg">Contact Info</h2>
                        <div className="text-md font-light">Mobile: {getGyms?.gymcontactNumber}</div>
                        <div className="text-md font-light">Email: {getGyms?.gymEmail}</div>
                    </div>

                    <div className="mt-6">
                        <h2 className="text-black font-semibold text-lg">Gym Timings</h2>
                        {getGyms?.gymTimings?.length > 0 ? (
                            <div className="mt-2">
                                {getGyms?.gymTimings.map((timings)=>(
                                    <div className="grid grid-cols-3 items-center max-w-[50vw] mt-1">
                                        <div className=" text-neutral-700">
                                            {timings.days.length === 7 ? "Everyday" : timings.days.length === 1 ? timings.days[0] : timings.days[0] + "-" + timings.days[timings.days.length-1]}
                                        </div>
                                        <div className=" text-neutral-500">{timings.startTime} - {timings.endTime}</div>
                                        <FaTrash size={15} className="text-red-500 cursor-pointer hover:text-red-700"
                                            onClick={()=>handleDeleteTiming(timings._id)}/>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-neutral-500 mt-2">No gym timings available.</p>
                        )}

                    </div>

                    <div className="mt-6 flex flex-row justify-between w-full border-2 border-neutral-300 px-2 rounded-lg items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>

                    <h2 className="text-black font-semibold text-lg ">Amenities</h2>

                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <FaChevronDown size={15} />
                    </motion.div>

                    </div>

                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                    {getGyms?.aminities?.length > 0 ? (
                        <div className=" p-3">
                            <ul className="list-disc pl-5 text-neutral-600">
                            {getGyms.aminities.map((amenity, index) => (
                                    <div key={index} className="flex flex-row justify-between items-center">
                                       <li>{amenity}</li>
                                       <FaTrash size={15} className="text-red-500 cursor-pointer hover:text-red-700"
                                           onClick={()=>handleDeleteAmenities(amenity)}/>  
                                   </div>
                            ))}
                            </ul>
                        </div>
                        ) : (
                        <p className="text-neutral-500 mt-2 mx-2">No amenities available.</p>
                    )}
                    
                    <button className="text-neutral-800 mt-2 mx-2 px-3 py-1 bg-neutral-300 rounded-lg  hover:bg-neutral-200 cursor-pointer" onClick={()=>setOpenAmenity(!openAmenity)}>ADD +</button>

                    </motion.div>

                    <div className="mt-6 flex flex-row justify-between w-full border-2 border-neutral-300 px-2 rounded-lg items-center cursor-pointer" onClick={() => setIsOpens(!isOpens)}>

                    <h2 className="text-black font-semibold text-lg ">Activities</h2>

                    <motion.div animate={{ rotate: isOpens ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <FaChevronDown size={15} />
                    </motion.div>

                    </div>

                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: isOpens ? "auto" : 0, opacity: isOpens ? 1 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                    {getGyms?.activities?.length > 0 ? (
                        <div className="p-3">
                            <ul className="list-disc pl-5 text-neutral-600">
                            {getGyms.activities.map((activity, index) => (
                                <div key={index} className="flex flex-row justify-between items-center">
                                    <li>{activity}</li>
                                    <FaTrash size={15} className="text-red-500 cursor-pointer hover:text-red-700"
                                        onClick={()=>handleDeleteActivity(activity)}/>  
                                </div>
                            ))}
                            </ul>
                        </div>
                        ) : (
                        <p className="text-neutral-500 mt-2 mx-2">No activities available.</p>
                    )}
                    <button className="text-neutral-800 mt-2 mx-2 px-3 py-1 bg-neutral-300 rounded-lg  hover:bg-neutral-200 cursor-pointer" onClick={()=>setOpenActivitiy(!openActivity)}>ADD +</button>

                    </motion.div>

                    <div className="mt-6 flex flex-row justify-between hover:opacity-90 hover:text-neutral-800 cursor-pointer" onClick={()=>setIsModalOpen(!isModalOpen)}>
                        <h2 className="text-lg font-semibold">Add Photos</h2>
                        <div className="text-3xl font-semibold">+</div>
                    </div>

                    {getGyms?.photos?.length > 0 ? (
                        <div className="mt-2 rounded-lg">
                            <ul className="list-disc  text-neutral-600">

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 ml-2">
                            {getGyms.photos.map((photo, index) => (
                            
                                <div className="flex flex-col " key={index} >
                                    <img src={photo.photo} alt={photo.name} className="w-[20vw] rounded-lg h-[20vh]"/>
                                    <div className="flex flex-row justify-around items-center">
                                        <div>{photo.name}</div>
                                        <FaTrash size={15} className="text-red-500 cursor-pointer hover:text-red-700"
                                            onClick={()=>handleDeletePhoto(photo.photoId)}/>
                                    </div>        
                                </div>
                            
                            ))}
                            </div>
                            </ul>
                        </div>
                    ):(
                        <p className="text-neutral-500 mt-2 text-center">No Photos available.</p>
                    )}

                    <div className="mt-6 flex flex-row justify-between w-full border-2 border-neutral-300 px-2 rounded-lg items-center cursor-pointer" onClick={()=>setOpenMembership(!openMembership)}>
                        <h2 className="text-black font-semibold text-lg ">MembershipPlans</h2>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                            <FaChevronDown size={15} />
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: openMembership ? "auto" : 0, opacity: openMembership ? 1 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        

                        {getGyms?.membershipPlans?.length > 0 ? (

                            
                            <div className="mt-2 rounded-lg">
                                <div className="grid grid-cols-4 gap-4 text-center">
                                    <div className="font-semibold">Plan Name</div>
                                    <div className="font-semibold">Price</div>
                                    <div className="font-semibold">Duration</div>
                                </div>
                                <ul className="list-disc  text-neutral-600">

                                
                                {getGyms.membershipPlans.map((member, index) => (
                                    <div className="grid grid-cols-4 gap-4 text-center" key={index}>
                                        <div  >
                                            {member.planName}      
                                        </div>
                                        <div>
                                            ₹{member.price}
                                        </div>
                                        <div >
                                            {member.duration}      
                                        </div>
                                        <div >
                                            <FaTrash size={15} className="text-red-500 cursor-pointer hover:text-red-700"
                                            onClick={()=>handleDeleteMembership(member.planName)}/>     
                                        </div>
                                    
                                    </div>
                                ))}
                                </ul>
                            </div>
                            ):(
                            <p className="text-neutral-500 mt-2 text-center">No Membership Plans.</p>
                        )}
                    
                        <button className="text-neutral-800 mt-2 mx-2 px-3 py-1 bg-neutral-300 rounded-lg  hover:bg-neutral-200 cursor-pointer" onClick={()=>setAddMembership(!addMembership)}>ADD +</button>

                    </motion.div>
                        
                    <p className="mt-6"><span className="text-gray-600 font-semibold text-lg">Total Revenue: </span> ₹{getGyms?.totalRevenue}</p>
                    <div className="mt-6 flex flex-row items-center justify-between">
                        <div className="text-gray-600 font-semibold text-lg">Want to list your gym?  </div>
                        <div className="flex flex-row items-center justify-between">
                            <button className={`px-4 py-2 ${List === true ? 'bg-green-500':'bg-transparent'} rounded-lg border-2 hover:cursor-pointer mx-4 hover:bg-green-500` } onClick={()=>handleList(true)}>Yes</button>
                            <button className={`px-4 py-2 ${List === false ? 'bg-red-500':'bg-transparent'} rounded-lg border-2 hover:cursor-pointer hover:bg-red-500`} onClick={()=>handleList(false)}>No</button>

                        </div>
                    </div>

                    <div className="text-lg font-semibold mt-8 flex flex-row justify-between items-center">
                        <h2>Reviews <span className="text-sm text-neutral-700">⭐{avgStar}</span></h2>
                    </div>
                    
                    {error && <p className="text-center text-gray-600 mt-2">{error}</p>}

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
                <MemberPage gymId={gymId}/>
            )}

            {page === 3 && (
                <TrainerPage gymId={gymId}/>
            )}

            {page === 4 && (
                <Equipment gymId={gymId}/>
            )}

            {page === 5 && (
                <EventsList gymId={gymId}/>
            )}

        </div>

        {isModalOpen && (
            <>
                <div
                    className="fixed inset-0 bg-black/60 bg-opacity-50 z-40"
                ></div>

                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white shadow-lg rounded-2xl p-6 w-[30vw] border border-gray-200">
                        <div className="flex flex-row justify-between items-center">
                            <h2 className="text-2xl font-medium text-black">Add Photos</h2>
                            <button
                            onClick={()=>setIsModalOpen(!isModalOpen)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none hover:cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <hr className="mt-2"/>

                        <UploadPhoto gymId={gymId} setGetGyms={setGetGyms} modal={isModalOpen} setIsModalOpen={setIsModalOpen}/>

                    </div>
                </div>
            </>
        )}

        {openActivity && (
            <form onSubmit={handleActivitySubmit}>
                <div
                    className="fixed inset-0 bg-black/60 bg-opacity-50 z-40"
                ></div>

                <div className="fixed inset-0 flex items-center justify-center z-50 ">
                
                    <div className="bg-white shadow-lg rounded-2xl p-6 w-[30vw] border border-gray-200">
                        <div className="flex flex-row justify-between items-center">

                            <h2 className="text-xl font-bold text-gray-700 mb-4">ADD Activities</h2>
                            <button
                                onClick={()=>setOpenActivitiy(!openActivity)}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none hover:cursor-pointer"
                                >
                                    ✕
                                </button>
                        </div> 

                        {/* Dropdown for predefined activities */}
                        <div className="mb-4">
                            <select
                            value={selectedActivity}
                            onChange={(e) => setSelectedActivity(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                            <option value="" disabled>
                                Select an activity
                            </option>
                            {predefinedActivities.map((activity, index) => (
                                <option key={index} value={activity}>
                                {activity}
                                </option>
                            ))}
                            </select>
                            <button
                            onClick={handleAddActivity}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg mt-2 hover:bg-blue-600 cursor-pointer"
                            >
                            Add Activity
                            </button>
                        </div>

                        {/* Custom Activity Input */}
                        <div>
                            <input
                            type="text"
                            value={customActivity}
                            onChange={(e) => setCustomActivity(e.target.value)}
                            placeholder="Add other activity"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                            />
                            <button
                            onClick={addCustomActivity}
                            className="px-4 py-2 bg-neutral-400 text-white rounded-lg hover:bg-neutral-600 cursor-pointer"
                            >
                            Add Activity
                            </button>
                        </div>

                        {/* Display Selected Amenities and Activities */}
                        <div className="mt-6">


                            <h3 className="text-lg font-bold text-gray-700 mt-4">Selected Activities:</h3>
                            <ul className="list-disc list-inside text-gray-600">
                            {activities.map((activity, index) => (
                                <li key={index} className="flex flex-row justify-between items-center">
                                    <span>{activity}</span>
                                    <FaTrash 
                                        size={15}
                                        className="text-red-500 cursor-pointer hover:text-red-700"
                                        onClick={()=>handleDelete(activity)}
                                    />
                                </li>
                            ))}
                            </ul>
                        </div>

                        
                        <button className="px-4 py-2 rounded-lg bg-black text-white cursor-pointer hover:bg-neutral-700 mt-2" type="submit">
                            Submit
                        </button>   
                    </div>
                
                </div>                
            </form>
        )}

        {openAmenity && (
            <form onSubmit={handleAmenitySubmit}>

                <div
                    className="fixed inset-0 bg-black/60 bg-opacity-50 z-40"
                ></div>

                <div className="fixed inset-0 flex items-center justify-center z-50 ">
            
                    <div className="bg-white shadow-lg rounded-2xl p-6 w-[30vw] border border-gray-200">
                        <div className="flex flex-row justify-between items-center">

                            <h2 className="text-xl font-bold text-gray-700 mb-4">ADD Amenities</h2>
                            <button
                                onClick={()=>setOpenAmenity(!openAmenity)}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none hover:cursor-pointer"
                                >
                                    ✕
                            </button>
                        </div> 

                        {/* Dropdown for predefined amenities */}
                        <div className="mb-4">
                            <select
                            value={selectedAmenity}
                            onChange={(e) => setSelectedAmenity(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                            <option value="" disabled>
                                Select an amenity
                            </option>
                            {predefinedAmenities.map((amenity, index) => (
                                <option key={index} value={amenity}>
                                {amenity}
                                </option>
                            ))}
                            </select>
                            <button
                            onClick={handleAddAmenity}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg mt-2 hover:bg-blue-600 cursor-pointer"
                            >
                            Add Amenity
                            </button>
                        </div>

                        {/* Custom Amenity Input */}
                        <div className="mb-6">
                            <input
                            type="text"
                            value={customAmenity}
                            onChange={(e) => setCustomAmenity(e.target.value)}
                            placeholder="Add other amenity"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
                            />
                            <button
                            onClick={addCustomAmenity}
                            className="px-4 py-2 bg-neutral-400 text-white rounded-lg hover:bg-neutral-600 cursor-pointer"
                            >
                            Add Amenity
                            </button>
                        </div>
                        
                        <div className="mt-6">
                            <h3 className="text-lg font-bold text-gray-700">Selected Amenities:</h3>
                            <ul className="list-disc list-inside text-gray-600">
                            {amenities.map((amenity, index) => (
                                <li key={index} className="flex flex-row justify-between items-center">
                                <span>{amenity}</span> 
                                <FaTrash 
                                        size={15}
                                        className="text-red-500 cursor-pointer hover:text-red-700"
                                        onClick={()=>handleDeleteAmenity(amenity)}
                                    />
                                </li>
                            ))}
                            </ul>
                        </div>

                        <button className="px-4 py-2 rounded-lg bg-black text-white cursor-pointer hover:bg-neutral-700 mt-2" type="submit">
                            Submit
                        </button>  

                    </div>
                </div>
            </form>
        )}

        {addMembership && (
            <form onSubmit={handleMemberships}>
                <div
                    className="fixed inset-0 bg-black/60 bg-opacity-50 z-40"
                ></div>

                <div className="fixed inset-0 flex items-center justify-center z-50 ">
            
                    <div className="bg-white shadow-lg rounded-2xl p-6 w-[30vw] border border-gray-200">
                        <div className="flex flex-row justify-between items-center">

                            <h2 className="text-xl font-bold text-gray-700 mb-4">Add Membership Plan</h2>
                            <button
                                onClick={()=>setAddMembership(!addMembership)}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none hover:cursor-pointer"
                                >
                                    ✕
                            </button>
                        </div> 

                        <div className="flex flex-col">
                            <input type="text" name="planName" placeholder="Enter Plan Name (different)" value={plan.planName} onChange={handlePlans} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"/>

                            <input type="text" name="price" placeholder="Enter price" value={plan.price} onChange={handlePlans} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-3"/>

                            <input type="text" name="duration" placeholder="Enter duration months or days ex: 6 Months" value={plan.duration} onChange={handlePlans} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-3"/>
                        </div>

                        <button className="px-4 py-2 rounded-lg bg-black text-white cursor-pointer hover:bg-neutral-700 mt-2" type="submit">
                            Submit
                        </button>  
                    </div>
                </div>
            </form>
        )}

        {openEdit && (
            <form onSubmit={handleEditGym}>

                <div
                    className="fixed inset-0 bg-black/60 bg-opacity-50 z-40"
                ></div>

                <div className="fixed inset-0 flex items-center justify-center z-50 ">
            
                    <div className="bg-white shadow-lg rounded-2xl p-6 w-auto border border-gray-200">
                        <div className="flex flex-row justify-between items-center">

                        <h2 className="text-xl font-bold text-gray-700 mb-4">Gym Details</h2>                            <button
                                onClick={()=>setOpenEdit(!openEdit)}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none hover:cursor-pointer"
                                >
                                    ✕
                            </button>
                        </div> 
                    

                    {editPage === 1 && (
                        <>
            
                        {/* Gym Name */}
                        <div className="mb-4">
                        <label
                            htmlFor="gymName"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Gym Name
                        </label>
                        <input
                            type="text"
                            id="gymName"
                            name="gymName"
                            value={formData.gymName}
                            onChange={handleChange}
                            required
                            placeholder="Enter gym name"
                            className="w-[30vw] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        </div>

                        {/* Gym Number */}
                        <div className="mb-4">
                        <label
                            htmlFor="gymNumber"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Gym Contact Number
                        </label>
                        <input
                            type="tel"
                            id="gymNumber"
                            name="gymNumber"
                            value={formData.gymNumber}
                            onChange={handleChange}
                            required
                            placeholder="Enter gym number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        </div>

                        {/* Gym Email */}
                        <div className="mb-4">
                        <label
                            htmlFor="gymEmail"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Gym Email
                        </label>
                        <input
                            type="email"
                            id="gymEmail"
                            name="gymEmail"
                            value={formData.gymEmail}
                            onChange={handleChange}
                            required
                            placeholder="Enter gym email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="Enter description"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="4"
                        ></textarea>
                        </div>
                        <div className="mb-4">
                        <label
                            htmlFor="revenue"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Total Revenue
                        </label>
                        <input
                            id="revenue"
                            name="totalRevenue"
                            value={formData.totalRevenue}
                            onChange={handleChange}
                            required
                            placeholder="Enter description"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="number"
                        />
                        </div>

                    </>
                    )}

                    {editPage === 2 && (
                        <>
                        <h2 className="text-xl font-bold text-gray-700 mb-4">Address</h2>

                        <div className="mb-4">
                        <label
                            htmlFor="gymAddress"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Gym Address
                        </label>
                        <input
                            type="text"
                            id="gymAddress"
                            name="gymAddress"
                            value={formData.gymAddress}
                            onChange={handleChange}
                            required
                            placeholder="Enter gym address"
                            className="w-[30vw] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        </div>

                        {/* Gym City */}
                        <div className="mb-4">
                        <label
                            htmlFor="gymCity"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Gym City
                        </label>
                        <input
                            type="text"
                            id="gymCity"
                            name="gymCity"
                            value={formData.gymCity}
                            onChange={handleChange}
                            required
                            placeholder="Enter gym city"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        </div>

                        {/* Gym State */}
                        <div className="mb-4">
                        <label
                            htmlFor="gymState"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Gym State
                        </label>
                        <input
                            type="text"
                            id="gymState"
                            name="gymState"
                            value={formData.gymState}
                            onChange={handleChange}
                            required
                            placeholder="Enter gym state"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        </div>

                        {/* Gym Zipcode */}
                        <div className="mb-4">
                        <label
                            htmlFor="gymZipcode"
                            className="block text-sm font-medium text-gray-600 mb-1"
                        >
                            Gym Zipcode
                        </label>
                        <input
                            type="text"
                            id="gymZipcode"
                            name="gymZipcode"
                            value={formData.gymZipcode}
                            onChange={handleChange}
                            required
                            placeholder="Enter gym zipcode"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        </div>
                        </>
                    )}

                    {editPage === 3 && (
                        <>
                        <h2 className="text-xl font-bold text-gray-700 mb-4">
                            Upload Gym Photo
                        </h2>

                        {/* File Input */}
                        <div className="mb-4 flex flex-row items-center justify-between">
                        <input
                            type="file"
                            id="profilePicture"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-[30vw] text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none px-2 py-1 mr-3"
                        />
                        <FaTrash 
                            size={15}
                            className="text-red-500 cursor-pointer hover:text-red-700"
                            onClick={handleDeleteImage}
                        />
                        </div>

                        {/* Preview */}
                        {previewUrl ? (
                        <div className="mb-4">
            
                            <img
                            src={previewUrl}
                            alt="Profile Preview"
                            className="rounded-lg w-full h-50 object-cover mx-auto"
                            />
                        </div>
                        ):(
                        <div className="mb-4">
            
                            <img
                            src="/images/noPhoto.jpg"
                            alt="Profile Preview"
                            className="rounded-lg w-full h-50 object-cover mx-auto"
                            />
                        </div>
                        )}
                        </>
                    )} 

                    {editPage === 4 && (
                        <>     
                        <div className="mb-4">      {/* Gym Timing Section */}
                            <label className="block text-sm font-medium text-gray-600 ">
                                Gym Timing
                            </label>
                            
                            <div className="flex flex-row justify-center items-center max-w-[90vw] min-w-[30vw] flex-wrap">

                            {formData.gymTiming.map((timing, index) => (
                                <div key={index} className="border p-4 rounded-lg shadow-sm my-1 mx-1">
                                    
                                    {/* Select Days */}
                                    <div className="mb-4 relative">
                                        <label className="block text-sm font-medium text-gray-600 mb-2">
                                            Select Days
                                        </label>

                                        {/* Dropdown Button */}
                                        <div className="border px-4 py-2 rounded-md bg-white cursor-pointer flex justify-between items-center"
                                            onClick={() => toggleDropdown(index)}
                                        >
                                            <span>
                                                {timing.days.length === 7 ? "Everyday" : timing.days.length === 1 ? timing.days[0] : timing.days[0] + "-" + timing.days[timing.days.length-1]}
                                            </span>
                                            <svg
                                                className="w-4 h-4 transform transition-transform"
                                                style={{ transform: timing.openDropdown ? "rotate(180deg)" : "rotate(0deg)" }}
                                                fill="none" stroke="currentColor" strokeWidth="2"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </div>

                                        {/* Dropdown List */}
                                        {timing.openDropdown && (
                                            <div className="absolute bg-white border rounded-md shadow-md mt-1 w-full z-10">
                                                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                                                    <label key={day} className="flex items-center px-4 py-2 hover:bg-gray-100">
                                                        <input
                                                            type="checkbox"
                                                            checked={timing.days.includes(day)}
                                                            onChange={() => handleDayChange(index, day)}
                                                            className="form-checkbox text-blue-500"
                                                        />
                                                        <span className="ml-2">{day}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Start Time */}
                                    <div className="flex items-center space-x-2 mb-2">
                                        <label className="text-sm font-medium text-gray-600">Start Time:</label>
                                        <input
                                            type="time"
                                            value={timing.startTime}
                                            onChange={(e) => handleTimingChange(index, "startTime", e.target.value)}
                                            className="border px-2 py-1 rounded"
                                        />
                                    
                                    </div>

                                    {/* End Time */}
                                    <div className="flex items-center space-x-2 mb-2">
                                        <label className="text-sm font-medium text-gray-600">End Time:</label>
                                        <input
                                            type="time"
                                            value={timing.endTime}
                                            onChange={(e) => handleTimingChange(index, "endTime", e.target.value)}
                                            className="border px-2 py-1 rounded"
                                        />
                                    </div>

                                    {/* Remove Timing Button */}
                                    {formData.gymTiming.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeTimingSlot(index)}
                                            className="bg-red-500 text-white px-3 py-1 rounded-md"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            </div>

                        

                            {/* Add Timing Button */}
                            <button
                                type="button"
                                onClick={addTimingSlot}
                                className="bg-blue-500 text-white px-4 py-2 rounded-md my-2"
                            >
                                + Add Timing
                            </button>
                        </div>
                        </>
                    )} 

                

                    <div className="flex flex-row justify-between mt-4">
                        {editPage !== 1 && (
                            <button className="px-9 py-4 border-2 border-black text-lg rounded-2xl hover:opacity-80 hover:cursor-pointer" onClick={Back} type="button">
                                Back
                            </button>
                        )}

                        {editPage !==4 ?(
                            <button className="px-9 py-4 border-2 border-black text-lg rounded-2xl text-white bg-black hover:opacity-80 hover:cursor-pointer" onClick={Next} type="button">
                                Next
                            </button>
                        ):(
                            <button className="px-7 py-4 border-2 border-green-900 text-lg rounded-2xl text-white bg-green-900 hover:opacity-80 hover:cursor-pointer" type="submit">
                                Submit
                            </button>
                        )}
                    </div>
                    </div>
                </div>
            </form>
        )}

        </>
     );
}
 
export default OwnerGym;