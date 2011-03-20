var connectionInfo = {}
connectionManager.identifier = 'palm://com.palm.connectionmanager';

function connectionManager() {}

connectionManager.watchStatus = function(callback)
{
	var request = new Mojo.Service.Request(connectionManager.identifier,
	{
		method: 'getStatus',
		parameters: {
			"subscribe":true
		},
		onSuccess: callback,
		onFailure: callback
	});

	return request;
}
