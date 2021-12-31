/**
 * 连接时失败/连接中出现异常的 重连定时器
 */
var timeout;

/**
 * 封装的mqttConnect对象
 * @param {Object} options 
 */
var MqttConnect = function(options) {

	var this_ = this;
	var client;

	this.host = options.host; //amq的ip ex:locahost
	this.port = Number(options.port); //amq的端口号 ex:61414
	this.user = options.user; //用户名 ex:admin
	this.password = options.password; //密码 ex:admin123
	this.destination = options.destination; //需要订阅的destination 
	this.clientId = options.clientId; //clientId必须唯一哦,我当初用的timestamp,
	                                  //注意是字符串类型噢 new Date().getTime().toString()

	// 创建连接
	this.createConnect = function() {
		console.log("开始创建amq连接.....");
		this_.client = new Messaging.Client(this_.host, this_.port, this_.clientId);
		this_.client.connect({
			userName: this_.user,
			password: this_.password,
			onSuccess: function() {
				// 创建连接成功后的订阅destination
				// 这里可以订阅多个主题，也可以手动添加,或者传一个主题数组进来,遍历数组订阅
				this_.client.subscribe(this_.destination);
				console.log(this_.destination + ":创建连接成功！");
			},
			onFailure: function(failure) {
				// 连接失败,自动重连
				console.log("连接失败:"+failure.errorMessage);
				if (timeout) {
					clearTimeout(timeout);
				}
				timeout = setTimeout(function() {
					this_.createConnect();
				}, 5000);
			},

		});
		// 收到数据
		this_.client.onMessageArrived = function() {
			// 这个方法可以在调用的时候重写.处理数据
		}

		// 发送数据
		this_.client.sendMessage = function(text) {
			var message = new Messaging.Message(text);
			message.destinationName = destination;
			console.log("amq发送数据："+text)
			this_.client.send(message);
		}

		// 失去连接自动重连 
		this_.client.onConnectionLost = function(responseObject) {
			if (responseObject.errorCode !== 0) {
				console.log(this_.client.clientId + ": " + responseObject.errorCode + "\n");
			}
			if (timeout) {
				clearTimeout(timeout)
			}
			timeout = setTimeout(function() {
				this_.createConnect();
			}, 5000);
		}
		return this_;
	}
}
