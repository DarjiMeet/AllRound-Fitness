import { useState, useEffect } from "react";
import axios from "axios";
import { FaChevronDown, FaChevronUp, FaSearch, FaTrash } from "react-icons/fa";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

const Attendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedDate, setExpandedDate] = useState(null);
    const [addingSet, setAddingSet] = useState(null);
    const [newSet, setNewSet] = useState({ setNumber: "", reps: "", wt: "", unit: "kg" });
    const [addingExercise, setAddingExercise] = useState(null);
    const [newExercise, setNewExercise] = useState("");
    const [editingWeight, setEditingWeight] = useState(null);
    const [newWeight, setNewWeight] = useState("");
    const [startDate, setStartDate] = useState(""); 

    const { gymId } = useParams();

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const response = await axios.post(
                    "http://localhost:5000/api/user/getAttendance",
                    { gymId },
                    { withCredentials: true }
                );

                if (response.data.success) {
                    setAttendance(response.data.attendance);
                } else {
                    throw new Error(response.data.message);
                }
            } catch (err) {
                setError(err.response?.data?.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, []);

    const toggleDetails = (date) => {
        setExpandedDate(expandedDate === date ? null : date);
    };

    const openSetModal = (date, exerciseName) => {
        setAddingSet({ date, exerciseName });
        setNewSet({ setNumber: "", reps: "", wt: "", unit: "kg" });
    };

    const closeSetModal = () => {
        setAddingSet(null);
        setNewSet({ setNumber: "", reps: "", wt: "", unit: "kg" });
    };

    const handleAddSet = async () => {
        try {
            const response = await axios.post(
                "http://localhost:5000/api/user/addSet",
                { 
                    gymId, 
                    date: addingSet.date, 
                    exerciseName: addingSet.exerciseName, 
                    setNumber: newSet.setNumber, 
                    reps: newSet.reps, 
                    wt: newSet.wt, 
                    unit: newSet.unit 
                },
                { withCredentials: true }
            );

            if (response.data.success) {
                setAttendance((prev) =>
                    prev.map((entry) =>
                        entry.date === addingSet.date
                            ? {
                                ...entry,
                                workout: entry.workout.map((exercise) =>
                                    exercise.exerciseName === addingSet.exerciseName
                                        ? { ...exercise, set: [...exercise.set, { ...newSet }] }
                                        : exercise
                                ),
                            }
                            : entry
                    )
                );
                closeSetModal();
            } 
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add set");
        }
    };

    const handleAddExercise = async () => {
        try {
            const response = await axios.post(
                "http://localhost:5000/api/user/addExerciseName",
                { gymId, date: addingExercise, exerciseName: newExercise },
                { withCredentials: true }
            );

            if (response.data.success) {
                setAttendance((prev) =>
                    prev.map((entry) =>
                        entry.date === addingExercise
                            ? { ...entry, workout: [...entry.workout, { exerciseName: newExercise, set: [] }] }
                            : entry
                    )
                );
                closeExerciseModal();
            } 
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add exercise");
        }
    };

    const handleDateChange = (e) => {
        setStartDate(e.target.value);
    };

    const openExerciseModal = (date) => {
        setAddingExercise(date);
        setNewExercise("");
    };

    const closeExerciseModal = () => {
        setAddingExercise(null);
        setNewExercise("");
    };

    const openWeightModal = (date, weight) => {
        setEditingWeight(date);
        setNewWeight(weight || "");
    };

    const closeWeightModal = () => {
        setEditingWeight(null);
        setNewWeight("");
    };

    const handleSaveWeight = async () => {
        try {
            const response = await axios.post(
                "http://localhost:5000/api/user/addWeight",
                { gymId, date: editingWeight, weight: newWeight },
                { withCredentials: true }
            );

            if (response.data.success) {
                setAttendance((prev) =>
                    prev.map((entry) =>
                        entry.date === editingWeight ? { ...entry, weight: newWeight } : entry
                    )
                );
                closeWeightModal();
            } 
          
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update weight");
        }
    };

    const handleDeleteExercise = async ( date, exerciseName) => {
        try {
            const response = await axios.post(
                "http://localhost:5000/api/user/deleteExercise",
                { gymId, date, exerciseName },
                { withCredentials: true }
            );
    
            if (response.data.success) {
                setAttendance((prev) =>
                    prev.map((entry) =>
                        entry.date === date
                            ? { ...entry, workout: entry.workout.filter(exercise => exercise.exerciseName !== exerciseName) }
                            : entry
                    )
                );
            } 
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete exercise");
        }
    };

    const handleDeleteSet = async ( date, exerciseName, setNumber) => {
        try {
            const response = await axios.post(
                "http://localhost:5000/api/user/deleteSet",
                { gymId, date, exerciseName, setNumber },
                { withCredentials: true }
            );
    
            if (response.data.success) {
                setAttendance((prev) =>
                    prev.map((entry) =>
                        entry.date === date
                            ? {
                                  ...entry,
                                  workout: entry.workout.map((exercise) =>
                                      exercise.exerciseName === exerciseName
                                          ? {
                                                ...exercise,
                                                set: exercise.set.filter((s) => s.setNumber !== setNumber),
                                            }
                                          : exercise
                                  ),
                              }
                            : entry
                    )
                );
            } 
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete set");
        }
    };

    const filteredDate = attendance.filter((ad) => {
        const formattedAdDate = new Date(ad.date).toLocaleDateString('en-CA'); // 'YYYY-MM-DD' format
        const formattedStartDate = new Date(startDate).toLocaleDateString('en-CA'); // 'YYYY-MM-DD' format
        return startDate ? formattedAdDate === formattedStartDate : true;
    });
    return (
        <div className="mx-[20vw] p-6 rounded-lg bg-white relative">
            <div className="flex flex-row justify-between items-center"> 
                <h2 className="text-xl font-bold    ">Attendance</h2>
                <div className="flex flex-row items-center">
                    <input
                        type="date"
                        value={startDate}
                        onChange={handleDateChange} // Update search query on input change
                        placeholder="Search Event Name"
                        className="w-[250px] px-2 py-2 rounded-lg text-sm border border-gray-400 focus:outline-none text-black"
                    />
                </div>
            </div>

            {loading && <p className="text-gray-500">Loading...</p>}
            {error && <p className="text-gray-500">No attendance records available.  </p>}
            {!loading && !error && attendance.length === 0 && (
                <p className="text-gray-500">No attendance records available.</p>
            )}

            {filteredDate.map((entry, index) => (
                <div key={index} className="border-b py-2 mt-3">
                    <div
                        className="flex justify-between items-center cursor-pointer p-2 rounded-lg hover:bg-gray-100"
                        onClick={() => toggleDetails(entry.date)}
                    >
                        <span className="text-lg font-medium">
                            {new Date(entry.date).toLocaleDateString('en-GB')}
                        </span>
                        <div className="flex items-center space-x-2">
                            <span className="text-green-600 font-bold">Present</span>
                            {expandedDate === entry.date ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                    </div>

                    {expandedDate === entry.date && (
                        <div className="p-4 bg-gray-50 rounded-lg mt-2">
                            <div className="flex justify-between items-center">
                                <p className="font-medium text-[16px]">
                                    Your Weight: {entry.weight ? `${entry.weight} kg` : "Not recorded"}
                                </p>
                                <button
                                    onClick={() => openWeightModal(entry.date, entry.weight)}
                                    className="ml-2 bg-gray-500 text-white px-4 py-2 rounded text-sm"
                                >
                                    {entry.weight ? "Edit Weight" : "Add Weight"}
                                </button>
                            </div>

                            <h3 className="font-semibold mt-2 text-xl">Workout Details:</h3>
                            {entry.workout.length === 0 ? (
                                <p className="text-gray-500">No exercises recorded.</p>
                            ) : (
                                entry.workout.map((exercise, exIndex) => (
                                    <div key={exIndex} className="mt-2 mx-10">
                                        <div className="font-medium text-neutral-700 text-lg flex flex-row justify-between items-center hover:bg-neutral-200">
                                            <div>* {exercise.exerciseName}</div>
                                             <FaTrash size={16} className="text-red-500 cursor-pointer hover:text-red-700"
                                               onClick={() => handleDeleteExercise(entry.date, exercise.exerciseName)}/>
                                        </div>
                                        
                                        {exercise.set.length === 0 ? (
                                            <p className="text-gray-500 text-sm ml-4">No sets recorded.</p>
                                        ) : (
                                            <ul className="ml-4 list-disc text-sm text-gray-700">
                                                {exercise.set.map((set, setIndex) => (
                                                    <li key={setIndex} className="text-[16px] mx-4 flex flex-row justify-between items-center hover:bg-neutral-200">
                                                        <div>Set {set.setNumber}: {set.reps} reps × {set.wt} {set.unit}</div>
                                                        <FaTrash size={12} className="text-red-500 cursor-pointer hover:text-red-700"
                                                         onClick={() => handleDeleteSet( entry.date, exercise.exerciseName, set.setNumber)}/>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        <button
                                            onClick={() => openSetModal(entry.date, exercise.exerciseName)}
                                            className="mt-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm"
                                        >
                                            Add Set
                                        </button>
                                    </div>
                                ))
                            )}
                            <button
                                onClick={() => openExerciseModal(entry.date)}
                                className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
                            >
                                Add Exercise
                            </button>
                        </div>
                    )}
                </div>
            ))}

            {addingSet && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                        <h3 className="text-lg font-bold mb-3">Add Set</h3>

                        <input
                            type="number"
                            value={newSet.setNumber}
                            onChange={(e) => setNewSet({ ...newSet, setNumber: e.target.value })}
                            className="border rounded p-2 w-full mb-2"
                            placeholder="Set Number"
                        />
                        <input
                            type="number"
                            value={newSet.reps}
                            onChange={(e) => setNewSet({ ...newSet, reps: e.target.value })}
                            className="border rounded p-2 w-full mb-2"
                            placeholder="Reps"
                        />
                        <input
                            type="number"
                            value={newSet.weight}
                            onChange={(e) => setNewSet({ ...newSet, wt: e.target.value })}
                            className="border rounded p-2 w-full mb-2"
                            placeholder="Weight"
                        />

                        <select
                            value={newSet.unit}
                            onChange={(e) => setNewSet({ ...newSet, unit: e.target.value })}
                            className="border rounded p-2 w-full mb-4"
                        >
                            <option value="kg">Kilograms (kg)</option>
                            <option value="lbs">Pounds (lbs)</option>
                        </select>

                        <div className="flex justify-end space-x-2">
                            <button onClick={closeSetModal} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>
                            <button onClick={handleAddSet} className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">Submit</button>
                        </div>
                    </div>
                </div>
            )}

            {addingExercise && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                        <h3 className="text-lg font-bold mb-3">Add Exercise</h3>
                        <input
                            type="text"
                            value={newExercise}
                            onChange={(e) => setNewExercise(e.target.value)}
                            className="border rounded p-2 w-full mb-4"
                            placeholder="Enter exercise name"
                        />
                        <div className="flex justify-end space-x-2">
                            <button onClick={closeExerciseModal} className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>
                            <button onClick={handleAddExercise} className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">Submit</button>
                        </div>
                    </div>
                </div>
            )}

            {editingWeight && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                        <h3 className="text-lg font-bold mb-3">
                            {attendance.find((entry) => entry.date === editingWeight)?.weight
                                ? "Edit Weight"
                                : "Add Weight"}
                        </h3>
                        <input
                            type="number"
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                            className="border rounded p-2 w-full mb-4"
                            placeholder="Enter weight (kg)"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={closeWeightModal}
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveWeight}
                                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
