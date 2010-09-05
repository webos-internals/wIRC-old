/*
 * Copyright (C) 2004-2009 Georgy Yunaev gyunaev@ulduzsoft.com
 *
 * This library is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or (at your
 * option) any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Lesser General Public
 * License for more details.
 */

/*
 * The sockets interface was moved out to simplify going OpenSSL integration.
 */
#include <sys/socket.h>
#include <netdb.h>
#include <arpa/inet.h>
#include <net/if.h>
#include <netinet/in.h>
#include <fcntl.h>

#include <openssl/bio.h>
#include <openssl/ssl.h>
#include <openssl/err.h>

#define IS_SOCKET_ERROR(a)	((a)<0)
typedef int 			socket_t;

#ifndef INADDR_NONE
	#define INADDR_NONE 	0xFFFFFFFF
#endif


static int socket_error()
{
	return errno;
}


static int socket_create (int domain, int type, socket_t * sock, const char * interface)
{
	*sock = socket (domain, type, 0);
    if((int)sock != -1 && interface != NULL) {
    	struct ifreq iface;
    	strncpy(iface.ifr_ifrn.ifrn_name, interface, IFNAMSIZ);
		setsockopt(*sock, SOL_SOCKET, SO_BINDTODEVICE, (char *)&iface, sizeof(iface));
    }
	return IS_SOCKET_ERROR(*sock) ? 1 : 0;
}


static int socket_make_nonblocking (socket_t * sock)
{
	return fcntl (*sock, F_SETFL, fcntl (*sock, F_GETFL,0 ) | O_NONBLOCK) != 0;
}


static int socket_close (socket_t * sock)
{
	close (*sock);

	*sock = -1;
	return 0;
}


static int socket_connect (socket_t * sock, const struct sockaddr *saddr, socklen_t len)
{
	while ( 1 )
	{
	    if ( connect (*sock, saddr, len) < 0 )
	    {
	    	if ( socket_error() == EINTR )
	    		continue;

			if ( socket_error() != EINPROGRESS && socket_error() != EWOULDBLOCK )
				return 1;
		}

		return 0;
	}
}


static int socket_accept (socket_t * sock, socket_t * newsock, struct sockaddr *saddr, socklen_t * len)
{
	while ( IS_SOCKET_ERROR(*newsock = accept (*sock, saddr, len)) )
	{
    	if ( socket_error() == EINTR )
    		continue;

		return 1;
	}

	return 0;
}


static int socket_recv (socket_t * sock, void * buf, size_t len)
{
	int length;

	while ( (length = recv (*sock, buf, len, 0)) < 0
	&& socket_error() == EINTR )
		continue;

	return length;
}

static int ssl_socket_recv (SSL * sslHandle, void * buf, size_t len)
{
	int length;

	while ( (length = SSL_read (sslHandle, buf, len)) < 0
	&& socket_error() == EINTR )
		continue;

	return length;
}

static int socket_send (socket_t * sock, const void *buf, size_t len)
{
	int length;

	while ( (length = send (*sock, buf, len, 0)) < 0
	&& socket_error() == EINTR )
		continue;

	return length;
}

static int ssl_socket_send (SSL * sslHandle, const void *buf, size_t len)
{
	int length;

	while ( (length = SSL_write (sslHandle, buf, len)) < 0
	&& socket_error() == EINTR )
		continue;

	return length;
}
