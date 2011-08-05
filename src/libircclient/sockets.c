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
#include <ifaddrs.h>
#include <netinet/in.h>
#include <fcntl.h>

#if defined (USE_SSL)
#include <openssl/ssl.h>
#include <openssl/err.h>
#endif

#include <syslog.h>

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
    if((int)sock != -1 && interface != NULL && strlen(interface) != 0) {
        struct ifaddrs *ifaddrlist, *ifaddr;
        if (getifaddrs(&ifaddrlist) == -1) {
		    syslog(LOG_WARNING, "** (%s:%d) Unable to enumerate interface addresses.", __FILE__, __LINE__);
        }
        //find the name match in our list
        for (ifaddr = ifaddrlist; ifaddr != NULL; ifaddr = ifaddr->ifa_next) {
            int family, s;
            char addrstring[INET6_ADDRSTRLEN];
            if (ifaddr->ifa_addr == NULL) {
                continue;
            }

            if (strcmp(ifaddr->ifa_name, interface) == 0) {
                family = ifaddr->ifa_addr->sa_family;
                if (family == AF_INET || family == AF_INET6) {
                    // <purely for debugging>
                    if (family == AF_INET) {
                        //have: sockaddr. need it as _in or _in6
                        inet_ntop(family, &((struct sockaddr_in*) ifaddr->ifa_addr)->sin_addr, addrstring, INET6_ADDRSTRLEN);
                    } else if (family == AF_INET6) {
                        inet_ntop(family, &((struct sockaddr_in6*) ifaddr->ifa_addr)->sin6_addr, addrstring, INET6_ADDRSTRLEN);
                    }
                    syslog(LOG_DEBUG,"%s  address family: %d %s  address: <%s>",
                            ifaddr->ifa_name, family,
                            (family == AF_PACKET) ? "(AF_PACKET)" :
                            (family == AF_INET) ?   "(AF_INET)" :
                            (family == AF_INET6) ?  "(AF_INET6)" : "",
                            addrstring);
                    // </purely for debugging>
                    if (bind(*sock, ifaddr->ifa_addr, sizeof(*ifaddr->ifa_addr)) != 0) {
                        syslog(LOG_WARNING, "** (%s:%d) Unable to bind errno=%d.", __FILE__, __LINE__, errno);
                        //syslog(LOG_DEBUG, "** (%s:%d) address=%u", __FILE__, __LINE__, ((struct sockaddr_in*) ifaddr->ifa_addr)->sin_addr);
                        //syslog(LOG_DEBUG, "** (%s:%d) port=%d", __FILE__, __LINE__, htons(((struct sockaddr_in*) ifaddr->ifa_addr)->sin_port));
                    }
                }
            }
        }
        freeifaddrs(ifaddr);
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

static int socket_send (socket_t * sock, const void *buf, size_t len)
{
	int length;

	while ( (length = send (*sock, buf, len, 0)) < 0
	&& socket_error() == EINTR )
		continue;

	return length;
}

#if defined (USE_SSL)
static int ssl_socket_recv (SSL * sslHandle, void * buf, size_t len)
{
	int length, err;

	do { 
		length = SSL_read(sslHandle, buf, len); 
		err = SSL_get_error(sslHandle, length); 
	} while (err == SSL_ERROR_WANT_READ);

	switch(err){
	case SSL_ERROR_NONE:
		break;
	default:
		syslog(LOG_INFO, "** recv error: %d\n", err);
		break;
	}

	return length;
}

static int ssl_socket_send (SSL * sslHandle, const void *buf, size_t len)
{
	int length, err;

	do {
		length = SSL_write(sslHandle, buf, len); 
		err = SSL_get_error(sslHandle, length); 
	} while (err == SSL_ERROR_WANT_WRITE);

	switch(err){
	case SSL_ERROR_NONE:
		break;
	default:
		syslog(LOG_INFO, "** send error: %d\n", err);
		break;
	}

	return length;
}
#endif
