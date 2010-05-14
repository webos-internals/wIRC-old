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
#include <time.h>
#include <sys/timeb.h>

#include "wIRCd.h"

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

int unrefMessages(wIRCd_client_t *client) {
	if (client->msg_event_connect) LSMessageUnref(client->msg_event_connect);
	if (client->msg_event_nick) LSMessageUnref(client->msg_event_nick);
	if (client->msg_event_quit) LSMessageUnref(client->msg_event_quit);
	if (client->msg_event_join) LSMessageUnref(client->msg_event_join);
	if (client->msg_event_part) LSMessageUnref(client->msg_event_part);
	if (client->msg_event_mode) LSMessageUnref(client->msg_event_mode);
	if (client->msg_event_umode) LSMessageUnref(client->msg_event_umode);
	if (client->msg_event_topic) LSMessageUnref(client->msg_event_topic);
	if (client->msg_event_kick) LSMessageUnref(client->msg_event_kick);
	if (client->msg_event_channel) LSMessageUnref(client->msg_event_channel);
	if (client->msg_event_privmsg) LSMessageUnref(client->msg_event_privmsg);
	if (client->msg_event_notice) LSMessageUnref(client->msg_event_notice);
	if (client->msg_event_channel_notice) LSMessageUnref(client->msg_event_channel_notice);
	if (client->msg_event_invite) LSMessageUnref(client->msg_event_invite);
	if (client->msg_event_ctcp_req) LSMessageUnref(client->msg_event_ctcp_req);
	if (client->msg_event_ctcp_rep) LSMessageUnref(client->msg_event_ctcp_rep);
	if (client->msg_event_ctcp_action) LSMessageUnref(client->msg_event_ctcp_action);
	if (client->msg_event_unknown) LSMessageUnref(client->msg_event_unknown);
	if (client->msg_event_numeric) LSMessageUnref(client->msg_event_numeric);
	if (client->msg_auto_ping) LSMessageUnref(client->msg_auto_ping);
}

// Probably a race condition in this, probably need some sort of lock to be safe
void *live_or_die(void *ptr) {
	wIRCd_client_t *client = (wIRCd_client_t *)ptr;
	sleep(60);
	if (pthread_mutex_trylock(&client->mutex)==0) {
		if (debug)
			g_message("Destroying unused session: %s", client->sessionToken);
		g_hash_table_remove(wIRCd_clients, (gconstpointer)client->sessionToken);
		if (client->sessionToken) free(client->sessionToken);
		if (client) free(client);
	} else
		if (debug) g_message("Failed to get lock in live or die thread!", client->sessionToken);
}

void *client_run(void *ptr) {

	LSError lserror;
	LSErrorInit(&lserror);

	wIRCd_client_t *client = (wIRCd_client_t*)ptr;

	int retry = 0;

	while (true && retry<=max_retries) {

		client->session = irc_create_session(&callbacks, client->interface);
		if (!client->session) {
			//LSMessageReply(pub_serviceHandle,client->message_monolithic,"{\"returnValue\":-1,\"errorText\":\"Failed to create session\"}",&lserror);
			goto done;
		}

		irc_set_ctx(client->session, client);

		int c = irc_connect(client->session, client->server, (unsigned short int)client->port?client->port:6667,
				client->server_password, client->nick, client->username?client->username:"wirc", client->realname);
		usleep(pre_run_usleep);
		irc_run(client->session);

		if (client->estabilshed) {
			break;
		} else {
			irc_destroy_session(client->session);
			client->session = 0;
			retry++;
			g_message("Retry %d", retry);
		}

	}

	done:

	g_hash_table_remove(wIRCd_clients, (gconstpointer)client->sessionToken);

	unrefMessages(client);

	if (client->session) irc_destroy_session(client->session);
	if (client->interface) free(client->interface);
	if (client->username) free(client->username);
	if (client->sessionToken) free(client->sessionToken);
	if (client->server_password) free(client->server_password);
	if (client->server) free(client->server);
	if (client->realname) free(client->realname);
	if (client->nick) free(client->nick);
	if (client->realServer) free(client->realServer);
	if (client) free(client);

	LSErrorFree(&lserror);

}

bool client_connect(LSHandle* lshandle, LSMessage *message, void *ctx) {

	bool retVal = true;

	LSError lserror;
	LSErrorInit(&lserror);

	json_t *object = LSMessageGetPayloadJSON(message);

	char *sessionToken = 0;
	json_get_string(object, "sessionToken", &sessionToken);

	if (!sessionToken) {
		LSMessageReply(lshandle,message,"{\"returnValue\":-1,\"errorText\":\"Missing sessionToken\"}",&lserror);
		goto done;
	}

	wIRCd_client_t *client = 0;
	client = (wIRCd_client_t*)g_hash_table_lookup(wIRCd_clients, (gconstpointer)sessionToken);

	if (!client) {
		LSMessageReply(lshandle,message,"{\"returnValue\":-1,\"errorText\":\"Invalid sessionToken\"}",&lserror);
		goto done;
	}

	if (pthread_mutex_trylock(&client->mutex)!=0) {
		LSMessageReply(lshandle,message,"{\"returnValue\":-1,\"errorText\":\"Expired sessionToken\"}",&lserror);
		goto done;
	} else pthread_cancel(client->live_or_die_thread);

	if (debug)
		g_message("Connection requested by session: %s", client->sessionToken);

	char *server = 0;
	char *username = 0;
	char *server_password = 0;
	char *nick = 0;
	char *realname = 0;
	char *interface = 0;
	int port = 0;

	// Basic connection info
	json_get_string(object, "server", &server); // Required
	json_get_int(object, "port", &client->port);

	// Server related connection info
	json_get_string(object, "username", &username);
	json_get_string(object, "server_password", &server_password);

	// Basic user info
	json_get_string(object, "nick", &nick); // Required
	json_get_string(object, "realname", &realname);

	// Extra info
	json_get_string(object, "interface", &interface);

	if (server)
		client->server = strdup(server);
	if (username)
		client->username = strdup(username);
	if (server_password)
		client->server_password = strdup(server_password);
	if (nick)
		client->nick = strdup(nick);
	if (realname)
		client->realname = strdup(realname);
	if (interface)
		client->interface = strdup(interface);

	if (!client->server) {
		LSMessageReply(lshandle,message,"{\"returnValue\":-1,\"errorText\":\"Server missing\"}",&lserror);
		goto done;
	} else if (!client->nick) {
		LSMessageReply(lshandle,message,"{\"returnValue\":-1,\"errorText\":\"Nick missing\"}",&lserror);
		goto done;
	}

	//client->worker_thread = (pthread_t)malloc(sizeof(pthread_t));
	if (pthread_create(&client->worker_thread, NULL, client_run, (void*)client)) {
		LSMessageReply(lshandle,message,"{\"returnValue\":-1,\"errorText\":\"Failed to create thread\"}",&lserror);
		retVal = false;
	}
	LSMessageReply(lshandle,message,"{\"returnValue\":0}",&lserror);

	done:

	LSErrorFree(&lserror);

	return retVal;

}

bool process_command(LSHandle* lshandle, LSMessage *message, irc_cmd type) {

	bool retVal = true;

	LSError lserror;
	LSErrorInit(&lserror);

	json_t *object = LSMessageGetPayloadJSON(message);

	char *jsonResponse = 0;
	char *sessionToken = 0;
	char *nch = 0;
	char *txt = 0;
	char *channel = 0;
	char *key = 0;
	char *nick = 0;
	char *topic = 0;
	char *reason = 0;
	char *mode = 0;
	char *server = 0;
	char *command = 0;

	json_get_string(object, "sessionToken", &sessionToken);
	json_get_string(object, "nch", &nch);
	json_get_string(object, "text", &txt);
	json_get_string(object, "channel", &channel);
	json_get_string(object, "key", &key);
	json_get_string(object, "nick", &nick);
	json_get_string(object, "topic", &topic);
	json_get_string(object, "reason", &reason);
	json_get_string(object, "mode", &mode);
	json_get_string(object, "server", &server);
	json_get_string(object, "command", &server);

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

	if (!sessionToken)
		goto done;

	/*if (type==msg_||type==me_||type==notice_) {
		if (!nch || !text)
			goto done;
	}

	if (type==join_||type==invite_||type==topic_||type==kick_||type==part_||type==names_||type==list_||type==channel_mode_) {
		if (!channel)
			goto done;
	}

	if (type==join_) {
		if (!key)
			goto done;
	}

	if (type==invite_ || type==kick_) {
		if (!nick)
			goto done;
	}

	if (type==topic_) {
		if (!topic)
			goto done;
	}

	if (type==kick_) {
		if (!reason)
			goto done;
	}

	if (type==channel_mode_) {
		if (!mode)
			goto done;
	}*/

	if (debug && type==quit_) {
		g_message("Connection quit for session: %s", sessionToken);
	}

	wIRCd_client_t *client = (wIRCd_client_t*)g_hash_table_lookup(wIRCd_clients, sessionToken);
	if (client) {
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
			if (pthread_mutex_trylock(&client->ping_mutex)==0) {
				ftime(&client->ping);
				irc_send_raw(client->session, "PING %s", server);
				retVal = 0;
			} else retVal = 1;
			break;
		case away_: retVal = irc_custom_cmd_away(client->session, reason); break;
		case raw_: retVal = irc_send_raw(client->session, "%s", command); break;
		case disconnect_: irc_disconnect(client->session); break;
		}
		len = asprintf(&jsonResponse, "{\"returnValue\":%d}", retVal);
		if (jsonResponse) {
			LSMessageReply(lshandle,message,jsonResponse,&lserror);
			free(jsonResponse);
		} else
			LSMessageReply(lshandle,message,"{\"returnValue\":-1,\"errorText\":\"Generic error\"}",&lserror);
	} else
		LSMessageReply(lshandle,message,"{\"returnValue\":-1,\"errorText\":\"Invalid sessionToken\"}",&lserror);

	done:

	LSErrorFree(&lserror);

	return retVal;

}


bool client_cmd_msg(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_command(lshandle, message, msg_);
}

bool client_cmd_me(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_command(lshandle, message, me_);
}

bool client_cmd_notice(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_command(lshandle, message, notice_);
}

bool client_cmd_join(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_command(lshandle, message, join_);
}

bool client_cmd_part(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_command(lshandle, message, part_);
}

bool client_cmd_invite(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_command(lshandle, message, invite_);
}

bool client_cmd_names(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_command(lshandle, message, names_);
}

bool client_cmd_list(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_command(lshandle, message, list_);
}

bool client_cmd_topic(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_command(lshandle, message, topic_);
}

bool client_cmd_channel_mode(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_command(lshandle, message, channel_mode_);
}

bool client_cmd_kick(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_command(lshandle, message, kick_);
}

bool client_cmd_nick(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_command(lshandle, message, nick_);
}

bool client_cmd_quit(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_command(lshandle, message, quit_);
}

bool client_cmd_whois(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_command(lshandle, message, whois_);
}

bool client_cmd_user_mode(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_command(lshandle, message, user_mode_);
}

// Custom methods

bool client_cmd_ping(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_command(lshandle, message, ping_);
}

bool client_cmd_away(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_command(lshandle, message, away_);
}

bool client_cmd_disconnect(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_command(lshandle, message, disconnect_);
}

bool client_send_raw(LSHandle* lshandle, LSMessage *message, void *ctx) {
	return process_command(lshandle, message, raw_);
}

// Random info

bool client_get_version(LSHandle* lshandle, LSMessage *message, void *ctx) {

	bool retVal = true;

	LSError lserror;
	LSErrorInit(&lserror);

	char *jsonResponse = 0;
	int len = 0;

	len = asprintf(&jsonResponse, "{\"serviceVersion\":\"%s\"}", VERSION);
	if (jsonResponse) {
		LSMessageReply(lshandle,message,jsonResponse,&lserror);
		free(jsonResponse);
	} else
		LSMessageReply(lshandle,message,"{\"returnValue\":-1,\"errorText\":\"Generic error\"}",&lserror);

	LSErrorFree(&lserror);

	return retVal;

}

bool client_init(LSHandle* lshandle, LSMessage *message, void *ctx) {

	LSError lserror;
	LSErrorInit(&lserror);

	if (debug) {
		g_message("%s",LSMessageGetApplicationID(message));
		g_message("%s",LSMessageGetSender(message));
	}

	int len = 0;

	wIRCd_client_t *client = calloc(1,sizeof(wIRCd_client_t));
	len = asprintf(&client->sessionToken, "%s", LSMessageGetUniqueToken(message)+1);

	client->estabilshed = 0;
	client->worker_thread = 0;
	client->ping_server = true;
	client->msg_auto_ping = 0;

	char *jsonResponse = 0;

	len = asprintf(&jsonResponse, "{\"sessionToken\":\"%s\"}", client->sessionToken);
	if (jsonResponse) {
		g_hash_table_insert(wIRCd_clients, (gpointer)client->sessionToken, (gpointer)client);
		//client->live_or_die_thread = (pthread_t)malloc(sizeof(pthread_t));
		if (pthread_create(&client->live_or_die_thread, NULL, live_or_die, (void*)client)) {
			if (debug)
				g_message("Failed to create 'live or die' thread for session: %s", client->sessionToken);
		}
		LSMessageReply(lshandle,message,jsonResponse,&lserror);
		free(jsonResponse);
	} else {
		LSMessageReply(lshandle,message,"{\"returnValue\":-1,\"errorText\":\"Failed creating wIRCd client object\"}",&lserror);
		if (client) free(client);
	}

	LSErrorFree(&lserror);

	return true;

}

LSMethod lscommandmethods[] = {
		// Connection subscription
		{"client_connect",client_connect},
		// Init method
		{"client_init",client_init},
		// Message methods
		{"client_cmd_msg",client_cmd_msg},
		{"client_cmd_me",client_cmd_me},
		{"client_cmd_notice",client_cmd_notice},
		// Channel methods
		{"client_cmd_join",client_cmd_join},
		{"client_cmd_part",client_cmd_part},
		{"client_cmd_invite",client_cmd_invite},
		{"client_cmd_names",client_cmd_names},
		{"client_cmd_list",client_cmd_list},
		{"client_cmd_topic",client_cmd_topic},
		{"client_cmd_channel_mode",client_cmd_channel_mode},
		{"client_cmd_kick",client_cmd_kick},
		// Misc methods
		{"client_cmd_nick",client_cmd_nick},
		{"client_cmd_quit",client_cmd_quit},
		{"client_cmd_whois",client_cmd_whois},
		{"client_cmd_user_mode",client_cmd_user_mode},
		// Custom methods
		{"client_cmd_ping",client_cmd_ping},
		{"client_cmd_away",client_cmd_away},
		{"client_cmd_disconnect",client_cmd_disconnect},
		// Raw
		{"client_send_raw",client_send_raw},
		// Random info
		{"client_get_version",client_get_version},
		{0,0}
};

bool register_commands(LSPalmService *serviceHandle, LSError lserror) {
	return LSPalmServiceRegisterCategory(serviceHandle, "/", lscommandmethods,
			NULL, NULL, NULL, &lserror);
}
