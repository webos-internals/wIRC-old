VERSION=3.0

CFLAGS		:=	-DVERSION=\"${VERSION}\" 

INCLUDES	:=	-I${ROOT}/include \
				-I${ROOT}/usr/include \
				-I$(ROOT)/usr/include/glib-2.0 \
				-I$(ROOT)/usr/lib/glib-2.0/include \
				-I$(ROOT)/usr/include/SDL \
				-I$(ROOT)/usr/include/pdl \
				-Ilibircclient/include
				
LIBDIRS		:=	-L$(ROOT)/usr/lib
	
LIBS		:=  -lpdl \
				-lglib-2.0 \
				-lgmodule-2.0 \
				-lgthread-2.0 \
				-lgobject-2.0

ARCHIVES	:=	libircclient/src/libircclient.a

OBJECTS		:=	libircclient/src/libircclient.a \
				plugin_client.o \
				plugin_events.o \
				plugin.o \
				main.o \
				
PROGRAM		:=	org.webosinternals.wirc

.PHONY		:	clean clobber

$(PROGRAM): $(OBJECTS)
	$(CC) $(CFLAGS) $(LIBDIRS) $(LIBS) $(OBJECTS) $(ARCHIVES) -o org.webosinternals.wirc

libircclient/src/libircclient.a:
	cd libircclient; ./configure --host=$(CHOST); make

plugin_client.o: %.o: %.c
	$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

plugin_events.o: %.o: %.c
	$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

plugin.o: %.o: %.c
	$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

main.o: %.o: %.c
	$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

push: 

clobber:
	rm -rf *.o $(PROGRAM)

clean: clobber