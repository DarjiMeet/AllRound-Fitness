import { useNavigate, useParams } from "react-router-dom";

const PaymentSuccess = () => {
    const navigate = useNavigate()
    const {gymId} = useParams()
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-green-50">
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center max-w-md">
                <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
                </svg>
                <h2 className="text-2xl font-bold text-gray-800 mt-4">Payment Successful!</h2>
                <p className="text-gray-600 mt-2"> Your transaction was successful.</p>
                <button className="mt-6 inline-block bg-green-500 text-white px-6 py-2 rounded-full text-lg font-medium hover:bg-green-600 transition cursor-pointer" onClick={()=>navigate(gymId ? `/user/gym/${gymId}` : "/user/home")}>Go to Home</button>
            </div>
        </div>
    );
}
 
export default PaymentSuccess;
