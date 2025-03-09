import React, { useState } from "react";
import {useNavigate} from 'react-router-dom'
import toast from "react-hot-toast";
import axios from "axios";

const SignUp = () => {

    const [values, setValues] = useState({
        fullname:'',
        email:'',
        mobile:'',
        password:'',
        confirmpassword:'',
    })

    const [verify, setVerify] = useState(false)
    
    const navigate = useNavigate()

    const handleLogo = ()=>{
        navigate("/")
    }

    const handleInput = (e)=>{
        const {id,value} = e.target
        setValues((prev)=>({
            ...prev,
            [id] : value
        }))
      
    }

    const handleSubmit = async(e)=>{
        e.preventDefault()
        if(values.password !== values.confirmpassword){
            return toast.error("Incorrect password")
        }
        try {
            const res = await axios.post('http://localhost:5000/api/owner/register',values)
            if(res.data.success === true){
                toast.success("Successfully Registered!")   
                setVerify(true)       
            }
        } catch (error) {
            console.error('Error:', error);
            const backendMessage = error.response?.data?.message
            toast.error(backendMessage)
        }

    }

    return ( 
    <div
        className="flex justify-center items-center h-screen bg-cover bg-center relative"
        style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
        {/* Background overlay */}
        <div className="absolute inset-0 bg-black/50 z-10"></div>
      
        {/* Conditional Rendering */}
        {verify === false   ? (
          <div className="flex items-center justify-center min-h-screen bg-transparent z-20 relative w-[30vw] animate-slideIn">
            <div className="bg-gray-800 shadow-lg rounded-2xl p-8 max-w-sm w-full">
              {/* Logo and Title */}
              <div className="flex flex-row items-center">
                <img
                  src="/images/gymlogo.png"
                  alt="placeholder"
                  className="w-[100px] rounded-2xl px-5 mb-6 hover:cursor-pointer"
                  onClick={handleLogo}
                />
                <h2 className="text-2xl font-bold text-center text-white mb-6">
                  Owner's Sign Up
                </h2>
              </div>
      
              {/* Signup Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="fullname"
                    className="block text-sm font-medium text-white"
                  >
                    FullName
                  </label>
                  <input
                    type="text"
                    id="fullname"
                    className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300 placeholder:text-gray-500 text-white"
                    placeholder="Enter your FullName"
                    value={values.fullname}
                    onChange={handleInput}
                    required
                  />
                </div>
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
                    onChange={handleInput}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="moblie"
                    className="block text-sm font-medium text-white"
                  >
                    Mobile
                  </label>
                  <input
                    type="text"
                    id="mobile"
                    className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300 placeholder:text-gray-500 text-white"
                    placeholder="Enter your mobile number"
                    value={values.mobile}
                    onChange={handleInput}
                    required
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
                    onChange={handleInput}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="confirmpassword"
                    className="block text-sm font-medium text-white"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmpassword"
                    className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300 placeholder:text-gray-500 text-white"
                    placeholder="Enter your password"
                    value={values.confirmpassword}
                    onChange={handleInput}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring focus:ring-blue-300 cursor-pointer"
                >
                  Sign Up
                </button>
              </form>
              <p className="text-sm text-center text-gray-600 mt-4">
                Already have an account?{" "}
                <span
                  className="text-gray-300 hover:underline hover:cursor-pointer"
                  onClick={() => navigate("/owner/login")}
                >
                  Log In
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-screen bg-transparent z-20 relative w-[30vw] animate-slideIn">
            <div className="bg-gray-800 shadow-lg rounded-2xl p-8 max-w-sm w-full text-center">
              <h2 className="text-2xl font-bold text-white mb-6">Check Your Email</h2>
              <p className="text-white mb-4">
                A verification email has been sent to your email address. Please check
                your inbox to verify your account.
              </p>
              <button
                onClick={() => setVerify(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Back to Signup
              </button>
            </div>
          </div>
        )}
    </div>
      
      
     );
}
 
export default SignUp;