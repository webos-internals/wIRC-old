ifdef DEVICE
	CC=/srv/preware/build/toolchain/cs07q3armel/build/arm-2007q3/bin/arm-none-linux-gnueabi-gcc
	ROOT=/srv/preware/build/staging/armv7/usr
else
	CC=/srv/preware/build/toolchain/i686-unknown-linux-gnu/build/i686-unknown-linux-gnu/bin/i686-unknown-linux-gnu-gcc
	ROOT=/srv/preware/build/staging/i686/usr
endif