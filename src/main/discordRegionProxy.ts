/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { session } from "electron";

import { Settings } from "./settings";

export const DEFAULT_DISCORD_REGION_PROXY = "http://181.39.25.196:8118";

function toPacProxy(raw: string) {
    try {
        const url = new URL(raw);
        const port = url.port || (url.protocol === "http:" ? "80" : url.protocol === "https:" ? "443" : "1080");
        const host = `${url.hostname}:${port}`;

        switch (url.protocol) {
            case "socks5:":
            case "socks:":
                return `SOCKS5 ${host}`;
            case "socks4:":
                return `SOCKS ${host}`;
            case "http:":
            case "https:":
                return `PROXY ${host}`;
            default:
                return null;
        }
    } catch {
        return null;
    }
}

function buildPacScript(proxy: string) {
    return `
function FindProxyForURL(url, host) {
    host = host.toLowerCase();

    if (host === "discord.media" || shExpMatch(host, "*.discord.media")) return "DIRECT";
    if (host === "cdn.discordapp.com" || host === "media.discordapp.net" || shExpMatch(host, "*.discordapp.net")) return "DIRECT";

    if (host === "discord.com" || shExpMatch(host, "*.discord.com")) return "${proxy}";
    if (host === "discordapp.com" || shExpMatch(host, "*.discordapp.com")) return "${proxy}";
    if (host === "discord.gg" || shExpMatch(host, "*.discord.gg")) return "${proxy}";

    return "DIRECT";
}
`.trim();
}

export async function applyDiscordRegionProxy() {
    const ses = session.defaultSession;
    const enabled = Settings.store.discordRegionProxyEnabled !== false;
    const proxy = enabled ? toPacProxy(Settings.store.discordRegionProxy || DEFAULT_DISCORD_REGION_PROXY) : null;

    if (!enabled || !proxy) {
        await ses.setProxy({ mode: "direct" });
        console.log("Discord region proxy: direct (no split tunnel)");
        return;
    }

    const pacScript = "data:application/x-ns-proxy-autoconfig;base64," + Buffer.from(buildPacScript(proxy)).toString("base64");
    await ses.setProxy({
        mode: "pac_script",
        pacScript
    });

    console.log("Discord region proxy:", proxy, "(API/gateway only, media DIRECT)");
}
