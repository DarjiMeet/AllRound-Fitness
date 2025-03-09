import axios from "axios";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AddEventForm = ({ open, setOpen, gymId, setActiveEvents}) => {

    const navigate = useNavigate()
    const [eventPage, setEventPage] = useState(1);
    const [formData, setFormData] = useState({
        name: "", description: "", userType: "",
        address: "", city: "", state: "", zipCode: "",
        startDate: null, startTime: "", endDate: null, endTime: "",
        contactForQuery: "", organizedBy: "", registrationEnds: null, MaxUser: "",
        priceMember: "", priceNon_member: "", displayPhoto: ""
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);
   
    
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
            const res = await axios.post("http://localhost:5000/api/owner/createEvent",{...formData,displayPhoto:uploadedImageUrl,gymId},{
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
                setOpen(!open)
                setActiveEvents((prev)=>[...prev,res.data.event])
                toast.success(res.data.message)

            }
        } catch (error) {
            console.error('Error:', error.message);
            const backendMessage = error.response?.data?.message
            toast.error(backendMessage)
        }
    };
    
    return open && (
        <form onSubmit={handleSubmit}>
            <div className="fixed inset-0 bg-black/60 bg-opacity-50 z-40"></div>
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white shadow-lg rounded-2xl p-6 w-[40vw] border border-gray-200">
                    <div className="flex flex-row justify-between items-center">
                        <h2 className="text-2xl font-medium text-black">Add Event</h2>
                        <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
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
    );
};

export default AddEventForm;