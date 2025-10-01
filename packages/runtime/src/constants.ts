export const SUBSCRIPTION_ON_RUNTIME_MCP_SERVERS = (uid: string) => `
subscription OnRuntimeMCPServers {
    runtimeMCPServers(uid: "${uid}") {
    uid
    name
    description
    package
    repositoryUrl
    mcpServerType
    command
    args
    ENV
    serverUrl
    notificationType
    }
}
`;
