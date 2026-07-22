/// <reference types="powerapps-component-framework" />
import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import type { IInputs, IOutputs } from "./generated/ManifestTypes";
import { App } from "./App";

export class SalesMobileDashboard implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private container: HTMLDivElement | null = null;
  private reactRoot: Root | null = null;

  private configureContainer(context: ComponentFramework.Context<IInputs>): void {
    if (!this.container) {
      return;
    }

    const allocatedHeight = context.mode.allocatedHeight;

    this.container.style.width = "100%";
    this.container.style.height = allocatedHeight > 0 ? `${allocatedHeight}px` : "100%";
    this.container.style.maxHeight = "100%";
    this.container.style.overflowY = "auto";
    this.container.style.overflowX = "hidden";
  }

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    void notifyOutputChanged;
    void state;
    this.container = container;
    context.mode.trackContainerResize(true);
    this.configureContainer(context);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    if (!this.container) {
      return;
    }
    
    this.configureContainer(context);

    if (!this.reactRoot) {
      this.reactRoot = createRoot(this.container);
    }

    this.reactRoot.render(React.createElement(App, { context }));
  }

  public getOutputs(): IOutputs {
    return {};
  }

  public destroy(): void {
    this.reactRoot?.unmount();
    this.reactRoot = null;
  }
}
