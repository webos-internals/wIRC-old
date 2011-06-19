include Makefile.inc

PLUGIN		:=	wirc

IRCLIB		:=	libircclient
PDLLIB		:=	libpdl

GITHASH		:=	"\"$(shell git describe --tags --dirty --always)\""

CFLAGS		:=	$(MARCH_TUNE) -DGITHASH=${GITHASH} $(USESSL)

INCLUDES	:=	-I${ROOT}/include \
			-I${ROOT}${prefix}/include \
			-I$(ROOT)${prefix}/include/SDL \
			-I$(ROOT)${prefix}/include/pdl \
			-I$(IRCLIB)/include \
								
LIBDIRS		:=	-Larm -Li686 -L$(PDLLIB) -L$(ROOT)${prefix}/lib

LIBS		:=	-lpdl -lpthread -lm $(LIBSSL)

OBJECTS		:=	$(IRCLIB)/$(IRCLIB).o \
				ping.o plugin_client.o plugin_events.o plugin.o \
				main.o

.PHONY		:	clean clobber clobber-$(IRCLIB) install package.properties

all: $(PLUGIN) package.properties

$(PLUGIN): $(OBJECTS) $(PDLLIB)/$(PDLLIB).so
	$(CC) $(CFLAGS) $(LIBDIRS) $(LIBS) $(OBJECTS) -o $(PLUGIN)

.PHONY: $(IRCLIB)/$(IRCLIB).o
$(IRCLIB)/$(IRCLIB).o:
	cd $(IRCLIB); $(MAKE)
	
.PHONY: $(PDLLIB)/$(PDLLIB).so
$(PDLLIB)/$(PDLLIB).so:
	cd $(PDLLIB); $(MAKE)
		
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

clobber: clobber-$(IRCLIB) clobber-$(PDLLIB)
	rm -rf *.o $(PLUGIN)

clobber-$(IRCLIB):
	cd $(IRCLIB); $(MAKE) clean
	
clobber-$(PDLLIB):
	cd $(PDLLIB); $(MAKE) clean

clean: clobber
