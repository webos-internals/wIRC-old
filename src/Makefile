VERSION=3.0

CFLAGS		:=	-DVERSION=\"${VERSION}\" 

LIBS		:=	-lpdl

INCLUDES	:=	-I${ROOT}/include \
				-I${ROOT}/usr/include \
				-I$(ROOT)/usr/include/glib-2.0 \
				-I$(ROOT)/usr/lib/glib-2.0/include \
				-I$(ROOT)/usr/include/SDL \
				-I$(ROOT)/usr/include/pdl \
				-Ilibircclient/include
 
#	-I$(ROOT)/usr/include/lunaservice \
	 \
	-I$(ROOT)/usr/include/mjson \
	 \
	-I$(ROOT)/usr/include \
	-Ilibircclient/include
	
#LDFLAGS  := -L$(ROOT)/usr/lib -llunaservice -lmjson -lglib-2.0 -lgmodule-2.0 -lgthread-2.0 -lgobject-2.0

#ARCHIVES = libircclient/src/libircclient.a

all: plugin_client.o plugin.o main.o

plugin_client.o: %.o: %.c
	$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

plugin.o: %.o: %.c
	$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

main.o: %.o: %.c
	$(CC) $(CFLAGS) $(INCLUDES) -c $< -o $@

push: 

clobber:
	rm -rf *.o

clean: clobber