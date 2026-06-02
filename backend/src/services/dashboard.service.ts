import User from "../models/User";
import CleaningService from "../models/CleaningService";
import CleaningBooking from "../models/CleaningBooking";
import ModificationItem from "../models/ModificationItem";
import RepairBooking from "../models/RepairBooking";
import CarrierRequest from "../models/CarrierRequest";

export const getDashboardMetrics = async () => {
  const [
    totalUsers,
    totalCleaningServices,
    totalCleaningBookings,
    pendingCleaningBookings,
    totalModItems,
    availableModItems,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    totalCarrierRequests,
    activeCarrierRequests,
  ] = await Promise.all([
    User.countDocuments({ role: "USER" }),
    CleaningService.countDocuments({ isActive: true }),
    CleaningBooking.countDocuments(),
    CleaningBooking.countDocuments({ status: "PENDING" }),
    ModificationItem.countDocuments(),
    ModificationItem.countDocuments({ isAvailable: true }),
    RepairBooking.countDocuments(),
    RepairBooking.countDocuments({ status: "REQUESTED" }),
    RepairBooking.countDocuments({ status: "ACCEPTED" }),
    RepairBooking.countDocuments({ status: "COMPLETED" }),
    CarrierRequest.countDocuments(),
    CarrierRequest.countDocuments({
      status: { $in: ["REQUESTED", "ASSIGNED"] },
    }),
  ]);

  return {
    users: { total: totalUsers },
    cleaning: {
      active: totalCleaningServices,
      bookings: totalCleaningBookings,
      pending: pendingCleaningBookings,
    },
    modification: { total: totalModItems, available: availableModItems },
    repairs: {
      total: totalBookings,
      pending: pendingBookings,
      confirmed: confirmedBookings,
      completed: completedBookings,
    },
    carrier: { total: totalCarrierRequests, active: activeCarrierRequests },
  };
};
