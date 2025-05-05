const db = require("../../../../models");
const { ServerError } = require("../../../errors/CustomError");
const catchAsyncError = require("../../../helpers/catch-async-error");
const UserServices = require("../../../services/user");

const getCustomersWithMultipleContractors = catchAsyncError(
  async (req, res) => {
    try {
      const customerId = req.user.id;
      const contractors = await db.CustomersContractors.findAll({
        where: { customer_id: customerId },
        include: [
          {
            model: db.Users,
            as: "con2",
            attributes: [
              "id",
              "user_uuid",
              "first_name",
              "last_name",
              "email_address",
              "phone_no"
            ]
          }
        ],
        order: [["id", "DESC"]]
      });
      if (!contractors || contractors.length === 0) {
        res.status(200).json({
          success: true,
          data: [],
          message: "Contractor details not found",
          errors: []
        });
      }
      const contractorDetails = contractors.map((contractor) => ({
        id: contractor.con2.id,
        user_uuid: contractor.con2.user_uuid,
        firstName: contractor.con2.first_name,
        lastName: contractor.con2.last_name,
        email: contractor.con2.email_address,
        phoneNo: contractor.con2.phone_no
      }));
      res.status(200).json({
        success: true,
        data: contractorDetails,
        message: "Contractor details fetched successfully",
        errors: []
      });
    } catch (error) {
      const serverError = new ServerError(
        `Cannot Get Contractor Details: ${error.message}`
      );
      res.status(serverError.status).json(serverError.serializeError());
    }
  }
);

const getCustomersforContractor = catchAsyncError(async (req, res) => {
  try {
    const contractorId = req.user.id;
    const user = await UserServices.getContractorById({ id: contractorId });
    if (!user) throw new ServerError("Contractor not found");
    const customers = await UserServices.findAllRelationsByContractorId(
      contractorId
    );
    const customerCount = customers?.length || 0;
    res.status(200).json({
      success: true,
      data: customerCount,
      message: "Customer count fetched successfully",
      errors: []
    });
  } catch (error) {
    const serverError = new ServerError(
      `Cannot Get Contractor Details: ${error.message}`
    );
    res.status(serverError.status).json(serverError.serializeError());
  }
});

module.exports = {
  getCustomersWithMultipleContractors,
  getCustomersforContractor
};
