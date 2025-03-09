import React from "react";
import {useNavigate} from 'react-router-dom'

function App() {

  const navigate = useNavigate()

  const handleUser = ()=>{
    navigate("/user/login")
  }
  const handleOwner = ()=>{
    navigate("/owner/login")
  }

  return (
    <>
      <div
        className="flex justify-center items-center h-screen bg-cover bg-center relative"
        style={{ backgroundImage: "url('/images/background.jpg')" }}
      >
        
        <div className="absolute inset-0 bg-black/50 z-10" ></div>
       
        <div className="flex flex-col z-20 animate-slideIn">
                <div className="flex flex-row items-center ">
                    <img
                        src="/images/gymlogo.png"
                        alt="placeholder"
                        className="w-[100px] rounded-2xl px-2 mb-5"
                    />
                    <h1 className="text-white text-4xl text-center font-bold mb-5 ">Welcome To All-RoundFitness</h1>
                </div>
       
           
        
          <div className="z-20 flex flex-row justify-evenly bg-white/0 rounded-lg p-6 shadow-lg">
            
            <div className="flex flex-col mx-16 items-center hover:bg-white hover:rounded-2xl hover:cursor-pointer"
            onClick={handleUser}>
              <img
                src="/images/user.jpg"
                alt="placeholder"
                className="w-[150px] rounded-2xl"
              />
              <h3 className="font-semibold text-center mt-4 text-2xl bg-white px-3 py-1 rounded-2xl">User</h3>
            </div>
            <div className="flex flex-col mx-16 items-center  hover:bg-white hover:rounded-2xl  hover:cursor-pointer"
            onClick={handleOwner}>
              <img
                src="/images/owner.jpg"
                alt="placeholder"
                className="w-[150px]  rounded-2xl"
              />
              <h3 className="font-semibold text-center mt-4 text-2xl bg-white px-3 py-1 rounded-2xl">Owner</h3>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}

export default App
