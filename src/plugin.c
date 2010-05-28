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
#include "SDL.h"

GMainLoop *loop = NULL;

PDL_Err plugin_initialize() {

	SDL_Init(SDL_INIT_VIDEO);
	PDL_Init(0);

	if (plugin_client_init() > 0) {
		syslog(LOG_ERR, "JS handler registration failed");
		return -1;
	}

	return PDL_JSRegistrationComplete();
}

void plugin_start() {

	//setup_event_callbacks();

	//wIRCd_clients = g_hash_table_new(g_str_hash, g_str_equal);
	//if (wIRCd_clients)

	loop = g_main_loop_new(NULL, FALSE);

	client = calloc(1,sizeof(wIRC_client_t));

	client->estabilshed = 0;
	client->worker_thread = 0;
	client->ping_server = 1;

	g_main_loop_run(loop);

}

void luna_service_cleanup() {

	//if (wIRCd_clients)
		//g_hash_table_destroy(wIRCd_clients);

}
