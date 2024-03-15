// browser.proxy.settings.set({
//     value: {
//         proxyType: "none",
//     }
// });

const pendingRequests = [];

function completed(details) {
    // console.log(`completed: ${details.requestId}`);
    let index = pendingRequests.indexOf(details.requestId);
    if (index > -1)
        pendingRequests.splice(index, 1);
}

function completedWithError(details) {
    // console.log(`completed with error: ${details.requestId}`);
    let index = pendingRequests.indexOf(details.requestId);
    if (index > -1)
        pendingRequests.splice(index, 1);
}

function handleRequest(details) {
    let cred = localStorage.getItem("credentials").split(',');
    const credentials = {
        username: cred[0],
        password: atob(cred[1])
    };
    if (pendingRequests.includes(details.requestId))
        return { cancel: true }

    pendingRequests.push(details.requestId);
    // console.log(`providing credentials for: ${details.requestId}`, details);
    return { authCredentials: credentials };
}

browser.webRequest.onAuthRequired.addListener(
    handleRequest,
    { urls: ["<all_urls>"] },
    ["blocking"]
);

browser.webRequest.onCompleted.addListener(
    completed,
    { urls: ["<all_urls>"] }
);

browser.webRequest.onErrorOccurred.addListener(
    completedWithError,
    { urls: ["<all_urls>"] }
)