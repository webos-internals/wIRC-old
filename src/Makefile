include ../Makefile.inc

IRCLIB		:=	libircclient

GITHASH		:=	"\"$(shell git log -1 --pretty=format:"%h")\""

CFLAGS		:=	-g $(MARCH_TUNE) -DGITHASH=${GITHASH}

INCLUDES	:=	-I${ROOT}/include \
				-I${ROOT}${prefix}/include \
				-I$(ROOT)${prefix}/include/SDL \
				-I$(ROOT)${prefix}/include/pdl \
				-I$(IRCLIB)/include
								
LIBDIRS		:=	-Llibpdl -L$(ROOT)${prefix}/lib -Wl,-rpath-link,$(ROOT)${prefix}/lib -Wl,--allow-shlib-undefined
	
LIBS		:=  -lpdl -lpthread -lm -lssl -lcrypto

OBJECTS		:=	$(IRCLIB)/$(IRCLIB).o \
				ping.o plugin_client.o plugin_events.o plugin.o \
				main.o

.PHONY		:	clean clobber clobber-$(IRCLIB) install package.properties

$(PLUGIN): libpdl/libpdl.so $(OBJECTS)
	$(CC) $(CFLAGS) $(LIBDIRS) $(LIBS) $(OBJECTS) -o $(PLUGIN)

.PHONY: libpdl/libpdl.so
libpdl/libpdl.so:
	cd libpdl; $(MAKE)

.PHONY: $(IRCLIB)/$(IRCLIB).o
$(IRCLIB)/$(IRCLIB).o:
	cd $(IRCLIB); $(MAKE)
		
ping.o: %.o: %.c
	$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@
		
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
