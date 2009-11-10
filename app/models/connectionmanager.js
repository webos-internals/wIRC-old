var connectionInfo = {}

connectionmanager.identifier = 'palm://com.palm.connectionmanager';

function connectionmanager() {}

connectionmanager.watchStatus = function(callback)
{
	var request = new Mojo.Service.Request(connectionmanager.identifier,
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
