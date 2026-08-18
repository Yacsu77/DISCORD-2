/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CheckedTextInput, Heading, Paragraph } from "@vencord/types/components";
import { Margins } from "@vencord/types/utils";

import { SimpleErrorBoundary } from "../SimpleErrorBoundary";
import { SettingsComponent } from "./Settings";
import { VesktopSettingsSwitch } from "./VesktopSettingsSwitch";

const DEFAULT_PROXY = "http://181.39.25.196:8118";

function validateProxy(value: string) {
    if (!value) return "Enter a proxy URL, for example http://181.39.25.196:8118";

    try {
        const url = new URL(value);
        if (!["socks5:", "socks:", "socks4:", "http:", "https:"].includes(url.protocol)) {
            return "Use http://host:port or socks5://host:port";
        }
        if (!url.hostname || !url.port) return "Host and port are required";
        return true;
    } catch {
        return "Invalid proxy URL";
    }
}

export const DiscordRegionProxy: SettingsComponent = ({ settings }) => {
    return (
        <SimpleErrorBoundary>
            <div>
                <Heading tag="h5">Region Split Proxy</Heading>
                <Paragraph className={Margins.bottom8}>
                    Discord API and gateway go through this proxy (Ecuador / Guayaquil) so Discord assigns a media
                    region from that IP. Voice and screenshare stay direct on your connection. This proxy sees Discord
                    traffic, including your token.
                </Paragraph>
                <VesktopSettingsSwitch
                    title="Enable split proxy"
                    description="Route Discord geo through Ecuador, keep media direct"
                    value={settings.discordRegionProxyEnabled !== false}
                    onChange={v => (settings.discordRegionProxyEnabled = v)}
                />
                <CheckedTextInput
                    initialValue={settings.discordRegionProxy || DEFAULT_PROXY}
                    validate={validateProxy}
                    onChange={value => (settings.discordRegionProxy = value)}
                />
            </div>
        </SimpleErrorBoundary>
    );
};
