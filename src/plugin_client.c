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

#define IRC_MSG_BUF	512

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
		retVal = irc_send_raw(session,"AWAY :%s",reason);
	else
		retVal = irc_send_raw(session,"AWAY");
	return retVal;
}

void *client_run(void *ptr) {

	wIRCd_client_t *server = &servers[*(int*)ptr];

	int retry = 0;

	while (retry<=max_retries) {

		server->session = irc_create_session(&callbacks, server->interface);
		if (!server->session)
			return;

		irc_set_ctx(server->session, server);

		int c = irc_connect(server->session, server->server, server->port, server->server_password, server->nick, server->username, server->realname);
		usleep(pre_run_usleep);

		irc_run(server->session);

		if (server->estabilshed) {
			return;
		} else {
			irc_destroy_session(server->session);
			server->session = 0;
			retry++;
			syslog(LOG_INFO, "Retry %d", retry);
		}

	}

}

PDL_bool client_connect(PDL_JSParameters *params) {

	PDL_bool retVal = PDL_TRUE;

	int id = PDL_GetJSParamInt(params, 0);

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
	servers[id].ping_server = 1;

	if (pthread_create(&servers[id].worker_thread, NULL, client_run, (void*)&id)) {
		PDL_JSReply(params, "{\"returnValue\":-1,\"errorText\":\"Failed to create thread\"}");
		retVal = PDL_FALSE;
	}
	PDL_JSReply(params, "{\"returnValue\":0}");

	return retVal;

}

PDL_bool client_cmd_msg(PDL_JSParameters *params) {
	return irc_cmd_msg(servers[PDL_GetJSParamInt(params, 0)].session, PDL_GetJSParamString(params, 1), PDL_GetJSParamString(params, 2));
}

PDL_bool client_cmd_me(PDL_JSParameters *params) {
	return irc_cmd_me(servers[PDL_GetJSParamInt(params, 0)].session, PDL_GetJSParamString(params, 1), PDL_GetJSParamString(params, 2));
}

PDL_bool client_cmd_notice(PDL_JSParameters *params) {
	return irc_cmd_notice(servers[PDL_GetJSParamInt(params, 0)].session, PDL_GetJSParamString(params, 1), PDL_GetJSParamString(params, 2));
}

PDL_bool client_cmd_join(PDL_JSParameters *params) {
	return irc_cmd_join(servers[PDL_GetJSParamInt(params, 0)].session, PDL_GetJSParamString(params, 1), PDL_GetJSParamString(params, 2));
}

PDL_bool client_cmd_part(PDL_JSParameters *params) {
	return irc_cmd_part(servers[PDL_GetJSParamInt(params, 0)].session, PDL_GetJSParamString(params, 1));
}

PDL_bool client_cmd_invite(PDL_JSParameters *params) {
	return irc_cmd_invite(servers[PDL_GetJSParamInt(params, 0)].session, PDL_GetJSParamString(params, 1), PDL_GetJSParamString(params, 2));
}

PDL_bool client_cmd_names(PDL_JSParameters *params) {
	return irc_cmd_names(servers[PDL_GetJSParamInt(params, 0)].session, PDL_GetJSParamString(params, 1));
}

PDL_bool client_cmd_list(PDL_JSParameters *params) {
	return irc_cmd_list(servers[PDL_GetJSParamInt(params, 0)].session, PDL_GetJSParamString(params, 1));
}

PDL_bool client_cmd_topic(PDL_JSParameters *params) {
	return irc_cmd_topic(servers[PDL_GetJSParamInt(params, 0)].session, PDL_GetJSParamString(params, 1), PDL_GetJSParamString(params, 2));
}

PDL_bool client_cmd_channel_mode(PDL_JSParameters *params) {
	return irc_cmd_channel_mode(servers[PDL_GetJSParamInt(params, 0)].session, PDL_GetJSParamString(params, 1), PDL_GetJSParamString(params, 2));
}

PDL_bool client_cmd_kick(PDL_JSParameters *params) {
	return irc_cmd_kick(servers[PDL_GetJSParamInt(params, 0)].session, PDL_GetJSParamString(params, 1), PDL_GetJSParamString(params, 2), PDL_GetJSParamString(params, 3));
}

PDL_bool client_cmd_nick(PDL_JSParameters *params) {
	return irc_cmd_nick(servers[PDL_GetJSParamInt(params, 0)].session, PDL_GetJSParamString(params, 1));
}

PDL_bool client_cmd_quit(PDL_JSParameters *params) {
	return irc_cmd_quit(servers[PDL_GetJSParamInt(params, 0)].session, PDL_GetJSParamString(params, 1));
}

PDL_bool client_cmd_whois(PDL_JSParameters *params) {
	return irc_cmd_whois(servers[PDL_GetJSParamInt(params, 0)].session, PDL_GetJSParamString(params, 1));
}

PDL_bool client_cmd_user_mode(PDL_JSParameters *params) {
	return irc_cmd_user_mode(servers[PDL_GetJSParamInt(params, 0)].session, PDL_GetJSParamString(params, 1));
}

PDL_bool client_cmd_ping(PDL_JSParameters *params) {
	//return irc_cmd_ping(session, PDL_GetJSParamString(params, 0));
	return PDL_TRUE;
}

PDL_bool client_cmd_away(PDL_JSParameters *params) {
	return irc_custom_cmd_away(servers[PDL_GetJSParamInt(params, 0)].session, PDL_GetJSParamString(params, 1));
}

PDL_bool client_cmd_disconnect(PDL_JSParameters *params) {
	return irc_cmd_quit(servers[PDL_GetJSParamInt(params, 0)].session, PDL_GetJSParamString(params, 1));
}

PDL_bool client_send_raw(PDL_JSParameters *params) {
	return irc_send_raw(servers[PDL_GetJSParamInt(params, 0)].session, PDL_GetJSParamString(params, 1));
}

PDL_bool client_get_version(PDL_JSParameters *params) {

	return PDL_JSReply(params, VERSION);

}

int plugin_client_init() {

	int ret = 0;
	int tmp = 0;
	char *name = "";

	name = "connect";
	tmp = PDL_RegisterJSHandler(name, client_connect);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "cmd_msg";
	tmp = PDL_RegisterJSHandler(name, client_cmd_msg);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "cmd_me";
	tmp = PDL_RegisterJSHandler(name, client_cmd_me);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "cmd_notice";
	tmp = PDL_RegisterJSHandler(name, client_cmd_notice);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "cmd_join";
	tmp = PDL_RegisterJSHandler(name, client_cmd_join);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "cmd_part";
	tmp = PDL_RegisterJSHandler(name, client_cmd_part);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "cmd_invite";
	tmp = PDL_RegisterJSHandler(name, client_cmd_invite);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "cmd_names";
	tmp = PDL_RegisterJSHandler(name, client_cmd_names);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "cmd_list";
	tmp = PDL_RegisterJSHandler(name, client_cmd_list);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "cmd_topic";
	tmp = PDL_RegisterJSHandler(name, client_cmd_topic);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "cmd_channel_mode";
	tmp = PDL_RegisterJSHandler(name, client_cmd_channel_mode);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "cmd_kick";
	tmp = PDL_RegisterJSHandler(name, client_cmd_kick);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "cmd_nick";
	tmp = PDL_RegisterJSHandler(name, client_cmd_nick);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "cmd_quit";
	tmp = PDL_RegisterJSHandler(name, client_cmd_quit);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "cmd_whois";
	tmp = PDL_RegisterJSHandler(name, client_cmd_whois);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "cmd_user_mode";
	tmp = PDL_RegisterJSHandler(name, client_cmd_user_mode);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "cmd_ping";
	tmp = PDL_RegisterJSHandler(name, client_cmd_ping);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "cmd_away";
	tmp = PDL_RegisterJSHandler(name, client_cmd_away);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "cmd_disconnect";
	tmp = PDL_RegisterJSHandler(name, client_cmd_disconnect);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "send_raw";
	tmp = PDL_RegisterJSHandler(name, client_send_raw);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	name = "get_version";
	tmp = PDL_RegisterJSHandler(name, client_get_version);
	syslog(LOG_NOTICE, "Registering JS handler \"%s\": %d", name, tmp);
	ret +=tmp;

	return ret;

}
