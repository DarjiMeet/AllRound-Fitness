import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const UserLogin = () => {
    const navigate = useNavigate()

    const [form, setForm] = useState({
        Email:'',
        password:''
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
          ...prev,
          [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const res = await axios.post("http://localhost:5000/api/user/login", form,{
                withCredentials: true
              });
        
            if (res.data.success) {
                toast.success("Login successful!");
                navigate("/user/home");
            }
        } catch (error) {
            console.error('Error:', error.message);
            const backendMessage = error.response?.data?.message
            toast.error(backendMessage)
        }
    }
    return ( 
        <div
        className="flex justify-center items-center h-screen bg-cover bg-center relative"
        style={{ backgroundImage: "url('/images/background.jpg')" }}
      >
        
        <div className="absolute inset-0 bg-black/50 z-10" ></div>
        <div className="flex items-center justify-center min-h-screen bg-transparent z-20 relative w-[30vw] animate-slideIn">
            <div className="bg-gray-800 shadow-lg rounded-2xl p-8 max-w-sm w-full">
                <div className="flex flex-row items-center ">
                    <img
                        src="/images/gymlogo.png"
                        alt="placeholder"
                        className="w-[100px] rounded-2xl px-5 mb-6"
                    />
                    <h2 className="text-2xl font-bold text-center text-white mb-6">
                        User's Log In
                    </h2>
                </div>
             
                <form onSubmit={handleSubmit}>
            
                    <div className="mb-4">
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-white"
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        name="Email"
                        className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300 placeholder:text-gray-500 text-white"
                        placeholder="Enter your email"
                        value={form.Email}
                        onChange={handleChange}
                    />
                    </div>
                    
                
                    <div className="mb-4">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-white"
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300 placeholder:text-gray-500 text-white"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                    />
                    </div>

            
                    <button
                    type="submit"
                    className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring focus:ring-blue-300 cursor-pointer"
                    >
                    Log In
                    </button>
                </form>
                <p className="text-sm text-center text-gray-600 mt-4">
                    Create account?{" "}
                    <span className="text-gray-300 hover:underline hover:cursor-pointer" onClick={()=>navigate('/user/signup')}>
                        Sign Up
                    </span>
                </p>
            </div>
        </div>
      </div>
     );
}
 
export default UserLogin;