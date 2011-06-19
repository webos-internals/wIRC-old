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

void ping(int id, const char *server) {
	ftime(&servers[id].ping);
	irc_send_raw(servers[id].session, "PING %s", server);
}

void *autoping(void *ptr) {

	int i;
	while (autoPing) {
		for (i = 0; i < max_connections; i++) {
			if (servers[i].session && servers[i].realServer && strlen(
					servers[i].realServer) > 0) {
				ping(i, servers[i].realServer);
			}
		}
		sleep(autoPingInterval);
	}

}

void start_autoping() {
	pthread_create(&autoPingThread, NULL, autoping, NULL);
}

