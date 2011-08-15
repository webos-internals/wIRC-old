ifeq ($(SSL),1)
	USESSL		:=	-DUSE_SSL
	LIBSSL		:=	-Wl,--allow-shlib-undefined -lssl
endif

ifdef DEVICE
ifeq ($(shell uname -s),Darwin)
	CC=/opt/PalmPDK/arm-gcc/bin/arm-none-linux-gnueabi-gcc
else
	CC=/srv/preware/build/toolchain/cs07q3armel/build/arm-2007q3/bin/arm-none-linux-gnueabi-gcc
endif
	ROOT=/srv/preware/build/staging/armv7/usr
else
ifeq ($(shell uname -s),Darwin)
	CC=/opt/PalmPDK/i686-gcc/bin/i686-nptl-linux-gnu-gcc --sysroot=/opt/PalmPDK/i686-gcc/sys-root
else
	CC=/srv/preware/build/toolchain/i686-unknown-linux-gnu/build/i686-unknown-linux-gnu/bin/i686-unknown-linux-gnu-gcc
endif
	ROOT=/srv/preware/build/staging/i686/usr
endif