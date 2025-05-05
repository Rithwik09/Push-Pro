const ProjectServices = require("../../../services/project");
const ProjectScheduleServices = require("../../../services/project_schedule");
const NotificationService = require("../../../services/notification");
const UserServices = require("../../../services/user");
const {
  ValidationError,
  ServerError,
  UnauthorizedError
} = require("../../../errors/CustomError");
const catchAsyncError = require("../../../helpers/catch-async-error");

const checkAccess = (userId, contractorId) => {
  if (userId !== contractorId) {
    throw new UnauthorizedError("Not Authorized. Not your Schedule");
  }
};

const getCustomerSchedules = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const project = await ProjectServices.getProjectById(id);
    if (!project) throw new ValidationError("Project Not Found");
    const customer = await UserServices.getCustomer({
      id: userId
    });
    if (!customer) throw new ValidationError("Customer Not Found");
    checkAccess(userId, project.customer_id);
    const schedules = await ProjectScheduleServices.getAllSchedules({
      customer_id: userId
    });
    const schedulesArray = await Promise.all(
      schedules.map(async (schedule) => {
        const contractor = await UserServices.getContractor({
          id: schedule.contractor_id
        });
        return {
          ...schedule.dataValues,
          contractor_name: `${contractor.dataValues.first_name} ${contractor.dataValues.last_name}`
        };
      })
    );
    const data = {
      schedules: schedulesArray
    };
    res.status(200).json({
      success: true,
      data: data,
      message: "Project Schedule Fetched Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Customer Schedule Details : ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getProjectSchedules = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const body = req.body;
    const project = await ProjectServices.getProjectById(id);
    checkAccess(userId, project.customer_id);
    const { schedules, totalPage } = await ProjectScheduleServices.getSchedules(
      {
        pageNo: body.pageNo,
        limit: body.limit,
        search: body.search,
        condition: {
          project_id: id,
          customer_id: userId
        }
      }
    );
    const schedulesArray = schedules.map((schedule) => schedule.dataValues);
    const data = {
      schedules: schedulesArray,
      totalPage: totalPage
    };
    res.status(200).json({
      success: true,
      data: data,
      message: "Project Schedule Fetched Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Contractor Project Schedule Details : ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const createProjectSchedule = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.user.id;
    const { title, description, start_time, end_time } = req.body;
    const project = await ProjectServices.getProjectById(id);
    const payload = {
      project_id: id,
      contractor_id: project.contractor_id,
      customer_id: project.customer_id,
      created_by: userId,
      title: title,
      description: description,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      status: "Pending"
    };
    const schedule = await ProjectScheduleServices.createProjectSchedule(
      payload
    );
    const contractor = await UserServices.getContractor({
      id: project.contractor_id
    });
    const customer = await UserServices.getCustomer({
      id: userId
    });
    if (!schedule)
      throw new ValidationError("Project Schedule Creation Failed");
    const schedulesArray = [
      {
        ...schedule.dataValues,
        customer_name: `${customer.dataValues.first_name} ${customer.dataValues.last_name}`,
        contractor_name: `${contractor.dataValues.first_name} ${contractor.dataValues.last_name}`
      }
    ];
    const notification = await NotificationService.createNotification({
      user_id: project.contractor_id,
      type_id: 12,
      project_id: project.id,
      text: "Project meeting request created",
      link: `${process.env.BASE_URL_CONTRACTOR}/project-schedule/${project.id}/`,
      is_read: false
    });
    if (!notification) throw new NotFoundError("Notification Creation Failed.");
    res.status(200).json({
      success: true,
      data: schedulesArray,
      message: "Project Schedule Created Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Create Project Schedule: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const updateProjectSchedule = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.sid;
    const userId = req.user.id;
    const { title, description, start_time, end_time, status } = req.body;
    let schedule = await ProjectScheduleServices.getSchedule({ id: id });
    checkAccess(userId, schedule.created_by);
    const contractor = await UserServices.getContractor({
      id: schedule.contractor_id
    });
    // const newStatus = status ? status : schedule.status || "Pending";
    // if (
    //   status !== "Pending" ||
    //   status !== "Accepted" ||
    //   status !== "Rejected"
    // ) {
    //   throw new ValidationError("Invalid Status Value");
    // }
    const payload = {
      title: title ? title : schedule.title,
      description: description ? description : schedule.description,
      start_time: start_time ? new Date(start_time) : schedule.start_time,
      end_time: end_time ? new Date(end_time) : schedule.end_time,
      status: status ? status : schedule.status
    };
    schedule = await ProjectScheduleServices.updateProjectSchedule(payload, {
      id: id
    });
    if (!schedule) throw new ValidationError("Project Schedule Update Failed");
    schedule = await ProjectScheduleServices.getSchedule({ id: id });
    const schedulesArray = [
      {
        ...schedule,
        contractor_name: `${contractor.dataValues.first_name} ${contractor.dataValues.last_name}`
      }
    ];
    res.status(200).json({
      success: true,
      data: schedulesArray,
      message: "Project Schedule Updated Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Update Project Schedule: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const updateScheduleStatus = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.sid;
    const userId = req.user.id;
    const { status } = req.body;
    let schedule = await ProjectScheduleServices.getSchedule({ id: id });
    if (schedule.status === "Pending" && schedule.created_by !== userId) {
      const payload = {
        status: status
      };
      schedule = await ProjectScheduleServices.updateProjectSchedule(payload, {
        id: id
      });
      if (!schedule)
        throw new ValidationError("Project Schedule Update Failed");
      res.status(200).json({
        success: true,
        data: schedule,
        message: "Project Schedule Status Updated Successfully",
        errors: []
      });
    } else {
      throw new ValidationError("Project Schedule is Accepted or Rejected");
    }
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Update Project Schedule Status : ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const deleteProjectSchedule = catchAsyncError(async (req, res) => {
  try {
    const id = req.params.sid;
    const userId = req.user.id;
    let schedule = await ProjectScheduleServices.getSchedule({ id: id });
    checkAccess(userId, schedule.created_by);
    schedule = await ProjectScheduleServices.deleteProjectSchedule({ id: id });
    if (!schedule)
      throw new ValidationError(
        "Project Schedule Not Found or Already Deleted"
      );
    res.status(200).json({
      success: true,
      data: schedule,
      message: "Project Schedule Deleted Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Delete Project Schedule: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

const getDashboardSchedules = catchAsyncError(async (req, res) => {
  try {
    const userId = req.user.id;
    const contactorId = req.params.id;
    const user = await UserServices.getCustomerById({ id: userId });
    if (!user) throw new ValidationError("Customer Not Found");
    const contractor = await UserServices.getContractor({
      user_uuid: contactorId
    });
    if (!contractor) throw new ValidationError("Contractor Not Found");
    const schedules = await ProjectScheduleServices.getAllSchedules({
      customer_id: userId,
      contractor_id: contractor?.id
    });
    const currentTime = new Date();
    const schedulesArray = await Promise.all(
      schedules
        .filter(
          (schedule) =>
            schedule.status !== "Rejected" &&
            new Date(schedule.start_time) >= currentTime
        )
        .map(async (schedule) => {
          const customer = await UserServices.getContractor({
            id: schedule.contractor_id
          });
          return {
            ...schedule.dataValues,
            customer_name: `${customer.dataValues.first_name} ${customer.dataValues.last_name}`
          };
        })
    );
    const data = {
      schedules: schedulesArray
    };
    res.status(200).json({
      success: true,
      data: data,
      message: "Customer Schedules Fetched Successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Contractor Schedules: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getCustomerSchedules,
  getProjectSchedules,
  getDashboardSchedules,
  createProjectSchedule,
  updateProjectSchedule,
  updateScheduleStatus,
  deleteProjectSchedule
};
