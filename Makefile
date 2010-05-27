PLUGIN_DIR := src

.PHONY: clean

build-package: clean-package clean-plugin build-plugin
	pdk-package .

build-plugin:
	cd $(PLUGIN_DIR); make install

clean-package:
	rm -rf *.ipkg

clean-plugin:
	cd $(PLUGIN_DIR); make clean
