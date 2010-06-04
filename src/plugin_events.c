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

#include "wIRC.h"

void process_event(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count, irc_callbacks type) {

	wIRCd_client_t *client = (wIRCd_client_t*)irc_get_ctx(session);

	client->estabilshed = 1;

	char buf[1024];
	int cnt;
	int i;
	int j = 0;

	for (cnt = 0; cnt < count; cnt++) {
		if (cnt)
			buf[j++]=',';

		buf[j++]='"';

		for (i = 0; i < strlen(params[cnt]); i++) {
			if (params[cnt][i] == '"' || params[cnt][i] == '\\')
				buf[j++] = '\\';

			buf[j++] = params[cnt][i];
		}

		buf[j++]='"';
	}

	buf[j]='\0';

	int len = 0;
	char *parms = 0;
	len = asprintf(&parms, "[%s]", buf);

	char *id = 0;
	asprintf(&id, "%d", client->id);

	const char *payload[5];
	payload[0] = id;
	payload[1] = event;
	payload[2] = origin ? origin : "";
	payload[3] = parms;
	if (type == event_connect_) {
		payload[4] = inet_ntoa(session->local_addr);
	} else {
		payload[4] = 0;
	}

	//syslog(LOG_INFO, "irc-event: %s %s %s %s", payload[0], payload[1], payload[2], payload[3]);

	switch (type) {
	case event_connect_: PDL_CallJS("event_connect", payload, 5); break;
	case event_nick_: PDL_CallJS("event_nick", payload, 4); break;
	case event_quit_: PDL_CallJS("event_quit", payload, 4); break;
	case event_join_: PDL_CallJS("event_join", payload, 4); break;
	case event_part_: PDL_CallJS("event_part", payload, 4); break;
	case event_mode_: PDL_CallJS("event_mode", payload, 4); break;
	case event_umode_: PDL_CallJS("event_umode", payload, 4); break;
	case event_topic_: PDL_CallJS("event_topic", payload, 4); break;
	case event_kick_: PDL_CallJS("event_kick", payload, 4); break;
	case event_channel_: PDL_CallJS("event_channel", payload, 4); break;
	case event_privmsg_: PDL_CallJS("event_privmsg", payload, 4); break;
	case event_notice_: PDL_CallJS("event_notice", payload, 4); break;
	case event_channel_notice_: PDL_CallJS("event_channel_notice", payload, 4); break;
	case event_invite_: PDL_CallJS("event_invite", payload, 4); break;
	case event_ctcp_req_: PDL_CallJS("event_ctcp_req", payload, 4); break;
	case event_ctcp_rep_: PDL_CallJS("event_ctcp_rep", payload, 4); break;
	case event_ctcp_action_: PDL_CallJS("event_ctcp_action", payload, 4); break;
	case event_unknown_: PDL_CallJS("event_unknown", payload, 4); break;
	case event_numeric_: PDL_CallJS("event_numeric", payload, 4); break;
	}

	if (parms) free(parms);
	if (id) free(id);

}

void *ping_server(void *ptr) {
	wIRCd_client_t *client = (wIRCd_client_t *)ptr;
	while (client->ping_server) {
		if (pthread_mutex_trylock(&client->ping_mutex)==0) {
			ftime(&client->ping);
			irc_send_raw(client->session, "PING %s", client->realServer);
		}
		sleep(10);
	}
}

void handle_event_connect(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count) {

	wIRCd_client_t *client = (wIRCd_client_t*)irc_get_ctx(session);

	client->realServer = strdup(origin);
	pthread_create(&client->ping_thread, NULL, ping_server, (void*)client);

	syslog(LOG_INFO, "Connection established");
	process_event(session, event, origin, params, count, event_connect_);

}

void handle_event_nick(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count) {
	process_event(session, event, origin, params, count, event_nick_);
}

void handle_event_quit(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count) {
	process_event(session, event, origin, params, count, event_quit_);
}

void handle_event_join(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count) {
	process_event(session, event, origin, params, count, event_join_);
}

void handle_event_part(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count) {
	process_event(session, event, origin, params, count, event_part_);
}

void handle_event_mode(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count) {
	process_event(session, event, origin, params, count, event_mode_);
}

void handle_event_umode(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count) {
	process_event(session, event, origin, params, count, event_umode_);
}

void handle_event_topic(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count) {
	process_event(session, event, origin, params, count, event_topic_);
}

void handle_event_kick(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count) {
	process_event(session, event, origin, params, count, event_kick_);
}

void handle_event_channel(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count) {
	process_event(session, event, origin, params, count, event_channel_);
}

void handle_event_privmsg(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count) {
	process_event(session, event, origin, params, count, event_privmsg_);
}

void handle_event_notice(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count) {
	process_event(session, event, origin, params, count, event_notice_);
}

void handle_event_channel_notice(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count) {
	process_event(session, event, origin, params, count, event_channel_notice_);
}

void handle_event_invite(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count) {
	process_event(session, event, origin, params, count, event_invite_);
}

void handle_event_ctcp_req(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count) {
	process_event(session, event, origin, params, count, event_ctcp_req_);
}

void handle_event_ctcp_rep(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count) {
	process_event(session, event, origin, params, count, event_ctcp_rep_);
}

void handle_event_ctcp_action(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count) {
	process_event(session, event, origin, params, count, event_ctcp_action_);
}

void handle_event_unknown(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count) {

	wIRCd_client_t *client = (wIRCd_client_t*)irc_get_ctx(session);

	if (strcmp(event,"PONG")==0) {
		struct timeb pong;
		ftime(&pong);
		long rtt = (pong.time*1000+pong.millitm)-(client->ping.time*1000+client->ping.millitm);
		if (debug)
			syslog(LOG_INFO, "PING/PONG RTT from %s: %ld", params[0], rtt);
		int len = 0;
		char *server = 0;
		len = asprintf(&server, "%s", params[0]);
		char *rtt_string = 0;
		len = asprintf(&rtt_string, "%ld", rtt);
		char *id = 0;
		asprintf(&id, "%d", client->id);
		const char *payload[3];
		payload[0] = id;
		payload[1] = server;
		payload[2] = rtt_string;
		PDL_CallJS("auto_ping", payload, 3);
		if (id) free(id);
		if (server) free(server);
		if (rtt_string) free(rtt_string);
		pthread_mutex_unlock(&client->ping_mutex);
	}

	process_event(session, event, origin, params, count, event_unknown_);
}

void handle_event_numeric(irc_session_t * session, unsigned int event, const char * origin, const char ** params, unsigned int count) {
	char buf[24];
	sprintf(buf, "%d", event);
	process_event(session, buf, origin, params, count, event_numeric_);
}

void setup_event_callbacks() {

	memset(&callbacks, 0, sizeof(callbacks));
	callbacks.event_connect = handle_event_connect;
	callbacks.event_nick = handle_event_nick;
	callbacks.event_quit = handle_event_quit;
	callbacks.event_join = handle_event_join;
	callbacks.event_part = handle_event_part;
	callbacks.event_mode = handle_event_mode;
	callbacks.event_umode = handle_event_umode;
	callbacks.event_topic = handle_event_topic;
	callbacks.event_kick = handle_event_kick;
	callbacks.event_channel = handle_event_channel;
	callbacks.event_privmsg = handle_event_privmsg;
	callbacks.event_notice = handle_event_notice;
	callbacks.event_channel_notice = handle_event_channel_notice;
	callbacks.event_invite = handle_event_invite;
	callbacks.event_ctcp_req = handle_event_ctcp_req;
	callbacks.event_ctcp_rep = handle_event_ctcp_rep;
	callbacks.event_ctcp_action = handle_event_ctcp_action;
	callbacks.event_unknown = handle_event_unknown;
	callbacks.event_numeric = handle_event_numeric;

}
