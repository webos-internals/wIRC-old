include Makefile.inc

.PHONY: clean clean-plugin clean-package install $(PLUGIN)_plugin_$(APPINFO) $(APPINFO) build-package build-plugin

build-package: build-plugin $(PLUGIN)_plugin_$(APPINFO) $(APPINFO)
	pdk-package .
ifneq ($(PARCH),)	
	mv `cat appinfo.json | grep id | cut -f 2 -d ':' | cut -f 2 -d '"'`_`cat appinfo.json | grep version | cut -f 2 -d ':' | cut -f 2 -d '"'`_all.ipk `cat appinfo.json | grep id | cut -f 2 -d ':' | cut -f 2 -d '"'`_`cat appinfo.json | grep version | cut -f 2 -d ':' | cut -f 2 -d '"'`_$(PARCH).ipk
endif

build-plugin:
	cd $(PLUGIN_DIR); ${MAKE} install

clean-package:
	rm -rf *.ipk

clean-plugin:
	cd $(PLUGIN_DIR); ${MAKE} clean

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
	@cat appinfo.static.json >> $@
	@echo -e '}' >> $@

$(PLUGIN)_plugin_$(APPINFO):
	@echo -e '{' > $@
	@echo -e '\t"type" : "game",' >> $@
	@echo -e '\t"requiredMemory" : "$(MEM_USAGE)",' >> $@
	@echo -e '}' >> $@
	
pre: clean
	${MAKE} DEVICE="pre" build-package
	
pixi: clean
	${MAKE} DEVICE="pixi" build-package