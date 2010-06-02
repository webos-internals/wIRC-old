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

	estabilshed = 1;

	char buf[1024];
	int cnt;
	int i;
	int j = 0;

	for (cnt = 0; cnt < count; cnt++) {
		if (cnt)
			buf[j++]=',';

		buf[j++]='"';

		for (i = 0; i < strlen(params[cnt]); i++) {
			if (params[cnt][i] == '"')
				buf[j++] = '\\';

			buf[j++] = params[cnt][i];
		}

		buf[j++]='"';
	}

	buf[j]='\0';

	int len = 0;
	char *parms = 0;
	len = asprintf(&parms, "[%s]", buf);

	const char *payload[4];
	payload[0] = event;
	payload[1] = origin ? origin : "";
	payload[2] = parms;
	if (type == event_connect_) {
		payload[3] = 0;//inet_ntoa(session->local_addr);
	} else {
		payload[3] = 0;
	}

	syslog(LOG_INFO, "irc-event: %s %s %s", payload[0], payload[1], payload[2]);

	switch (type) {
	case event_connect_: PDL_CallJS("event_connect", payload, 4); break;
	case event_nick_: PDL_CallJS("event_nick", payload, 3); break;
	case event_quit_: PDL_CallJS("event_quit", payload, 3); break;
	case event_join_: PDL_CallJS("event_join", payload, 3); break;
	case event_part_: PDL_CallJS("event_part", payload, 3); break;
	case event_mode_: PDL_CallJS("event_mode", payload, 3); break;
	case event_umode_: PDL_CallJS("event_umode", payload, 3); break;
	case event_topic_: PDL_CallJS("event_topic", payload, 3); break;
	case event_kick_: PDL_CallJS("event_kick", payload, 3); break;
	case event_channel_: PDL_CallJS("event_channel", payload, 3); break;
	case event_privmsg_: PDL_CallJS("event_privmsg", payload, 3); break;
	case event_notice_: PDL_CallJS("event_notice", payload, 3); break;
	case event_channel_notice_: PDL_CallJS("event_channel_notice", payload, 3); break;
	case event_invite_: PDL_CallJS("event_invite", payload, 3); break;
	case event_ctcp_req_: PDL_CallJS("event_ctcp_req", payload, 3); break;
	case event_ctcp_rep_: PDL_CallJS("event_ctcp_rep", payload, 3); break;
	case event_ctcp_action_: PDL_CallJS("event_ctcp_action", payload, 3); break;
	case event_unknown_: PDL_CallJS("event_unknown", payload, 3); break;
	case event_numeric_: PDL_CallJS("event_numeric", payload, 3); break;
	}

	if (parms) free(parms);

}

void *do_ping_server(void *ptr) {
	while (ping_server) {
		if (pthread_mutex_trylock(&ping_mutex)==0) {
			ftime(&ping);
			irc_send_raw(session, "PING %s", realServer);
		}
		sleep(5);
	}
}

void handle_event_connect(irc_session_t * session, const char * event, const char * origin, const char ** params, unsigned int count) {

	realServer = strdup(origin);
	pthread_create(&ping_thread, NULL, do_ping_server, NULL);

	if (debug)
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

	if (strcmp(event,"PONG")==0) {
		struct timeb pong;
		ftime(&pong);
		long rtt = (pong.time*1000+pong.millitm)-(ping.time*1000+ping.millitm);
		if (debug)
			syslog(LOG_INFO, "PING/PONG RTT from %s: %ld", params[0], rtt);
		int len = 0;
		char *rtt_string = 0;
		len = asprintf(&rtt_string, "{\"server\":\"%s\",\"rtt\":%ld}", params[0], rtt);
		const char *payload[2];
		payload[0] = params[0];
		payload[1] = rtt_string;
		PDL_CallJS("auto_ping", payload, 2);
		if (rtt_string) free(rtt_string);
		pthread_mutex_unlock(&ping_mutex);
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
