import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaSearch, FaTrash, FaUserCircle } from "react-icons/fa"
import { useNavigate } from "react-router-dom";

const Equipment = ({ gymId }) => {
    const navigate = useNavigate();
    const [equip, setEquip] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");  // Step 1: Add search query state
    const [openAdd, setOpenAdd] = useState(false);
    const [formData, setFormData] = useState({
        imageUrl: "",
        equipName: "",
        quantity: ""
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const decreaseQuantity = async (name) => {
        try {
            const response = await axios.post("http://localhost:5000/api/owner/decreaseQuantity", { gymId: gymId, name: name }, {
                withCredentials: true
            });

            if (response.data.success) {
                setEquip((prevEquipments) =>
                    prevEquipments.map((equip) =>
                        equip.name === name ? { ...equip, quantity: equip.quantity - 1 } : equip
                    )
                );
            }
        } catch (error) {
            toast.error('Unable to decrease quantity');
        }
    };

    const increaseQuantity = async (name) => {
        try {
            const response = await axios.post("http://localhost:5000/api/owner/increaseQuantity", { gymId: gymId, name: name }, {
                withCredentials: true
            });

            if (response.data.success) {
                setEquip((prevEquipments) =>
                    prevEquipments.map((equip) =>
                        equip.name === name ? { ...equip, quantity: equip.quantity + 1 } : equip
                    )
                );
            }
        } catch (error) {
            toast.error('Unable to increase quantity');
        }
    };

    useEffect(() => {
        if (!gymId) return;
        const fetchMember = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/owner/getEquipments", { gymId: gymId }, {
                    withCredentials: true
                });

                if (response.data.success) {
                    setEquip(response.data.equipments);
                }
            } catch (error) {
                toast.error("Error fetching members");
            }
        };

        fetchMember();
    }, [gymId]);

    const handleDeleteEquipment = async (name) => {
        try {
            const response = await axios.post("http://localhost:5000/api/owner/deleteEquipment", { gymId: gymId, equipName: name }, {
                withCredentials: true
            });
            if (response.data.success === true) {
                setEquip((prev) => prev.filter((equip) => equip.name !== name));
                toast.success("Equipment deleted successfully");
            }
        } catch (error) {
            console.error('Error:', error.message);
            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value, // Ensure value is updated correctly
        });
    };

    const handleFileChange = (event) => {
        event.preventDefault();
        const file = event.target.files[0];
        if (file) {
            setProfilePicture(file);
            const preview = URL.createObjectURL(file);
            setPreviewUrl(preview);
        }
    };

    const handleDeleteImage = (e) => {
        e.preventDefault();
        setProfilePicture(null);
        setPreviewUrl(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent form submission refresh

        if (!formData.equipName || !formData.quantity) {
            return toast.error("Required fields are empty");
        }

        let uploadedImageUrl = formData.imageUrl;

        if (profilePicture) {
            const formdata = new FormData();
            formdata.append("file", profilePicture);
            formdata.append("upload_preset", "a5amtbnt");

            try {
                const response = await axios.post(
                    "https://api.cloudinary.com/v1_1/ddwfq06lp/image/upload",
                    formdata
                );

                uploadedImageUrl = response.data.secure_url;
            } catch (error) {
                console.error("Error uploading image:", error);
                toast.error("Unable to upload image");
            }
        }

        try {
            const res = await axios.post("http://localhost:5000/api/owner/addEquipments", { ...formData, imageUrl: uploadedImageUrl, gymUniqueId: gymId }, {
                withCredentials: true
            });

            if (res.data.success === true) {
                setFormData((prev) => ({
                    ...prev,
                    imageUrl: "",
                    equipName: "",
                    quantity: ""
                }));
                setOpenAdd(!openAdd);
                setEquip(res.data.equipment);
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error('Error:', error.message);
            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage);
        }
    };

    // Step 2: Filter the equipment list based on the search query
    const filteredEquip = equip.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
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

                    <button className="text-neutral-800 mt-2 mx-2 px-3 py-1 bg-neutral-300 rounded-lg hover:bg-neutral-200 cursor-pointer" onClick={() => setOpenAdd(true)}>Add New Equipment</button>
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
                                    <div className="flex justify-center mt-4" key={equip.name}>
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
                                                <button className="px-3 py-1  hover:bg-gray-300 text-xl" onClick={() => decreaseQuantity(equip.name)}>-</button>
                                                <span className="text-lg font-semibold w-8 text-center">{equip.quantity}</span>
                                                <button className="px-3 py-1  hover:bg-gray-300 text-xl" onClick={() => increaseQuantity(equip.name)}>+</button>
                                            </div>

                                            {/* Delete Icon */}
                                            <div>
                                                <FaTrash size={18} className="text-red-500 cursor-pointer hover:text-red-700"
                                                    onClick={() => handleDeleteEquipment(equip.name)} />
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

            {openAdd && (
                <form onSubmit={handleSubmit}>
                    <div className="fixed inset-0 bg-black/60 bg-opacity-50 z-40"></div>

                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="bg-white shadow-lg rounded-2xl p-6 w-[30vw] border border-gray-200">
                            <div className="flex flex-row justify-between items-center">
                                <h2 className="text-2xl font-medium text-black">Add Equipment</h2>
                                <button
                                    onClick={() => setOpenAdd(!openAdd)}
                                    className="text-gray-400 hover:text-gray-600 focus:outline-none hover:cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <hr className="mt-2" />

                            <div className="mb-4 mt-4">
                                <label
                                    htmlFor="equipName"
                                    className="block text-sm font-medium text-gray-600 mb-1"
                                >
                                    Equipment Name
                                </label>
                                <input
                                    type="text"
                                    id="equipName"
                                    name="equipName"
                                    value={formData.equipName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter trainer name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Gym Email */}
                            <div className="mb-4">
                                <label
                                    htmlFor="quantity"
                                    className="block text-sm font-medium text-gray-600 mb-1"
                                >
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter quantity"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="image"
                                    className="block text-sm font-medium text-gray-600 mb-1"
                                >
                                    Image
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {previewUrl && (
                                    <div className="mt-2">
                                        <img src={previewUrl} alt="Preview" className="w-[50px] h-[50px] object-cover" />
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="mt-4 w-full px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
                            >
                                Add Equipment
                            </button>
                        </div>
                    </div>
                </form>
            )}
        </>
    );
};

export default Equipment;
