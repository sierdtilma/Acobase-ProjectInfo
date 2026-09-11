const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const packageJsonPath = path.join(rootDir, "package.json");
const pbivizJsonPath = path.join(rootDir, "pbiviz.json");

function bumpVersion(version) {
    const parts = version.split(".").map(Number);
    parts[3]++;
    return parts.join(".");
}

function updateFile(filePath, getNewContent) {
    try {
        const content = fs.readFileSync(filePath, "utf-8");
        const newContent = getNewContent(content);
        fs.writeFileSync(filePath, newContent, "utf-8");
        console.log(`✓ Updated ${path.basename(filePath)}`);
    } catch (error) {
        console.error(`✗ Error updating ${filePath}:`, error.message);
        process.exit(1);
    }
}

// Bump version in package.json
updateFile(packageJsonPath, (content) => {
    const data = JSON.parse(content);
    const oldVersion = data.version;
    data.version = bumpVersion(oldVersion);
    console.log(`  ${oldVersion} → ${data.version}`);
    return JSON.stringify(data, null, 2) + "\n";
});

// Bump version in pbiviz.json
updateFile(pbivizJsonPath, (content) => {
    const data = JSON.parse(content);
    const oldVersion = data.visual.version;
    data.visual.version = bumpVersion(oldVersion);
    data.version = data.visual.version;
    console.log(`  ${oldVersion} → ${data.visual.version}`);
    return JSON.stringify(data, null, 2) + "\n";
});
