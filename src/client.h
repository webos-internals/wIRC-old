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

#ifndef CLIENT_H_
#define CLIENT_H_

#include <pthread.h>
#include <time.h>
#include <netinet/in.h>
#include <sys/socket.h>
#include <time.h>
#include <sys/timeb.h>

#define IN_BUILDING_LIBIRC
typedef int socket_t;
typedef pthread_mutex_t port_mutex_t;

#include <lunaservice.h>
#include <libircclient.h>
#include <libirc_session.h>

typedef struct {
	irc_session_t	*session;
	char	 		*server;
	char 			*server_password;
	char 			*nick;
	char 			*username;
	char 			*realname;
	char			*interface;
	char			*realServer;
	int				estabilshed;
	int			 	port;
	pthread_mutex_t ping_mutex;
	struct timeb 	ping;
} wIRCd_client_t;

bool register_commands(LSPalmService *serviceHandle, LSError lserror);

#endif /* CLIENT_H_ */
