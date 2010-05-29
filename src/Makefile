include ../Makefile.inc

IRCLIB          :=      libircclient

CFLAGS		:=	-DID=\"${ID}\" \
				-DVERSION=\"${VERSION}\" \
				-DVENDOR=\"${VENDOR}\" \
				-DVENDOR_EMAIL=\"${VENDOR_EMAIL}\" \
				-DVENDOR_URL=\"${VENDOR_URL}\"

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

OBJECTS		:=	$(IRCLIB)/$(IRCLIB).o \
				plugin_client.o plugin_events.o plugin.o \
				main.o

.PHONY		:	clean clobber clobber-$(IRCLIB) install package.properties

$(PLUGIN): $(OBJECTS)
	$(CC) $(CFLAGS) $(LIBDIRS) $(LIBS) $(OBJECTS) -o $(PLUGIN)

$(IRCLIB)/$(IRCLIB).o:
	cd $(IRCLIB); $(MAKE)
		
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
	rm -rf *.o $(PLUGIN) ../$(PLUGIN) ../package.properties

clobber-$(IRCLIB):
	cd $(IRCLIB); $(MAKE) clean

clean: clobber

install: $(PLUGIN) package.properties
	cp $(PLUGIN) ../

package.properties:
	echo "filemode.755=$(PLUGIN)" > ../package.properties
