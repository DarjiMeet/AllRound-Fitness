import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "./component/Navbar";
import { LuArrowLeft, LuPencil } from "react-icons/lu";

const GymMember = () => {
    const [Gyms, setGyms] = useState([]);
    const { gymId, memberId } = useParams();
    const [member, setMember] = useState([]);
    const [attendanceMarked, setAttendanceMarked] = useState(false);
    const [markingAttendance, setMarkingAttendance] = useState(false);
    const navigate = useNavigate();
    
    const todayDate = new Date().toLocaleDateString('en-GB'); // Format: YYYY-MM-DD

    useEffect(() => {
        const fetchGyms = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/owner/getGyms", {}, { withCredentials: true });
                if (response.data.success) setGyms(response.data.data);
            } catch (error) {
                toast.error("Unable to fetch your gyms");
            }
        };
        fetchGyms();
    }, []);

    useEffect(() => {
        const fetchMember = async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/owner/getSingleMember", { gymId, memberId }, { withCredentials: true });
                if (response.data.success) {
                    setMember(response.data.member);
                  // Check if attendance for today is already marked
                    const formattedTodayDate = new Date().toISOString().split("T")[0];

                  // Extract stored attendance dates and compare
                    const memberAttendance = response.data.member.attendance || [];
                    const isTodayMarked = memberAttendance.some(
                        (entry) => entry.date.split("T")[0] === formattedTodayDate
                    );

                    setAttendanceMarked(isTodayMarked);
                }
            } catch (error) {
                toast.error("Unable to fetch member details");
            }
        };
        fetchMember();
    }, [gymId, memberId]);

    const handleMarkAttendance = async () => {
      try {
        const response = await axios.post("http://localhost:5000/api/owner/markAttendance", {
          memberId,
          gymId,
        }, { withCredentials: true });
    
        if (response.data.success) {
          toast.success("Attendance marked successfully!");
          setAttendanceMarked(true);
          setMember(prev => ({ ...prev, totalAttendance: prev.totalAttendance + 1 })); // Update state
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Error marking attendance");
      }
    };

    return (
        <>
            <Nav getGyms={Gyms} />
            <div className="flex justify-center h-auto p-4">
                <div className="bg-gray-100 shadow-xl rounded-lg p-6 max-w-md w-full">
                    <div className="flex flex-row justify-between items-center">
                        <button className="flex items-center text-black hover:text-neutral-800 cursor-pointer" onClick={() => navigate(`/owner/gym/${gymId}`,{ state: { page: 2 } })}>
                            <LuArrowLeft size={24} /> Back
                        </button>
                    </div>

                    {member ? (
                        <>
                            <div className="flex flex-col justify-center items-center mt-2">
                                <img src={member.profilepic || "/images/noPhoto.jpg"} alt={member.memberId?.Fullname} className="w-60 h-60 object-cover rounded-lg mx-auto border-4 border-gray-300" />
                                <h2 className="text-2xl font-semibold">{member.memberId?.Fullname}</h2>
                            </div>
                            <div className="mt-4 text-gray-700 flex flex-col justify-center">
                                <p><strong>Email:</strong> {member.memberId?.Email}</p>
                                <p><strong>Contact:</strong> {member.memberId?.Mobile}</p>
                                <p><strong>Plan Name:</strong> {member.planName}</p>
                                <p><strong>Duration:</strong> {member.duration}</p>
                                <p><strong>Start Date:</strong> {member.startDate ? new Date(member.startDate).toISOString().split("T")[0] : "N/A"}</p>
                                <p><strong>End Date:</strong> {member.endDate ? new Date(member.endDate).toISOString().split("T")[0] : "N/A"}</p>
                                <div className={` ${member.membershipStatus === "Active" ? "text-green-600" : "text-red-600"}`}>
                                    <strong className="mt-4 text-neutral-700 mr-2">Membership:</strong>{member.membershipStatus}
                                </div>
                                <p><strong>Amount Paid:</strong> ₹{member.amountPaid}</p>

                                <p className="mt-2"><strong>Total Attendance:</strong> {member.totalAttendance}</p>
                            </div>

                            {/* Attendance Section */}
                            {member.membershipStatus === "Active" && (
                                <div className="mt-4">
                                    <p className="font-semibold text-lg">Today's Date: {todayDate}</p>

                                    {!attendanceMarked ? (
                                        markingAttendance ? (
                                            <div className="flex space-x-3 mt-2">
                                                <button 
                                                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 cursor-pointer"
                                                    onClick={handleMarkAttendance}
                                                >
                                                    Submit
                                                </button>
                                                <button 
                                                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 cursor-pointer"
                                                    onClick={() => setMarkingAttendance(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mt-2 cursor-pointer"
                                                onClick={() => setMarkingAttendance(true)}
                                            >
                                                Mark Attendance
                                            </button>
                                        )
                                    ) : (
                                        <button className="bg-green-600 font-semibold mt-2 text-white px-4 py-2">Attendance marked for today</button>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-500">Loading member details...</p>
                    )}
                </div>
            </div>
        </> 
    );
};

export default GymMember;
