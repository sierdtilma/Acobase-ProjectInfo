"use strict";

import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

type FormattingSettingsSlice = formattingSettings.Slice;

export class TextStyleSettings {
    alignment: formattingSettings.AlignmentGroup;
    fontFamily: formattingSettings.FontPicker;
    fontSize: formattingSettings.NumUpDown;
    bold: formattingSettings.ToggleSwitch;
    italic: formattingSettings.ToggleSwitch;
    underline: formattingSettings.ToggleSwitch;
    fontControl: formattingSettings.FontControl;
    color: formattingSettings.ColorPicker;
    backgroundColor: formattingSettings.ColorPicker;
    slices: FormattingSettingsSlice[];

    constructor(prefix: string, bold: boolean) {
        this.alignment = new formattingSettings.AlignmentGroup({ name: `${prefix}Alignment`, displayName: "Uitlijning", mode: powerbi.visuals.AlignmentGroupMode.Horizonal, value: "left" });
        this.fontFamily = new formattingSettings.FontPicker({ name: `${prefix}FontFamily`, displayName: "Lettertype", value: "Segoe UI" });
        this.fontSize = new formattingSettings.NumUpDown({ name: `${prefix}FontSize`, displayName: "Tekstgrootte", value: 11 });
        this.bold = new formattingSettings.ToggleSwitch({ name: `${prefix}Bold`, displayName: "Vet", value: bold });
        this.italic = new formattingSettings.ToggleSwitch({ name: `${prefix}Italic`, displayName: "Cursief", value: false });
        this.underline = new formattingSettings.ToggleSwitch({ name: `${prefix}Underline`, displayName: "Onderstrepen", value: false });
        this.fontControl = new formattingSettings.FontControl({ name: `${prefix}FontControl`, displayName: "Tekstopmaak", fontFamily: this.fontFamily, fontSize: this.fontSize, bold: this.bold, italic: this.italic, underline: this.underline });
        this.color = new formattingSettings.ColorPicker({ name: `${prefix}Color`, displayName: "Tekstkleur", value: { value: "#374151" } });
        this.backgroundColor = new formattingSettings.ColorPicker({ name: `${prefix}BackgroundColor`, displayName: "Achtergrond", value: { value: "#ffffff" } });
        this.slices = [this.fontControl, this.alignment, this.color, this.backgroundColor];
    }
}

class ColumnsCardSettings extends formattingSettings.SimpleCard {
    selectedColumn = new formattingSettings.ItemDropdown({
        name: "selectedColumn", displayName: "Kolom",
        items: [{ displayName: "Labels", value: "label" }, { displayName: "Waarden", value: "value" }],
        value: { displayName: "Labels", value: "label" }
    });
    label = new TextStyleSettings("label", true);
    value = new TextStyleSettings("value", false);
    name = "columns";
    displayName = "Kolommen";
    slices: FormattingSettingsSlice[] = [this.selectedColumn, ...this.label.slices, ...this.value.slices];

    onPreProcess(): void {
        const selected = String(this.selectedColumn.value.value);
        this.label.slices.forEach((slice) => slice.visible = selected === "label");
        this.value.slices.forEach((slice) => slice.visible = selected === "value");
    }
}

class LinesCardSettings extends formattingSettings.SimpleCard {
    horizontalColor = new formattingSettings.ColorPicker({ name: "horizontalColor", displayName: "Horizontale lijnkleur", value: { value: "#e5e7eb" } });
    horizontalWidth = new formattingSettings.NumUpDown({ name: "horizontalWidth", displayName: "Horizontale lijndikte (px)", value: 1 });
    verticalColor = new formattingSettings.ColorPicker({ name: "verticalColor", displayName: "Verticale lijnkleur", value: { value: "#e5e7eb" } });
    verticalWidth = new formattingSettings.NumUpDown({ name: "verticalWidth", displayName: "Verticale lijndikte (px)", value: 1 });
    borderVisible = new formattingSettings.ToggleSwitch({ name: "borderVisible", displayName: "Vensterrand tonen", value: true });
    borderColor = new formattingSettings.ColorPicker({ name: "borderColor", displayName: "Vensterrand kleur", value: { value: "#d1d5db" } });
    borderWidth = new formattingSettings.NumUpDown({ name: "borderWidth", displayName: "Vensterrand dikte (px)", value: 1 });
    cornerRadius = new formattingSettings.NumUpDown({ name: "cornerRadius", displayName: "Hoekradius (px)", value: 6 });
    name = "lines";
    displayName = "Lijnen";
    slices: FormattingSettingsSlice[] = [this.horizontalColor, this.horizontalWidth, this.verticalColor, this.verticalWidth, this.borderVisible, this.borderColor, this.borderWidth, this.cornerRadius];
}

class PaddingCardSettings extends formattingSettings.SimpleCard {
    horizontalPadding = new formattingSettings.NumUpDown({ name: "horizontalPadding", displayName: "Horizontale padding (px)", value: 7 });
    verticalPadding = new formattingSettings.NumUpDown({ name: "verticalPadding", displayName: "Verticale padding (px)", value: 4 });
    topPadding = new formattingSettings.NumUpDown({ name: "topPadding", displayName: "Boven (px)", value: 12 });
    bottomPadding = new formattingSettings.NumUpDown({ name: "bottomPadding", displayName: "Onder (px)", value: 12 });
    leftPadding = new formattingSettings.NumUpDown({ name: "leftPadding", displayName: "Links (px)", value: 12 });
    rightPadding = new formattingSettings.NumUpDown({ name: "rightPadding", displayName: "Rechts (px)", value: 12 });
    name = "padding";
    displayName = "Padding";
    slices: FormattingSettingsSlice[] = [this.horizontalPadding, this.verticalPadding, this.topPadding, this.bottomPadding, this.leftPadding, this.rightPadding];
}

export class VisualFormattingSettingsModel extends formattingSettings.Model {
    columnsCard = new ColumnsCardSettings();
    linesCard = new LinesCardSettings();
    paddingCard = new PaddingCardSettings();
    cards = [this.columnsCard, this.linesCard, this.paddingCard];
}