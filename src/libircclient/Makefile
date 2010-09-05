include ../../Makefile.inc

CFLAGS		:=	$(CFLAGS) -DIN_BUILDING_LIBIRC -DENABLE_THREADS -D_REENTRANT
INCLUDES	:=	$(INCLUDES) -I./include -I../include -I${ROOT}${prefix}/include

IRCLIB		:=	libircclient.o

$(IRCLIB): utils.c dcc.c errors.c portable.c sockets.c colors.c

clean:
	rm -f $(IRCLIB)

.c.o: $(IRCLIB)
	@$(CC) $(CFLAGS) $(LDFLAGS) $(INCLUDES) -c -o $@ $<
