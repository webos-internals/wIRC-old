/*=============================================================================
 Copyright (C) 2009-2010 Ryan Hope <rmh3093@gmail.com>

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

#include "wIRC.h"

typedef enum {
	msg_,
	me_,
	notice_,
	join_,
	part_,
	invite_,
	names_,
	list_,
	topic_,
	channel_mode_,
	kick_,
	nick_,
	quit_,
	whois_,
	user_mode_,
	ping_,
	away_,
	disconnect_,
	raw_,
	ip_,
} irc_cmd;

int irc_custom_cmd_away(irc_session_t *session, const char *reason) {
	int retVal = -1;
	if (reason)
		retVal = irc_send_raw(session, "AWAY :%s", reason);
	else
		retVal = irc_send_raw(session, "AWAY");
	return retVal;
}

void *client_run(void *ptr) {

	wIRCd_client_t *server = &servers[*(int*) ptr];

	int retry = 0;

	while (retry <= max_retries) {

		server->session = irc_create_session(&callbacks, server->interface);
		if (!server->session)
			return;

		irc_set_ctx(server->session, server);

		int c = irc_connect(server->session, server->server, server->port,
				server->server_password, server->nick, server->username,
				server->realname);
		usleep(pre_run_usleep);

		irc_run(server->session);

		irc_destroy_session(server->session);
		memset(server, -1, sizeof(server));

		if (server->estabilshed) {
			return;
		} else {
			retry++;
			syslog(LOG_INFO, "Retry %d", retry);
		}

	}

}

PDL_bool client_connect(PDL_JSParameters *params) {

	PDL_bool retVal = PDL_TRUE;

	int id = PDL_GetJSParamInt(params, 0);

	syslog(LOG_INFO, "Connecting to server: %d", id);

	if (servers[id].id != -1)
		return PDL_FALSE;

	servers[id].id = id;
	servers[id].server = PDL_GetJSParamString(params, 1);
	servers[id].port = PDL_GetJSParamInt(params, 2);
	servers[id].username = PDL_GetJSParamString(params, 3);
	servers[id].server_password = PDL_GetJSParamString(params, 4);
	servers[id].nick = PDL_GetJSParamString(params, 5);
	servers[id].realname = PDL_GetJSParamString(params, 6);
	servers[id].interface = PDL_GetJSParamString(params, 7);
	servers[id].estabilshed = 0;
	servers[id].worker_thread = 0;
	servers[id].realServer = 0;

	if (pthread_create(&servers[id].worker_thread, NULL, client_run,
			(void*) &id)) {
		PDL_JSReply(params,
				"{\"returnValue\":-1,\"errorText\":\"Failed to create thread\"}");
		retVal = PDL_FALSE;
	}
	PDL_JSReply(params, "{\"returnValue\":0}");

	return retVal;

}

PDL_bool client_cmd_msg(PDL_JSParameters *params) {
	return irc_cmd_msg(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamString(params, 1), PDL_GetJSParamString(params, 2));
}

PDL_bool client_cmd_me(PDL_JSParameters *params) {
	return irc_cmd_me(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamString(params, 1), PDL_GetJSParamString(params, 2));
}

PDL_bool client_cmd_notice(PDL_JSParameters *params) {
	return irc_cmd_notice(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamString(params, 1), PDL_GetJSParamString(params, 2));
}

PDL_bool client_cmd_join(PDL_JSParameters *params) {
	return irc_cmd_join(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamString(params, 1), PDL_GetJSParamString(params, 2));
}

PDL_bool client_cmd_part(PDL_JSParameters *params) {
	return irc_cmd_part(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamString(params, 1), PDL_GetJSParamString(params, 2));
}

PDL_bool client_cmd_invite(PDL_JSParameters *params) {
	return irc_cmd_invite(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamString(params, 1), PDL_GetJSParamString(params, 2));
}

PDL_bool client_cmd_names(PDL_JSParameters *params) {
	return irc_cmd_names(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamString(params, 1));
}

PDL_bool client_cmd_list(PDL_JSParameters *params) {
	return irc_cmd_list(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamString(params, 1));
}

PDL_bool client_cmd_topic(PDL_JSParameters *params) {
	return irc_cmd_topic(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamString(params, 1), PDL_GetJSParamString(params, 2));
}

PDL_bool client_cmd_channel_mode(PDL_JSParameters *params) {
	return irc_cmd_channel_mode(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamString(params, 1), PDL_GetJSParamString(params, 2));
}

PDL_bool client_cmd_kick(PDL_JSParameters *params) {
	return irc_cmd_kick(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamString(params, 2), PDL_GetJSParamString(params, 1),
			PDL_GetJSParamString(params, 3));
}

PDL_bool client_cmd_nick(PDL_JSParameters *params) {
	return irc_cmd_nick(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamString(params, 1));
}

PDL_bool client_cmd_quit(PDL_JSParameters *params) {
	return irc_cmd_quit(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamString(params, 1));
}

PDL_bool client_cmd_whois(PDL_JSParameters *params) {
	return irc_cmd_whois(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamString(params, 1));
}

PDL_bool client_cmd_user_mode(PDL_JSParameters *params) {
	return irc_cmd_user_mode(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamString(params, 1));
}

PDL_bool client_cmd_ping(PDL_JSParameters *params) {
	int id = PDL_GetJSParamInt(params, 0);
	if (pthread_mutex_trylock(&servers[id].ping_mutex) == 0) {
		ftime(&servers[id].ping);
		irc_send_raw(servers[id].session, "PING %s", PDL_GetJSParamString(
				params, 1));
	}
	return PDL_TRUE;
}

PDL_bool client_cmd_away(PDL_JSParameters *params) {
	return irc_custom_cmd_away(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamString(params, 1));
}

PDL_bool client_disconnect(PDL_JSParameters *params) {
	irc_disconnect(servers[PDL_GetJSParamInt(params, 0)].session);
	return PDL_TRUE;
}

PDL_bool client_send_raw(PDL_JSParameters *params) {
	return irc_send_raw(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamString(params, 1));
}

PDL_bool client_get_uid(PDL_JSParameters *params) {
	char uid[64];
	PDL_GetUniqueID(uid, 64);
	return PDL_JSReply(params, uid);
}

PDL_bool client_ctcp_rep(PDL_JSParameters *params) {
	int id = PDL_GetJSParamInt(params, 0);
	const char *nick = PDL_GetJSParamString(params, 1);
	const char *reply = PDL_GetJSParamString(params, 2);
	syslog(LOG_INFO, "CTCP REPLY: %d %s %s", id, nick, reply);
	irc_cmd_ctcp_reply(servers[id].session, nick, reply);
	return PDL_TRUE;
}

PDL_bool client_ctcp_cmd(PDL_JSParameters *params) {
	return irc_cmd_ctcp_request(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamString(params, 1), PDL_GetJSParamString(params, 2));
}

PDL_bool client_dcc_accept(PDL_JSParameters *params) {
	return irc_dcc_accept(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamInt(params, 1), NULL, handle_dcc_callback);
}

PDL_bool client_dcc_decline(PDL_JSParameters *params) {
	return irc_dcc_decline(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamInt(params, 1));
}

PDL_bool client_dcc_destroy(PDL_JSParameters *params) {
	return irc_dcc_destroy(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamInt(params, 1));
}

PDL_bool client_dcc_chat(PDL_JSParameters *params) {
	int id = PDL_GetJSParamInt(params, 0);
	irc_dcc_t *dcc_id = 0;
	int ret = irc_dcc_chat(servers[id].session, NULL,
			PDL_GetJSParamString(params, 1), handle_dcc_callback, dcc_id);
	/*if (ret==0)
		handle_pending_dcc_chat(id, &dcc_id);*/
	return ret;
}

PDL_bool client_dcc_sendfile(PDL_JSParameters *params) {
	int id = PDL_GetJSParamInt(params, 0);
	irc_dcc_t *dcc_id = 0;
	int ret = irc_dcc_sendfile(servers[id].session, NULL, PDL_GetJSParamString(params, 1), PDL_GetJSParamString(params, 2), handle_dcc_callback, dcc_id);
	/*if (ret==0)
		handle_pending_dcc_senfile(id, &dcc_id);*/
	return ret;
}

PDL_bool client_dcc_msg(PDL_JSParameters *params) {
	return irc_dcc_msg(servers[PDL_GetJSParamInt(params, 0)].session,
			PDL_GetJSParamInt(params, 1), PDL_GetJSParamString(params, 2));
}

int plugin_client_init() {

	int ret = 0;

	ret += PDL_RegisterJSHandler("connect", client_connect);
	ret += PDL_RegisterJSHandler("cmd_msg", client_cmd_msg);
	ret += PDL_RegisterJSHandler("cmd_me", client_cmd_me);
	ret += PDL_RegisterJSHandler("cmd_notice", client_cmd_notice);
	ret += PDL_RegisterJSHandler("cmd_join", client_cmd_join);
	ret += PDL_RegisterJSHandler("cmd_part", client_cmd_part);
	ret += PDL_RegisterJSHandler("cmd_invite", client_cmd_invite);
	ret += PDL_RegisterJSHandler("cmd_names", client_cmd_names);
	ret += PDL_RegisterJSHandler("cmd_list", client_cmd_list);
	ret += PDL_RegisterJSHandler("cmd_topic", client_cmd_topic);
	ret += PDL_RegisterJSHandler("cmd_channel_mode", client_cmd_channel_mode);
	ret += PDL_RegisterJSHandler("cmd_kick", client_cmd_kick);
	ret += PDL_RegisterJSHandler("cmd_nick", client_cmd_nick);
	ret += PDL_RegisterJSHandler("cmd_quit", client_cmd_quit);
	ret += PDL_RegisterJSHandler("cmd_whois", client_cmd_whois);
	ret += PDL_RegisterJSHandler("cmd_user_mode", client_cmd_user_mode);
	ret += PDL_RegisterJSHandler("cmd_ping", client_cmd_ping);
	ret += PDL_RegisterJSHandler("cmd_away", client_cmd_away);
	ret += PDL_RegisterJSHandler("disconnect", client_disconnect);
	ret += PDL_RegisterJSHandler("send_raw", client_send_raw);
	ret += PDL_RegisterJSHandler("get_uid", client_get_uid);
	ret += PDL_RegisterJSHandler("ctcp_rep", client_ctcp_rep);
	ret += PDL_RegisterJSHandler("ctcp_cmd", client_ctcp_cmd);
	ret += PDL_RegisterJSHandler("dcc_accept", client_dcc_accept);
	ret += PDL_RegisterJSHandler("dcc_msg", client_dcc_msg);
	ret += PDL_RegisterJSHandler("dcc_sendfile", client_dcc_sendfile);
	ret += PDL_RegisterJSHandler("dcc_chat", client_dcc_chat);
	ret += PDL_RegisterJSHandler("dcc_destroy", client_dcc_destroy);
	ret += PDL_RegisterJSHandler("dcc_decline", client_dcc_decline);

	return ret;

}
