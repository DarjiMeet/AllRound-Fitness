import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";

const UserSignup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullname: "",
    UserName: "",
    email: "",
    mobile: "",
    password: "",
    confirmpassword: "",
    profilePic: "",
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  const handleDeleteImage = (e) => {
    e.preventDefault();
    setProfilePicture(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.fullname || !form.UserName || !form.email || !form.password || !form.confirmpassword) {
      return toast.error("Please fill in all required fields.");
    }

    if(form.password !== form.confirmpassword){
        return toast.error("Password does not match to confirmPassword");
    }

    setLoading(true);
    let uploadedImageUrl = form.profilePic;

    if (profilePicture) {
      const formData = new FormData();
      formData.append("file", profilePicture);
      formData.append("upload_preset", "a5amtbnt"); // Change to your Cloudinary upload preset

      try {
        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/ddwfq06lp/image/upload",
          formData
        );
        uploadedImageUrl = response.data.secure_url;
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Unable to upload image.");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await axios.post("http://localhost:5000/api/user/register", {
        ...form,
        profilePic: uploadedImageUrl,
      });

      if (res.data.success) {
        toast.success("Signup successful!");
        navigate("/user/login");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-cover bg-center relative" style={{ backgroundImage: "url('/images/background.jpg')" }}>
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      <div className="flex items-center justify-center min-h-screen bg-transparent z-20 relative w-[30vw] animate-slideIn">
        <div className="bg-gray-800 shadow-lg rounded-2xl py-2 px-8 max-w-sm w-full">
            <div className="flex flex-row items-center ">
                    <img
                        src="/images/gymlogo.png"
                        alt="placeholder"
                        className="w-[100px] rounded-2xl px-5 mb-4"
                    />
                    <h2 className="text-2xl font-bold text-center text-white mb-4">
                        User's Sign Up
                    </h2>
            </div>
          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-white">Full Name</label>
              <input type="text" name="fullname" className="w-full px-4 py-2 mt-2 border rounded-lg text-white" placeholder="Enter your Full Name" value={form.fullname} onChange={handleChange} />
            </div>

            {/* Username */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-white">Username</label>
              <input type="text" name="UserName" className="w-full px-4 py-2 mt-2 border rounded-lg text-white" placeholder="Enter your Username" value={form.UserName} onChange={handleChange} />
            </div>

            {/* Email */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-white">Email</label>
              <input type="email" name="email" className="w-full px-4 py-2 mt-2 border rounded-lg text-white" placeholder="Enter your Email" value={form.email} onChange={handleChange} />
            </div>

            {/* Mobile */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-white">Mobile</label>
              <input type="text" name="mobile" className="w-full px-4 py-2 mt-2 border rounded-lg text-white" placeholder="Enter your Mobile Number" value={form.mobile} onChange={handleChange} />
            </div>

            {/* Password */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-white">Password</label>
              <input type="password" name="password" className="w-full px-4 py-2 mt-2 border rounded-lg text-white" placeholder="Enter your Password" value={form.password} onChange={handleChange} />
            </div>

            {/* Confirm Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-white">Confirm Password</label>
              <input type="password" name="confirmpassword" className="w-full px-4 py-2 mt-2 border rounded-lg text-white" placeholder="Confirm your Password" value={form.confirmpassword} onChange={handleChange} />
            </div>

            {/* Profile Picture */}
            <div className="mb-2">
              <label className="block text-sm font-medium text-white">Profile Picture</label>

              <div className="flex flex-row justify-between items-center">
                <input type="file" accept="image/*" onChange={handleFileChange} className="w-[300px] px-2 py-1 mt-2 border rounded-lg bg-white text-black cursor-pointer" />
                <FaTrash 
                      size={15}
                      className="text-red-500 cursor-pointer hover:text-red-700 mt-2"
                      onClick={handleDeleteImage}
                  />
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none cursor-pointer">
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-4">
            Already have an account?{" "}
            <span className="text-gray-300 hover:underline hover:cursor-pointer" onClick={() => navigate("/user/login")}>
              Log In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserSignup;
