export function getServerApiUrl() {
    return process.env.API_URL ?? "http://localhost:8080";
}
