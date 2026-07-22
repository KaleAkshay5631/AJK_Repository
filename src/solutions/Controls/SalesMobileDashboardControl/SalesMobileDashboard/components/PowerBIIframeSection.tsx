import * as React from "react";
import { makeStyles, tokens } from "@fluentui/react-components";
import { SectionCard } from "./SectionCard";

interface PowerBIIframeSectionProps {
  layoutMode: "web" | "mobile";
}

const useStyles = makeStyles({
  frame: {
    width: "100%",
    minHeight: "360px",
    border: "0",
    borderRadius: tokens.borderRadiusLarge,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  webFrame: {
    height: "541px",
  },
  mobileFrame: {
    height: "784px",
    width: "400px",
  },
});

export const PowerBIIframeSection: React.FC<PowerBIIframeSectionProps> = ({ layoutMode }) => {
  const styles = useStyles();
  const frameClassName = layoutMode === "web" ? styles.webFrame : styles.mobileFrame;
  const sectionTitle = layoutMode === "web" ? "2026 W25 Difference from Selected Value" : "2026 W25 Difference from Selected Value (Mobile)";

  return (
    <SectionCard title={sectionTitle} subtitle={`Embedded Power BI iframe report - ${layoutMode} layout`}>
      <iframe
        title={sectionTitle}
        width={layoutMode === "web" ? "100%" : "400"}
        height={layoutMode === "web" ? "541.25" : "784"}
        src="https://app.powerbi.com/reportEmbed?reportId=e90f0601-fe06-460a-8dec-c7d8846d9ca2&autoAuth=true&embeddedDemo=true"
        frameBorder="0"
        allowFullScreen={true}
        className={`${styles.frame} ${frameClassName}`}
      />
    </SectionCard>
  );
};
