import { spawn } from "child_process";
import * as vscode from "vscode";
import * as net from "net";

const DEBUG_TYPE = "moonbug";
const DEFAULT_PORT = 8888;

/**
 * @typedef {Object} MoonbugConfig
 * @property {string} project_root_dir
 * @property {string} lua
 */

/**
 * @param {MoonbugConfig} config
 * @return {Promise<ChildProcess>}
 */
async function spawnProcess(config) {
    const child = spawn(config.lua || "lua", [config.program, ...(config.args ?? [])], {
        cwd: config.project_root_dir || process.cwd(),
        env: process.env,
        stdio: "ignore",
    });

    child.on("error", (err) => {
        vscode.window.showErrorMessage(
            `moonbug: could not start '${config.lua || "lua"}': ${err.message}`,
        );

        reject(err);
    });

    child.on("spawn", () => resolve(child));
}

/**
 * Try connecting with the port until `timeoutMs` is passed, resolve on success
 * @param {string} host
 * @param {number} port
 * @return {Promise}
 */
async function waitForPort(host, port, timeoutMs = 5000) {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
        const tryConnect = () => {
            const socket = new net.Socket();
            socket.setTimeout(200);

            socket.on("connect", () => {
                socket.destroy();
                resolve();
            });

            const onError = () => {
                socket.destroy();

                if (Date.now() - startTime >= timeoutMs) {
                    reject(new Error(`Timed out waiting for adapter at ${host}:${port}`));
                    return;
                }

                setTimeout(tryConnect, 100);
            };

            socket.on("error", onError);
            socket.on("timeout", onError);

            socket.connect(port, host);
        };

        tryConnect();
    });
}

export function activate(context) {
    context.subscriptions.push(
        vscode.debug.registerDebugAdapterDescriptorFactory(DEBUG_TYPE, {
            async createDebugAdapterDescriptor(session) {
                const config = session.configuration;
                const host = config.host || "127.0.0.1";
                const port = Number(config.port) || DEFAULT_PORT;

                let childProcess = null;

                if (config?.request === "launch" && config.program) {
                    childProcess = await spawnProcess(config);
                }

                try {
                    await waitForPort(host, port);
                } catch (err) {
                    childProcess?.kill();
                    throw err;
                }

                return new vscode.DebugAdapterServer(port, host);
            },
        }),
    );
}

export function deactivate() {}
