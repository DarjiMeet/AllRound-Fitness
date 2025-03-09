import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const VerifyEmail = () => {
    const { token } = useParams(); // Extract the token from the URL
    const navigate = useNavigate();
    const [verificationStatus, setVerificationStatus] = useState(null); // null = loading, true = success, false = failure

    useEffect(() => {
        const verifyToken = async () => {
            try {
                // Replace this with your actual API call
                const response = await axios.post(`http://localhost:5000/api/owner/verify-email`,{token});
                if (response.data.success === true) {
                    setVerificationStatus(true); // Verification successful
                } else {
                    setVerificationStatus(false);
                  // Verification failed
                }
            } catch (error) {
                console.error("Error verifying token:", error);
                setVerificationStatus(false);
                const backendMessage = error.response?.data?.message
                toast.error(backendMessage)
            }
        };

        verifyToken();
    }, [token]);

    if (verificationStatus === null) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-800 text-white">
                <p className="text-lg font-semibold">Verifying your email...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
            {verificationStatus ? (
                <div className="bg-gray-900 p-8 rounded-lg shadow-lg text-center">
                    <h2 className="text-3xl font-bold mb-4">Email Verified Successfully!</h2>
                    <p className="mb-6 text-gray-400">
                        Your email has been verified. You can now proceed to log in.
                    </p>

                    <div className="flex flex-row justify-center mb-6">
                        <img src="/images/verified-icon.png" alt="check" className="w-[100px] "/>
                    </div>

                    <button
                        onClick={() => navigate("/owner/login")}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none cursor-pointer"
                    >
                        Go to Login
                    </button>
                </div>
            ) : (
                <div className="bg-gray-900 p-8 rounded-lg shadow-lg text-center">
                    <h2 className="text-3xl font-bold mb-4 text-red-500">Verification Failed!</h2>
                    <p className="mb-6 text-gray-400">
                        We couldn't verify your email. Please try again or contact support.
                    </p>
                    <button
                        onClick={() => navigate("/owner/signup")}
                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none hover:cursor-pointer"
                    >
                        Go Back to Sign Up
                    </button>
                </div>
            )}
        </div>
    );
};

export default VerifyEmail;
