VERSION=3.0

CFLAGS		:= -g -DVERSION=\"${VERSION}\" -I${ROOT}/usr/include/ -I${ROOT}/include/

PDL_CFLAGS	:= -I$(ROOT)/usr/include/SDL -I$(ROOT)/usr/include/pdl
PDL_LIBS	:= -lpdl
 
#	-I$(ROOT)/usr/include/glib-2.0 \
	-I$(ROOT)/usr/lib/glib-2.0/include \
	-I$(ROOT)/usr/include/lunaservice \
	 \
	-I$(ROOT)/usr/include/mjson \
	 \
	-I$(ROOT)/usr/include \
	-Ilibircclient/include
	
LDFLAGS  := -g -L$(ROOT)/usr/lib -llunaservice -lmjson -lglib-2.0 -lgmodule-2.0 -lgthread-2.0 -lgobject-2.0

ARCHIVES = libircclient/src/libircclient.a

plugin_client.o: %.o: %.c
	$(CC) $(CFLAGS) -c $<  -o $@ $(INCLUDES) $(PDL_CFLAGS)

push: 

clobber:
	rm -rf *.o

	