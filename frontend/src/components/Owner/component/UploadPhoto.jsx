import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const UploadPhoto = ({gymId, setGetGyms, modal, setIsModalOpen}) => {

    const navigate = useNavigate()

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [photos,setPhotos] = useState({
        photo:"",
        name:""
    }) // Control modal visibility

  
  
    const handleFileChange = (event) => {
      event.preventDefault()
      const file = event.target.files[0];
      if (file) {
        const fileUrl = URL.createObjectURL(file);
        setSelectedFile(file);
        setPreviewUrl(fileUrl);
        setPhotos((prev)=>({
            ...prev,
            photo:fileUrl
        }))
      }
    };

    const handleDeleteImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    const handleChange = (e) => {
        e.preventDefault()
        const { name, value } = e.target;
        setPhotos({ ...photos, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault()

        let photoUrl;

        if (!selectedFile) {
            toast.error("Please select an image before uploading.");
            return;
        }

        if(selectedFile){
            const formdata = new FormData()
            formdata.append("file",selectedFile)
            formdata.append("upload_preset","a5amtbnt")

            try {
                const response = await axios.post(
                    "https://api.cloudinary.com/v1_1/ddwfq06lp/image/upload",
                    formdata
                )

                photoUrl = response.data.secure_url
            } catch (error) {
                console.error("Error uploading image:", error);
                toast.error("Unable to upload image")
                return;
            }
        }

        try {
            const res = await axios.post("http://localhost:5000/api/owner/addPhotos",{gymId,photo:photoUrl,name:photos.name},{
                withCredentials:true
            })

               toast.success('Photo uploaded successfully')
               setSelectedFile(null);
               setPreviewUrl(null);
               setPhotos((prev)=>({
                ...prev,
                photo:"",
                name:""
               }))

              setGetGyms((prev)=>({
                ...prev,
                photos:res.data.photos  
              }))
              setIsModalOpen(!modal)
 
        } catch (error) {
            toast.error('Error to upload image')
        }


    }
    return ( 
        <form onSubmit={handleSubmit}>
        <div className="p-4">
    
            {/* File Input */}
            <div className="flex flex-col">
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

                <input
                    type="text"
                    id="photo"
                    name="name"
                    value={photos.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter Phots Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                />
            </div>
    
            {/* Preview */}
            <div className="mb-4 mt-4">
            <img
                src={previewUrl || "/images/noPhoto.jpg"}
                alt="Profile Preview"
                className="rounded-lg w-full h-50 object-cover mx-auto cursor-pointer"
            />
            </div>

            <button className="px-4 py-2 rounded-lg bg-black text-white cursor-pointer hover:bg-neutral-700" type="submit">
                Submit
            </button>      
      </div>
      </form>
     );
}
 
export default UploadPhoto;