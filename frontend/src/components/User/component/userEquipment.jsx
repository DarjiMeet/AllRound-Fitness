import { useNavigate, useParams } from "react-router-dom";
import { useGym } from "../userContext";
import { useState } from "react";
import { FaSearch, FaTrash } from "react-icons/fa";

const UserEquip = () => {
    const{gymId} = useParams()
    const {gym} = useGym()
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState(""); 

    const filteredEquip = gym.equipment.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    return ( 
        <div>
            <div className="mx-[20vw] my-7">
                <div className="flex flex-row items-center justify-between">
                    <div className="flex flex-row items-center">
                        <input
                            type="text"
                            placeholder="Search Equipment name"
                            className="w-[250px] px-2 py-2 rounded-lg text-sm border border-gray-400 focus:outline-none text-black"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}  // Step 3: Update the search query
                        />
                        <FaSearch size={18} className="text-black mx-3 cursor-pointer hover:opacity-80" />
                    </div>

                </div>

                <div className="mt-6">
                    {filteredEquip.length > 0 ? (  // Step 4: Display the filtered list
                        <>
                            <div className="grid grid-cols-4 gap-10 text-center font-semibold">
                                <div></div>
                                <div>Name</div>
                                <div>Quantity</div>
                            </div>

                            <div className="mt-2">
                                {filteredEquip.map((equip) => (
                                    <div className="flex justify-center mt-4" key={equip.name} onClick={()=>navigate(`/user/gym/${gymId}/equipment/${equip._id}`)}>
                                        <div className="grid grid-cols-4 gap-10 items-center text-center w-full hover:bg-neutral-100 hover:opacity-80">
                                            {/* Profile Picture */}
                                            <div>
                                                {equip?.photo ? (
                                                    <img src={equip.photo} alt={equip?.name} className="w-[80px] h-[80px] rounded-lg object-cover mx-auto" />
                                                ) : (
                                                    <img
                                                        src="/images/noPhoto.jpg"
                                                        alt="Equipment Preview"
                                                        className="rounded-lg w-[50px] h-[50px] object-cover mx-auto"
                                                    />
                                                )}
                                            </div>

                                            {/* Name */}
                                            <div className="text-gray-700 font-medium text-sm w-full truncate overflow-hidden">
                                                {equip?.name}
                                            </div>

                                            <div className="flex items-center justify-center">
                                                <span className="text-lg font-semibold w-8 text-center">{equip.quantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-neutral-500 mt-10 flex flex-row justify-center items-center">No Equipment found.</p>
                    )}
                </div>
            </div>
        </div>
     );
}
 
export default UserEquip;