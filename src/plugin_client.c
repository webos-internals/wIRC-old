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

#include <PDL.h>

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


PDL_bool process_command(PDL_MojoParameters *params, irc_cmd type) {
	return PDL_TRUE;
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
