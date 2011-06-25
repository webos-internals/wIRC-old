include Makefile.inc

.PHONY: clean clean-plugin clean-package install $(PLUGIN)_plugin_$(APPINFO) $(APPINFO) build-package build-plugin

build-package: build-plugin $(PLUGIN)_plugin_$(APPINFO) $(APPINFO)
	palm-package .
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
	palm-install `cat appinfo.json | grep id | cut -f 2 -d ':' | cut -f 2 -d '"'`_`cat appinfo.json | grep version | cut -f 2 -d ':' | cut -f 2 -d '"'`_all.ipk

clean: clean-plugin clean-package

pre: clean
	${MAKE} DEVICE="pre" build-package

pixi: clean
	${MAKE} DEVICE="pixi" build-package

emu: clean
	${MAKE} DEVICE="emu" build-package

test:
	palm-install ${ID}_*.ipk
	palm-launch ${ID}

device:
	${MAKE} DEVICE="pre" build-package

clobber: clean
	find . -name '*~' -delete
	rm -f ipkgtmp*.tar.gz ${ID}_*.ipk
