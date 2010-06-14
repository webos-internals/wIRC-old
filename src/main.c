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

void cleanup(int sig) {
	syslog(LOG_INFO, "Cleanup caused by: %d", sig);
	if (servers) {
		plugin_cleanup();
		free(servers);
	}
	closelog();
	PDL_Quit();
}

void sighandler(int sig) {
	cleanup(sig);
	exit(0);
}

int isDir(const char *dname) {
	struct stat sbuf;
	if (lstat(dname, &sbuf) == -1)
		return 0;
	if (S_ISDIR(sbuf.st_mode))
		return 1;
	return 0;
}

int main(int argc, char *argv[]) {

	signal(SIGINT, sighandler);
	signal(SIGTERM, sighandler);
	signal(SIGQUIT, sighandler);
	signal(SIGHUP, sighandler);
	signal(SIGKILL, sighandler);

	openlog("org.webosinternals.plugin.wirc", LOG_PID, LOG_USER);

	mkdir("/media/internal/wIRC", S_IRWXU);
	if (isDir("/media/internal/wIRC")) {
		mkdir("/media/internal/wIRC/backlogs", S_IRWXU);
		if (!isDir("/media/internal/wIRC/backlogs")) {
			syslog(LOG_NOTICE, "!/media/internal/wIRC/backlogs");
			cleanup(-2);
		}
		mkdir("/media/internal/wIRC/downloads", S_IRWXU);
		if (!isDir("/media/internal/wIRC/downloads")) {
			syslog(LOG_NOTICE, "!/media/internal/wIRC/downloads");
			cleanup(-2);
		}
	} else {
		syslog(LOG_NOTICE, "!/media/internal/wIRC");
		cleanup(-2);
	}

	max_connections = *argv[1];

	servers = malloc(sizeof(wIRCd_client_t) * max_connections);

	max_retries = DEFAULT_MAX_RETRIES;
	pre_run_usleep = DEFAULT_PRE_RUN_USLEEP;

	int ret = plugin_initialize();
	if (ret == PDL_NOERROR) {
		syslog(LOG_NOTICE, "JS handler registration complete");
		plugin_start();
	} else {
		syslog(LOG_ERR, "JS handler registration failed: %d", ret);
	}

	cleanup(-1);

	return 0;

}
