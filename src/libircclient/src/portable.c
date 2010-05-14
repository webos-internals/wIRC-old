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


#include "config.h"
#include <stdio.h>
#include <stdarg.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
#include <arpa/inet.h>	
#include <netinet/in.h>
#include <fcntl.h>
#include <errno.h>
#include <ctype.h>
#include <time.h>

#if defined (ENABLE_THREADS)
	#include <pthread.h>
	typedef pthread_mutex_t		port_mutex_t;
		#if !defined (PTHREAD_MUTEX_RECURSIVE) && defined (PTHREAD_MUTEX_RECURSIVE_NP)
			#define PTHREAD_MUTEX_RECURSIVE		PTHREAD_MUTEX_RECURSIVE_NP
		#endif
#endif /* #endif ENABLE_THREADS */

#if defined (ENABLE_THREADS)

static inline int libirc_mutex_init (port_mutex_t * mutex)
{
#if defined (PTHREAD_MUTEX_RECURSIVE)
	pthread_mutexattr_t	attr;

	return (pthread_mutexattr_init (&attr)
		|| pthread_mutexattr_settype (&attr, PTHREAD_MUTEX_RECURSIVE)
		|| pthread_mutex_init (mutex, &attr));
#else /* !defined (PTHREAD_MUTEX_RECURSIVE) */

	return pthread_mutex_init (mutex, 0);

#endif /* endif PTHREAD_MUTEX_RECURSIVE block */
}


static inline void libirc_mutex_destroy (port_mutex_t * mutex)
{
	pthread_mutex_destroy (mutex);
}


static inline void libirc_mutex_lock (port_mutex_t * mutex)
{
	pthread_mutex_lock (mutex);
}


static inline void libirc_mutex_unlock (port_mutex_t * mutex)
{
	pthread_mutex_unlock (mutex);
}

#else

	typedef void *	port_mutex_t;

	static inline int libirc_mutex_init (port_mutex_t * mutex) { return 0; }
	static inline void libirc_mutex_destroy (port_mutex_t * mutex) {}
	static inline void libirc_mutex_lock (port_mutex_t * mutex) {}
	static inline void libirc_mutex_unlock (port_mutex_t * mutex) {}

#endif /* #endif ENABLE_THREADS */
