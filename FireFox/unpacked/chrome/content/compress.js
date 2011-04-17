self.onmessage = function(e) {
    var message = e.data;
    if (message.action === "start") {
        // Do some computation
        self.postMessage({"action": "compressed", "value": message.value});
    }
};
