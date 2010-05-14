VERSION=unknown

#STAGING_DIR=/srv/preware/build/staging/i686
#CC=/srv/preware/build/toolchain/i686-unknown-linux-gnu/build/i686-unknown-linux-gnu/bin/i686-unknown-linux-gnu-gcc

STAGING_DIR=/srv/preware/build/staging/armv7
CC=/srv/preware/build/toolchain/cs07q3armel/build/arm-2007q3/bin/arm-none-linux-gnueabi-gcc

CFLAGS := -g -DVERSION=\"${VERSION}\" -I${STAGING_DIR}/usr/include/glib-2.0 -I${STAGING_DIR}/usr/lib/glib-2.0/include -I${STAGING_DIR}/usr/include/lunaservice -I${STAGING_DIR}/usr/include/mjson -I${STAGING_DIR}/usr/include -Ilibircclient/include
LDFLAGS  := -g -L${STAGING_DIR}/usr/lib -llunaservice -lmjson -lglib-2.0 -lgmodule-2.0 -lgthread-2.0 -lgobject-2.0

OBJECTS = events.o subscriptions.o client.o luna_service.o main.o

ARCHIVES = libircclient/src/libircclient.a

org.webosinternals.wirc: ${OBJECTS}
	$(CC) $(CFLAGS) $(OBJECTS) $(ARCHIVES) -o org.webosinternals.wirc $(CFLAGS) $(LDFLAGS)

push: 

clobber:
	rm -rf *.o

#$(PROGRAM): $(OBJECTS)
#	$(CC) $(CFLAGS) $(OBJECTS) $(ARCHIVES) -o $(PROGRAM) $(INCLUDES) $(LIBS)
#
#$(OBJECTS): %.o: %.c
#	$(CC) $(CFLAGS) -c $<  -o $@ -I. $(INCLUDES) $(LIBS)
	
