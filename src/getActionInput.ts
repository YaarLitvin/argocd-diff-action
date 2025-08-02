import * as core from '@actions/core';

export interface ActionInput {
    arch: string;
    argocd: {
        cliVersion: string;
        excludePaths: string[];
        extraCliArgs: string;
        fqdn: string;
        headers: Map<string, string>;
        protocol: string;
        token: string;
        uri: string;
    };
    githubToken: string;
    timezone: string;
}

function parseHeaders(input: string): Map<string, string> {
    const headers = new Map<string, string>();

    // Handle empty input
    if (!input || input.trim() === '') {
        return headers;
    }

    for (const item of input.split(',')) {
        const trimmedItem = item.trim();
        if (!trimmedItem) continue;

        const colonIndex = trimmedItem.indexOf(':');
        if (colonIndex === -1) {
            // Skip items without colon
            continue;
        }

        const header = trimmedItem.substring(0, colonIndex).trim();
        const value = trimmedItem.substring(colonIndex + 1).trim();

        if (header && value) {
            headers.set(header, value);
        }
    }

    return headers;
}

export default function getActionInput(): ActionInput {
    const useTls = core.getInput('argocd-server-tls') === 'true';
    const fqdn = core.getInput('argocd-server-fqdn');
    const protocol = useTls ? 'https' : 'http';
    let extraCliArgs = core.getInput('argocd-extra-cli-args');

    core.debug(`TLS input: '${core.getInput('argocd-server-tls')}', useTls: ${useTls}, protocol: ${protocol}`);

    if (!useTls) {
        extraCliArgs += ' --plaintext';
    }

    return {
        arch: process.env.ARCH || 'linux',
        argocd: {
            cliVersion: core.getInput('argocd-version'),
            excludePaths: core.getInput('argocd-exclude-paths').split(','),
            extraCliArgs,
            fqdn,
            headers: parseHeaders(core.getInput('argocd-headers')),
            protocol,
            token: core.getInput('argocd-token'),
            uri: `${protocol}://${fqdn}`,
        },
        githubToken: core.getInput('github-token'),
        timezone: core.getInput('timezone'),
    };
}
