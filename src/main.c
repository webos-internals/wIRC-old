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

void cleanup() {
	remove("/tmp/.wirc");
}

void sighandler(int sig) {
	cleanup();
	exit(0);
}

int main(int argc, char *argv[]) {

	signal(SIGINT, sighandler);
	signal(SIGTERM, sighandler);
	signal(SIGQUIT, sighandler);

	int fd = open("/tmp/.wirc", O_CREAT|O_EXCL);
	if (fd==-1)
		sighandler(0);
	close(fd);

	openlog("org.webosinternals.plugin.wirc", LOG_PID, LOG_USER);

	max_retries = DEFAULT_MAX_RETRIES;
	pre_run_usleep = DEFAULT_PRE_RUN_USLEEP;
	debug = DEFAULT_DEBUG_LEVEL;

	int ret = plugin_initialize();
    if (ret == PDL_NOERROR) {
    	syslog(LOG_NOTICE, "JS handler registration complete");
    	plugin_start();
    } else {
    	syslog(LOG_ERR, "JS handler registration failed: %d", ret);
    }

    closelog();

	return 0;

}
