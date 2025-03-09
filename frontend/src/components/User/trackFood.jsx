import { useState } from "react";
import axios from "axios";

const TrackFood = () => {
    const [query, setQuery] = useState("");
    const [foodResults, setFoodResults] = useState([]);

    const fetchFoodData = async () => {
        if (!query) return;
        try {
            const response = await axios.get(
                `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1`
            );
            setFoodResults(response.data.products.slice(0, 10)); // Get top 10 results
        } catch (error) {
            console.error("Error fetching food data:", error);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-4">
            <h1 className="text-xl font-bold mb-4">Track Your Food</h1>
            
            {/* Search Input */}
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search food..."
                className="border p-2 w-full mb-2"
            />
            <button 
                onClick={fetchFoodData} 
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
                Search
            </button>

            {/* Search Results */}
            <ul className="mt-4">
                {foodResults.map((food) => (
                    <li 
                        key={food.code} 
                        className="p-2 border-b cursor-pointer"
                    >
                        {food.product_name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TrackFood;
