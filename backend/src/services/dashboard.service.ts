import User from "../models/User";
import CleaningService from "../models/CleaningService";
import CleaningBooking from "../models/CleaningBooking";
import ModificationItem from "../models/ModificationItem";
import RepairBooking from "../models/RepairBooking";
import CarrierRequest from "../models/CarrierRequest";

type DashboardRange = "today" | "all";

const getTodayDateFilter = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { $gte: start, $lt: end };
};

const sumFinalizedRevenue = async (
  model: typeof CleaningBooking | typeof RepairBooking,
  dateFilter?: Record<string, Date>,
) => {
  const [result] = await model.aggregate([
    {
      $match: {
        billStatus: "FINALIZED",
        ...(dateFilter ? { billFinalizedAt: dateFilter } : {}),
      },
    },
    { $group: { _id: null, total: { $sum: "$billTotal" }, count: { $sum: 1 } } },
  ]);

  return {
    total: result?.total ?? 0,
    finalizedBills: result?.count ?? 0,
  };
};

export const getDashboardMetrics = async (range: DashboardRange = "all") => {
  const dateFilter = range === "today" ? getTodayDateFilter() : undefined;
  const createdAtFilter = dateFilter ? { createdAt: dateFilter } : {};

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
    cleaningRevenue,
    repairRevenue,
  ] = await Promise.all([
    User.countDocuments({ role: "USER", ...createdAtFilter }),
    CleaningService.countDocuments({ isActive: true, ...createdAtFilter }),
    CleaningBooking.countDocuments(createdAtFilter),
    CleaningBooking.countDocuments({ status: "PENDING", ...createdAtFilter }),
    ModificationItem.countDocuments(createdAtFilter),
    ModificationItem.countDocuments({ isAvailable: true, ...createdAtFilter }),
    RepairBooking.countDocuments(createdAtFilter),
    RepairBooking.countDocuments({ status: "REQUESTED", ...createdAtFilter }),
    RepairBooking.countDocuments({ status: "ACCEPTED", ...createdAtFilter }),
    RepairBooking.countDocuments({ status: "COMPLETED", ...createdAtFilter }),
    CarrierRequest.countDocuments(createdAtFilter),
    CarrierRequest.countDocuments({
      status: { $in: ["REQUESTED", "ASSIGNED"] },
      ...createdAtFilter,
    }),
    sumFinalizedRevenue(CleaningBooking, dateFilter),
    sumFinalizedRevenue(RepairBooking, dateFilter),
  ]);

  return {
    range,
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
    revenue: {
      total: cleaningRevenue.total + repairRevenue.total,
      vehicleService: cleaningRevenue.total,
      repair: repairRevenue.total,
      finalizedBills:
        cleaningRevenue.finalizedBills + repairRevenue.finalizedBills,
    },
  };
};
