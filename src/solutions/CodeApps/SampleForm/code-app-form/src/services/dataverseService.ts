import type { FormModel } from "../models/FormModel";

export const saveRecord = async (
  data: FormModel
): Promise<void> => {

  try {

    console.log("Saving Data to Dataverse...");

    console.log(data);

    /*
      Example Dataverse Create Record

      await Xrm.WebApi.createRecord(
        "new_employee",
        {
          new_firstname: data.firstName,
          new_lastname: data.lastName,
          new_email: data.email,
          new_phone: data.phone,
          new_city: data.city,
          new_country: data.country,
          new_department: data.department,
          new_employeeid: data.employeeId
        }
      );
    */

    // Temporary simulation
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Record saved successfully.");

  } catch (error) {

    console.error(
      "Error while saving record:",
      error
    );

    throw error;
  }
};
