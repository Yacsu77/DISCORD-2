import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { addAssetsCar } from "./addAssetsCar.mjs";

const execFileAsync = promisify(execFile);

export default async function afterPack(context) {
    await addAssetsCar(context);
    await adHocSignMacApp(context);
}

/**
 * Apple Silicon rejects Electron apps whose binaries were patched (or left
 * with a leftover Developer ID) without a matching signature. Ad-hoc signing
 * replaces that certificate so the app can launch without Apple notarization.
 */
async function adHocSignMacApp({ appOutDir, electronPlatformName }) {
    if (electronPlatformName !== "darwin") return;

    const appName = (await readdir(appOutDir)).find(item => item.endsWith(".app"));
    if (!appName) {
        console.warn(`Could not find .app directory in ${appOutDir}. Skipping ad-hoc sign.`);
        return;
    }

    const appPath = join(appOutDir, appName);
    const entitlements = join(process.cwd(), "build/entitlements.mac.plist");

    await execFileAsync("codesign", [
        "--sign",
        "-",
        "--force",
        "--deep",
        "--entitlements",
        entitlements,
        appPath
    ]);

    console.log(`Ad-hoc signed ${appName} without Developer ID`);
}
