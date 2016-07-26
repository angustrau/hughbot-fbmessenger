const hughbot = module.parent.exports;
const login = require("facebook-chat-api");
const request = require("request");
const stream = require("stream");

class FBMessenger extends hughbot.Adapter {
    constructor(robot) {
        super(robot, "FBMessenger");
    }

    connect() {
        login({
            email: process.env.HUGHBOT_FBMESSENGER_EMAIL,
            password: process.env.HUGHBOT_FBMESSENGER_PASSWORD
        }, (err, api) => {
            if (err) {
                this.robot.emit("error", "Error logging in to Facebook Messenger:");
                this.robot.emit("error", err);
                return;
            }

            api.setOptions({ listenEvents: true })

            this.send = (message) => {
                api.sendMessage({ body: message.message }, message.room);
            }

            this.image = (message) => {
                let image = new stream.PassThrough();

                request(message.imageURL).pipe(image)
                api.sendMessage({ attatchment: image }, message.room);
            }

            api.listen((err, e) => {
                if (err) {
                    this.robot.emit("error", e);
                    return;
                }

                switch (e.type) {
                    case "message":
                        break;
                    case "event":
                        break;
                }
            });
        });
    }
}

module.exports = (robot) => {
    if (!process.env.HUGHBOT_FBMESSENGER_EMAIL) {
        robot.emit("error", new Error("Set HUGHBOT_FBMESSENGER_EMAIL"));
        process.exit();
    }

    if (!process.env.HUGHBOT_FBMESSENGER_PASSWORD) {
        robot.emit("error", new Error("Set HUGHBOT_FBMESSENGER_PASSWORD"));
        process.exit();
    }

    robot.addAdapter(new FBMessenger(robot));
}