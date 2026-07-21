/// <reference types="powerapps-component-framework" />
import * as React from "react";
import { createRoot, type Root } from "react-dom/client";
import type { IInputs, IOutputs } from "./generated/ManifestTypes";
import { SearchFormComponent, type SearchFormData } from "./SearchFormComponent";

export class SearchForm implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private container: HTMLDivElement | null = null;
    private notifyOutputChanged: (() => void) | null = null;
    private context: ComponentFramework.Context<IInputs> | null = null;
    private reactRoot: Root | null = null;
    private submittedFormDataJson = "";

    /**
     * Empty constructor.
     */
    constructor() {
        // Empty
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        void state;
        this.container = container;
        this.notifyOutputChanged = notifyOutputChanged;
        this.context = context;
    }

    /**
     * Called when any value in the property bag has changed.
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this.context = context;

        if (!this.container) {
            return;
        }

        if (!this.reactRoot) {
            this.reactRoot = createRoot(this.container);
        }

        this.reactRoot.render(
            React.createElement(SearchFormComponent, {
                onSubmit: (data: SearchFormData): void => {
                    this.submittedFormDataJson = JSON.stringify(data);
                    this.notifyOutputChanged?.();
                },
            })
        );
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     */
    public getOutputs(): IOutputs {
        return {
            formDataJson: this.submittedFormDataJson,
        };
    }

    /**
     * Called when the control is to be removed from the DOM tree.
     */
    public destroy(): void {
        this.reactRoot?.unmount();
        this.reactRoot = null;
    }
}
