/*
 * Vesktop, a desktop app aiming to give you a snappier Discord Experience
 * Copyright (c) 2023 Vendicated and Vencord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Logger } from "@vencord/types/utils";
import { onceReady } from "@vencord/types/webpack";
import { FluxDispatcher } from "@vencord/types/webpack/common";

const logger = new Logger("VesktopForceUsRegion");

onceReady.then(() => {
    FluxDispatcher.subscribe("VOICE_SERVER_UPDATE", (event: any) => {
        logger.info("Voice media server", event.endpoint ?? event);
    });

    FluxDispatcher.subscribe("STREAM_SERVER_UPDATE", (event: any) => {
        logger.info("Stream media server", event.endpoint ?? event);
    });
});
