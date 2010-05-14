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

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#include "wIRCd.h"

bool init_client(LSHandle* lshandle, LSMessage *message, void *ctx) {

	LSError lserror;
	LSErrorInit(&lserror);

	const char *sessionToken = LSMessageGetUniqueToken(message)+1;
	wIRCd_client_t *client = calloc(1,sizeof(wIRCd_client_t));

	int len = 0;
	char *jsonResponse = 0;

	len = asprintf(&jsonResponse, "{\"sessionToken\":\"%s\"}", sessionToken);
	if (jsonResponse) {
		g_hash_table_insert(wIRCd_clients, (gpointer)sessionToken, (gpointer)client);
		LSMessageReply(lshandle,message,jsonResponse,&lserror);
		free(jsonResponse);
	} else {
		LSMessageReply(lshandle,message,"{\"returnValue\":-1,\"errorText\":\"Failed creating wIRCd client object\"}",&lserror);
		free(client);
	}

	LSErrorFree(&lserror);

	return true;

}
