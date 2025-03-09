import { useNavigate, useParams } from "react-router-dom";
import { useGym } from "../userContext";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import { useState } from "react";

const UserTrainer = () => {
    const navigate = useNavigate()
    const {gymId} = useParams()
    const {gym} = useGym()
    const [search, setSearch] = useState("");

    const filteredTrainer = gym.trainers.filter((trainer) =>
        trainer.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleSearch = (e) => {
        setSearch(e.target.value);
    };

    return ( 
        <div>
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
            </div>

            <div className="mt-6">
                {filteredTrainer?.length > 0 ?(
                    <div>
                        <div className="grid grid-cols-[.8fr_2fr_1fr_1fr] gap-10 text-center font-semibold text-lg ">
                            <div>Profile</div>
                            <div>Email</div>
                            <div>Name</div>
                            <div>Role</div>
                        </div>

                        <div className="mt-8">
                        {filteredTrainer.map((trainer) => 

                            <div className="flex justify-center mt-4 hover:cursor-pointer" key={trainer.email} onClick={()=>navigate(`/user/gym/${gymId}/trainer/${trainer._id}`)}>
                                <div className="grid grid-cols-[0.8fr_2fr_1fr_1fr] gap-10 items-center text-center w-full max-w-5xl hover:bg-neutral-100 hover:opacity-80">
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
                                        {trainer?.role}
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
        </div>
     );
}
 
export default UserTrainer;