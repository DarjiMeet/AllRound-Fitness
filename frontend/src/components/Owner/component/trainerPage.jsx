import axios from "axios";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";
import { FaSearch, FaTrash, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const TrainerPage = ({gymId}) => {

    const navigate = useNavigate()
    const [trainer, setTrainer] = useState([])
    const [openAddTrainer, setOpenAddTriner] = useState(false)
    const [trianerPage, setTrainerPage] = useState(1)
    const [formData,setFormData] = useState({
        trainerName:"",
        trainerEmail:"",
        trainerNumber:"",
        role:"",
        profileUrl:""
    })
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(()=>{
        if(!gymId) return
        const fetchTrainer = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/owner/getTrainer",{gymId:gymId},{
                    withCredentials:true
                })

                if(response.data.success){
                    setTrainer(response.data.trainers)
                }
            } catch (error) {
                toast.error("Error fetching trainer")
            }
        }

        fetchTrainer()
    },[gymId])

    const Next = (e)=>{
        e.preventDefault()
        setTrainerPage(prevPage => prevPage + 1)
    }
    const Back = (e)=>{
        e.preventDefault()
        setTrainerPage(prevPage => prevPage - 1)
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value, // Ensure value is updated correctly
        });
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

    const handleSearch = (e) => {
        setSearch(e.target.value);
      };

    const handleSubmit = async(event) => {
        event.preventDefault(); // Prevent form submission refresh
        
        if(!formData.trainerName || !formData.trainerEmail || !formData.trainerNumber || !formData.role){
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
            const res = await axios.post("http://localhost:5000/api/owner/addTrainers",{...formData,profileUrl:uploadedImageUrl,gymId:gymId},{
                withCredentials:true
            })

            if(res.data.success === true){               
                setFormData((prev)=>({
                    ...prev,
                    trainerName:"",
                    trainerEmail:"",
                    trainerNumber:"",
                    role:"",
                    profileUrl:""
                }))
                setOpenAddTriner(!openAddTrainer)
                setTrainer(res.data.trainers)
                toast.success(res.data.message)

            }
        } catch (error) {
            console.error('Error:', error.message);
            const backendMessage = error.response?.data?.message
            toast.error(backendMessage)
        }

        
    };
    const filteredTrainer = trainer.filter((trainer) =>
       trainer.email.toLowerCase().includes(search.toLowerCase())
      );

    const handleDeleteTrainer = async (Email) => {
        try {
            const response = await axios.post("http://localhost:5000/api/owner/deleteTrainer",{gymId:gymId,Email:Email},{
                withCredentials:true
            })
            if(response.data.success === true){               
                setTrainer((prev) => prev.filter((trainer) => trainer.email !== Email))

                toast.success("trainer deleted successfully")

            }
        } catch (error) {
            console.error('Error:', error.message);
            const backendMessage = error.response?.data?.message
            toast.error(backendMessage)
        }

    }
    return ( 
        <>
        <div className="mx-[20vw] my-7">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row items-center">
                     <input
                        type="text"
                        placeholder="Search Trainer by email"
                        value={search}
                        onChange={handleSearch}
                        className="w-[250px] px-2 py-2 rounded-lg text-sm border border-gray-400 focus:outline-none text-black"
                    />
                    <FaSearch size={18} className="text-black mx-3 cursor-pointer hover:opacity-80"/>
                </div>

                <button className="text-neutral-800 mt-2 mx-2 px-3 py-1 bg-neutral-300 rounded-lg  hover:bg-neutral-200 cursor-pointer" onClick={()=>setOpenAddTriner(!openAddTrainer)}>Add Trainer</button>
            </div>

            <div className="mt-6">
                {filteredTrainer?.length > 0 ?(
                    <div>
                        <div className="grid grid-cols-[.8fr_2fr_1fr_1fr_1fr_0.5fr] gap-10 text-center font-semibold text-lg ">
                            <div>Profile</div>
                            <div>Email</div>
                            <div>Name</div>
                            <div>Number</div>
                            <div>Role</div>
                        </div>

                        <div className="mt-8">
                        {filteredTrainer.map((trainer) => 

                            <div className="flex justify-center mt-4 hover:cursor-pointer" key={trainer.email} onClick={()=>navigate(`/owner/gym/${gymId}/trainer/${trainer._id}`)}>
                                <div className="grid grid-cols-[0.8fr_2fr_1fr_1fr_1fr_0.5fr] gap-10 items-center text-center w-full max-w-5xl hover:bg-neutral-100 hover:opacity-80">
                                    {/* Profile Picture */}
                                    <div>
                                        {trainer?.profilePicture ? (
                                            <img src={trainer.profilePicture} alt={trainer?.name} className="w-[50px] h-[50px] rounded-full object-cover mx-auto"/>
                                        ) : (
                                            <FaUserCircle size={50} className="text-black mx-auto"/>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="text-gray-700 font-medium text-sm w-full truncate overflow-hidden">
                                        {trainer?.email}
                                    </div>

                                    <div className="text-gray-700 font-medium text-sm w-full truncate overflow-hidden">
                                        {trainer?.name}
                                    </div>

                                    
                                    <div className="text-gray-700 font-medium text-sm w-full truncate overflow-hidden">
                                        {trainer?.contactNumber}
                                    </div>

                                    <div className="text-gray-700 font-medium text-sm w-full truncate overflow-hidden">
                                        {trainer?.role}
                                    </div>

                                    {/* Delete Icon */}
                                    <div>
                                        <FaTrash size={18} className="text-red-500 cursor-pointer hover:text-red-700"
                                        onClick={()=>handleDeleteTrainer(trainer.email)}/>
                                    </div>
                                </div>
                            </div>
                                                    
                        )}
                        </div>

                        
                    </div>
                ):(
                    <p className="text-neutral-500 mt-10 flex flex-row justify-center items-center">No trainer found.</p>
                )}
            </div>

        </div>

        {openAddTrainer && (
            <form onSubmit={handleSubmit}>
                <div
                    className="fixed inset-0 bg-black/60 bg-opacity-50 z-40"
                ></div>

                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-white shadow-lg rounded-2xl p-6 w-[30vw] border border-gray-200">
                        <div className="flex flex-row justify-between items-center">
                            <h2 className="text-2xl font-medium text-black">Add Trainer</h2>
                            <button
                            onClick={()=>setOpenAddTriner(!openAddTrainer)}
                            className="text-gray-400 hover:text-gray-600 focus:outline-none hover:cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <hr className="mt-2"/>

                        {trianerPage === 1 && (
                        <>
            
                            {/* Gym Name */}
                            <div className="mb-4 mt-4">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-600 mb-1"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="trainerEmail"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter trainer email"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            </div>

                            {/* Gym Number */}
                            <div className="mb-4">
                            <label
                                htmlFor="trainerName"
                                className="block text-sm font-medium text-gray-600 mb-1"
                            >
                                Name
                            </label>
                            <input
                                type="text"
                                id="trainerName"
                                name="trainerName"
                                value={formData.trainerName}
                                onChange={handleChange}
                                required
                                placeholder="Enter trainer name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            </div>

                            {/* Gym Email */}
                            <div className="mb-4">
                            <label
                                htmlFor="trainerNumber"
                                className="block text-sm font-medium text-gray-600 mb-1"
                            >
                                Number
                            </label>
                            <input
                                type="text"
                                id="trainerNumber"
                                name="trainerNumber"
                                value={formData.duration}
                                onChange={handleChange}
                                required
                                placeholder="Enter trainer number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                            <label
                                htmlFor="role"
                                className="block text-sm font-medium text-gray-600 mb-1"
                            >
                                Role
                            </label>
                            <input
                                type="text"
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                placeholder="ex: Floor trainer, Personal trainer"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            </div>


                        </>
                        )}

                        {trianerPage === 2 && (
                            <>
                                <h2 className="text-xl font-bold text-gray-700 mb-4">
                                    Upload Profile Image
                                </h2>
         
                            {/* File Input */}
                            <div className="mb-4 flex flex-row items-center justify-between">
                            <input
                                type="file"
                                id="profilePicture"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none px-2 py-1 mr-3"
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
                                className="rounded-lg w-50 h-50 object-cover mx-auto"
                                />
                            </div>
                            ):(
                            <div className="mb-4">
                
                                <img
                                src="/images/noPhoto.jpg"
                                alt="Profile Preview"
                                className="rounded-lg w-50 h-50 object-cover mx-auto"
                                />
                            </div>
                            )}
                         </>
                        )}

                        <div className="flex flex-row justify-between mt-4">
                            {trianerPage !== 1 && (
                                <button className="px-9 py-4 border-2 border-black text-lg rounded-2xl hover:opacity-80 hover:cursor-pointer" onClick={Back} type="button">
                                    Back
                                </button>
                            )}

                            {trianerPage !==2 ?(
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
 
export default TrainerPage;