
var client; // 客户端
var destination; // 订阅的主题

createConnect();
function createConnect() {
	var options = {};
	options.host = "localhost";
	options.port = "61614";
	options.user = "admin";
	options.password = "admin";
	options.destination = "AMQ_WEBSOCKET";
	destination = options.destination;
	options.clientId = new Date().getTime().toString();
	mqttConnect = new MqttConnect(options).createConnect();
	mqttConnect.client.onMessageArrived = function(message){
		console.log("重写的onMessageArrived方法："+message.payloadString);
		$("#recvMsg").val(message.payloadString);
	}
}

function send() {
	var text = $("#sendMsg").val();
	mqttConnect.client.sendMessage(text);
	$("#sendMsg").val("");
}