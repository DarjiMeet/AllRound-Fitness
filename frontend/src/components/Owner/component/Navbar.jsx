import { useEffect, useState } from "react";
import { FaSearch, FaUserCircle, FaUser, FaRegEnvelope, FaChartLine } from "react-icons/fa";
import { MdFitnessCenter } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import CreateGym from "../createGym";
import toast from "react-hot-toast";
import axios from "axios";

const Nav = ({ getGyms }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [create, setCreate] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredGyms, setFilteredGyms] = useState([]);

    // Toggle dropdown
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    // Handle Logout
    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:5000/api/owner/logout", {}, { withCredentials: true });
            toast.success("Logout successfully");
            navigate("/");
        } catch (error) {
            console.error(error);
            toast.error("Failed to log out");
        }
    };

    // Toggle Create Gym popup
    const togglePopup = () => {
        setCreate(!create);
    };

    // Search Functionality
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredGyms([]); // Reset when search is empty
        } else {
            setFilteredGyms(
                getGyms.filter((gym) =>
                    gym.gymName.toLowerCase().includes(searchTerm.toLowerCase()) // Case-insensitive search
                )
            );
        }
    }, [searchTerm, getGyms]);

    return (
        <>
            <nav className="flex flex-row px-3 py-3 items-center justify-around border-b-2 border-neutral-400 shadow-md bg-white">
                {/* Logo */}
                <div className="flex flex-row items-center hover:cursor-pointer hover:opacity-80">
                    <div className="text-2xl font-bold text-black" onClick={() => navigate("/owner/home")}>
                        All-Round<span className="text-gray-500">Fitness</span>
                    </div>
                </div>

                {/* Search Input */}
                <div className="relative flex flex-row items-center">
                    <input
                        type="text"
                        placeholder="Search your gym name"
                        className="w-[400px] px-4 py-2 rounded-3xl border border-gray-400 focus:outline-none text-black"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <FaSearch size={20} className="text-black mx-3 cursor-pointer hover:opacity-80" />

                    {/* Search Results Dropdown */}
                    {filteredGyms.length > 0 && (
                        <div className="absolute top-12 left-0 w-[400px] bg-white shadow-lg rounded-lg border border-gray-300 z-50">
                            <ul>
                                {filteredGyms.map((gym) => (
                                    <li
                                        key={gym.id}
                                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                                        onClick={() => {
                                            navigate(`/owner/gym/${gym.gymUniqueId}`);
                                            setSearchTerm(""); // Clear search after selection
                                        }}
                                    >
                                        {gym.gymName}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Create Gym Button */}
                <div
                    className="flex items-center flex-row text-lg font-semibold px-4 py-2 rounded-3xl hover:bg-neutral-300 hover:text-black cursor-pointer hover:opacity-80"
                    onClick={togglePopup}
                >
                    <MdFitnessCenter size={20} className="mr-2" />
                    <div>Create Gym</div>
                </div>

                {/* User Profile Dropdown */}
                <div className="relative">
                    <div className="flex flex-row px-3 py-2 items-center rounded-3xl hover:cursor-pointer hover:opacity-80" onClick={toggleDropdown}>
                        <FaUserCircle size={50} className="text-black ml-5" />
                    </div>

                    {isOpen && (
                        <div className="absolute bg-black text-white rounded-lg shadow-lg right-0 w-48">
                            <ul>
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex flex-row items-center">
                                    <FaUser size={15} className="mr-2" />
                                    <div>My Profile</div>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex flex-row items-center">
                                    
                                    <FaRegEnvelope size={15} className="mr-2" />
                                    <div>Messages</div>
                                </li>
                                <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer" onClick={handleLogout}>
                                    Logout
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </nav>

            {/* Create Gym Popup */}
            {create && (
                <>
                    {/* Dark Overlay */}
                    <div onClick={togglePopup} className="fixed inset-0 bg-black/60 bg-opacity-50 z-40"></div>

                    {/* Popup Box */}
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="bg-white shadow-lg rounded-2xl p-6 w-auto border border-gray-200 mx-5">
                            <div className="flex flex-row justify-between items-center">
                                <h2 className="text-2xl font-medium text-black">Create Your Gym</h2>
                                <button onClick={togglePopup} className="text-gray-400 hover:text-gray-600 focus:outline-none hover:cursor-pointer">
                                    ✕
                                </button>
                            </div>

                            <hr className="mt-2" />
                            <CreateGym />
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Nav;
