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

PDL_bool process_command(PDL_MojoParameters *params, irc_cmd type) {

	char *jsonResponse = 0;

	char nch[IRC_MSG_BUF];
	char txt[IRC_MSG_BUF];
	char channel[IRC_MSG_BUF];
	char key[IRC_MSG_BUF];
	char nick[IRC_MSG_BUF];
	char topic[IRC_MSG_BUF];
	char reason[IRC_MSG_BUF];
	char mode[IRC_MSG_BUF];
	char server[IRC_MSG_BUF];
	char command[IRC_MSG_BUF];

	PDL_GetParamString((PDL_ServiceParameters*)params, "nch", nch, IRC_MSG_BUF);
	PDL_GetParamString((PDL_ServiceParameters*)params, "text", txt, IRC_MSG_BUF);
	PDL_GetParamString((PDL_ServiceParameters*)params, "channel", channel, IRC_MSG_BUF);
	PDL_GetParamString((PDL_ServiceParameters*)params, "key", key, IRC_MSG_BUF);
	PDL_GetParamString((PDL_ServiceParameters*)params, "nick", nick, IRC_MSG_BUF);
	PDL_GetParamString((PDL_ServiceParameters*)params, "topic", topic, IRC_MSG_BUF);
	PDL_GetParamString((PDL_ServiceParameters*)params, "reason", reason, IRC_MSG_BUF);
	PDL_GetParamString((PDL_ServiceParameters*)params, "mode", mode, IRC_MSG_BUF);
	PDL_GetParamString((PDL_ServiceParameters*)params, "server", server, IRC_MSG_BUF);
	PDL_GetParamString((PDL_ServiceParameters*)params, "command", command, IRC_MSG_BUF);

	int len = 0;
	if (txt)
		len = strlen(txt);

	char text[len];

	int i = 0;
	int c = 0;
	while(txt && txt[c]) {
		if (txt[c] == '\\' && txt[c+1] == '"') {
			c++;
		}
		text[i++] = txt[c++];
	}

	text[i] = '\0';

	int retVal = -1;
	switch (type) {
	case msg_: retVal = irc_cmd_msg(client->session, nch, text); break;
	case me_: retVal = irc_cmd_me(client->session, nch, text); break;
	case notice_: retVal = irc_cmd_notice(client->session, nch, text); break;
	case join_: retVal = irc_cmd_join(client->session, channel, key); break;
	case part_: retVal = irc_cmd_part(client->session, channel); break;
	case invite_: retVal = irc_cmd_invite(client->session, nick, channel); break;
	case names_: retVal = irc_cmd_names(client->session, channel); break;
	case list_: retVal = irc_cmd_list(client->session, channel); break;
	case topic_: retVal = irc_cmd_topic(client->session, channel, topic); break;
	case channel_mode_: retVal = irc_cmd_channel_mode(client->session, channel, mode); break;
	case kick_: retVal = irc_cmd_kick(client->session, nick, channel, reason); break;
	case nick_: retVal = irc_cmd_nick(client->session, nick); break;
	case quit_: retVal = irc_cmd_quit(client->session, reason); break;
	case whois_: retVal = irc_cmd_whois(client->session, nick); break;
	case user_mode_: retVal = irc_cmd_user_mode(client->session, mode); break;
	case ping_:
		/*if (pthread_mutex_trylock(&client->ping_mutex)==0) {
			ftime(&client->ping);
			irc_send_raw(client->session, "PING %s", server);
			retVal = 0;
		} else retVal = 1;*/
		break;
	case away_: retVal = irc_custom_cmd_away(client->session, reason); break;
	case raw_: retVal = irc_send_raw(client->session, "%s", command); break;
	case disconnect_: irc_disconnect(client->session); break;
	}
	len = asprintf(&jsonResponse, "{\"returnValue\":%d}", retVal);
	if (jsonResponse) {
		PDL_MojoReply(params, jsonResponse);
		free(jsonResponse);
	} else {
		PDL_MojoReply(params, "{\"returnValue\":-1,\"errorText\":\"Generic error\"}");
	}

	return retVal;

}

PDL_bool client_cmd_msg(PDL_MojoParameters *params) {
	return process_command(params, msg_);
}

PDL_bool client_cmd_me(PDL_MojoParameters *params) {
	return process_command(params, me_);
}

PDL_bool client_cmd_notice(PDL_MojoParameters *params) {
	return process_command(params, notice_);
}

PDL_bool client_cmd_join(PDL_MojoParameters *params) {
	return process_command(params, join_);
}

PDL_bool client_cmd_part(PDL_MojoParameters *params) {
	return process_command(params, part_);
}

PDL_bool client_cmd_invite(PDL_MojoParameters *params) {
	return process_command(params, invite_);
}

PDL_bool client_cmd_names(PDL_MojoParameters *params) {
	return process_command(params, names_);
}

PDL_bool client_cmd_list(PDL_MojoParameters *params) {
	return process_command(params, list_);
}

PDL_bool client_cmd_topic(PDL_MojoParameters *params) {
	return process_command(params, topic_);
}

PDL_bool client_cmd_channel_mode(PDL_MojoParameters *params) {
	return process_command(params, channel_mode_);
}

PDL_bool client_cmd_kick(PDL_MojoParameters *params) {
	return process_command(params, kick_);
}

PDL_bool client_cmd_nick(PDL_MojoParameters *params) {
	return process_command(params, nick_);
}

PDL_bool client_cmd_quit(PDL_MojoParameters *params) {
	return process_command(params, quit_);
}

PDL_bool client_cmd_whois(PDL_MojoParameters *params) {
	return process_command(params, whois_);
}

PDL_bool client_cmd_user_mode(PDL_MojoParameters *params) {
	return process_command(params, user_mode_);
}

PDL_bool client_cmd_ping(PDL_MojoParameters *params) {
	return process_command(params, ping_);
}

PDL_bool client_cmd_away(PDL_MojoParameters *params) {
	return process_command(params, away_);
}

PDL_bool client_cmd_disconnect(PDL_MojoParameters *params) {
	return process_command(params, disconnect_);
}

PDL_bool client_send_raw(PDL_MojoParameters *params) {
	return process_command(params, raw_);
}

PDL_bool client_get_version(PDL_MojoParameters *params) {

	char *jsonResponse = 0;
	int len = 0;

	len = asprintf(&jsonResponse, "{\"serviceVersion\":\"%s\"}", VERSION);

	if (jsonResponse) {
		PDL_MojoReply(params, jsonResponse);
		free(jsonResponse);
	} else {
		PDL_MojoReply(params, "{\"returnValue\":-1,\"errorText\":\"Generic error\"}");
	}

	return PDL_TRUE;
}

int plugin_client_init() {

	int ret = 0;

	ret += PDL_RegisterJSHandler("client_cmd_msg",			client_cmd_msg);
	ret += PDL_RegisterJSHandler("client_cmd_me",			client_cmd_me);
	ret += PDL_RegisterJSHandler("client_cmd_notice",		client_cmd_notice);
	ret += PDL_RegisterJSHandler("client_cmd_join",			client_cmd_join);
	ret += PDL_RegisterJSHandler("client_cmd_part",			client_cmd_part);
	ret += PDL_RegisterJSHandler("client_cmd_invite",		client_cmd_invite);
	ret += PDL_RegisterJSHandler("client_cmd_names",		client_cmd_names);
	ret += PDL_RegisterJSHandler("client_cmd_list",			client_cmd_list);
	ret += PDL_RegisterJSHandler("client_cmd_topic",		client_cmd_topic);
	ret += PDL_RegisterJSHandler("client_cmd_channel_mode",	client_cmd_channel_mode);
	ret += PDL_RegisterJSHandler("client_cmd_kick",			client_cmd_kick);
	ret += PDL_RegisterJSHandler("client_cmd_nick",			client_cmd_nick);
	ret += PDL_RegisterJSHandler("client_cmd_quit",			client_cmd_quit);
	ret += PDL_RegisterJSHandler("client_cmd_whois",		client_cmd_whois);
	ret += PDL_RegisterJSHandler("client_cmd_user_mode",	client_cmd_user_mode);
	ret += PDL_RegisterJSHandler("client_cmd_ping",			client_cmd_ping);
	ret += PDL_RegisterJSHandler("client_cmd_away",			client_cmd_away);
	ret += PDL_RegisterJSHandler("client_cmd_disconnect",	client_cmd_disconnect);
	ret += PDL_RegisterJSHandler("client_send_raw",			client_send_raw);
	ret += PDL_RegisterJSHandler("client_get_version",		client_get_version);

	return ret;

}
