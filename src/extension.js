import { spawn } from "child_process";
import * as vscode from "vscode";

const DEBUG_TYPE = "moonbug";
const DEFAULT_PORT = 8888;

export function activate(context) {
    context.subscriptions.push(
        vscode.debug.registerDebugAdapterDescriptorFactory(DEBUG_TYPE, {
            createDebugAdapterDescriptor(session) {
                const config = session.configuration;
                const host = config.host || "127.0.0.1";
                const port = Number(config.port) || DEFAULT_PORT;

                if (config?.request === "launch" && config.program) {
                    const child = spawn(
                        config.lua || "lua",
                        [config.program, ...(config.args ?? [])],
                        {
                            cwd: config.project_root_dir || process.cwd(),
                            env: process.env,
                            stdio: "ignore",
                        },
                    );
                    child.on("error", (err) => {
                        vscode.window.showErrorMessage(
                            `moonbug: could not start '${config.lua || "lua"}': ${err.message}`,
                        );
                    });
                }

                return new vscode.DebugAdapterServer(port, host);
            },
        }),
    );
}

export function deactivate() { }
