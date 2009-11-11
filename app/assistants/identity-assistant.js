function IdentityAssistant(showButton, disableButton)
{
	
	this.showButton = showButton;
		
	// setup default preferences in the prefCookie.js model
	this.cookie = new prefCookie();
	this.prefs = this.cookie.get();
	
	// setup menu
	this.menuModel =
	{
		visible: true,
		items:
		[
			{
				label: "Help",
				command: 'do-help'
			}
		]
	}
	
	this.identDoneModel = 
	{
		label:		"Done",
		disabled:	disableButton
	}
	
	this.nickList =			false;
	this.nickListModel =	{items:[]};
	this.nickListData =		[];
	this.nickListCount =	0;
	
	if (this.prefs.nicknames && this.prefs.nicknames.length > 0)
	{
		for (var n = 0; n < this.prefs.nicknames.length; n++)
		{
			this.nickListCount++;
			this.nickListData.push({id: this.nickListCount, index: this.nickListCount-1, value: this.prefs.nicknames[n]});
		}
	}
}

IdentityAssistant.prototype.setup = function()
{
	try
	{
		this.controller.setupWidget(Mojo.Menu.appMenu, { omitDefaultItems: true }, this.menuModel);
		
		this.controller.setDefaultTransition(Mojo.Transition.zoomFade);
		
		this.realName	= this.controller.get('realname');
		this.nickList	= this.controller.get('nickList');
		this.identDone	= this.controller.get('identDone');
		
		if (!this.showButton)
			this.identDone.hide();
		
		this.controller.setupWidget
		(
			'realname',
			{
				multiline: false,
				enterSubmits: false,
				//changeOnKeyPress: true,
				hintText: '',
				modelProperty: 'realname',
				maxLength: 128,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.prefs
		);
		Mojo.Event.listen(this.realName, Mojo.Event.propertyChange, this.textChanged);
		
		this.nickListBuildList();
		this.controller.setupWidget
		(
			'nickList',
			{
				itemTemplate: "identity/nick-row",
				swipeToDelete: true,
				reorderable: true,
				addItemLabel: 'Add',
				
				multiline: false,
				enterSubmits: false,
				modelProperty: 'value',
				changeOnKeyPress: true,
				charsAllow: this.validChars,
				maxLength: 16,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			},
			this.nickListModel
		);
		this.controller.setupWidget
		(
			'nickField',
			{
				multiline: false,
				enterSubmits: false,
				modelProperty: 'value',
				changeOnKeyPress: true,
				charsAllow: this.validChars,
				maxLength: 16,
				textCase: Mojo.Widget.steModeLowerCase,
				focusMode: Mojo.Widget.focusSelectMode
			}
		);
		
		Mojo.Event.listen(this.nickList, Mojo.Event.listAdd,			this.nickListAdd.bindAsEventListener(this));
		Mojo.Event.listen(this.nickList, Mojo.Event.propertyChanged,	this.nickListChange.bindAsEventListener(this));
		Mojo.Event.listen(this.nickList, Mojo.Event.listReorder,		this.nickListReorder.bindAsEventListener(this));
		Mojo.Event.listen(this.nickList, Mojo.Event.listDelete,			this.nickListDelete.bindAsEventListener(this));
		
		this.controller.setupWidget
		(
			'identDone',
			{},
			this.identDoneModel
		);
		Mojo.Event.listen(this.identDone, Mojo.Event.tap, this.identDoneTapped.bindAsEventListener(this));
		
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'preferences#setup');
	}

}

IdentityAssistant.prototype.validateIdentity = function()
{
	if (this.prefs.realname.length>0 && this.prefs.nicknames.length>0)
		this.identDoneModel.disabled = false;
	else
		this.identDoneModel.disabled = true;
	this.controller.modelChanged(this.identDoneModel);
	
	return !this.identDoneModel.disabled;
}

IdentityAssistant.prototype.identDoneTapped = function()
{
	try
	{
		this.controller.stageController.swapScene('server-list');
	}
	catch (e)
	{
		Mojo.Log.logException(e, 'ident#done');
	}
}

IdentityAssistant.prototype.validChars = function(test)
{
//	if (String.fromCharCode(test).match(/^[\x41-\x7D][-\d\x41-\x7D]*$/)) 
//	Allow 0(x30)-9(x39), A(x41)-Z(x5A), [(x5B), ](x5D), ^(x5E), _(x5F), `(x60), a(x61)-z(x7A), {(x7B), |(x7C), }(x7D), ~(x7E), -(x2D)
	if (String.fromCharCode(test).match(/^[\x30-\x39\x41-\x5B\x5D-\x7E\x2D]*$/))
	{
		return true;
	}
	else
	{
		return false;
	}
}

IdentityAssistant.prototype.textChanged = function(event)
{
//	var error = false;
//	if (!event.value.match(/^[\x41-\x7D][-\d\x41-\x7D]*$/)) error = true;
	
	this.cookie.put(this.prefs);
	this.validateIdentity();
}


IdentityAssistant.prototype.nickListBuildList = function()
{
	this.nickListModel.items = [];
	if (this.nickListData.length > 0)
	{
		for (var d = 0; d < this.nickListData.length; d++)
		{
			this.nickListModel.items.push(this.nickListData[d]);
		}
	}
}
IdentityAssistant.prototype.nickListAdd = function(event)
{
	this.nickListCount++;
	this.nickListData.push({id: this.nickListCount, index: this.nickListData.length, value: ''});
	
	this.nickListBuildList();
	
	this.nickList.mojo.noticeUpdatedItems(0, this.nickListModel.items);
	this.nickList.mojo.setLength(this.nickListModel.items.length);
	
	this.nickList.mojo.focusItem(this.nickListModel.items[this.nickListModel.items.length-1]);
	
	this.nickListSave();
}
IdentityAssistant.prototype.nickListChange = function(event)
{
	this.nickListSave();
}
IdentityAssistant.prototype.nickListReorder = function(event)
{
	for (var d = 0; d < this.nickListData.length; d++) 
	{
		if (this.nickListData[d].index == event.fromIndex) 
		{
			this.nickListData[d].index = event.toIndex;
		}
		else 
		{
			if (event.fromIndex > event.toIndex) 
			{
				if (this.nickListData[d].index < event.fromIndex &&
				this.nickListData[d].index >= event.toIndex) 
				{
					this.nickListData[d].index++;
				}
			}
			else if (event.fromIndex < event.toIndex) 
			{
				if (this.nickListData[d].index > event.fromIndex &&
				this.nickListData[d].index <= event.toIndex) 
				{
					this.nickListData[d].index--;
				}
			}
		}
	}
	this.nickListSave();
}
IdentityAssistant.prototype.nickListDelete = function(event)
{
	var newData = [];
	if (this.nickListData.length > 0) 
	{
		for (var d = 0; d < this.nickListData.length; d++) 
		{
			if (this.nickListData[d].id == event.item.id) 
			{
				// ignore
			}
			else 
			{
				if (this.nickListData[d].index > event.index) 
				{
					this.nickListData[d].index--;
				}
				newData.push(this.nickListData[d]);
			}
		}
	}
	this.nickListData = newData;
	this.nickListSave();
}
IdentityAssistant.prototype.nickListSave = function()
{
	if (this.nickListData.length > 0) 
	{
		if (this.nickListData.length > 1) 
		{
			this.nickListData.sort(function(a, b)
			{
				return a.index - b.index;
			});
		}
		
		for (var i = 0; i < this.nickListModel.items.length; i++) 
		{
			for (var d = 0; d < this.nickListData.length; d++) 
			{
				if (this.nickListData[d].id == this.nickListModel.items[i].id) 
				{
					this.nickListData[d].value = this.nickListModel.items[i].value;
				}
			}
		}
	}
	
	this.prefs.nicknames = [];
	if (this.nickListData.length > 0) 
	{
		for (var d = 0; d < this.nickListData.length; d++) 
		{
			if (this.nickListData[d].value) 
			{
				this.prefs.nicknames.push(this.nickListData[d].value);
			}
		}
	}
	
	this.cookie.put(this.prefs);
	this.validateIdentity();
}


IdentityAssistant.prototype.deactivate = function(event)
{
	this.nickListSave();
	
	// reload global storage of preferences when we get rid of this stage
	var tmp = prefs.get(true);
}
IdentityAssistant.prototype.cleanup = function(event)
{
	Mojo.Event.stopListening(this.realName, Mojo.Event.propertyChange,	this.textChanged);
	Mojo.Event.stopListening(this.nickList, Mojo.Event.listAdd,			this.nickListAdd.bindAsEventListener(this));
	Mojo.Event.stopListening(this.nickList, Mojo.Event.propertyChanged,	this.nickListChange.bindAsEventListener(this));
	Mojo.Event.stopListening(this.nickList, Mojo.Event.listReorder,		this.nickListReorder.bindAsEventListener(this));
	Mojo.Event.stopListening(this.nickList, Mojo.Event.listDelete,		this.nickListDelete.bindAsEventListener(this));
	Mojo.Event.stopListening(this.identDone, Mojo.Event.tap, this.identDoneTapped);
}
