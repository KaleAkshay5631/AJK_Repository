import * as React from "react";
import {
    ChoiceGroup,
    DefaultButton,
    Dialog,
    DialogFooter,
    Nav,
    Label,
    MessageBar,
    MessageBarType,
    PrimaryButton,
    Stack,
    TextField,
    type INavLink,
    type IChoiceGroupOption,
    type IModalProps,
    type INavStyles,
    type INavLinkGroup,
    type ITextFieldStyles,
    mergeStyleSets,
} from "@fluentui/react";

export interface SearchFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    country: string;
}

interface SearchFormComponentProps {
    onSubmit: (data: SearchFormData) => void;
}

const styles = mergeStyleSets({
    root: {
        width: "100%",
        display: "flex",
        gap: 16,
        alignItems: "flex-start",
    },
    navPane: {
        width: 208,
        minWidth: 208,
    },
    contentPane: {
        flex: 1,
        minWidth: 0,
    },
    formCard: {
        width: "100%",
        maxWidth: 980,
        padding: 16,
        boxSizing: "border-box",
        border: "1px solid #d6d6d6",
        borderRadius: 2,
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
    },
    formTitle: {
        fontSize: 15,
        fontWeight: 600,
        color: "#323130",
        marginBottom: 4,
    },
    fieldsGrid: {
        width: "100%",
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(320px, 1fr))",
        gap: 12,
        alignItems: "center",
    },
    fieldCell: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        minHeight: 38,
    },
    fieldLabel: {
        minWidth: 120,
        margin: 0,
        fontSize: 13,
        color: "#323130",
    },
    actions: {
        marginTop: 12,
    },
    requiredMark: {
        color: "#a4262c",
        marginLeft: 3,
    },
    fullWidth: {
        width: "100%",
    },
});

const textFieldStyles: Partial<ITextFieldStyles> = {
    root: {
        width: "100%",
    },
    fieldGroup: {
        height: 32,
        borderColor: "#c8c6c4",
    },
    field: {
        fontSize: 13,
    },
};

const navStyles: Partial<INavStyles> = {
    root: {
        width: 208,
        boxSizing: "border-box",
        border: "1px solid #e1dfdd",
        overflowY: "auto",
        backgroundColor: "#ffffff",
    },
};

const navLinkGroups: INavLinkGroup[] = [
    {
        links: [
            {
                name: "Home",
                url: "#",
                key: "home",
            },
            {
                name: "Search Form",
                url: "#",
                key: "searchForm",
            },
            {
                name: "Documents",
                url: "#",
                key: "documents",
            },
            {
                name: "Pages",
                url: "#",
                key: "pages",
            },
            {
                name: "Notebook",
                url: "#",
                key: "notebook",
                disabled: true,
            },
            {
                name: "Communication and Media",
                url: "#",
                key: "communication",
            },
            {
                name: "News",
                url: "#",
                key: "news",
            },
        ],
    },
];

const modalProps: IModalProps = {
    isBlocking: true,
    topOffsetFixed: true,
};

const confirmationOptions: IChoiceGroupOption[] = [
    {
        key: "A",
        iconProps: { iconName: "CalendarDay" },
        text: "Day",
    },
    {
        key: "B",
        iconProps: { iconName: "CalendarWeek" },
        text: "Week",
    },
    {
        key: "C",
        iconProps: { iconName: "Calendar" },
        text: "Month",
    },
];

const defaultFormData: SearchFormData = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    country: "",
};

export const SearchFormComponent: React.FC<SearchFormComponentProps> = ({ onSubmit }) => {
    const [formData, setFormData] = React.useState<SearchFormData>(defaultFormData);
    const [error, setError] = React.useState<string>("");
    const [success, setSuccess] = React.useState<boolean>(false);
    const [selectedKey, setSelectedKey] = React.useState<string>("home");
    const [hideDialog, setHideDialog] = React.useState<boolean>(true);
    const [optionSelected, setOptionSelected] = React.useState<string>("A");

    const onFieldChange = React.useCallback(
        (field: keyof SearchFormData, value?: string): void => {
            setSuccess(false);
            setError("");
            setFormData((prev) => ({
                ...prev,
                [field]: value ?? "",
            }));
        },
        []
    );

    const handleSubmit = React.useCallback((): void => {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            setError("First Name and Last Name are required.");
            setSuccess(false);
            return;
        }

        setError("");
        setHideDialog(false);
    }, [formData.firstName, formData.lastName]);

    const handleDialogDismiss = React.useCallback((): void => {
        setHideDialog(true);
    }, []);

    const handleDialogSave = React.useCallback((): void => {
        onSubmit(formData);
        setSuccess(true);
        setHideDialog(true);
    }, [formData, onSubmit]);

    const onChoiceChange = React.useCallback(
        (_ev?: React.FormEvent<HTMLElement | HTMLInputElement>, option?: IChoiceGroupOption): void => {
            if (!option?.key) {
                return;
            }

            setOptionSelected(option.key);
        },
        []
    );

    const onNavLinkClick = React.useCallback(
        (ev?: React.MouseEvent<HTMLElement>, item?: INavLink): void => {
            ev?.preventDefault();
            if (!item?.key) {
                return;
            }

            setSelectedKey(item.key);

            if (item.name === "News") {
                window.alert("News link clicked");
            }
        },
        []
    );

    return (
        <div className={styles.root}>
            <div className={styles.navPane}>
                <Nav
                    onLinkClick={onNavLinkClick}
                    selectedKey={selectedKey}
                    ariaLabel="Navigation"
                    styles={navStyles}
                    groups={navLinkGroups}
                />
            </div>

            <div className={styles.contentPane}>
                {selectedKey === "searchForm" ? (
                    <Stack tokens={{ childrenGap: 12 }} className={styles.formCard}>
                        <Label className={styles.formTitle}>Search Form</Label>

                        {error && <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>}
                        {success && (
                            <MessageBar messageBarType={MessageBarType.success} isMultiline={false}>
                                Form submitted successfully.
                            </MessageBar>
                        )}

                        <div className={styles.fieldsGrid}>
                            <div className={styles.fieldCell}>
                                <Label className={styles.fieldLabel}>
                                    First Name<span className={styles.requiredMark}>*</span>
                                </Label>
                                <TextField
                                    ariaLabel="First Name"
                                    required
                                    styles={textFieldStyles}
                                    className={styles.fullWidth}
                                    value={formData.firstName}
                                    onChange={(_, value) => onFieldChange("firstName", value)}
                                />
                            </div>

                            <div className={styles.fieldCell}>
                                <Label className={styles.fieldLabel}>
                                    Last Name<span className={styles.requiredMark}>*</span>
                                </Label>
                                <TextField
                                    ariaLabel="Last Name"
                                    required
                                    styles={textFieldStyles}
                                    className={styles.fullWidth}
                                    value={formData.lastName}
                                    onChange={(_, value) => onFieldChange("lastName", value)}
                                />
                            </div>

                            <div className={styles.fieldCell}>
                                <Label className={styles.fieldLabel}>Email</Label>
                                <TextField
                                    ariaLabel="Email"
                                    type="email"
                                    styles={textFieldStyles}
                                    className={styles.fullWidth}
                                    value={formData.email}
                                    onChange={(_, value) => onFieldChange("email", value)}
                                />
                            </div>

                            <div className={styles.fieldCell}>
                                <Label className={styles.fieldLabel}>Phone</Label>
                                <TextField
                                    ariaLabel="Phone"
                                    styles={textFieldStyles}
                                    className={styles.fullWidth}
                                    value={formData.phone}
                                    onChange={(_, value) => onFieldChange("phone", value)}
                                />
                            </div>

                            <div className={styles.fieldCell}>
                                <Label className={styles.fieldLabel}>City</Label>
                                <TextField
                                    ariaLabel="City"
                                    styles={textFieldStyles}
                                    className={styles.fullWidth}
                                    value={formData.city}
                                    onChange={(_, value) => onFieldChange("city", value)}
                                />
                            </div>

                            <div className={styles.fieldCell}>
                                <Label className={styles.fieldLabel}>Country</Label>
                                <TextField
                                    ariaLabel="Country"
                                    styles={textFieldStyles}
                                    className={styles.fullWidth}
                                    value={formData.country}
                                    onChange={(_, value) => onFieldChange("country", value)}
                                />
                            </div>
                        </div>

                        <Stack horizontalAlign="end" className={styles.actions}>
                            <PrimaryButton text="Submit" onClick={handleSubmit} />
                        </Stack>

                        <Dialog hidden={hideDialog} onDismiss={handleDialogDismiss} modalProps={modalProps}>
                            <ChoiceGroup
                                label="Pick one icon"
                                options={confirmationOptions}
                                selectedKey={optionSelected}
                                onChange={onChoiceChange}
                                required
                            />

                            {optionSelected === "A" && (
                                <div>
                                    <h1>Description</h1>
                                    <div>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                                        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                                        laboris nisi ut aliquip ex ea commodo consequat.
                                    </div>
                                </div>
                            )}
                            {optionSelected === "B" && (
                                <div>
                                    <h1>Description</h1>
                                    <div>
                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                                        labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
                                        laboris nisi ut aliquip ex ea commodo consequat.
                                    </div>
                                </div>
                            )}
                            {optionSelected === "C" && (
                                <div>
                                    <h1>Description</h1>
                                </div>
                            )}

                            <DialogFooter>
                                <PrimaryButton onClick={handleDialogSave} text="Save" />
                                <DefaultButton onClick={handleDialogDismiss} text="Cancel" />
                            </DialogFooter>
                        </Dialog>
                    </Stack>
                ) : (
                    <Stack tokens={{ childrenGap: 8 }} className={styles.formCard}>
                        <Label className={styles.formTitle}>Select Search Form from the left navigation.</Label>
                    </Stack>
                )}
            </div>
        </div>
    );
};
