import {
  Button,
  Card,
  CardHeader,
  Field,
  Input,
  makeStyles,
  Text
} from "@fluentui/react-components";
import type { InputOnChangeData } from "@fluentui/react-components";

import { useState } from "react";
import type { FormModel } from "../models/FormModel";
import { saveRecord } from "../services/dataverseService";

const useStyles = makeStyles({
  container: {
    maxWidth: "700px",
    margin: "40px auto",
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  buttonContainer: {
    marginTop: "20px"
  }
});

export default function UserForm() {
  const styles = useStyles();

  const [formData, setFormData] = useState<FormModel>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
    department: "",
    employeeId: ""
  });

  const handleChange = (
    fieldName: keyof FormModel,
    data: InputOnChangeData
  ) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: data.value
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email
    ) {
      alert("Please fill mandatory fields");
      return;
    }

    try {
      await saveRecord(formData);
      alert("Record Submitted Successfully");
    } catch (error) {
      console.error(error);
      alert("Error while saving record");
    }
  };

  return (
    <Card appearance="filled">
      <CardHeader
        header={
          <Text weight="semibold" size={500}>
            Employee Registration Form
          </Text>
        }
      />

      <div className={styles.container}>
        <Field
          label="First Name"
          required
          validationState={
            !formData.firstName ? "error" : "none"
          }
          validationMessage={
            !formData.firstName
              ? "First Name is required"
              : ""
          }
        >
          <Input
            value={formData.firstName}
            onChange={(_, data) =>
              handleChange("firstName", data)
            }
          />
        </Field>

        <Field
          label="Last Name"
          required
          validationState={
            !formData.lastName ? "error" : "none"
          }
          validationMessage={
            !formData.lastName
              ? "Last Name is required"
              : ""
          }
        >
          <Input
            value={formData.lastName}
            onChange={(_, data) =>
              handleChange("lastName", data)
            }
          />
        </Field>

        <Field
          label="Email"
          required
          validationState={
            !formData.email ? "error" : "none"
          }
          validationMessage={
            !formData.email
              ? "Email is required"
              : ""
          }
        >
          <Input
            value={formData.email}
            onChange={(_, data) =>
              handleChange("email", data)
            }
          />
        </Field>

        <Field label="Phone Number">
          <Input
            value={formData.phone}
            onChange={(_, data) =>
              handleChange("phone", data)
            }
          />
        </Field>

        <Field label="City">
          <Input
            value={formData.city}
            onChange={(_, data) =>
              handleChange("city", data)
            }
          />
        </Field>

        <Field label="Country">
          <Input
            value={formData.country}
            onChange={(_, data) =>
              handleChange("country", data)
            }
          />
        </Field>

        <Field label="Department">
          <Input
            value={formData.department}
            onChange={(_, data) =>
              handleChange("department", data)
            }
          />
        </Field>

        <Field label="Employee ID">
          <Input
            value={formData.employeeId}
            onChange={(_, data) =>
              handleChange("employeeId", data)
            }
          />
        </Field>

        <div className={styles.buttonContainer}>
          <Button
            appearance="primary"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </div>
    </Card>
  );
}