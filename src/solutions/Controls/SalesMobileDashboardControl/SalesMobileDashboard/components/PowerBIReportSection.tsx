import * as React from "react";
import {
  Body1,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Spinner,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
// Do not remove the import statements below
import * as powerbiClient from "powerbi-client";
import * as models from "powerbi-models";
import { SectionCard } from "./SectionCard";

interface PowerBIReportSectionProps {
  embedUrl: string;
  reportId: string;
  accessToken: string;
  tokenType: string;
}

const useStyles = makeStyles({
  container: {
    width: "100%",
    minHeight: "320px",
    height: "380px",
    borderRadius: tokens.borderRadiusLarge,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    overflow: "hidden",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  loadingWrap: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    color: tokens.colorNeutralForeground3,
  },
});

let loadedResolve: (() => void) | undefined;
let renderedResolve: (() => void) | undefined;

// Reuse the global Power BI service if already initialized by script; otherwise create one.
const powerbi: powerbiClient.service.Service =
  (window as Window & { powerbi?: powerbiClient.service.Service })["powerbi"] ??
  new powerbiClient.service.Service(
    powerbiClient.factories.hpmFactory,
    powerbiClient.factories.wpmpFactory,
    powerbiClient.factories.routerFactory
  );

export const PowerBIReportSection: React.FC<PowerBIReportSectionProps> = ({
  embedUrl,
  reportId,
  accessToken,
  tokenType,
}) => {
  const styles = useStyles();
  const embedContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
  const [isRendered, setIsRendered] = React.useState<boolean>(false);
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  React.useEffect(() => {
    const embedContainer = embedContainerRef.current;

    if (!embedContainer) {
      return;
    }

    if (!embedUrl || !reportId || !accessToken) {
      setErrorMessage("Power BI is not configured. Provide Embed URL, Report ID, and Access Token.");
      setIsLoaded(false);
      setIsRendered(false);
      powerbi.reset(embedContainer);
      return;
    }

    let report: powerbiClient.Report | undefined;
    setErrorMessage("");
    setIsLoaded(false);
    setIsRendered(false);

    const reportLoaded = new Promise<void>((resolve) => {
      loadedResolve = resolve;
    });
    const reportRendered = new Promise<void>((resolve) => {
      renderedResolve = resolve;
    });

    const embedPowerBIReport = async (): Promise<void> => {
      // Read embed application token
      const configuredAccessToken: string = accessToken;

      // Read embed URL
      const configuredEmbedUrl: string = embedUrl;

      // Read report Id
      const configuredEmbedReportId: string = reportId;

      // Read embed type from radio
      const configuredTokenType = tokenType;

      // We give All permissions to demonstrate switching between View and Edit mode and saving report.
      const permissions: models.Permissions = models.Permissions.All;

      // Create the embed configuration object for the report
      // For more information see https://go.microsoft.com/fwlink/?linkid=2153590
      const config: models.IReportEmbedConfiguration = {
        type: "report",
        tokenType: configuredTokenType === "0" ? models.TokenType.Aad : models.TokenType.Embed,
        accessToken: configuredAccessToken,
        embedUrl: configuredEmbedUrl,
        id: configuredEmbedReportId,
        permissions,
        settings: {
          panes: {
            filters: {
              visible: true,
            },
            pageNavigation: {
              visible: true,
            },
          },
        },
      };

      // Embed the report and display it within the div container.
      powerbi.reset(embedContainer);
      report = powerbi.embed(embedContainer, config) as powerbiClient.Report;

      // report.off removes all event handlers for a specific event
      report.off("loaded");

      // report.on will add an event handler
      report.on("loaded", () => {
        loadedResolve?.();
        report?.off("loaded");
      });

      // report.off removes all event handlers for a specific event
      report.off("error");

      report.on("error", (event: powerbiClient.service.ICustomEvent<models.IError>) => {
        const message = event.detail?.message ?? "Power BI rendering error.";
        setErrorMessage(message);
      });

      // report.off removes all event handlers for a specific event
      report.off("rendered");

      // report.on will add an event handler
      report.on("rendered", () => {
        renderedResolve?.();
        report?.off("rendered");
      });
    };

    void (async () => {
      try {
        await embedPowerBIReport();
        await reportLoaded;
        setIsLoaded(true);

        // Insert here the code you want to run after the report is loaded

        await reportRendered;
        setIsRendered(true);

        // Insert here the code you want to run after the report is rendered
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to embed Power BI report.");
      }
    })();

    return () => {
      report?.off("loaded");
      report?.off("error");
      report?.off("rendered");
      powerbi.reset(embedContainer);
    };
  }, [accessToken, embedUrl, reportId, tokenType]);

  return (
    <SectionCard title="Power BI Report" subtitle="Embedded analytics for mobile sellers">
      {errorMessage ? (
        <MessageBar intent="error">
          <MessageBarBody>
            <MessageBarTitle>Power BI load failed</MessageBarTitle>
            {errorMessage}
          </MessageBarBody>
        </MessageBar>
      ) : null}

      {!isLoaded || !isRendered ? (
        <div className={styles.loadingWrap}>
          <Spinner size="tiny" />
          <Body1>Loading report...</Body1>
        </div>
      ) : null}

      <div id="embedContainer" ref={embedContainerRef} className={styles.container} />
    </SectionCard>
  );
};
