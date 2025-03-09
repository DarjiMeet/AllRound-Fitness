import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const CreateGym = () => {

    
    const navigate = useNavigate()
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [page,setPage] = useState(1)

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
            aminities:[],
            activities:[],
            gymTiming: [
                {
                    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    startTime: "",
                    endTime: "",
                    openDropdown: false, // Unique dropdown state for each timing slot
                }
            ]
        });

        const [amenities, setAmenities] = useState([]);
        const [activities, setActivities] = useState([]);
        const [selectedAmenity, setSelectedAmenity] = useState("");
        const [selectedActivity, setSelectedActivity] = useState("");
        const [customAmenity, setCustomAmenity] = useState("");
        const [customActivity, setCustomActivity] = useState("");
      
        const predefinedAmenities = ["WiFi", "Parking", "Swimming Pool", "Gym"];
        const predefinedActivities = ["Yoga", "Zumba", "Personal Training", "Cycling"];

    const handleFileChange = (event) => {
        event.preventDefault()
        const file = event.target.files[0];
        if (file) {
            setProfilePicture(file);
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);
          }
    };
    
    const handleSubmit = async(event) => {
        event.preventDefault(); // Prevent form submission refresh
        
        if(!formData.gymName || !formData.gymAddress || !formData.gymCity || !formData.gymState || !formData.gymZipcode || !formData.gymNumber || !formData.gymEmail){
           return toast.error("Required fields are empty")
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
            const res = await axios.post("http://localhost:5000/api/owner/createGym",{...formData,profileUrl:uploadedImageUrl,aminities:amenities,activities:activities},{
                withCredentials:true
            })

            if(res.data.success === true){
                toast.success(res.data.message)
                setFormData((prev)=>({
                    ...prev,
                    gymName: "",
                    gymNumber: "",
                    gymEmail: "",
                    description: "",
                    gymAddress: "",
                    gymCity: "",
                    gymState: "",
                    gymZipcode: "",
                    profileUrl:"",
                    aminities:[],
                    activities:[],
                    gymTiming: [
                        {
                            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                            startTime: "",
                            endTime: "",
                            openDropdown: false, // Unique dropdown state for each timing slot
                        }
                    ]

                }))
                navigate("/owner/home")

            }
        } catch (error) {
            console.error('Error:', error.message);
            const backendMessage = error.response?.data?.message
            toast.error(backendMessage)
        }

        
    };

    const handleChange = (e) => {
        e.preventDefault()
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const Next = (e)=>{
        e.preventDefault()
        setPage(prevPage => prevPage + 1)
    }
    const Back = (e)=>{
        e.preventDefault()
        setPage(prevPage => prevPage - 1)
    }


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

    const handleDeleteImage = (e)=>{
        e.preventDefault()
        setProfilePicture(null)
        setPreviewUrl(null)
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

    
    return ( 
        <form
        onSubmit={handleSubmit}
        className="bg-transparent rounded-lg p-6"
        >   
            {page === 1 && (
                <>
                <h2 className="text-xl font-bold text-gray-700 mb-4">Gym Details</h2>

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
                        className="w-[20vw] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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



                </>
            )}

            {page === 2 && (
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
                    className="w-[20vw] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {page === 3 && (
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
                    className="block w-[20vw] text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none px-2 py-1 mr-3"
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

            {page === 4 && (
                <>
                <div className="p-4">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">ADD Amenities</h2>

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
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg mt-2 hover:bg-blue-600"
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
                        className="px-4 py-2 bg-neutral-400 text-white rounded-lg hover:bg-neutral-600"
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

                </div>
                </>
            )}  

            {page === 5 && (
                <div className="p-4">

                    <h2 className="text-xl font-bold text-gray-700 mb-4">ADD Activities</h2>

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
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg mt-2 hover:bg-blue-600"
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
                        className="px-4 py-2 bg-neutral-400 text-white rounded-lg hover:bg-neutral-600"
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
                </div>                                   
            )}                          
            

            {page === 6 && (

                <>     
                <div className="mb-4">      {/* Gym Timing Section */}
                    <label className="block text-sm font-medium text-gray-600 ">
                        Gym Timing
                    </label>
                    
                 

                    <div className="flex flex-row justify-center items-center max-w-[90vw] flex-wrap">

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
                {page !== 1 && (
                    <button className="px-9 py-2 mx-3 border-2 border-black text-lg rounded-2xl hover:opacity-80 hover:cursor-pointer" onClick={Back} type="button">
                        Back
                    </button>
                )}

                {page !==6 ?(
                    <button className="px-9 py-2 border-2 border-black text-lg rounded-2xl text-white bg-black hover:opacity-80 hover:cursor-pointer" onClick={Next} type="button">
                        Next
                    </button>
                ):(
                    <button className="px-4 py-2 border-2 border-green-900 text-lg rounded-2xl text-white bg-green-900 hover:opacity-80 hover:cursor-pointer" type="submit">
                        Submit
                    </button>
                )}
            </div>
        </form>
                            

     );
}
 
export default CreateGym;