/*=============================================================================
 Copyright (C) 2009 Ryan Hope <rmh3093@gmail.com>

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 =============================================================================*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#include "wIRCd.h"

bool process_subscription(LSHandle* lshandle, LSMessage *message, irc_callbacks type) {

	bool retVal = true;

	LSError lserror;
	LSErrorInit(&lserror);

	json_t *object = LSMessageGetPayloadJSON(message);

	char *sessionToken = 0;
	bool subscribe = false;
	json_get_string(object, "sessionToken", &sessionToken);
	json_get_bool(object, "subscribe", &subscribe);

	wIRCd_client_t *client = (wIRCd_client_t*)g_hash_table_lookup(wIRCd_clients, sessionToken);

	if (!subscribe) {
		LSMessageReply(lshandle,message,"{\"returnValue\":-1,\"errorText\":\"Expecting {\"subscribe\":true}\"}",&lserror);
		retVal = false;
		goto end;
	}

	if (sessionToken==0 || client==NULL) {
		LSMessageReply(lshandle,message,"{\"returnValue\":-1,\"errorText\":\"Missing or invalid sessionToken\"}",&lserror);
		retVal = false;
		goto end;
	}

	LSMessageRef(message);

	switch (type) {
	case event_connect_: client->msg_event_connect = message; break;
	case event_nick_: client->msg_event_nick = message; break;
	case event_quit_: client->msg_event_quit = message; break;
	case event_join_: client->msg_event_join = message; break;
	case event_part_: client->msg_event_part = message; break;
	case event_mode_: client->msg_event_mode = message; break;
	case event_umode_: client->msg_event_umode = message; break;
	case event_topic_: client->msg_event_topic = message; break;
	case event_kick_: client->msg_event_kick = message; break;
	case event_channel_: client->msg_event_channel = message; break;
	case event_privmsg_: client->msg_event_privmsg = message; break;
	case event_notice_: client->msg_event_notice = message; break;
	case event_channel_notice_: client->msg_event_channel_notice = message; break;
	case event_invite_: client->msg_event_invite = message; break;
	case event_ctcp_req_: client->msg_event_ctcp_req = message; break;
	case event_ctcp_rep_: client->msg_event_ctcp_rep = message; break;
	case event_ctcp_action_: client->msg_event_ctcp_action = message; break;
	case event_unknown_: client->msg_event_unknown = message; break;
	case event_numeric_: client->msg_event_numeric = message; break;
	case auto_ping_: client->msg_auto_ping = message; break;
	}

	end:

	LSErrorFree(&lserror);

	return retVal;

}

bool sub_event_connect(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, event_connect_);
}

bool sub_event_nick(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, event_nick_);
}

bool sub_event_quit(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, event_quit_);
}

bool sub_event_join(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, event_join_);
}

bool sub_event_part(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, event_part_);
}

bool sub_event_mode(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, event_mode_);
}

bool sub_event_umode(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, event_umode_);
}

bool sub_event_topic(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, event_topic_);
}

bool sub_event_kick(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, event_kick_);
}

bool sub_event_channel(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, event_channel_);
}

bool sub_event_privmsg(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, event_privmsg_);
}

bool sub_event_notice(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, event_notice_);
}

bool sub_event_channel_notice(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, event_channel_notice_);
}

bool sub_event_invite(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, event_invite_);
}

bool sub_event_ctcp_req(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, event_ctcp_req_);
}

bool sub_event_ctcp_rep(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, event_ctcp_rep_);
}

bool sub_event_ctcp_action(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, event_ctcp_action_);
}

bool sub_event_unknown(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, event_unknown_);
}

bool sub_event_numeric(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, event_numeric_);
}

bool sub_auto_ping(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_subscription(lshandle, message, auto_ping_);
}

LSMethod lssubscriptionmethods[] = {
		{"event_connect", sub_event_connect},
		{"event_nick", sub_event_nick},
		{"event_quit", sub_event_quit},
		{"event_join", sub_event_join},
		{"event_part", sub_event_part},
		{"event_mode", sub_event_mode},
		{"event_umode", sub_event_umode},
		{"event_topic", sub_event_topic},
		{"event_kick", sub_event_kick},
		{"event_channel", sub_event_channel},
		{"event_privmsg", sub_event_privmsg},
		{"event_notice", sub_event_notice},
		{"event_channel_notice", sub_event_channel_notice},
		{"event_invite", sub_event_invite},
		{"event_ctcp_req", sub_event_ctcp_req},
		{"event_ctcp_rep", sub_event_ctcp_rep},
		{"event_ctcp_action", sub_event_ctcp_action},
		{"event_unknown", sub_event_unknown},
		{"event_numeric", sub_event_numeric},
		{"auto_ping", sub_auto_ping},
		{0,0}
};

bool register_subscriptions(LSPalmService *serviceHandle, LSError lserror) {
	return LSPalmServiceRegisterCategory(serviceHandle, "/subscriptions",
			lssubscriptionmethods, NULL, NULL, NULL, &lserror);
}
