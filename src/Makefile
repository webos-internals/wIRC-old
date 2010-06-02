include ../Makefile.inc

IRCLIB		:=	libircclient

ifeq ($(USEPDK), 1)

INCLUDES	:=	"-I/opt/PalmPDK/include/ -I/opt/PalmPDK/include/SDL"
CFLAGS		:=	"--sysroot=/opt/PalmPDK/arm-gcc/sysroot -L/opt/PalmPDK/device/lib -Wl,--allow-shlib-undefined"
CC			:=	"/opt/PalmPDK/arm-gcc/bin/arm-none-linux-gnueabi-gcc"

else 

CC              :=      gcc
prefix          :=      /usr
CFLAGS		:=	-DID=\"${ID}\" \
				-DVERSION=\"${VERSION}\" \
				-DVENDOR=\"${VENDOR}\" \
				-DVENDOR_EMAIL=\"${VENDOR_EMAIL}\" \
				-DVENDOR_URL=\"${VENDOR_URL}\"

INCLUDES	:=	-I${prefix}/include \
				-I${prefix}/include/SDL \
				-I/${prefix}/include/pdl \
				-I$(IRCLIB)/include

LIBDIRS		:=	-L${prefix}/lib -Wl,-rpath-link,${prefix}/lib
	
LIBS		:=  -lpdl -lSDL

endif

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

pdk-build:
	
