"use strict";

import powerbi from "powerbi-visuals-api";
import { valueFormatter } from "powerbi-visuals-utils-formattingutils";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import { TextStyleSettings, VisualFormattingSettingsModel } from "./settings";

import DataView = powerbi.DataView;
import DataViewMetadataColumn = powerbi.DataViewMetadataColumn;
import PrimitiveValue = powerbi.PrimitiveValue;
import IVisual = powerbi.extensibility.visual.IVisual;
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;

const FIELDS = [
    { role: "project", label: "Project" },
    { role: "projectnummer", label: "Projectnummer" },
    { role: "adviseur", label: "Adviseur" },
    { role: "datumMetingen", label: "Datum metingen" },
    { role: "meetnorm", label: "Meetnorm" }
] as const;

export class Visual implements IVisual {
    private readonly container: HTMLElement;
    private readonly formattingSettingsService = new FormattingSettingsService();
    private formattingSettings = new VisualFormattingSettingsModel();

    constructor(options: VisualConstructorOptions | undefined) {
        if (!options) throw new Error("Visual options are required");
        this.container = document.createElement("div");
        this.container.className = "projectinfo";
        options.element.appendChild(this.container);
    }

    public update(options: VisualUpdateOptions): void {
        const dataView = options.dataViews?.[0];
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, dataView);
        this.applyStyles();
        this.container.replaceChildren();

        const table = dataView?.table;
        if (!table?.columns.length) {
            this.renderEmpty("Voeg projectgegevens toe aan de visual.");
            return;
        }

        const element = document.createElement("table");
        element.className = "projectinfo-table";
        const body = document.createElement("tbody");

        for (const field of FIELDS) {
            const columnIndex = table.columns.findIndex((column) => Boolean(column.roles?.[field.role]));
            if (columnIndex < 0) continue;

            const row = document.createElement("tr");
            const label = document.createElement("th");
            label.scope = "row";
            label.textContent = field.label;
            row.appendChild(label);

            const value = document.createElement("td");
            const rawValue = table.rows?.map((sourceRow) => sourceRow[columnIndex]).find((item) => item !== null && item !== undefined);
            value.textContent = this.formatValue(rawValue, table.columns[columnIndex]);
            row.appendChild(value);
            body.appendChild(row);
        }

        element.appendChild(body);
        this.container.appendChild(element);
    }

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    private formatValue(value: PrimitiveValue | undefined, column: DataViewMetadataColumn): string {
        if (value === null || value === undefined) return "";
        return valueFormatter.create({ format: column.format }).format(value);
    }

    private applyStyles(): void {
        const style = this.container.style;
        this.applyTextStyle(style, "label", this.formattingSettings.columnsCard.label);
        this.applyTextStyle(style, "value", this.formattingSettings.columnsCard.value);
        const lines = this.formattingSettings.linesCard;
        const padding = this.formattingSettings.paddingCard;
        style.setProperty("--pi-horizontal-line", `${Math.max(0, lines.horizontalWidth.value)}px solid ${lines.horizontalColor.value.value}`);
        style.setProperty("--pi-vertical-line", `${Math.max(0, lines.verticalWidth.value)}px solid ${lines.verticalColor.value.value}`);
        style.setProperty("--pi-border", lines.borderVisible.value ? `${Math.max(0, lines.borderWidth.value)}px solid ${lines.borderColor.value.value}` : "none");
        style.setProperty("--pi-radius", `${Math.max(0, lines.cornerRadius.value)}px`);
        style.setProperty("--pi-container-padding-top", `${Math.max(0, padding.topPadding.value)}px`);
        style.setProperty("--pi-container-padding-bottom", `${Math.max(0, padding.bottomPadding.value)}px`);
        style.setProperty("--pi-container-padding-left", `${Math.max(0, padding.leftPadding.value)}px`);
        style.setProperty("--pi-container-padding-right", `${Math.max(0, padding.rightPadding.value)}px`);
        style.setProperty("--pi-horizontal-padding", `${Math.max(0, padding.horizontalPadding.value)}px`);
        style.setProperty("--pi-vertical-padding", `${Math.max(0, padding.verticalPadding.value)}px`);
    }

    private applyTextStyle(style: CSSStyleDeclaration, prefix: string, settings: TextStyleSettings): void {
        style.setProperty(`--pi-${prefix}-font-family`, settings.fontFamily.value);
        style.setProperty(`--pi-${prefix}-font-size`, `${settings.fontSize.value}px`);
        style.setProperty(`--pi-${prefix}-font-weight`, settings.bold.value ? "700" : "400");
        style.setProperty(`--pi-${prefix}-font-style`, settings.italic.value ? "italic" : "normal");
        style.setProperty(`--pi-${prefix}-decoration`, settings.underline.value ? "underline" : "none");
        style.setProperty(`--pi-${prefix}-align`, settings.alignment.value);
        style.setProperty(`--pi-${prefix}-color`, settings.color.value.value);
        style.setProperty(`--pi-${prefix}-background`, settings.backgroundColor.value.value);
    }

    private renderEmpty(message: string): void {
        const empty = document.createElement("div");
        empty.className = "projectinfo-empty";
        empty.textContent = message;
        this.container.appendChild(empty);
    }
}