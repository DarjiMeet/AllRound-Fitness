import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaSearch, FaTrash, FaUserCircle } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { FaSearch, FaUserCircle, FaTrash } from 'react-icons/fa';

const MemberPage = ({ gymId }) => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [inActive, setInActive] = useState([]);
  const [openAddMember, setOpenAddMember] = useState(false);
  const [memberPage, setMemberPage] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    planName: "",
    duration: "",
    amountPaid: "",
    profileUrl: ""
  });
  const [startDate, setStartDate] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [active, setActive] = useState(true);
  const [search, setSearch] = useState("");

  // New states for sorting
  const [sortField, setSortField] = useState("endDate"); // default to sort by endDate
  const [sortOrder, setSortOrder] = useState("asc"); // ascending order

  useEffect(() => {
    if (!gymId) return;
    const fetchMember = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/owner/getMember",
          { gymId: gymId },
          { withCredentials: true }
        );

        if (response.data.success) {
          setMembers(response.data.activeMembers);
          setInActive(response.data.inactiveMembers);
        }
      } catch (error) {
        console.error("Error:", error.message);
        const backendMessage = error.response?.data?.message;
        toast.error(backendMessage);
      }
    };

    fetchMember();
  }, [gymId]);

  // Search handler
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const Next = (e) => {
    e.preventDefault();
    setMemberPage((prevPage) => prevPage + 1);
  };
  const Back = (e) => {
    e.preventDefault();
    setMemberPage((prevPage) => prevPage - 1);
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

    if (!formData.email || !formData.planName || !formData.duration || !formData.amountPaid || !startDate) {
      return toast.error("Required fields are empty");
    }

    let uploadedImageUrl = formData.profileUrl;

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
      const res = await axios.post(
        "http://localhost:5000/api/owner/addMember",
        { ...formData, profileUrl: uploadedImageUrl, startDate: startDate, gymId: gymId },
        { withCredentials: true }
      );

      if (res.data.success === true) {
        setFormData((prev) => ({
          ...prev,
          email: "",
          planName: "",
          duration: "",
          amountPaid: "",
          profileUrl: ""
        }));
        setOpenAddMember(!openAddMember);
        navigate(0);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error("Error:", error.message);
      const backendMessage = error.response?.data?.message;
      toast.error(backendMessage);
    }
  };

  const handleDeleteMember = async (memberEmail) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/owner/deleteMember",
        { gymId: gymId, email: memberEmail },
        { withCredentials: true }
      );
      if (response.data.success === true) {
        setMembers((prev) => prev.filter((member) => member.memberId.Email !== memberEmail));
        setInActive((prev) => prev.filter((member) => member.memberId.Email !== memberEmail));
        toast.success("Member deleted successfully");
      }
    } catch (error) {
      console.error("Error:", error.message);
      const backendMessage = error.response?.data?.message;
      toast.error(backendMessage);
    }
  };

  // Filter and sort active members based on search and sort criteria
  const filteredActiveMembers = members.filter((member) =>
    member.memberId.Email.toLowerCase().includes(search.toLowerCase())
  );
  const sortedActiveMembers = [...filteredActiveMembers].sort((a, b) => {
    const dateA = a[sortField] ? new Date(a[sortField]) : new Date(0);
    const dateB = b[sortField] ? new Date(b[sortField]) : new Date(0);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  // Filter and sort inactive members based on search and sort criteria
  const filteredInactiveMembers = inActive.filter((member) =>
    member.memberId.Email.toLowerCase().includes(search.toLowerCase())
  );
  const sortedInactiveMembers = [...filteredInactiveMembers].sort((a, b) => {
    const dateA = a[sortField] ? new Date(a[sortField]) : new Date(0);
    const dateB = b[sortField] ? new Date(b[sortField]) : new Date(0);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  return (
    <>
      <div className="mx-[20vw] my-7">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center">
            <input
              type="text"
              placeholder="Search Member by email"
              className="w-[250px] px-2 py-2 rounded-lg text-sm border border-gray-400 focus:outline-none text-black"
              value={search}
              onChange={handleSearch}
            />
            <FaSearch size={18} className="text-black mx-3 cursor-pointer hover:opacity-80" />

            {/* Sorting options */}
            <div className="flex items-center ml-4">
              <label className="mr-2 text-sm text-gray-700">Sort by:</label>
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded-lg"
              >
                <option value="startDate">Start Date</option>
                <option value="endDate">End Date</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="ml-2 px-2 py-1 border border-gray-300 rounded-lg"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>

          <button
            className="text-neutral-800 mt-2 mx-2 px-3 py-1 bg-neutral-300 rounded-lg hover:bg-neutral-200 cursor-pointer"
            onClick={() => setOpenAddMember(true)}
          >
            Add New Member
          </button>
        </div>

        <div className="mt-10 flex flex-row justify-center items-center">
          <div className="flex flex-row justify-center items-center border rounded-2xl w-[20vw]">
            <div
              className={`text-sm mr-2 border-r-2 border-black pr-2 hover:cursor-pointer ${
                active ? "text-blue-400" : "text-black"
              }`}
              onClick={() => setActive(true)}
            >
              Active Members
            </div>
            <div
              className={`text-sm hover:cursor-pointer ${!active ? "text-blue-400" : "text-black"}`}
              onClick={() => setActive(false)}
            >
              Inactive Members
            </div>
          </div>
        </div>

        {active && (
          <div className="mt-6">
            {sortedActiveMembers?.length > 0 ? (
              <div>
                <div className="grid grid-cols-[0.8fr_2fr_1fr_1fr_1fr_1fr_0.5fr] gap-10 text-center font-semibold text-lg">
                  <div>Profile</div>
                  <div>Email</div>
                  <div>Start</div>
                  <div>End</div>
                  <div>AmountPaid</div>
                  <div>Status</div>
                </div>

                <div className="mt-8">
                  {sortedActiveMembers.map((member) => (
                    <div className="flex justify-center mt-4" key={member.memberId.Email}>
                      <div className="grid grid-cols-[0.8fr_2fr_1fr_1fr_1fr_1fr_0.25fr] gap-10 items-center text-center w-full max-w-5xl hover:bg-neutral-100 hover:opacity-80 cursor-pointer"  onClick={()=>navigate(`/owner/gym/${gymId}/member/${member._id}`)}>
                        {/* Profile Picture */}
                        <div>
                          {member?.profilepic ? (
                            <img
                              src={member.profilepic}
                              alt={member?.memberId?.Fullname}
                              className="w-[50px] h-[50px] rounded-full object-cover mx-auto"
                            />
                          ) : (
                            <FaUserCircle size={50} className="text-black mx-auto" />
                          )}
                        </div>

                        {/* Email */}
                        <div className="text-gray-700 font-medium text-sm w-full truncate overflow-hidden">
                          {member.memberId.Email}
                        </div>

                        {/* Date (Formatted to YYYY-MM-DD) */}
                        <div className="text-gray-500 text-sm font-medium">
                          {new Date(member.startDate).toISOString().split("T")[0]}
                        </div>
                        <div className="text-gray-500 text-sm font-medium">
                          {new Date(member.endDate).toISOString().split("T")[0]}
                        </div>

                        {/* Amount Paid */}
                        <div className="text-gray-500 text-sm font-medium">₹{member.amountPaid}</div>

                        {/* Membership Status */}
                        <div className={`font-bold ${member.membershipStatus === "Active" ? "text-green-500" : "text-red-500"}`}>
                          {member.membershipStatus}
                        </div>
                        </div>

                        {/* Delete Icon */}
                        <span className="flex items-center">
                          <FaTrash
                            size={18}
                            className="text-red-500 cursor-pointer hover:text-red-700"
                            onClick={() => handleDeleteMember(member.memberId.Email)}
                          />
                        </span>
                     
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-neutral-500 mt-10 flex flex-row justify-center items-center">
                No Active members found.
              </p>
            )}
          </div>
        )}
        {!active && (
          <div className="mt-6">
            {sortedInactiveMembers?.length > 0 ? (
              <div>
                <div className="grid grid-cols-[.8fr_2fr_1fr_1fr_1fr_0.5fr] gap-10 text-center font-semibold text-lg">
                  <div>Profile</div>
                  <div>Email</div>
                  <div>Expires</div>
                  <div>AmountPaid</div>
                  <div>Status</div>
                </div>

                <div className="mt-8">
                  {sortedInactiveMembers.map((member) => (
                    <div className="flex justify-center mt-4" key={member.memberId.Email} >
                      <div className="grid grid-cols-[0.8fr_2fr_1fr_1fr_1fr_0.5fr] gap-10 items-center text-center w-full max-w-5xl hover:bg-neutral-100 hover:opacity-80" onClick={()=>navigate(`/owner/gym/${gymId}/member/${member._id}`)}>
                        {/* Profile Picture */}
                        <div>
                          {member?.profilepic ? (
                            <img
                              src={member.profilepic}
                              alt={member?.memberId?.Fullname}
                              className="w-[50px] h-[50px] rounded-full object-cover mx-auto"
                            />
                          ) : (
                            <FaUserCircle size={50} className="text-black mx-auto" />
                          )}
                        </div>

                        {/* Email */}
                        <div className="text-gray-700 font-medium text-sm w-full truncate overflow-hidden">
                          {member.memberId.Email}
                        </div>

                        {/* Date (Formatted to YYYY-MM-DD) */}
                        <div className="text-gray-500 text-sm font-medium">
                          {new Date(member.endDate).toISOString().split("T")[0]}
                        </div>

                        {/* Amount Paid */}
                        <div className="font-semibold text-green-600">₹{member.amountPaid}</div>

                        {/* Membership Status */}
                        <div className={`font-bold ${member.membershipStatus === "Active" ? "text-green-500" : "text-red-500"}`}>
                          {member.membershipStatus}
                        </div>
                        </div>
                        {/* Delete Icon */}
                        <span className="flex items-center">
                          <FaTrash
                            size={18}
                            className="text-red-500 cursor-pointer hover:text-red-700"
                            onClick={() => handleDeleteMember(member.memberId.Email)}
                          />
                        </span>
                      
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-neutral-500 mt-10 flex flex-row justify-center items-center">
                No Inactive members found.
              </p>
            )}
          </div>
        )}
      </div>

      {openAddMember && (
        <form onSubmit={handleSubmit}>
          <div className="fixed inset-0 bg-black/60 bg-opacity-50 z-40"></div>

          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white shadow-lg rounded-2xl p-6 w-[30vw] border border-gray-200">
              <div className="flex flex-row justify-between items-center">
                <h2 className="text-2xl font-medium text-black">Add Member</h2>
                <button
                  onClick={() => setOpenAddMember(!openAddMember)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none hover:cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <hr className="mt-2" />

              {memberPage === 1 && (
                <>
                  <div className="mb-4 mt-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter gym name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="planName" className="block text-sm font-medium text-gray-600 mb-1">
                      PlanName
                    </label>
                    <input
                      type="text"
                      id="planName"
                      name="planName"
                      value={formData.planName}
                      onChange={handleChange}
                      required
                      placeholder="Enter gym number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-600 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      required
                      placeholder="Enter gym email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-600 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      id="amountPaid"
                      name="amountPaid"
                      value={formData.amountPaid}
                      onChange={handleChange}
                      required
                      placeholder="Enter price"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-600 mb-1">
                      Start Date
                    </label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date) => setStartDate(date)}
                      dateFormat="yyyy-MM-dd"
                      placeholderText="Select a start date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {memberPage === 2 && (
                <>
                  <h2 className="text-xl font-bold text-gray-700 mb-4">Upload Profile Image</h2>

                  <div className="mb-4 flex flex-row items-center justify-between">
                    <input
                      type="file"
                      id="profilePicture"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none px-2 py-1 mr-3"
                    />
                    <FaTrash
                      size={15}
                      className="text-red-500 cursor-pointer hover:text-red-700"
                      onClick={handleDeleteImage}
                    />
                  </div>

                  {previewUrl ? (
                    <div className="mb-4">
                      <img
                        src={previewUrl}
                        alt="Profile Preview"
                        className="rounded-lg w-50 h-50 object-cover mx-auto"
                      />
                    </div>
                  ) : (
                    <div className="mb-4">
                      <img
                        src="/images/noPhoto.jpg"
                        alt="Profile Preview"
                        className="rounded-lg w-50 h-50 object-cover mx-auto"
                      />
                    </div>
                  )}
                </>
              )}

              <div className="flex flex-row justify-between mt-4">
                {memberPage !== 1 && (
                  <button
                    className="px-9 py-4 border-2 border-black text-lg rounded-2xl hover:opacity-80 hover:cursor-pointer"
                    onClick={Back}
                    type="button"
                  >
                    Back
                  </button>
                )}

                {memberPage !== 2 ? (
                  <button
                    className="px-9 py-4 border-2 border-black text-lg rounded-2xl text-white bg-black hover:opacity-80 hover:cursor-pointer"
                    onClick={Next}
                    type="button"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    className="px-7 py-4 border-2 border-green-900 text-lg rounded-2xl text-white bg-green-900 hover:opacity-80 hover:cursor-pointer"
                    type="submit"
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      )}
    </>
  );
};

export default MemberPage;
