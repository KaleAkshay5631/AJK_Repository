import {
  Button,
  Card,
  CardHeader,
  Input,
  makeStyles,
  Text
} from "@fluentui/react-components";
import type { InputOnChangeData } from "@fluentui/react-components";

import { useState } from "react";
import type { FormModel } from "../models/FormModel";
import { saveRecord } from "../services/dataverseService";
import { getHeaderLabel } from "../services/configService";

const useStyles = makeStyles({
  container: {
    maxWidth: "900px",
    margin: "40px auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "15px",
    alignItems: "start",
    "& > *": {
      minWidth: 0
    }
  },
  fieldLabel: {
    fontWeight: 600,
    marginBottom: "8px"
  },
  fieldControl: {
    display: "grid",
    gap: "5px",
    minWidth: 0
  },
  validationMessage: {
    color: "#d13438",
    fontSize: "0.875rem"
  },
  buttonContainer: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "flex-end",
    gridColumn: "1 / -1"
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
  const [submitted, setSubmitted] = useState(false);

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
    setSubmitted(true);

    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email
    ) {
      //alert("Please fill mandatory fields");
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
            {getHeaderLabel()}
          </Text>
        }
      />

      <div className={styles.container}>
        <div>
          <label className={styles.fieldLabel} htmlFor="firstName">
            First Name
          </label>
          <div className={styles.fieldControl}>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(_, data) =>
                handleChange("firstName", data)
              }
              aria-invalid={submitted && !formData.firstName}
            />
            {submitted && !formData.firstName && (
              <Text className={styles.validationMessage}>
                First Name is required
              </Text>
            )}
          </div>
        </div>

        <div>
          <label className={styles.fieldLabel} htmlFor="lastName">
            Last Name
          </label>
          <div className={styles.fieldControl}>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(_, data) =>
                handleChange("lastName", data)
              }
              aria-invalid={submitted && !formData.lastName}
            />
            {submitted && !formData.lastName && (
              <Text className={styles.validationMessage}>
                Last Name is required
              </Text>
            )}
          </div>
        </div>

        <div>
          <label className={styles.fieldLabel} htmlFor="email">
            Email
          </label>
          <div className={styles.fieldControl}>
            <Input
              id="email"
              value={formData.email}
              onChange={(_, data) =>
                handleChange("email", data)
              }
              aria-invalid={submitted && !formData.email}
            />
            {submitted && !formData.email && (
              <Text className={styles.validationMessage}>
                Email is required
              </Text>
            )}
          </div>
        </div>

        <div>
          <label className={styles.fieldLabel} htmlFor="phone">
            Phone Number
          </label>
          <div className={styles.fieldControl}>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(_, data) =>
                handleChange("phone", data)
              }
            />
          </div>
        </div>

        <div>
          <label className={styles.fieldLabel} htmlFor="city">
            City
          </label>
          <div className={styles.fieldControl}>
            <Input
              id="city"
              value={formData.city}
              onChange={(_, data) =>
                handleChange("city", data)
              }
            />
          </div>
        </div>

        <div>
          <label className={styles.fieldLabel} htmlFor="country">
            Country
          </label>
          <div className={styles.fieldControl}>
            <Input
              id="country"
              value={formData.country}
              onChange={(_, data) =>
                handleChange("country", data)
              }
            />
          </div>
        </div>

        <div>
          <label className={styles.fieldLabel} htmlFor="department">
            Department
          </label>
          <div className={styles.fieldControl}>
            <Input
              id="department"
              value={formData.department}
              onChange={(_, data) =>
                handleChange("department", data)
              }
            />
          </div>
        </div>

        <div>
          <label className={styles.fieldLabel} htmlFor="employeeId">
            Employee ID
          </label>
          <div className={styles.fieldControl}>
            <Input
              id="employeeId"
              value={formData.employeeId}
              onChange={(_, data) =>
                handleChange("employeeId", data)
              }
            />
          </div>
        </div>

        <div className={styles.buttonContainer}>
          <Button appearance="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>
    </Card>
  );
}