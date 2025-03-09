import mongoose from "mongoose"

const GymAnalyticsSchema = new mongoose.Schema({
    gymId: { type: String, required: true },
    totalMembers: { type: Number, required: true },
    totalActiveMembers: { type: Number, required: true },
    totalInactiveMembers: { type: Number, required: true },
    revenue: { type: Number, required: true },
    // membershipData: [{ month: String, members: Number }],
    // revenueData: [{ month: String, revenue: Number }],
    // eventData: [{ name: String, value: Number }]
});

const GymAnalytics = mongoose.model("GymAnalytics", GymAnalyticsSchema);
export default GymAnalytics