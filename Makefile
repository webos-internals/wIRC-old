TITLE			:=	wIRC
ID				:=	org.webosinternals.wirc
VERSION         :=	3.0.0
VENDOR			:=	WebOS Internals
VENDOR_EMAIL	:=	support@webos-internals.org
VENDOR_URL		:=	http://www.webos-internals.org/wiki/Application:WIRC

PLUGIN			:=	wirc
MEM_USAGE		:=	1

PLUGIN_DIR		:= 	src

APPINFO			:=	appinfo.json

.PHONY: clean clean-plugin clean-package install $(PLUGIN)_plugin_$(APPINFO) $(APPINFO) build-package build-plugin

build-package: build-plugin $(PLUGIN)_plugin_$(APPINFO) $(APPINFO)
	pdk-package .

build-plugin:
	cd $(PLUGIN_DIR); make install

clean-package:
	rm -rf *.ipk

clean-plugin:
	cd $(PLUGIN_DIR); make clean

install:
	pdk-install `cat appinfo.json | grep id | cut -f 2 -d ':' | cut -f 2 -d '"'`_`cat appinfo.json | grep version | cut -f 2 -d ':' | cut -f 2 -d '"'`_all.ipk

clean: clean-plugin clean-package

$(APPINFO):
	@echo -e '{' > $@
	@echo -e '\t"title" : "$(TITLE)",' >> $@
	@echo -e '\t"id" : "$(ID)",' >> $@
	@echo -e '\t"version" : "$(VERSION)",' >> $@
	@echo -e '\t"vendor" : "$(VENDOR)",' >> $@
	@echo -e '\t"vendor_email" : "$(VENDOR_EMAIL)",' >> $@
	@echo -e '\t"vendor_url" : "$(VENDOR_URL)",' >> $@
	@echo -e '\t"type" : "web",' >> $@
	@echo -e '\t"plug-ins" : true,' >> $@
	@echo -e '\t"main" : "index.html",' >> $@
	@echo -e '\t"icon" : "icon.png",' >> $@
	@echo -e '\t"noWindow" : true,' >> $@
	@echo -e '\t"noDeprecatedStyles" : true,' >> $@
	@echo -e '\t"keywords" : [ "IRC" ]' >> $@
	@echo -e '}' >> $@

$(PLUGIN)_plugin_$(APPINFO):
	@echo -e '{' > $@
	@echo -e '\t"type" : "game",' >> $@
	@echo -e '\t"requiredMemory" : "$(MEM_USAGE)",' >> $@
	@echo -e '}' >> $@