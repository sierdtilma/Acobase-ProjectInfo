/**
 * Automated pre-certification checklist for AppSource submission.
 * Run with: npm run certify
 *
 * Combines: lint, type-check, npm audit, forbidden-pattern scan and
 * manifest/metadata checks described in the Microsoft AppSource guidelines
 * (https://learn.microsoft.com/power-bi/developer/visuals/guidelines-powerbi-visuals).
 */
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const srcDir = path.join(rootDir, "src");

let errors = 0;
let warnings = 0;

function heading(title) {
    console.log(`\n=== ${title} ===`);
}

function fail(message) {
    errors++;
    console.error(`  ✗ ${message}`);
}

function warn(message) {
    warnings++;
    console.warn(`  ! ${message}`);
}

function ok(message) {
    console.log(`  ✓ ${message}`);
}

function run(command, args) {
    const result = spawnSync(command, args, { cwd: rootDir, stdio: "pipe", shell: true, encoding: "utf-8" });
    return result;
}

function runNode(script, args) {
    const result = spawnSync(process.execPath, [path.join(rootDir, "node_modules", script), ...args], {
        cwd: rootDir,
        stdio: "pipe",
        encoding: "utf-8"
    });
    return result;
}

// 1. ESLint
heading("ESLint");
{
    const result = runNode(path.join("eslint", "bin", "eslint.js"), ["."]);
    if (result.status === 0) {
        ok("Geen lint-fouten");
    } else {
        fail("ESLint meldt problemen:");
        console.log(result.stdout || result.stderr);
    }
}

// 2. TypeScript type-check
heading("TypeScript type-check");
{
    // --skipLibCheck: node_modules bevat geneste duplicaten van powerbi-visuals-api
    // (top-level + binnen powerbi-visuals-utils-formattingutils) die anders valse
    // TS6200/TS2374-conflicten opleveren. De echte pbiviz/webpack-build (npm run package)
    // heeft hier geen last van en blijft de uiteindelijke waarheid voor compileerbaarheid.
    const result = runNode(path.join("typescript", "bin", "tsc"), ["--noEmit", "--skipLibCheck"]);
    if (result.status === 0) {
        ok("Geen type-fouten in eigen code");
    } else {
        fail("TypeScript compilatiefouten:");
        console.log(result.stdout || result.stderr);
    }
}

// 3. npm audit (fails the check on high/critical vulnerabilities)
heading("npm audit (high/critical)");
{
    const result = run("npm", ["audit", "--audit-level=high"]);
    if (result.status === 0) {
        ok("Geen high/critical kwetsbaarheden");
    } else {
        fail("npm audit vond kwetsbaarheden (npm audit voor details):");
        console.log(result.stdout || result.stderr);
    }
}

// 4. Power BI certification audit
heading("Power BI certification audit");
{
    const result = runNode(path.join("powerbi-visuals-tools", "bin", "pbiviz.js"), ["package", "--certification-audit"]);
    if (result.status === 0) {
        ok("Power BI certification audit geslaagd");
    } else {
        fail("Power BI certification audit meldt problemen:");
        console.log(result.stdout);
        console.error(result.stderr);
    }
}

// 5. Forbidden patterns in source (security / certification red flags)
heading("Verboden patronen in src/");
{
    const forbiddenPatterns = [
        { regex: /\beval\s*\(/, message: "gebruik van eval()" },
        { regex: /\bdebugger\b/, message: "achtergebleven debugger-statement" },
        { regex: /console\.(log|debug|info|warn|error)\s*\(/, message: "console.* aanroep" },
        { regex: /\.innerHTML\s*=/, message: "innerHTML-toewijzing (XSS-risico, gebruik textContent/DOM API)" },
        { regex: /document\.write\s*\(/, message: "document.write()" },
        { regex: /new\s+Function\s*\(/, message: "new Function() (equivalent aan eval)" }
    ];

    const files = fs.readdirSync(srcDir, { recursive: true })
        .filter((file) => typeof file === "string" && file.endsWith(".ts"))
        .map((file) => path.join(srcDir, file));

    let found = false;
    for (const file of files) {
        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");
        lines.forEach((line, index) => {
            for (const pattern of forbiddenPatterns) {
                if (pattern.regex.test(line)) {
                    fail(`${path.relative(rootDir, file)}:${index + 1} — ${pattern.message}`);
                    found = true;
                }
            }
        });
    }
    if (!found) ok("Geen verboden patronen gevonden");
}

// 6. pbiviz.json metadata sanity check
heading("pbiviz.json metadata");
{
    const pbivizPath = path.join(rootDir, "pbiviz.json");
    const pbiviz = JSON.parse(fs.readFileSync(pbivizPath, "utf-8"));
    const visual = pbiviz.visual || {};

    const placeholderChecks = [
        { value: visual.supportUrl, name: "visual.supportUrl", placeholder: /example\.com/ },
        { value: pbiviz.author?.email, name: "author.email", placeholder: /example\.com/ },
        { value: visual.gitHubUrl, name: "visual.gitHubUrl", placeholder: /example\.com/ }
    ];
    for (const check of placeholderChecks) {
        if (!check.value) {
            fail(`${check.name} ontbreekt`);
        } else if (check.placeholder.test(check.value)) {
            fail(`${check.name} bevat nog een placeholder-waarde: ${check.value}`);
        } else {
            ok(`${check.name} = ${check.value}`);
        }
    }

    if (!/^[A-Za-z0-9]{1,50}$/.test(visual.guid || "")) {
        fail(`visual.guid heeft een ongeldig formaat: ${visual.guid}`);
    } else {
        ok(`visual.guid = ${visual.guid}`);
    }

    if (!visual.description || visual.description.length < 10) {
        warn("visual.description is erg kort, geef een duidelijke omschrijving voor de store listing");
    }
}

// 7. capabilities.json privileges review
heading("capabilities.json privileges");
{
    const capabilitiesPath = path.join(rootDir, "capabilities.json");
    const capabilities = JSON.parse(fs.readFileSync(capabilitiesPath, "utf-8"));
    const privileges = capabilities.privileges || [];
    if (privileges.length === 0) {
        ok("Geen privileges aangevraagd");
    } else {
        warn(`Privileges aangevraagd: ${privileges.map((p) => p.name).join(", ")} — zorg dat elk gebruik hiervan wordt uitgelegd in de privacyverklaring en het certificeringsformulier`);
    }
}

// 8. Required repo files for certification
heading("Verplichte repo-bestanden");
{
    const requiredFiles = ["README.md", "LICENSE"];
    for (const file of requiredFiles) {
        if (fs.existsSync(path.join(rootDir, file))) {
            ok(`${file} aanwezig`);
        } else {
            fail(`${file} ontbreekt`);
        }
    }
}

heading("Resultaat");
console.log(`  ${errors} fout(en), ${warnings} waarschuwing(en)`);
if (errors > 0) {
    process.exit(1);
}
