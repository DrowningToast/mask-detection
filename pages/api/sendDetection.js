// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
//
var mqtt = require("mqtt");

var mqtt_host = "mqtt://driver.cloudmqtt.com";
var mqtt_topic = "/ESP/mask";
var options = {
  port: 18669,
  host: "mqtt://driver.cloudmqtt.com",
  clientId: "mqttjs_" + Math.random().toString(16).substr(2, 8),
  username: "ukncbglf",
  password: "HppcZFydGYNk",
  keepalive: 60,
  reconnectPeriod: 1000,
  protocolId: "MQIsdp",
  protocolVersion: 3,
  clean: true,
  encoding: "utf8",
};

export default function handler(req, res) {
  var client = mqtt.connect(mqtt_host, options);

  client.on("connect", () => {
    client.publish(mqtt_topic, req.body.className, function () {
      client.end();
    });
  });

  /**
   *
   * Send MQTT Function Here
   *
   */

  res.status(200).json({
    reply: `${req.body.className} detected with ${req.body.probability * 100}%`,
  });
}
