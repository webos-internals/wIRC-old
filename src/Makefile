PROGRAM         :=      wirc
VERSION         :=      3.0

IRCLIB          :=      libircclient

CFLAGS		:=	-DVERSION=\"${VERSION}\" 

INCLUDES	:=	-I${ROOT}/include \
			-I${ROOT}/usr/include \
			-I$(ROOT)/usr/include/glib-2.0 \
			-I$(ROOT)/usr/lib/glib-2.0/include \
			-I$(ROOT)/usr/include/SDL \
			-I$(ROOT)/usr/include/pdl \
			-I$(IRCLIB)/include
				
LIBDIRS		:=	-L$(ROOT)/usr/lib
	
LIBS		:=  	-lpdl \
			-lglib-2.0 \
			-lgmodule-2.0 \
			-lgthread-2.0 \
			-lgobject-2.0 \
			-lSDL

ARCHIVES	:=	$(IRCLIB)/src/$(IRCLIB).a

OBJECTS		:=	plugin_client.o \
			plugin_events.o \
			plugin.o \
			main.o

.PHONY		:	clean clobber

$(PROGRAM): $(ARCHIVES) $(OBJECTS)
	$(CC) $(CFLAGS) $(LIBDIRS) $(LIBS) $(OBJECTS) $(ARCHIVES) -o $(PROGRAM)

$(IRCLIB)/src/$(IRCLIB).a:
	cd $(IRCLIB); ./configure --host=$(CHOST); make

plugin_client.o: %.o: %.c
	$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

plugin_events.o: %.o: %.c
	$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

plugin.o: %.o: %.c
	$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

main.o: %.o: %.c
	$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

push: 

clobber: clobber-$(IRCLIB)
	rm -rf *.o $(PROGRAM)

clobber-$(IRCLIB):
	cd $(IRCLIB); make clean

clean: clobber

install: $(PROGRAM) package.properties
	cp $(PROGRAM) ../

package.properties:
	echo "filemode.755=$(PROGRAM)" > ../package.properties