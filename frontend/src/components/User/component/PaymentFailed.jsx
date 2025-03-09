import { useNavigate, useParams } from "react-router-dom";

const PaymentFailed = () => {
    const navigate = useNavigate()
    const {gymId} = useParams()
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
            <div className="bg-white p-6 rounded-2xl shadow-lg text-center max-w-md">
                <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
                <h2 className="text-2xl font-bold text-gray-800 mt-4">Payment Failed</h2>
                <p className="text-gray-600 mt-2">Oops! Something went wrong. Your payment was not successful.</p>
                <button className="mt-6 inline-block bg-green-500 text-white px-6 py-2 rounded-full text-lg font-medium hover:bg-green-600 transition cursor-pointer" onClick={()=>navigate(`/user/gym/${gymId}`)}>Go to Home</button>            
            </div>
        </div>
    );
}
 
export default PaymentFailed;
