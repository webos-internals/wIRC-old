APPID = org.webosinternals.wirc-enyo

.PHONY: clean clean-plugin clean-package install build-package build-plugin
	
build-package: clean build-plugin
	palm-package -X exclude.txt .

build-plugin:
	cd plugin; ${MAKE}

clean-package:
	rm -rf *.ipk

clean-plugin:
	cd plugin; ${MAKE} clean

install: build-package
	palm-install ${APPID}_*.ipk
	
test: install
	palm-launch ${APPID}

clean: clean-plugin clean-package

clobber: clean

device:
	${MAKE} DEVICE="pre" build-package