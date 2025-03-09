import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const LogIn = () => {

     const [values, setValues] = useState({    
            email:'',
            password:'',

        })

    const navigate = useNavigate()

    const handleLogo = ()=>{
        navigate("/")
    }

    const handleChange = (e)=>{
        const {id,value} = e.target

        setValues((prev)=>({
            ...prev,
            [id]:value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        try {
            const response = await axios.post('http://localhost:5000/api/owner/login',values,{
                withCredentials:true
            })
             
            if(response.data.success === true){
                toast.success(response.data.message)
                navigate("/owner/home")
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
                        className="w-[100px] rounded-2xl px-5 mb-6 hover:cursor-pointer "
                        onClick={handleLogo}
                    />
                    <h2 className="text-2xl font-bold text-center text-white mb-6">
                        Owner's Log In
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
                        id="email"
                        className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300 placeholder:text-gray-500 text-white"
                        placeholder="Enter your email"
                        value={values.email}
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
                        id="password"
                        className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300 placeholder:text-gray-500 text-white"
                        placeholder="Enter your password"
                        value={values.password}
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
                    <span className="text-gray-300 hover:underline hover:cursor-pointer" onClick={()=>navigate("/owner/signup")}>
                        Sign Up
                    </span>
                </p>
            </div>
        </div>
      </div>
     );
}
 
export default LogIn;