import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Nav from "./component/Navbar";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { LuArrowLeft, LuPencil } from "react-icons/lu";
import { FaTrash } from "react-icons/fa";

const GymTrainer = () => {
  const { gymId, trainerId } = useParams();
  const navigate = useNavigate();
  
  const [Gyms, setGyms] = useState([]);
  const [trainer, setTrainer] = useState(null);
  const [editStep, setEditStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    role: "",
    experience: "",
    achievements: "",
    profilePicture: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchGyms = async () => {
      try {
        const response = await axios.post("http://localhost:5000/api/owner/getGyms", {}, { withCredentials: true });
        if (response.data.success) setGyms(response.data.data);
      } catch (error) {
        toast.error("Unable to fetch your gyms");
        console.error(error)
      }
    };
    fetchGyms();
  }, []);

  useEffect(() => {
    const fetchTrainer = async () => {
      try {
        const response = await axios.post("http://localhost:5000/api/owner/getSingleTrainer", { gymId, trainerId }, { withCredentials: true });
        if (response.data.success) {
          setTrainer(response.data.trainer);
          setFormData(response.data.trainer);
        }
      } catch (error) {
        toast.error("Unable to fetch trainer");
        console.error(error)
      }
    };
    fetchTrainer();
  }, [gymId, trainerId]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if(!formData.name || !formData.email || !formData.contactNumber || !formData.role){
        return toast.error("Required fields are empty")
     }

     let uploadedImageUrl = formData.profilePicture; 

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
      const response = await axios.put("http://localhost:5000/api/owner/updateTrainer", { gymId, trainerId, ...formData,profilePicture:uploadedImageUrl }, { withCredentials: true });
      if (response.data.success) {
        toast.success("Trainer details updated successfully!");
        setEditStep(0)
        setTrainer(response.data.trainer);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to update trainer details.");
      console.error(error)
    }
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

  return (
    <>
      <Nav getGyms={Gyms} />
      <div className="flex justify-center h-auto p-4">
        <div className="bg-gray-100 shadow-xl rounded-lg p-6 max-w-md w-full">
          <div className="flex flex-row justify-between items-center">
            <button className="flex items-center text-black hover:text-neutral-800 cursor-pointer" onClick={() => navigate(`/owner/gym/${gymId}`, {state:{page:3}})}>
              <LuArrowLeft size={24} /> Back
            </button>
            <button className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => setEditStep(1)}>
              <LuPencil size={20} /> Edit
            </button>
          </div>
          {trainer ? (
            <>
              <div className="flex flex-col justify-center items-center mt-2">
                <img src={trainer.profilePicture || "/images/noPhoto.jpg"} alt={trainer.name} className="w-60 h-60 object-cover rounded-lg mx-auto border-4 border-gray-300" />
                <h2 className="text-2xl font-semibold">{trainer.name}</h2>
                <p className="text-gray-600">{trainer.role}</p>
              </div>
              <div className="mt-4 text-gray-700 flex flex-col justify-center">
                <p><strong>Email:</strong> {trainer.email}</p>
                <p><strong>Contact:</strong> {trainer.contactNumber}</p>
                <p><strong>Experience:</strong> {trainer.experience || "-"}</p>
                <p><strong>Achievements:</strong> {trainer.achievements || "-"}</p>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Loading trainer details...</p>
          )}
        </div>
      </div>
      {editStep > 0 && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <div className="flex flex-row justify-between items-center">
                <h2 className="text-2xl font-medium text-black">Edit Trainer Details</h2>
                <button onClick={() => setEditStep(0)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col mt-3">
                {editStep === 1 && (
                    <>
                        <label htmlFor="name" className="font-semibold">
                            Trainer Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Trainer Name"
                            className="border p-2 rounded"
                        />

                        <label htmlFor="email" className="mt-4 font-semibold">
                            Trainer Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                            className="border p-2 rounded"
                        />

                        <label htmlFor="contactNumber" className="mt-4 font-semibold">
                            Trainer Number
                        </label>
                        <input
                            type="text"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleInputChange}
                            placeholder="Contact Number"
                            className="border p-2 rounded"
                        />

                        <label htmlFor="role" className="mt-4 font-semibold">
                            Trainer Role
                        </label>
                        <input
                            type="text"
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            placeholder="Role"
                            className="border p-2 rounded"
                        />

                        <label htmlFor="experience" className="mt-4 font-semibold">
                            Trainer Experience
                        </label>
                        <input
                            type="number"
                            name="experience"
                            value={formData.experience}
                            onChange={handleInputChange}
                            placeholder="Experience"
                            className="border p-2 rounded"
                        />

                        <label htmlFor="achievements" className="mt-4 font-semibold">
                            Trainer Achievements
                        </label>
                        <textarea
                            type="text"
                            name="achievements"
                            value={formData.achievements}
                            onChange={handleInputChange}
                            placeholder="Achievements"
                            className="border p-2 rounded"
                            rows={2}
                        ></textarea>
                        
                        <button type="button" onClick={() => setEditStep(2)} className="bg-blue-600 text-white px-4 py-2 rounded w-full mt-2 cursor-pointer hover:bg-blue-700">Next</button>
                    </>
                )}
                {editStep === 2 && (
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
                            <div className="flex flex-row justify-between items-center">
                                <button className="px-9 py-4 border-2 border-black text-lg rounded-2xl hover:opacity-80 hover:cursor-pointer" onClick={() => setEditStep(1)} type="button">
                                    Back
                                </button>
                                <button className="px-7 py-4 border-2 border-green-900 text-lg rounded-2xl text-white bg-green-900 hover:opacity-80 hover:cursor-pointer" type="submit">
                                    Submit
                                </button>
                            </div>
                    </>
                )}
            </form>
          </div>
        </div>
      )}
    </>
  );
};
export default GymTrainer;
