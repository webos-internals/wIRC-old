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

PDL_Err plugin_initialize() {

	int i = 0;
	for (;i<max_connections;i++) {
		servers[i].id = -1;
	}

	SDL_Init(SDL_INIT_VIDEO);
	PDL_Init(0);

	setup_event_callbacks();

	if (plugin_client_init() > 0) {
		syslog(LOG_ERR, "JS handler registration failed");
		return -1;
	}

	PDL_JSRegistrationComplete();
	return PDL_CallJS("ready", NULL, 0);
}

void plugin_start() {
	SDL_Event Event;
	int cont = 1;
	do {
		SDL_WaitEvent(&Event);
	} while (Event.type != SDL_QUIT);
}

void plugin_cleanup() {
	int i = 0;
	for (;i<max_connections;i++) {
		if (servers[i].session) {
			syslog(LOG_INFO, "Disconnect Server ID: %d", servers[i].id);
			irc_cmd_quit(servers[i].session, "wIRC closed");
		}
	}
}
