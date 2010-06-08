TITLE			:=	wIRC
ID				:=	org.webosinternals.wirc
VERSION         :=	0.2.5
VENDOR			:=	webOS-Internals
VENDOR_EMAIL	:=	support@webos-internals.org
VENDOR_URL		:=	http://www.webos-internals.org/wiki/Application:WIRC

PLUGIN			:=	wirc
MEM_USAGE		:=	8

PLUGIN_DIR		:= 	src

APPINFO			:=	appinfo.json

ifeq ($(DEVICE),pre)
	MARCH_TUNE	:=	-march=armv7-a -mcpu=cortex-a8 -mfpu=neon -mfloat-abi=softfp
	PARCH		:=	armv7
else
ifeq ($(DEVICE),pixi)
	MARCH_TUNE	:=	-march=armv6j -mcpu=arm1136jf-s -mfpu=vfp -mfloat-abi=softfp
	PARCH		:=	armv6
else
ifeq ($(DEVICE),emu)
	PARCH		:=	i686
endif
endif
endif